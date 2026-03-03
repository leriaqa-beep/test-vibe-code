import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Star, TrendingUp, BarChart2, Baby } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { AdminStats } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: '2-digit' });
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs font-semibold text-text-secondary leading-tight">{label}</p>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/app');
      return;
    }
    api.admin.stats()
      .then(setStats)
      .catch(e => setError(e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-secondary text-sm">Загружаем аналитику...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-red-500 font-medium">{error || 'Нет данных'}</p>
          <button onClick={() => navigate('/app')} className="mt-4 text-purple-600 text-sm font-semibold">← Назад</button>
        </div>
      </div>
    );
  }

  const conversionPct = stats.totalUsers > 0
    ? Math.round((stats.usersWithStories / stats.totalUsers) * 100)
    : 0;

  const avgStories = stats.totalUsers > 0
    ? (stats.totalStories / stats.totalUsers).toFixed(1)
    : '0';

  const maxBarCount = Math.max(...stats.storiesByDay.map(d => d.count), 1);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/app')}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-purple-600 hover:bg-purple-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-500" /> Аналитика
            </h1>
            <p className="text-xs text-text-secondary">Данные обновляются в реальном времени</p>
          </div>
        </div>

        {/* Row 1: Primary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <KpiCard
            icon={<Users className="w-4 h-4 text-purple-600" />}
            label="Всего пользователей"
            value={stats.totalUsers}
            sub={`+${stats.newUsersWeek} за неделю`}
            color="bg-purple-100"
          />
          <KpiCard
            icon={<BookOpen className="w-4 h-4 text-indigo-600" />}
            label="Всего сказок"
            value={stats.totalStories}
            sub={`+${stats.newStoriesWeek} за неделю`}
            color="bg-indigo-100"
          />
          <KpiCard
            icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
            label="Конверсия"
            value={`${conversionPct}%`}
            sub={`${stats.usersWithStories} из ${stats.totalUsers} генерили`}
            color="bg-emerald-100"
          />
          <KpiCard
            icon={<Star className="w-4 h-4 text-yellow-500" />}
            label="Средний рейтинг"
            value={stats.avgRating > 0 ? `${stats.avgRating} ★` : '—'}
            sub="из 5 звёзд"
            color="bg-yellow-100"
          />
        </div>

        {/* Row 2: Secondary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KpiCard
            icon={<Users className="w-4 h-4 text-blue-600" />}
            label="Новых за месяц"
            value={stats.newUsersMonth}
            sub="пользователей"
            color="bg-blue-100"
          />
          <KpiCard
            icon={<Baby className="w-4 h-4 text-pink-500" />}
            label="Профилей детей"
            value={stats.totalChildren}
            sub={`в среднем ${stats.totalUsers > 0 ? (stats.totalChildren / stats.totalUsers).toFixed(1) : 0} на пользователя`}
            color="bg-pink-100"
          />
          <KpiCard
            icon={<BookOpen className="w-4 h-4 text-orange-500" />}
            label="Сказок за месяц"
            value={stats.newStoriesMonth}
            sub="новых генераций"
            color="bg-orange-100"
          />
          <KpiCard
            icon={<BarChart2 className="w-4 h-4 text-violet-600" />}
            label="Сказок / пользователь"
            value={avgStories}
            sub="среднее"
            color="bg-violet-100"
          />
        </div>

        {/* Bar chart: Stories per day */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-6">
          <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-500" /> Сказки по дням (последние 30 дней)
          </h2>
          <div className="flex items-end gap-0.5 h-28">
            {stats.storiesByDay.map(({ date, count }) => {
              const heightPct = maxBarCount > 0 ? (count / maxBarCount) * 100 : 0;
              const isToday = date === new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={date}
                  className="flex-1 flex flex-col items-center gap-0.5 group relative"
                  title={`${formatShortDate(date)}: ${count}`}
                >
                  <div
                    className={`w-full rounded-t-sm transition-all ${isToday ? 'bg-purple-600' : 'bg-purple-200 group-hover:bg-purple-400'}`}
                    style={{ height: `${Math.max(heightPct, count > 0 ? 4 : 0)}%` }}
                  />
                  {/* Tooltip on hover */}
                  {count > 0 && (
                    <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none">
                      {formatShortDate(date)}: {count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-text-muted">{formatShortDate(stats.storiesByDay[0]?.date ?? '')}</span>
            <span className="text-xs text-text-muted">сегодня</span>
          </div>
        </div>

        {/* Conversion breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-6">
          <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Конверсия пользователей
          </h2>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary font-medium">Генерили сказки</span>
                <span className="text-emerald-600 font-bold">{stats.usersWithStories} ({conversionPct}%)</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${conversionPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary font-medium">Не генерили (зарегистрировались, но не пробовали)</span>
                <span className="text-text-muted font-bold">{stats.totalUsers - stats.usersWithStories} ({100 - conversionPct}%)</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-300 rounded-full transition-all"
                  style={{ width: `${100 - conversionPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User list */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-purple-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" /> Пользователи ({stats.totalUsers})
            </h2>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 px-5 py-2 bg-purple-50 text-xs font-semibold text-text-muted uppercase tracking-wide">
            <span className="col-span-5">Email</span>
            <span className="col-span-2 text-center">Детей</span>
            <span className="col-span-2 text-center">Сказок</span>
            <span className="col-span-3 text-right">Зарегистрирован</span>
          </div>

          <div className="divide-y divide-gray-50">
            {stats.userList.map(u => (
              <div
                key={u.id}
                className={`grid grid-cols-12 px-5 py-3 items-center text-sm ${u.storiesUsed === 0 ? 'opacity-50' : ''}`}
              >
                <div className="col-span-5 min-w-0">
                  <p className="truncate text-text-primary font-medium text-xs">{u.email}</p>
                  {u.isPremium && (
                    <span className="text-xs text-purple-500 font-semibold">Premium</span>
                  )}
                </div>
                <div className="col-span-2 text-center">
                  <span className={`text-xs font-bold ${u.childrenCount > 0 ? 'text-pink-500' : 'text-text-muted'}`}>
                    {u.childrenCount}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span className={`text-xs font-bold ${u.storiesUsed > 0 ? 'text-purple-600' : 'text-text-muted'}`}>
                    {u.storiesUsed}
                  </span>
                </div>
                <div className="col-span-3 text-right text-xs text-text-muted">
                  {formatDate(u.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
