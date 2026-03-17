import { Router, Request, Response } from 'express';

const router = Router();

function pollinationsUrl(name: string): string {
  const prompt = encodeURIComponent(
    `${name} cute cartoon character children book illustration friendly colorful simple white background`
  );
  // Deterministic seed → same name always generates same image (cached after first generation)
  // model=turbo (FLUX Schnell) generates in ~2-3s vs 10-30s for default model
  const seed = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 99999;
  return `https://image.pollinations.ai/prompt/${prompt}?width=256&height=256&nologo=true&nofeed=true&model=turbo&seed=${seed}`;
}

/**
 * GET /api/hero-image?name=...
 *
 * Strategy:
 * 1. Query DuckDuckGo Instant Answer API to:
 *    a) get the English heading of the character (for better Pollinations prompt)
 *    b) get a direct Wikipedia image URL if available (upload.wikimedia.org — no hotlink issues)
 * 2. If DDG returns a Wikipedia image URL → use it directly (real character art, loads fine)
 * 3. Otherwise → Pollinations with English name (much better than Russian query)
 *
 * NOTE: duckduckgo.com/i/... proxy URLs are NOT used — they require duckduckgo.com referer
 * and will fail when loaded directly in a browser <img> tag.
 */
router.get('/', async (req: Request, res: Response) => {
  const name = ((req.query.name as string) || '').trim();
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'name required' });
  }

  let bestName = name; // will be replaced with English heading if DDG finds it

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

      // Use English heading for a much better Pollinations prompt
      if (data.Heading && data.Heading.trim().length > 1) {
        bestName = data.Heading.trim();
      }

      // Only use DDG image if it's a direct Wikipedia URL — these load reliably in browsers
      // duckduckgo.com/i/... proxy URLs require Referer: duckduckgo.com and fail in <img> tags
      if (
        data.Image &&
        data.Image.includes('upload.wikimedia.org') &&
        data.Image.length > 20
      ) {
        return res.json({ imageUrl: data.Image, source: 'wikipedia', name: bestName });
      }
    }
  } catch {
    // DDG timed out or failed — fall through to Pollinations
  }

  return res.json({ imageUrl: pollinationsUrl(bestName), source: 'pollinations', name: bestName });
});

export default router;
