import { Router, Request, Response } from 'express';
import { Resend } from 'resend';
import { store } from '../db/store';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

const router = Router();
router.use(authMiddleware);

const FREE_STORY_LIMIT = 3;

// POST /api/users/activate-premium  (demo — no real payment)
router.post('/activate-premium', async (req: AuthRequest, res: Response) => {
  const user = await store.getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }
  user.isPremium = true;
  user.storiesUsed = 0;
  await store.saveUser(user);
  res.json({ success: true, message: 'Premium активирован (демо)' });
});

// GET /api/users/subscription-status
router.get('/subscription-status', async (req: AuthRequest, res: Response) => {
  const user = await store.getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }
  res.json({
    isPremium: user.isPremium,
    storiesUsed: user.storiesUsed || 0,
    freeLimit: FREE_STORY_LIMIT,
  });
});

// DELETE /api/users/me — delete account and all data
router.delete('/me', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const user = await store.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }
  await store.deleteUser(userId);
  res.json({ success: true });
});

// POST /api/users/feedback — store beta feedback (auth optional via query)
router.post('/feedback', async (req: AuthRequest & Request, res: Response) => {
  const { text, rating, page } = req.body as { text?: string; rating?: number; page?: string };
  if (!text?.trim()) {
    res.status(400).json({ error: 'Текст отзыва обязателен' });
    return;
  }
  const { error } = await supabase.from('feedback').insert({
    user_id: req.userId || null,
    text: text.trim(),
    rating: rating || null,
    page: page || null,
  });
  if (error) {
    res.status(500).json({ error: 'Не удалось сохранить отзыв' });
    return;
  }

  // Send email notification to admin
  if (resend && ADMIN_EMAIL) {
    const stars = rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : '—';
    resend.emails.send({
      from: process.env.EMAIL_FROM || 'Почему-Ка! <noreply@pochemu4ki.app>',
      to: ADMIN_EMAIL,
      subject: `📬 Новый отзыв${rating ? ` · ${stars}` : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;padding:24px">
          <h2 style="color:#7C6BC4;margin-top:0">Новый отзыв · Почему-Ка!</h2>
          ${rating ? `<p style="font-size:20px;letter-spacing:2px;margin:0 0 12px">${stars}</p>` : ''}
          <p style="background:#F5F3FF;border-radius:8px;padding:14px 16px;font-size:15px;line-height:1.6;color:#2D2B3D">${text.trim().replace(/\n/g, '<br>')}</p>
          ${page ? `<p style="color:#7A7890;font-size:12px;margin:8px 0 0">Страница: ${page}</p>` : ''}
        </div>
      `,
    }).catch(() => { /* silent — feedback already saved */ });
  }

  res.json({ success: true });
});

export default router;
