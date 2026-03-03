import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { store } from '../db/store';
import { supabase } from '../db/supabase';

const router = Router();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Admin-only middleware
async function adminMiddleware(req: AuthRequest, res: Response, next: () => void) {
  const user = await store.getUserById(req.userId!);
  if (!user || user.email !== ADMIN_EMAIL) {
    res.status(403).json({ error: 'Доступ запрещён' });
    return;
  }
  next();
}

// GET /api/admin/stats
router.get('/stats', authMiddleware, adminMiddleware as never, async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const month = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: totalStories },
    { count: totalChildren },
    { count: newUsersWeek },
    { count: newUsersMonth },
    { count: newStoriesWeek },
    { count: newStoriesMonth },
    { count: usersWithStories },
    { data: ratingData },
    { data: storiesByDayData },
    { data: userList },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('stories').select('*', { count: 'exact', head: true }),
    supabase.from('children').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', week),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', month),
    supabase.from('stories').select('*', { count: 'exact', head: true }).gte('created_at', week),
    supabase.from('stories').select('*', { count: 'exact', head: true }).gte('created_at', month),
    supabase.from('users').select('*', { count: 'exact', head: true }).gt('stories_used', 0),
    supabase.from('stories').select('rating').gt('rating', 0),
    supabase.from('stories').select('created_at').gte('created_at', month).order('created_at', { ascending: true }),
    supabase.from('users').select('id, email, created_at, stories_used, is_premium').order('created_at', { ascending: false }),
  ]);

  // Average rating
  const ratings = (ratingData || []).map((r: { rating: number }) => r.rating);
  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
    : 0;

  // Stories grouped by date (last 30 days)
  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const story of (storiesByDayData || [])) {
    const day = (story as { created_at: string }).created_at.slice(0, 10);
    if (day in dayMap) dayMap[day]++;
  }
  const storiesByDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

  // User list with children count
  const childrenByUser: Record<string, number> = {};
  const { data: allChildren } = await supabase.from('children').select('user_id');
  for (const c of (allChildren || [])) {
    const uid = (c as { user_id: string }).user_id;
    childrenByUser[uid] = (childrenByUser[uid] || 0) + 1;
  }

  const users = (userList || []).map((u: {
    id: string; email: string; created_at: string; stories_used: number; is_premium: boolean;
  }) => ({
    id: u.id,
    email: u.email,
    createdAt: u.created_at,
    storiesUsed: u.stories_used,
    isPremium: u.is_premium,
    childrenCount: childrenByUser[u.id] || 0,
  }));

  res.json({
    totalUsers: totalUsers ?? 0,
    totalStories: totalStories ?? 0,
    totalChildren: totalChildren ?? 0,
    newUsersWeek: newUsersWeek ?? 0,
    newUsersMonth: newUsersMonth ?? 0,
    newStoriesWeek: newStoriesWeek ?? 0,
    newStoriesMonth: newStoriesMonth ?? 0,
    usersWithStories: usersWithStories ?? 0,
    avgRating,
    storiesByDay,
    userList: users,
  });
});

export default router;
