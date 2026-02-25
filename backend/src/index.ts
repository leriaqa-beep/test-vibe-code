import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import authRouter from './routes/auth';
import childrenRouter from './routes/children';
import storiesRouter from './routes/stories';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'pochemu-ka-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());

app.use('/api/auth', authRouter);
app.use('/api/children', childrenRouter);
app.use('/api/stories', storiesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

app.listen(PORT, () => {
  console.log(`Почему-Ка! backend running on http://localhost:${PORT}`);
});
