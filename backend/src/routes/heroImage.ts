import { Router, Request, Response } from 'express';

const router = Router();

function pollinationsUrl(name: string): string {
  const prompt = encodeURIComponent(
    `${name} cute cartoon character children book illustration friendly colorful simple white background`
  );
  const seed = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 99999;
  return `https://image.pollinations.ai/prompt/${prompt}?width=256&height=256&nologo=true&nofeed=true&model=turbo&seed=${seed}`;
}

/**
 * GET /api/hero-image/img?name=...
 *
 * Backend proxy: fetches the image from Pollinations server-side and pipes it back.
 * This solves browser timeout/reliability issues with direct Pollinations requests.
 * Response is cached for 24h — subsequent loads of the same hero are instant.
 */
router.get('/img', async (req: Request, res: Response) => {
  const name = ((req.query.name as string) || '').trim();
  if (!name) return res.status(400).send('name required');

  const url = pollinationsUrl(name);

  try {
    const imgRes = await fetch(url, {
      signal: AbortSignal.timeout(25000),
    });

    if (!imgRes.ok) {
      return res.status(502).send('upstream error');
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await imgRes.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h browser cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.send(Buffer.from(buffer));
  } catch {
    return res.status(504).send('image generation timeout');
  }
});

/**
 * GET /api/hero-image?name=...
 *
 * 1. Query DuckDuckGo for English character name + Wikipedia image URL
 * 2. If Wikipedia image found → return it directly (reliable, fast)
 * 3. Otherwise → return backend proxy URL for Pollinations (avoids browser issues)
 */
router.get('/', async (req: Request, res: Response) => {
  const name = ((req.query.name as string) || '').trim();
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'name required' });
  }

  let bestName = name;

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

      // Wikipedia images load reliably — return direct URL
      if (data.Image && data.Image.includes('upload.wikimedia.org') && data.Image.length > 20) {
        return res.json({ imageUrl: data.Image, source: 'wikipedia', name: bestName });
      }
    }
  } catch {
    // DDG failed — proceed with original name
  }

  // Return proxy URL: browser loads from our server, server fetches from Pollinations
  const host = `${req.protocol}://${req.get('host')}`;
  const proxyUrl = `${host}/api/hero-image/img?name=${encodeURIComponent(bestName)}`;
  return res.json({ imageUrl: proxyUrl, source: 'pollinations', name: bestName });
});

export default router;
