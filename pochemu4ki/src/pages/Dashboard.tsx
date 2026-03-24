import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, UserPlus, Crown } from 'lucide-react';
import HeroImage from '../components/HeroImage';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { FREE_STORY_LIMIT } from '../types';
import DecorationLayer from '../components/Decorations';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { children, stories, loadChildren, loadStories } = useApp();

  useEffect(() => {
    loadChildren();
    loadStories();
  }, []);

  const [betaDismissed, setBetaDismissed] = useState(
    () => localStorage.getItem('pochemu4ki_beta_dismissed') === '1'
  );

  const storiesUsed = user?.storiesUsed || 0;
  const storiesLeft = Math.max(0, FREE_STORY_LIMIT - storiesUsed);
  const limitReached = !user?.isPremium && storiesUsed >= FREE_STORY_LIMIT;

  return (
    <div
      className="min-h-screen relative overflow-hidden page-enter"
      style={{ background: 'var(--bg-primary)' }}
    >
      <DecorationLayer preset="dashboard" />
      <div className="max-w-lg mx-auto px-4 py-5 relative" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/mascot/mascot-logo.png"
              alt="Почему-Ка!"
              className="w-9 h-9 object-contain flex-shrink-0"
            />
            <div>
              <span
                className="text-xl font-bold block leading-tight"
                style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}
              >
                Почему-Ка!
              </span>
              {user?.email && (
                <span className="caption block" style={{ lineHeight: 1.2 }}>
                  {user.email.split('@')[0]}
                </span>
              )}
            </div>
          </div>
          {user?.isPremium && (
            <span
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: 'var(--accent-yellow-100)', color: '#8A6A00' }}
            >
              <Crown className="w-3 h-3" /> Премиум
            </span>
          )}
        </div>

        {/* ── Beta banner — dismissable ───────────────────────────── */}
        {!betaDismissed && (
          <div
            className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg,#f3f0ff,#fce7f3)',
              border: '1px solid var(--accent-primary-100)',
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>🚀</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                Бета-версия · Premium бесплатно
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Вы среди первых! Все функции открыты — расскажите нам, что думаете
              </p>
            </div>
            <button
              onClick={() => {
                setBetaDismissed(true);
                localStorage.setItem('pochemu4ki_beta_dismissed', '1');
              }}
              style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(124,107,196,0.12)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--accent-primary)', fontSize: 18, lineHeight: 1,
              }}
              aria-label="Скрыть"
            >
              ×
            </button>
          </div>
        )}

        {/* ── Stories usage — compact strip (non-premium, used > 0) ── */}
        {!user?.isPremium && storiesUsed > 0 && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4"
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-muted)',
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="caption">Бесплатные истории</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: limitReached ? 'var(--color-error)' : 'var(--accent-primary)' }}
                >
                  {storiesUsed} / {FREE_STORY_LIMIT}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--border-default)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((storiesUsed / FREE_STORY_LIMIT) * 100, 100)}%`,
                    background: limitReached ? 'var(--color-error)' : 'var(--gradient-button)',
                  }}
                />
              </div>
              {!limitReached && (
                <p className="caption mt-1">
                  Осталось {storiesLeft} {storiesLeft === 1 ? 'история' : 'истории'}
                </p>
              )}
            </div>
            {limitReached && (
              <button
                onClick={() => navigate('/app/pricing')}
                className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-white px-3 rounded-lg"
                style={{
                  background: 'var(--accent-primary)',
                  minHeight: 36,
                  boxShadow: 'var(--shadow-button)',
                }}
              >
                <Crown className="w-3 h-3" /> Upgrade
              </button>
            )}
          </div>
        )}

        {/* ── Children ───────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Мои дети</span>
            <button
              onClick={() => navigate('/app/children/new')}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 rounded-xl"
              style={{
                background: 'var(--accent-primary)',
                color: '#fff',
                minHeight: 36,
                boxShadow: '0 2px 8px rgba(124,107,196,0.25)',
              }}
            >
              <Plus className="w-4 h-4" /> Добавить
            </button>
          </div>

          {children.length === 0 ? (
            /* Empty state */
            <button
              onClick={() => navigate('/app/children/new')}
              className="w-full rounded-2xl py-10 flex flex-col items-center gap-3 transition"
              style={{
                background: 'var(--accent-primary-50)',
                border: '1.5px dashed var(--accent-primary-200)',
              }}
            >
              <UserPlus className="w-10 h-10" style={{ color: 'var(--accent-primary-light)' }} />
              <div className="text-center">
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  Добавьте первого ребёнка
                </p>
                <p className="helper-text text-sm mt-0.5">Имя, возраст и любимые игрушки</p>
              </div>
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              {children.map(child => {
                const childStories = stories.filter(s => s.childId === child.id);
                const firstName = child.name.split(' ')[0];

                return (
                  <div
                    key={child.id}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    {/* Card top: hero + info */}
                    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                      {/* Hero avatar — круг 60px */}
                      <div
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{
                          width: 60, height: 60,
                          borderRadius: '50%',
                          background: 'var(--accent-primary-50)',
                          border: '2px solid var(--accent-primary-100)',
                        }}
                      >
                        <HeroImage emoji={child.hero.emoji} size="lg" />
                      </div>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="text-lg font-bold leading-tight truncate"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                          >
                            {child.name}
                          </h3>
                          {childStories.length > 0 && (
                            <span
                              className="caption flex-shrink-0 mt-0.5"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {childStories.length} ист.
                            </span>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {child.age} лет · {child.gender === 'girl' ? '👧' : '👦'}
                          {' · '}{child.hero.name}
                        </p>
                      </div>
                    </div>

                    {/* Toys chips — max 3 */}
                    {child.toys.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                        {child.toys.slice(0, 3).map(t => (
                          <span
                            key={t.id}
                            className="caption px-2.5 py-1 rounded-full"
                            style={{
                              background: 'var(--accent-primary-50)',
                              color: 'var(--accent-primary-dark)',
                              border: '1px solid var(--accent-primary-100)',
                            }}
                          >
                            🧸 {t.nickname}
                          </span>
                        ))}
                        {child.toys.length > 3 && (
                          <span
                            className="caption px-2 py-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            +{child.toys.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Divider */}
                    <div style={{ height: 1, background: 'var(--border-muted)', margin: '0 16px' }} />

                    {/* Actions */}
                    <div className="px-4 py-3 flex flex-col gap-2">
                      {/* PRIMARY — full width gradient */}
                      <button
                        onClick={() => limitReached
                          ? navigate('/app/pricing')
                          : navigate(`/app/children/${child.id}/story`)
                        }
                        className="w-full font-bold text-base rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98]"
                        style={{
                          background: 'var(--gradient-button)',
                          color: '#fff',
                          minHeight: 52,
                          boxShadow: 'var(--shadow-button)',
                          letterSpacing: '0.01em',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                          <path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z" />
                        </svg>
                        {limitReached ? 'Подключить Premium' : `Сказку для ${firstName}!`}
                      </button>

                      {/* SECONDARY — text link, only if stories exist */}
                      {childStories.length > 0 && (
                        <button
                          onClick={() => navigate(`/app/library?child=${child.id}`)}
                          style={{
                            width: '100%', background: 'none', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
                            minHeight: 36, padding: '4px 0',
                            WebkitTapHighlightColor: 'transparent',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          {childStories.length} {childStories.length === 1 ? 'история' : childStories.length <= 4 ? 'истории' : 'историй'} · смотреть
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent stories ─────────────────────────────────────── */}
        {stories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="section-label">Последние истории</span>
              <button
                onClick={() => navigate('/app/library')}
                className="text-sm font-semibold flex items-center gap-1 px-2 py-1 rounded-lg transition hover:bg-purple-50"
                style={{ color: 'var(--accent-primary)', minHeight: 36 }}
              >
                Все
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {stories.slice(0, 3).map(story => {
                const storyChild = children.find(c => c.id === story.childId);
                return (
                  <button
                    key={story.id}
                    onClick={() => navigate(`/app/story/${story.id}`)}
                    className="w-full text-left flex items-center gap-3 rounded-xl transition active:scale-[0.99]"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      minHeight: 68,
                      padding: '12px 14px',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary-200)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-xs)';
                    }}
                  >
                    {/* Hero thumbnail */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'var(--accent-primary-50)',
                        border: '1px solid var(--accent-primary-100)',
                      }}
                    >
                      {story.heroUsed?.imageUrl
                        ? <img
                            src={story.heroUsed.imageUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        : story.heroUsed?.emoji || storyChild
                          ? <HeroImage emoji={story.heroUsed?.emoji ?? storyChild!.hero.emoji} size="md" />
                          : <BookOpen className="w-5 h-5" style={{ color: 'var(--accent-primary-light)' }} />
                      }
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm truncate leading-tight"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {story.title}
                      </p>
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}
                      >
                        «{story.question}»
                      </p>
                      {storyChild && (
                        <p className="caption mt-0.5" style={{ color: 'var(--accent-primary)' }}>
                          {storyChild.name}
                        </p>
                      )}
                    </div>

                    {/* Rating + chevron */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      {story.rating > 0 && (
                        <span className="text-xs font-medium" style={{ color: 'var(--accent-yellow-dark)' }}>
                          {'★'.repeat(story.rating)}
                        </span>
                      )}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
