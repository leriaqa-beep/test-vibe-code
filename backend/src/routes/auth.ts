import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../db/store';
import { authMiddleware, signToken, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email и пароль обязательны' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    return;
  }
  const existing = store.getUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    email: email.toLowerCase().trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
    isPremium: false,
    storiesUsed: 0,
  };
  store.saveUser(user);
  const token = signToken(user.id);
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, isPremium: user.isPremium, storiesUsed: user.storiesUsed },
  });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email и пароль обязательны' });
    return;
  }
  const user = store.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Неверный email или пароль' });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Неверный email или пароль' });
    return;
  }
  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, isPremium: user.isPremium, storiesUsed: user.storiesUsed },
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = store.getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }
  res.json({ id: user.id, email: user.email, isPremium: user.isPremium, storiesUsed: user.storiesUsed });
});

export default router;
