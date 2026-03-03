import { Router, Response } from 'express';
import { store } from '../db/store';
import { authMiddleware, AuthRequest } from '../middleware/auth';

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

export default router;
