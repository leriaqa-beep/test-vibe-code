import { Router, Request, Response } from 'express';

const router = Router();

function pollinationsUrl(name: string): string {
  const prompt = encodeURIComponent(
    `${name} cute cartoon character children book illustration friendly colorful simple white background`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=256&height=256&nologo=true`;
}

/**
 * GET /api/hero-image?name=...
 *
 * 1. Tries DuckDuckGo Instant Answer API — returns official art for well-known characters
 *    (Elsa Frozen, Spider-Man, etc.)
 * 2. Falls back to Pollinations.AI URL generation for original / unknown characters
 *
 * No auth required — called before story generation, in real-time while user types.
 */
router.get('/', async (req: Request, res: Response) => {
  const name = ((req.query.name as string) || '').trim();
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'name required' });
  }

  try {
    const ddgUrl =
      `https://api.duckduckgo.com/?q=${encodeURIComponent(name)}` +
      `&format=json&t=pochemu4ki&no_redirect=1&no_html=1&skip_disambig=1`;

    const ddgRes = await fetch(ddgUrl, {
      headers: { 'User-Agent': 'pochemu4ki/1.0 hero-image-lookup' },
      signal: AbortSignal.timeout(4000),
    });

    if (ddgRes.ok) {
      const data = (await ddgRes.json()) as { Image?: string };
      if (data.Image && data.Image.length > 10) {
        return res.json({ imageUrl: data.Image, source: 'duckduckgo' });
      }
    }
  } catch {
    // DDG timed out or failed — fall through to Pollinations
  }

  return res.json({ imageUrl: pollinationsUrl(name), source: 'pollinations' });
});

export default router;
