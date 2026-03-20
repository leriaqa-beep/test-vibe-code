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

/** Returns true if the string contains Cyrillic characters */
function hasCyrillic(text: string): boolean {
  return /[а-яёА-ЯЁ]/.test(text);
}

/** Deterministic storage key — same name always maps to the same file */
function toStorageKey(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-zа-яёa-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  // Simple 32-bit hash for uniqueness
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = Math.imul(31, h) + name.charCodeAt(i) | 0;
  }
  return `${slug}-${Math.abs(h).toString(36)}.jpg`;
}

/** Create the bucket once at startup — safe to call repeatedly */
async function ensureBucket(): Promise<void> {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 2 * 1024 * 1024, // 2 MB
  });
  if (error && !error.message.toLowerCase().includes('already exist')) {
    console.error('[HeroImage] bucket error:', error.message);
  }
}
ensureBucket();

/**
 * GET /api/hero-image/img?name=...
 *
 * Legacy backend proxy — kept for old story URLs that may still reference it.
 * Fetches the image from Pollinations server-side and pipes it back.
 * Response is cached for 24 h in the browser.
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
 * Returns a stable, fast-loading image URL for the given character name:
 *
 * 1. Query DuckDuckGo for a Wikipedia image (fast, reliable, no generation needed).
 * 2. Check if we already have a cached image in Supabase Storage hero-images.
 * 3. Otherwise: fetch from Pollinations server-side → upload to Supabase Storage
 *    → return the permanent CDN URL.  Subsequent requests for the same character
 *    are served from cache (step 2) — near-instant.
 * 4. Hard fallback: return the direct Pollinations URL in case Supabase is down.
 */
router.get('/', async (req: Request, res: Response) => {
  const name = ((req.query.name as string) || '').trim();
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'name required' });
  }

  let bestName = name;

  // ── 1. Wikipedia via DuckDuckGo ─────────────────────────────────────────
  try {
    const ddgUrl =
      `https://api.duckduckgo.com/?q=${encodeURIComponent(name)}` +
      `&format=json&t=pochemu4ki&no_redirect=1&no_html=1&skip_disambig=1`;

    const ddgRes = await fetch(ddgUrl, {
      headers: { 'User-Agent': 'pochemu4ki/1.0 hero-image-lookup' },
      signal: AbortSignal.timeout(4000),
    });

    if (ddgRes.ok) {
      const data = (await ddgRes.json()) as { Image?: string; Heading?: string };

      if (data.Heading && data.Heading.trim().length > 1) {
        bestName = data.Heading.trim();
      }

      if (data.Image && data.Image.includes('upload.wikimedia.org') && data.Image.length > 20) {
        return res.json({ imageUrl: data.Image, source: 'wikipedia', name: bestName });
      }
    }
  } catch {
    // DDG failed — continue
  }

  // ── 1.5 Translate Cyrillic name → English for better Pollinations results
  if (hasCyrillic(bestName)) {
    try {
      const transUrl =
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(bestName)}&langpair=ru|en`;
      const transRes = await fetch(transUrl, { signal: AbortSignal.timeout(3000) });
      if (transRes.ok) {
        const transData = await transRes.json() as {
          responseStatus: number;
          responseData: { translatedText: string };
        };
        if (transData.responseStatus === 200) {
          const translated = transData.responseData.translatedText?.trim();
          if (translated && !hasCyrillic(translated)) {
            bestName = translated;
          }
        }
      }
    } catch {
      // Translation failed — use original name
    }
  }

  // ── 2. Check Supabase Storage cache ────────────────────────────────────
  const key = toStorageKey(bestName);
  const { data: cachedUrlData } = supabase.storage.from(BUCKET).getPublicUrl(key);

  try {
    const headRes = await fetch(cachedUrlData.publicUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });
    if (headRes.ok) {
      return res.json({ imageUrl: cachedUrlData.publicUrl, source: 'cache', name: bestName });
    }
  } catch {
    // Not cached — continue
  }

  // ── 3. Fetch from Pollinations → upload to Supabase Storage ────────────
  try {
    const polUrl = pollinationsUrl(bestName);
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
        return res.json({ imageUrl: urlData.publicUrl, source: 'generated', name: bestName });
      }
    }
  } catch {
    // Pollinations or upload failed — fall through to direct URL
  }

  // ── 4. Hard fallback: direct Pollinations URL ──────────────────────────
  return res.json({ imageUrl: pollinationsUrl(bestName), source: 'pollinations', name: bestName });
});

export default router;
