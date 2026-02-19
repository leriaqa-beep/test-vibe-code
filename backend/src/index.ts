import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import childrenRoutes from './routes/children';
import storiesRoutes from './routes/stories';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/stories', storiesRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

app.listen(PORT, () => {
  console.log(`Почему-Ка! backend running on http://localhost:${PORT}`);
});
