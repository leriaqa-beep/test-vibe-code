import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../db/store';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pochemu-ka-secret-key-2024';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// --- Google OAuth strategy ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (_accessToken, _refreshToken, profile, done) => {
      done(null, profile);
    }
  ));
}

// GET /api/auth/google — redirect to Google
router.get('/google', (req: Request, res: Response, next) => {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id' || !GOOGLE_CLIENT_SECRET || GOOGLE_CLIENT_SECRET === 'your-google-client-secret') {
    res.redirect(`${FRONTEND_URL}/auth?error=google_not_configured`);
    return;
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

// GET /api/auth/google/callback — handle Google response
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/auth?error=google_failed` }),
  async (req: Request, res: Response) => {
    const profile = req.user as import('passport-google-oauth20').Profile;
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value || `${googleId}@google.com`;

    // Find or create user
    let user = await store.getUserByGoogleId(googleId);
    if (!user) {
      user = await store.getUserByEmail(email);
    }
    if (!user) {
      user = {
        id: uuidv4(),
        email,
        passwordHash: '',
        googleId,
        createdAt: new Date().toISOString(),
        isPremium: false,
        storiesUsed: 0,
      };
    } else if (!user.googleId) {
      user = { ...user, googleId };
    }
    await store.saveUser(user);

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email и пароль обязательны' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    return;
  }

  const existing = await store.getUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
    isPremium: false,
    storiesUsed: 0,
  };
  await store.saveUser(user);

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, email: user.email, isPremium: user.isPremium, storiesUsed: user.storiesUsed } });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email и пароль обязательны' });
    return;
  }

  const user = await store.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Неверный email или пароль' });
    return;
  }

  if (!user.passwordHash) {
    res.status(401).json({ error: 'Этот аккаунт создан через Google. Войдите через Google.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Неверный email или пароль' });
    return;
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, email: user.email, isPremium: user.isPremium, storiesUsed: user.storiesUsed } });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const user = await store.getUserById(userId);

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }

  res.json({ id: user.id, email: user.email, isPremium: user.isPremium, storiesUsed: user.storiesUsed });
});

export default router;