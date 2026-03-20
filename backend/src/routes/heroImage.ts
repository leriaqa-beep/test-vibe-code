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
 * Search Wikipedia for the query string, return the best matching article thumbnail.
 * Uses: search API → summary API → thumbnail.source
 */
/** Fetch Wikipedia thumbnail for a given article title */
async function wikipediaThumbnail(title: string): Promise<string | null> {
  try {
    const summaryUrl =
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(summaryUrl, {
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

/** Search Wikipedia and return thumbnail. Tries multiple queries in priority order. */
async function wikipediaImage(name: string): Promise<string | null> {
  // Priority: fictional character → cartoon character → plain name
  const queries = [
    `${name} fictional character`,
    `${name} cartoon character`,
    `${name} animated character`,
    name,
  ];

  for (const q of queries) {
    try {
      const searchUrl =
        `https://en.wikipedia.org/w/api.php?action=query&list=search` +
        `&srsearch=${encodeURIComponent(q)}&format=json&srlimit=1&origin=*`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'pochemu4ki/1.0 hero-image-lookup' },
        signal: AbortSignal.timeout(4000),
      });
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json() as {
        query: { search: { title: string }[] };
      };
      const title = searchData.query?.search?.[0]?.title;
      if (!title) continue;

      const thumb = await wikipediaThumbnail(title);
      if (thumb) return thumb;
    } catch { /* try next query */ }
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
 * 1. Translate RU → EN (MyMemory)
 * 2. Wikipedia Search + Summary → reliable thumbnail for known characters
 * 3. Supabase Storage cache (previously generated images)
 * 4. Pollinations server-side → upload to Supabase Storage
 * 5. null — frontend shows mascot-surprise fallback
 */
router.get('/', async (req: Request, res: Response) => {
  const name = ((req.query.name as string) || '').trim();
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'name required' });
  }

  // ── 1. Translate RU → EN ─────────────────────────────────────────────────
  const englishName = await translateToEnglish(name);

  // ── 2. Wikipedia image ───────────────────────────────────────────────────
  const wikiImage = await wikipediaImage(englishName);
  if (wikiImage) {
    return res.json({ imageUrl: wikiImage, source: 'wikipedia', name: englishName });
  }

  // ── 3. Supabase Storage cache ────────────────────────────────────────────
  const key = toStorageKey(englishName);
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

  // ── 4. Pollinations server-side → Supabase Storage ──────────────────────
  try {
    const polUrl = pollinationsUrl(englishName);
    const imgRes = await fetch(polUrl, { signal: AbortSignal.timeout(20000) });
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
    }
  } catch { /* Pollinations down */ }

  // ── 5. No image — frontend shows mascot-surprise ─────────────────────────
  return res.json({ imageUrl: null, source: 'none', name: englishName });
});

export default router;
