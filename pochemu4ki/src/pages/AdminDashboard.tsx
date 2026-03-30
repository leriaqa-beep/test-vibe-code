import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Star, TrendingUp, BarChart2, Baby, Download, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { AdminStats, AdminUserEntry } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: '2-digit' });
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function pct(num: number, total: number) {
  return total > 0 ? Math.round((num / total) * 100) : 0;
}

function exportCSV(userList: AdminUserEntry[]) {
  const headers = ['Email', 'Детей', 'Сказок', 'Премиум', 'Дата регистрации'];
  const rows = userList.map(u => [
    `"${u.email}"`,
    u.childrenCount,
    u.storiesUsed,
    u.isPremium ? 'Да' : 'Нет',
    new Date(u.createdAt).toLocaleDateString('ru-RU'),
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pochemu4ka-users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function KpiCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs font-semibold text-text-secondary leading-tight">{label}</p>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

const PERIOD_OPTIONS = [
  { label: '7 дн', value: 7 },
  { label: '30 дн', value: 30 },
  { label: '90 дн', value: 90 },
  { label: '365 дн', value: 365 },
];

const DOW_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function heatColor(value: number, max: number): string {
  if (max === 0 || value === 0) return '#F3F0FB';
  const t = value / max;
  if (t < 0.25) return '#DDD5F5';
  if (t < 0.5)  return '#A897E0';
  if (t < 0.75) return '#7C6BC4';
  return '#4C3BA0';
}

function HeatmapGrid({ heatmap, days }: { heatmap: number[][], days: number }) {
  const max = Math.max(...heatmap.flat(), 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-6">
      <h2 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-purple-500" /> Тепловая карта спроса
      </h2>
      <p className="text-xs text-text-muted mb-4">
        Когда генерируют сказки — последние {days} дн, UTC+6 (Бишкек)
      </p>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 600 }}>
          {/* Hour labels */}
          <div style={{ display: 'flex', marginLeft: 28, marginBottom: 4 }}>
            {hours.map(h => (
              <div key={h} style={{
                flex: 1, textAlign: 'center',
                fontSize: 9, color: 'var(--text-muted)',
                fontWeight: h % 6 === 0 ? 700 : 400,
              }}>
                {h % 6 === 0 ? String(h).padStart(2, '0') : ''}
              </div>
            ))}
          </div>
          {/* Rows */}
          {heatmap.map((row, dow) => (
            <div key={dow} style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <div style={{
                width: 24, fontSize: 10, fontWeight: 600,
                color: 'var(--text-secondary)', textAlign: 'right',
                paddingRight: 5, flexShrink: 0,
              }}>
                {DOW_LABELS[dow]}
              </div>
              {row.map((count, hour) => (
                <div
                  key={hour}
                  title={`${DOW_LABELS[dow]} ${String(hour).padStart(2, '0')}:00 — ${count} сказок`}
                  style={{
                    flex: 1, height: 18,
                    borderRadius: 3,
                    background: heatColor(count, max),
                    margin: '0 1px',
                    cursor: count > 0 ? 'default' : undefined,
                    position: 'relative',
                    transition: 'opacity 0.15s',
                  }}
                />
              ))}
            </div>
          ))}
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>меньше</span>
            {['#F3F0FB', '#DDD5F5', '#A897E0', '#7C6BC4', '#4C3BA0'].map(c => (
              <div key={c} style={{ width: 14, height: 14, borderRadius: 3, background: c }} />
            ))}
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>больше</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const FUNNEL_STEPS = [
  { key: 'signups' as const,    label: 'Зарегист-рировались', color: '#7C6BC4', bg: '#EDE9F8' },
  { key: 'firstStory' as const, label: '1+ сказка',           color: '#5B8DD9', bg: '#E8F0FB' },
  { key: 'twoPlus' as const,    label: '2+ сказки',           color: '#3AABAB', bg: '#E4F5F5' },
  { key: 'rated' as const,      label: 'Оценили',             color: '#E8A93B', bg: '#FDF3E0' },
  { key: 'premium' as const,    label: 'Premium',             color: '#D46BAA', bg: '#FAE9F4' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchStats = useCallback((d: number) => {
    setLoading(true);
    api.admin.stats(d)
      .then(setStats)
      .catch(e => {
        if (e.status === 403) navigate('/app');
        else setError(e.message || 'Ошибка загрузки');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => { fetchStats(days); }, [days, fetchStats]);

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

  const conversionPct = pct(stats.usersWithStories, stats.totalUsers);
  const maxBarCount = Math.max(...stats.storiesByDay.map(d => d.count), 1);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
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
          <button
            onClick={() => exportCSV(stats.userList)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm text-purple-600 text-xs font-semibold hover:bg-purple-50 transition"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-5">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: days === opt.value ? '2px solid var(--accent-primary)' : '1.5px solid var(--border-default)',
                background: days === opt.value ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: days === opt.value ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {opt.label}
            </button>
          ))}
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
            sub={`~${stats.totalUsers > 0 ? (stats.totalChildren / stats.totalUsers).toFixed(1) : 0} на польз.`}
            color="bg-pink-100"
          />
          <KpiCard
            icon={<BookOpen className="w-4 h-4 text-orange-500" />}
            label={`Сказок за ${days} дн`}
            value={stats.newStoriesPeriod}
            sub="за выбранный период"
            color="bg-orange-100"
          />
          <KpiCard
            icon={<Crown className="w-4 h-4 text-violet-600" />}
            label="Premium"
            value={stats.premiumCount}
            sub={`${pct(stats.premiumCount, stats.totalUsers)}% от всех`}
            color="bg-violet-100"
          />
        </div>

        {/* Bar chart: Stories per day */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-6">
          <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-500" /> Сказки по дням (последние {days} дн)
          </h2>
          <div className="flex items-end gap-0.5 h-28">
            {stats.storiesByDay.map(({ date, count }) => {
              const heightPct = (count / maxBarCount) * 100;
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

        {/* Heatmap */}
        <HeatmapGrid heatmap={stats.heatmap} days={days} />

        {/* Funnel */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-6">
          <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" /> Воронка активации (все время)
          </h2>
          <div className="flex flex-col gap-2">
            {FUNNEL_STEPS.map((step, idx) => {
              const count = stats.funnel[step.key];
              const fromTotal = pct(count, stats.funnel.signups);
              const fromPrev = idx === 0 ? 100 : pct(count, stats.funnel[FUNNEL_STEPS[idx - 1].key]);
              const barWidth = fromTotal;
              return (
                <div key={step.key}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-xs font-semibold text-text-secondary w-24 shrink-0">{step.label}</span>
                    <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: step.bg }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${barWidth}%`,
                          background: step.color,
                          borderRadius: 8,
                          transition: 'width 0.4s ease',
                          minWidth: count > 0 ? 8 : 0,
                        }}
                      />
                    </div>
                    <div className="text-right shrink-0 w-28">
                      <span className="text-xs font-bold" style={{ color: step.color }}>{count}</span>
                      <span className="text-xs text-text-muted ml-1">({fromTotal}%</span>
                      {idx > 0 && (
                        <span className="text-xs text-text-muted">, {fromPrev}%↓)</span>
                      )}
                      {idx === 0 && <span className="text-xs text-text-muted">)</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-text-muted mt-2">% от начала воронки · % от предыдущего шага</p>
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
                <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${conversionPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary font-medium">Не генерили (зарегистрировались, но не пробовали)</span>
                <span className="text-text-muted font-bold">{stats.totalUsers - stats.usersWithStories} ({100 - conversionPct}%)</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-300 rounded-full transition-all" style={{ width: `${100 - conversionPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Referral sources */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-purple-50">
            <h2 className="text-sm font-bold text-text-primary">📣 Откуда узнали о приложении</h2>
            <div className="flex gap-4 mt-0.5">
              <p className="text-xs text-text-muted">
                Ответили {(stats.referralSources || []).reduce((s, r) => s + r.count, 0)} из {stats.totalUsers}
              </p>
              {stats.usersWithoutReferral > 0 && (
                <p className="text-xs text-orange-500 font-medium">
                  {stats.usersWithoutReferral} без ответа
                </p>
              )}
            </div>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            {!stats.referralSources || stats.referralSources.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">Пока нет данных</p>
            ) : (() => {
              const max = Math.max(...stats.referralSources.map(r => r.count));
              return stats.referralSources.map(r => (
                <div key={r.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">{r.source}</span>
                    <span className="text-sm font-bold text-purple-600">{r.count}</span>
                  </div>
                  <div style={{ background: 'var(--bg-subtle)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.round((r.count / max) * 100)}%`,
                      background: 'var(--gradient-button)',
                      borderRadius: 6,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* User list */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-purple-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" /> Пользователи ({stats.totalUsers})
            </h2>
            <span className="text-xs text-text-muted">
              {stats.premiumCount} Premium · {stats.totalUsers - stats.usersWithStories} без сказок
            </span>
          </div>

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
                    <span className="text-xs text-purple-500 font-semibold flex items-center gap-0.5">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
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
