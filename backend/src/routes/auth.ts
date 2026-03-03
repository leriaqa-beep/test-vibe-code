import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { Resend } from 'resend';
import { store } from '../db/store';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pochemu-ka-secret-key-2024';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Почему-Ка! <noreply@pochemu4ki.app>';

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
  // Save frontend origin so callback can redirect back to the correct port
  const referer = req.get('Referer') || req.get('Origin') || '';
  const match = referer.match(/^(https?:\/\/localhost:\d+)/);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req as any).session.frontendUrl = match ? match[1] : FRONTEND_URL;
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

// GET /api/auth/google/callback — handle Google response
router.get('/google/callback', (req: Request, res: Response, next) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const frontendUrl = (req as any).session?.frontendUrl || FRONTEND_URL;

  passport.authenticate('google', { session: false }, (err: Error | null, user: unknown, info: unknown) => {
    if (err) {
      logger.error('[Google OAuth] Strategy error', err);
      return res.redirect(`${frontendUrl}/auth?error=google_failed`);
    }
    if (!user) {
      logger.warn('[Google OAuth] Authentication failed', info);
      return res.redirect(`${frontendUrl}/auth?error=google_failed`);
    }

    const profile = user as import('passport-google-oauth20').Profile;
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value || `${googleId}@google.com`;

    (async () => {
      let dbUser = await store.getUserByGoogleId(googleId);
      if (!dbUser) dbUser = await store.getUserByEmail(email);
      if (!dbUser) {
        dbUser = {
          id: uuidv4(),
          email,
          passwordHash: '',
          googleId,
          createdAt: new Date().toISOString(),
          isPremium: true, // beta: all new users get Premium
          storiesUsed: 0,
        };
      } else if (!dbUser.googleId) {
        dbUser = { ...dbUser, googleId };
      }
      await store.saveUser(dbUser);

      const token = jwt.sign({ userId: dbUser.id, email: dbUser.email }, JWT_SECRET, { expiresIn: '30d' });
      logger.info(`[Google OAuth] Success for ${email} → redirecting to ${frontendUrl}`);
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    })().catch((asyncErr: Error) => {
      logger.error('[Google OAuth] Async error', asyncErr);
      res.redirect(`${frontendUrl}/auth?error=google_failed`);
    });
  })(req, res, next);
});

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
    isPremium: true, // beta: all new users get Premium
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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ error: 'Email обязателен' });
    return;
  }

  // Always respond with success to avoid email enumeration
  res.json({ message: 'Если аккаунт существует, ссылка для сброса отправлена на email' });

  const user = await store.getUserByEmail(email);
  if (!user || !user.passwordHash) return; // no account or Google-only account

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await store.saveResetToken(token, user.id, expiresAt);

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  if (resend) {
    resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Сброс пароля — Почему-Ка!',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#FFFBF5;border-radius:16px">
          <img src="https://pochemu4ki-app.onrender.com/assets/mascot/mascot-think.png" width="64" style="display:block;margin:0 auto 16px" alt="Маскот"/>
          <h1 style="font-size:22px;color:#2D2B3D;text-align:center;margin:0 0 8px">Сброс пароля</h1>
          <p style="color:#7A7890;text-align:center;margin:0 0 24px">Нажмите кнопку ниже, чтобы задать новый пароль. Ссылка действует 1 час.</p>
          <a href="${resetUrl}" style="display:block;background:linear-gradient(135deg,#7C6BC4,#C86DD7);color:#fff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:12px;font-weight:600;font-size:15px">
            Сбросить пароль
          </a>
          <p style="color:#ABA9C0;font-size:12px;text-align:center;margin-top:20px">
            Если вы не запрашивали сброс пароля — проигнорируйте это письмо.
          </p>
        </div>
      `,
    }).catch((err: Error) => logger.error('[ForgotPassword] Email send error', err));
  } else {
    logger.info(`[ForgotPassword] RESEND_API_KEY not set. Reset URL: ${resetUrl}`);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) {
    res.status(400).json({ error: 'Токен и новый пароль обязательны' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    return;
  }

  const record = await store.getResetToken(token);
  if (!record) {
    res.status(400).json({ error: 'Ссылка недействительна или уже использована' });
    return;
  }
  if (record.expiresAt < new Date()) {
    await store.deleteResetToken(token);
    res.status(400).json({ error: 'Ссылка истекла. Запросите новую' });
    return;
  }

  const user = await store.getUserById(record.userId);
  if (!user) {
    res.status(400).json({ error: 'Пользователь не найден' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await store.saveUser({ ...user, passwordHash });
  await store.deleteResetToken(token);

  logger.info(`[ResetPassword] Password updated for ${user.email}`);
  res.json({ message: 'Пароль успешно изменён' });
});

export default router;