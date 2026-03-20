import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

const BUCKET = 'hero-images';

function pollinationsUrl(name: string): string {
  const prompt = encodeURIComponent(
    `${name} cute cartoon character children book illustration friendly colorful simple white background`
  );
  const seed = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 99999;
  return `https://image.pollinations.ai/prompt/${prompt}?width=256&height=256&nologo=true&nofeed=true&model=turbo&seed=${seed}`;
}

function hasCyrillic(text: string): boolean {
  return /[а-яёА-ЯЁ]/.test(text);
}

function toStorageKey(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-zа-яёa-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = Math.imul(31, h) + name.charCodeAt(i) | 0;
  }
  return `${slug}-${Math.abs(h).toString(36)}.jpg`;
}

async function ensureBucket(): Promise<void> {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 2 * 1024 * 1024,
  });
  if (error && !error.message.toLowerCase().includes('already exist')) {
    console.error('[HeroImage] bucket error:', error.message);
  }
}
ensureBucket();

/**
 * Translate Russian name → English via MyMemory (free, no key).
 * Returns original string on failure.
 */
async function translateToEnglish(name: string): Promise<string> {
  if (!hasCyrillic(name)) return name;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(name)}&langpair=ru|en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return name;
    const data = await res.json() as { responseStatus: number; responseData: { translatedText: string } };
    if (data.responseStatus === 200) {
      const t = data.responseData.translatedText?.trim();
      if (t && !hasCyrillic(t)) return t;
    }
  } catch { /* fall through */ }
  return name;
}

/**
 * Google Custom Search — image search for a character.
 * Requires GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_CX in env.
 * Returns the first safe image URL or null.
 */
async function googleImageSearch(originalName: string, englishName: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  if (!apiKey || !cx) return null;

  // PNG files = character art on transparent background (not show logos/title cards)
  // Two passes: first PNG only, then any format as fallback
  const queries = hasCyrillic(originalName)
    ? [
        { q: `${originalName} персонаж`, png: true },
        { q: `${originalName} герой мультфильм`, png: true },
        { q: `${englishName} cartoon character`, png: true },
        { q: `${originalName} персонаж`, png: false },
      ]
    : [
        { q: `${englishName} cartoon character`, png: true },
        { q: `${englishName} character`, png: true },
        { q: `${englishName} cartoon character`, png: false },
      ];

  for (const { q, png } of queries) {
    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.set('key', apiKey);
      url.searchParams.set('cx', cx);
      url.searchParams.set('q', q);
      url.searchParams.set('searchType', 'image');
      url.searchParams.set('num', '5');
      url.searchParams.set('safe', 'active');
      url.searchParams.set('imgSize', 'medium');
      if (png) url.searchParams.set('fileType', 'png'); // PNG = character on transparent bg

      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(6000) });
      if (!res.ok) {
        console.error('[HeroImage] Google search HTTP error:', res.status);
        return null;
      }
      const data = await res.json() as { items?: { link: string }[] };
      const link = data.items?.[0]?.link;
      if (link) {
        console.log(`[HeroImage] Google found image for "${q}" png=${png}: ${link}`);
        return link;
      }
    } catch (e) {
      console.error('[HeroImage] Google search failed:', e);
    }
  }
  return null;
}

/**
 * Download an image from a URL and upload it to Supabase Storage.
 * Returns the public CDN URL on success, null on failure.
 */
async function fetchAndCache(imageUrl: string, storageKey: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png'
      : contentType.includes('webp') ? 'webp'
      : 'jpg';
    const finalKey = storageKey.replace(/\.jpg$/, `.${ext}`);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(finalKey, Buffer.from(buffer), { contentType, upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(finalKey);
    return data.publicUrl;
  } catch {
    return null;
  }
}

/** Fetch Wikipedia thumbnail by article title from a given language wiki */
async function wikipediaThumbnail(title: string, lang = 'en'): Promise<string | null> {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'pochemu4ki/1.0 hero-image-lookup' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { thumbnail?: { source: string } };
    return data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

/** Search Wikipedia (given lang) and return the first article's thumbnail */
async function wikiSearch(query: string, lang = 'en'): Promise<string | null> {
  try {
    const searchUrl =
      `https://${lang}.wikipedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1&origin=*`;
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'pochemu4ki/1.0 hero-image-lookup' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { query: { search: { title: string }[] } };
    const title = data.query?.search?.[0]?.title;
    if (!title) return null;
    return await wikipediaThumbnail(title, lang);
  } catch {
    return null;
  }
}

async function wikipediaImage(originalName: string, englishName: string): Promise<string | null> {
  if (hasCyrillic(originalName)) {
    const direct = await wikipediaThumbnail(originalName, 'ru');
    if (direct) return direct;
    for (const q of [originalName, `${originalName} персонаж`]) {
      const r = await wikiSearch(q, 'ru');
      if (r) return r;
    }
  }
  const directEn = await wikipediaThumbnail(englishName, 'en');
  if (directEn) return directEn;
  for (const q of [`${englishName} fictional character`, `${englishName} animated character`, englishName]) {
    const result = await wikiSearch(q, 'en');
    if (result) return result;
  }
  return null;
}

/**
 * GET /api/hero-image/img?name=...
 * Legacy backend proxy for old story URLs.
 */
router.get('/img', async (req: Request, res: Response) => {
  const name = ((req.query.name as string) || '').trim();
  if (!name) return res.status(400).send('name required');
  const url = pollinationsUrl(name);
  try {
    const imgRes = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (!imgRes.ok) return res.status(502).send('upstream error');
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await imgRes.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.send(Buffer.from(buffer));
  } catch {
    return res.status(504).send('image generation timeout');
  }
});

/**
 * GET /api/hero-image?name=...
 *
 * 1. Supabase Storage cache — instant on repeat requests
 * 2. Google Custom Search — finds real character artwork (requires API key)
 *    → downloaded and uploaded to Supabase for caching
 * 3. Pollinations AI generation — clean illustration when Google unavailable
 *    → uploaded to Supabase for caching
 * 4. Wikipedia — last resort (may return show logos)
 * 5. null — frontend shows mascot-surprise fallback
 */
router.get('/', async (req: Request, res: Response) => {
  const name = ((req.query.name as string) || '').trim();
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'name required' });
  }

  // ── 1. Translate RU → EN ─────────────────────────────────────────────────
  const englishName = await translateToEnglish(name);
  const key = toStorageKey(englishName);
  const forceRefresh = req.query.refresh === 'true';

  // ── 2. Supabase Storage cache ────────────────────────────────────────────
  if (!forceRefresh) {
    const { data: cachedUrlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
    try {
      const headRes = await fetch(cachedUrlData.publicUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });
      if (headRes.ok) {
        return res.json({ imageUrl: cachedUrlData.publicUrl, source: 'cache', name: englishName });
      }
    } catch { /* not cached */ }
  }

  // ── 3. Google Custom Search → cache in Supabase ──────────────────────────
  const googleUrl = await googleImageSearch(name, englishName);
  if (googleUrl) {
    const cached = await fetchAndCache(googleUrl, key);
    if (cached) {
      return res.json({ imageUrl: cached, source: 'google', name: englishName });
    }
    // Download failed but we have the URL — return it directly
    return res.json({ imageUrl: googleUrl, source: 'google', name: englishName });
  }

  // ── 4. Pollinations AI generation → cache in Supabase ───────────────────
  try {
    const polUrl = pollinationsUrl(englishName);
    const imgRes = await fetch(polUrl, { signal: AbortSignal.timeout(25000) });
    if (imgRes.ok) {
      const buffer = await imgRes.arrayBuffer();
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      const ext = contentType.includes('png') ? 'png'
        : contentType.includes('webp') ? 'webp'
        : 'jpg';
      const finalKey = key.replace(/\.jpg$/, `.${ext}`);
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(finalKey, Buffer.from(buffer), { contentType, upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(finalKey);
        return res.json({ imageUrl: urlData.publicUrl, source: 'generated', name: englishName });
      }
      return res.json({ imageUrl: polUrl, source: 'generated', name: englishName });
    }
  } catch { /* Pollinations down */ }

  // ── 5. Wikipedia fallback ────────────────────────────────────────────────
  const wikiImage = await wikipediaImage(name, englishName);
  if (wikiImage) {
    return res.json({ imageUrl: wikiImage, source: 'wikipedia', name: englishName });
  }

  // ── 6. No image ──────────────────────────────────────────────────────────
  return res.json({ imageUrl: null, source: 'none', name: englishName });
});

export default router;
