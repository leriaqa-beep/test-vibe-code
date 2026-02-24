import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pochemu-ka-secret-key-2024';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Необходима авторизация' });
    return;
  }
  const token = header.slice(7);
  try {
    // Supabase JWT stores user ID in 'sub', custom JWT used 'userId'
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string; userId?: string };
    req.userId = payload.sub ?? payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Недействительный токен' });
  }
}
