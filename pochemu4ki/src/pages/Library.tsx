import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Heart, ArrowLeft, LayoutGrid, List, BookMarked, X } from 'lucide-react';
import HeroImage from '../components/HeroImage';
import { useApp } from '../context/AppContext';
import DecorationLayer from '../components/Decorations';

type SortKey = 'newest' | 'oldest' | 'az' | 'za' | 'rating';
type ViewMode = 'cards' | 'list';

const SORT_OPTIONS: { value: SortKey; label: string; short: string }[] = [
  { value: 'newest', label: 'Новые сначала',  short: 'Новые ↓'  },
  { value: 'oldest', label: 'Старые сначала', short: 'Старые ↑' },
  { value: 'az',     label: 'А → Я',          short: 'А → Я'    },
  { value: 'za',     label: 'Я → А',          short: 'Я → А'    },
  { value: 'rating', label: 'По рейтингу',    short: '★ Оценка' },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function Library() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialChildId = params.get('child') || '';
  const { stories, children, loadStories, loadChildren } = useApp();

  const [search, setSearch] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [activeChildId, setActiveChildId] = useState(initialChildId);
  const [sort, setSort] = useState<SortKey>('newest');
  const [view, setView] = useState<ViewMode>('cards');

  useEffect(() => {
    loadChildren();
    loadStories();
  }, []);

  const filtered = useMemo(() => {
    let result = stories.filter(s => {
      if (activeChildId && s.childId !== activeChildId) return false;
      if (showSaved && !s.isSaved) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.question.toLowerCase().includes(q);
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'az') return a.title.localeCompare(b.title, 'ru');
      if (sort === 'za') return b.title.localeCompare(a.title, 'ru');
      if (sort === 'rating') return b.rating - a.rating;
      return 0;
    });

    return result;
  }, [stories, activeChildId, showSaved, search, sort]);

  return (
    <div
      className="min-h-screen relative overflow-hidden page-enter"
      style={{ background: 'var(--bg-primary)' }}
    >
      <DecorationLayer preset="dashboard" />
      <div className="max-w-lg mx-auto px-4 py-6 relative" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/app')}
            className="w-11 h-11 rounded-full bg-white shadow flex items-center justify-center text-purple-600 hover:bg-purple-50 transition flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text-primary">Библиотека</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <p className="text-sm text-text-secondary" style={{ margin: 0 }}>
                {filtered.length} из {stories.length} {stories.length === 1 ? 'история' : 'историй'}
              </p>
              {activeChildId && (() => {
                const c = children.find(ch => ch.id === activeChildId);
                return c ? (
                  <button
                    onClick={() => setActiveChildId('')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      padding: '2px 8px 2px 6px', borderRadius: 'var(--radius-full)',
                      background: 'var(--accent-primary-50)',
                      border: '1px solid var(--accent-primary-200)',
                      color: 'var(--accent-primary)', fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', lineHeight: 1.4,
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    aria-label="Сбросить фильтр"
                  >
                    {c.name} <X size={10} />
                  </button>
                ) : null;
              })()}
            </div>
          </div>
          {/* Book create button */}
          <button
            onClick={() => navigate(`/app/book/create${activeChildId ? `?child=${activeChildId}` : ''}`)}
            className="flex items-center gap-1.5 bg-purple-600 text-white text-sm font-semibold px-4 rounded-xl shadow-sm hover:bg-purple-700 transition flex-shrink-0"
            style={{ minHeight: 44 }}
          >
            <BookMarked className="w-4 h-4" />
            Книга
          </button>
        </div>

        {/* ── Search — standalone prominent bar ─────────────── */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', display: 'flex', alignItems: 'center',
          }}>
            <Search size={17} color="var(--text-muted)" />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по историям..."
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: 44, paddingRight: search ? 44 : 16,
              paddingTop: 13, paddingBottom: 13,
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              background: 'var(--bg-surface)',
              border: search
                ? '1.5px solid var(--accent-primary-200)'
                : '1.5px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              outline: 'none',
              boxShadow: 'var(--shadow-xs)',
              transition: 'border-color 0.18s',
              fontFamily: 'var(--font-body)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--bg-subtle)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Очистить поиск"
            >
              <X size={14} color="var(--text-muted)" />
            </button>
          )}
        </div>

        {/* ── Filter row: scrollable child chips + pinned controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>

          {/* Child chips — scrollable, flex-1 so they take remaining space */}
          {children.length > 0 ? (
            <div
              style={{
                flex: 1, minWidth: 0,
                display: 'flex', gap: 6,
                overflowX: 'auto', paddingBottom: 2,
                scrollbarWidth: 'none', msOverflowStyle: 'none',
              } as React.CSSProperties}
            >
              <button
                onClick={() => setActiveChildId('')}
                style={{
                  flexShrink: 0,
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: activeChildId === ''
                    ? '1.5px solid var(--accent-primary)'
                    : '1px solid var(--border-default)',
                  background: activeChildId === ''
                    ? 'var(--accent-primary-50)'
                    : 'var(--bg-surface)',
                  color: activeChildId === '' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: activeChildId === '' ? 600 : 400,
                  cursor: 'pointer',
                  minHeight: 36,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                Все
              </button>
              {children.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveChildId(activeChildId === c.id ? '' : c.id)}
                  style={{
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: activeChildId === c.id
                      ? '1.5px solid var(--accent-primary)'
                      : '1px solid var(--border-default)',
                    background: activeChildId === c.id
                      ? 'var(--accent-primary-50)'
                      : 'var(--bg-surface)',
                    color: activeChildId === c.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: activeChildId === c.id ? 600 : 400,
                    cursor: 'pointer',
                    minHeight: 36,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  <HeroImage emoji={c.hero.emoji} size="xs" /> {c.name}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {/* Secondary controls — pinned right, never scroll away */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

            {/* Saved toggle */}
            <button
              onClick={() => setShowSaved(!showSaved)}
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                background: showSaved ? 'var(--accent-pink-50)' : 'var(--bg-surface)',
                border: showSaved
                  ? '1.5px solid var(--accent-pink)'
                  : '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: 'var(--shadow-xs)',
              }}
              aria-label={showSaved ? 'Показать все' : 'Только сохранённые'}
              title={showSaved ? 'Показать все' : 'Только сохранённые'}
            >
              <Heart
                size={15}
                style={{
                  fill: showSaved ? 'var(--accent-pink)' : 'none',
                  color: showSaved ? 'var(--accent-pink)' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              />
            </button>

            {/* Sort — compact native select */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                style={{
                  height: 36,
                  paddingLeft: 10, paddingRight: 24,
                  fontSize: 13,
                  fontWeight: 500,
                  color: sort !== 'newest' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: sort !== 'newest' ? 'var(--accent-primary-50)' : 'var(--bg-surface)',
                  border: sort !== 'newest'
                    ? '1.5px solid var(--accent-primary-200)'
                    : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.15s',
                } as React.CSSProperties}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.short}</option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div style={{
                position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1l4 4 4-4" stroke={sort !== 'newest' ? 'var(--accent-primary)' : 'var(--text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* View toggle — compact pair */}
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: 2, gap: 1,
              height: 36, boxSizing: 'border-box',
              boxShadow: 'var(--shadow-xs)',
            }}>
              <button
                onClick={() => setView('cards')}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: view === 'cards' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.15s',
                  boxShadow: view === 'cards' ? 'var(--shadow-xs)' : 'none',
                  color: view === 'cards' ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
                title="Карточки"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setView('list')}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: view === 'list' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.15s',
                  boxShadow: view === 'list' ? 'var(--shadow-xs)' : 'none',
                  color: view === 'list' ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
                title="Список"
              >
                <List size={14} />
              </button>
            </div>

          </div>
        </div>

        {/* Stories */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8, fontSize: 'var(--text-base)' }}>
              {search || showSaved || activeChildId ? 'Ничего не найдено' : 'Историй пока нет'}
            </p>
            {!search && !showSaved && !activeChildId && (
              <button
                onClick={() => navigate('/app')}
                style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: 'var(--text-sm)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Создать первую сказку →
              </button>
            )}
          </div>

        ) : view === 'cards' ? (
          /* ── Card view ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(story => {
              const child = children.find(c => c.id === story.childId);
              return (
                <button
                  key={story.id}
                  onClick={() => navigate(`/app/story/${story.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'stretch',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-xs)',
                    textAlign: 'left', cursor: 'pointer',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                >
                  {/* Left thumbnail — always rendered for consistent rhythm */}
                  <div style={{
                    width: 72, flexShrink: 0, position: 'relative', overflow: 'hidden',
                    background: story.imageUrl
                      ? 'var(--bg-subtle)'
                      : 'linear-gradient(160deg, var(--accent-primary-50) 0%, var(--bg-warm) 100%)',
                  }}>
                    {story.imageUrl ? (
                      <img
                        src={story.imageUrl}
                        alt=""
                        style={{ width: 72, height: '100%', minHeight: 92, objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', minHeight: 92,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {child
                          ? <HeroImage emoji={child.hero.emoji} size="md" />
                          : <span style={{ fontSize: 22, opacity: 0.3 }}>✦</span>
                        }
                      </div>
                    )}
                    {/* Saved badge — overlaid on strip, doesn't compete with title */}
                    {story.isSaved && (
                      <div style={{
                        position: 'absolute', top: 6, right: 5,
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                      }}>
                        <Heart size={10} style={{ fill: 'var(--accent-pink)', color: 'var(--accent-pink)' }} />
                      </div>
                    )}
                  </div>

                  {/* Content area */}
                  <div style={{
                    flex: 1, minWidth: 0,
                    padding: '11px 14px 10px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    gap: 0,
                  }}>
                    {/* Title — most prominent */}
                    <p className="line-clamp-2" style={{
                      margin: '0 0 4px',
                      fontSize: 15, fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      fontFamily: 'var(--font-display)',
                    }}>
                      {story.title}
                    </p>

                    {/* Question — secondary, italic, clearly different */}
                    <p className="line-clamp-1" style={{
                      margin: '0 0 9px',
                      fontSize: 13,
                      fontStyle: 'italic',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                    }}>
                      «{story.question}»
                    </p>

                    {/* Footer: child name | date + stars */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {child && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 12, fontWeight: 500,
                          color: 'var(--accent-primary)',
                        }}>
                          <HeroImage emoji={child.hero.emoji} size="xs" />
                          {child.name}
                        </span>
                      )}
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {story.rating > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--accent-yellow-dark)', letterSpacing: '0.05em' }}>
                            {'★'.repeat(story.rating)}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {formatDate(story.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

        ) : (
          /* ── List / TOC view ── */
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-default)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xs)',
          }}>
            {filtered.map((story, idx) => {
              const child = children.find(c => c.id === story.childId);
              return (
                <button
                  key={story.id}
                  onClick={() => navigate(`/app/story/${story.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    borderBottom: idx < filtered.length - 1
                      ? '1px solid var(--border-muted)'
                      : 'none',
                    transition: 'background 0.12s',
                  }}
                >
                  {/* Hero avatar square — visual anchor instead of bare number */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: 'var(--accent-primary-50)',
                    border: '1px solid var(--accent-primary-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {child
                      ? <HeroImage emoji={child.hero.emoji} size="xs" />
                      : <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)' }}>{idx + 1}</span>
                    }
                  </div>

                  {/* Title + question */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: '0 0 2px',
                      fontSize: 14, fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {story.title}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: 12, fontStyle: 'italic',
                      color: 'var(--text-muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      «{story.question}»
                    </p>
                  </div>

                  {/* Right: stars (top) + date (bottom) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    {story.rating > 0 ? (
                      <span style={{ fontSize: 11, color: 'var(--accent-yellow-dark)', lineHeight: 1, letterSpacing: '0.04em' }}>
                        {'★'.repeat(story.rating)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--border-strong)', lineHeight: 1 }}>—</span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1 }}>
                      {formatDate(story.createdAt)}
                    </span>
                  </div>

                  {/* Saved heart — far right when present */}
                  {story.isSaved && (
                    <Heart size={13} style={{ fill: 'var(--accent-pink)', color: 'var(--accent-pink)', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
