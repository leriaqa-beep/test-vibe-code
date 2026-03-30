import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { store } from '../db/store';
import { supabase } from '../db/supabase';

const router = Router();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Admin-only middleware
async function adminMiddleware(req: AuthRequest, res: Response, next: () => void) {
  const user = await store.getUserById(req.userId!);
  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    res.status(403).json({ error: 'Доступ запрещён' });
    return;
  }
  next();
}

// GET /api/admin/stats?days=30
router.get('/stats', authMiddleware, adminMiddleware as never, async (req: Request, res: Response) => {
  const now = new Date();
  const days = Math.min(Math.max(parseInt(String(req.query.days || '30'), 10) || 30, 7), 365);
  const period = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
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
    { count: newStoriesPeriod },
    { count: usersWithStories },
    { count: premiumCount },
    { data: ratingData },
    { data: storiesByDayData },
    { data: userList },
    { data: allStoriesForFunnel },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('stories').select('*', { count: 'exact', head: true }),
    supabase.from('children').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', week),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', month),
    supabase.from('stories').select('*', { count: 'exact', head: true }).gte('created_at', week),
    supabase.from('stories').select('*', { count: 'exact', head: true }).gte('created_at', month),
    supabase.from('stories').select('*', { count: 'exact', head: true }).gte('created_at', period),
    supabase.from('users').select('*', { count: 'exact', head: true }).gt('stories_used', 0),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('stories').select('rating').gt('rating', 0),
    supabase.from('stories').select('created_at').gte('created_at', period).order('created_at', { ascending: true }),
    supabase.from('users').select('id, email, created_at, stories_used, is_premium').order('created_at', { ascending: false }),
    supabase.from('stories').select('user_id, rating'),
  ]);

  const { data: referralData } = await supabase
    .from('users')
    .select('referral_source')
    .not('referral_source', 'is', null);

  // Average rating
  const ratings = (ratingData || []).map((r: { rating: number }) => r.rating);
  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
    : 0;

  // Stories grouped by date (selected period)
  const dayMap: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }

  // Heatmap: day-of-week (0=Mon) × hour (0-23, UTC+6 Bishkek)
  const heatmap: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));

  for (const story of (storiesByDayData || [])) {
    const created = (story as { created_at: string }).created_at;
    const day = created.slice(0, 10);
    if (day in dayMap) dayMap[day]++;

    const d = new Date(created);
    const dow = (d.getUTCDay() + 6) % 7; // 0=Mon...6=Sun
    const hour = (d.getUTCHours() + 6) % 24; // UTC+6 Bishkek
    heatmap[dow][hour]++;
  }
  const storiesByDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

  // Funnel: all-time conversion stages
  const userStoryCounts: Record<string, number> = {};
  const userRatedSet = new Set<string>();
  for (const s of (allStoriesForFunnel || []) as { user_id: string; rating: number }[]) {
    userStoryCounts[s.user_id] = (userStoryCounts[s.user_id] || 0) + 1;
    if (s.rating > 0) userRatedSet.add(s.user_id);
  }
  const usersWithTwoPlus = Object.values(userStoryCounts).filter(c => c >= 2).length;

  const funnel = {
    signups: totalUsers ?? 0,
    firstStory: usersWithStories ?? 0,
    twoPlus: usersWithTwoPlus,
    rated: userRatedSet.size,
    premium: premiumCount ?? 0,
  };

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

  // Referral source breakdown
  const referralMap: Record<string, number> = {};
  for (const row of (referralData || [])) {
    const src = (row as { referral_source: string }).referral_source;
    if (src) referralMap[src] = (referralMap[src] || 0) + 1;
  }
  const referralSources = Object.entries(referralMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  const usersWithoutReferral = (totalUsers ?? 0) - (referralData || []).length;

  res.json({
    totalUsers: totalUsers ?? 0,
    totalStories: totalStories ?? 0,
    totalChildren: totalChildren ?? 0,
    newUsersWeek: newUsersWeek ?? 0,
    newUsersMonth: newUsersMonth ?? 0,
    newStoriesWeek: newStoriesWeek ?? 0,
    newStoriesMonth: newStoriesMonth ?? 0,
    newStoriesPeriod: newStoriesPeriod ?? 0,
    usersWithStories: usersWithStories ?? 0,
    premiumCount: premiumCount ?? 0,
    avgRating,
    storiesByDay,
    userList: users,
    referralSources,
    usersWithoutReferral,
    funnel,
    heatmap,
    days,
  });
});

// POST /api/admin/users/:id/set-premium
router.post('/users/:id/set-premium', authMiddleware, adminMiddleware as never, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isPremium, days: grantDays } = req.body as { isPremium: boolean; days?: number };

  if (typeof isPremium !== 'boolean') {
    res.status(400).json({ error: 'isPremium (boolean) обязателен' });
    return;
  }

  // Step 1: Toggle is_premium (always safe)
  const { error } = await supabase
    .from('users')
    .update({ is_premium: isPremium })
    .eq('id', id);

  if (error) {
    res.status(500).json({ error: 'Не удалось обновить пользователя' });
    return;
  }

  // Step 2: Set plan_expires_at (requires migration 001_plan_expires_at.sql — silently skipped if not run)
  let planExpiresAt: string | null = null;
  if (isPremium && grantDays) {
    planExpiresAt = new Date(Date.now() + grantDays * 24 * 60 * 60 * 1000).toISOString();
  }
  // column may not exist yet — run migrations/001_plan_expires_at.sql to enable
  try {
    await supabase.from('users').update({ plan_expires_at: planExpiresAt }).eq('id', id);
  } catch { /* silent — migration not yet applied */ }

  res.json({ success: true, isPremium, planExpiresAt });
});

// GET /api/admin/feedback?limit=50
router.get('/feedback', authMiddleware, adminMiddleware as never, async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit || '50'), 10) || 50, 200);

  const { data, error } = await supabase
    .from('feedback')
    .select('id, user_id, text, rating, page, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    res.status(500).json({ error: 'Не удалось загрузить отзывы' });
    return;
  }

  // Enrich with user emails
  const userIds = [...new Set(
    (data || []).map((f: { user_id: string | null }) => f.user_id).filter(Boolean)
  )] as string[];

  const emailMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users').select('id, email').in('id', userIds);
    for (const u of (users || []) as { id: string; email: string }[]) {
      emailMap[u.id] = u.email;
    }
  }

  const feedback = (data || []).map((f: {
    id: string; user_id: string | null; text: string;
    rating: number | null; page: string | null; created_at: string;
  }) => ({
    id: f.id,
    userId: f.user_id,
    userEmail: f.user_id ? (emailMap[f.user_id] || null) : null,
    text: f.text,
    rating: f.rating || null,
    page: f.page || null,
    createdAt: f.created_at,
  }));

  res.json({ feedback, total: feedback.length });
});

export default router;
