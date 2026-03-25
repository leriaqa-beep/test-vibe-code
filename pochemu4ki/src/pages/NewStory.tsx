import { useState, useEffect, useRef, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Check, ChevronRight, ChevronLeft, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import VoiceInput from '../components/VoiceInput';
import DecorationLayer from '../components/Decorations';
import Mascot from '../components/Mascot/Mascot';
import { declineName } from '../utils/declineName';

/** Small circle that shows a mascot until hero image loads, then swaps to it */
const HeroCircle = memo(function HeroCircle({ imageUrl, size }: { imageUrl?: string; size: number }) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const loaded = !!imageUrl && loadedUrl === imageUrl;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <img
        src="/assets/mascot/mascot-hero.png"
        alt=""
        style={{
          position: 'absolute', width: Math.round(size * 0.62), height: Math.round(size * 0.62),
          objectFit: 'contain',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          opacity: loaded ? 0 : 1, transition: 'opacity 0.3s',
        }}
      />
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          referrerPolicy="no-referrer"
          style={{
            position: 'absolute', inset: 0, width: size, height: size,
            objectFit: 'cover', objectPosition: 'top center', borderRadius: '50%',
            opacity: loaded ? 1 : 0, transition: 'opacity 0.4s',
          }}
          onLoad={() => setLoadedUrl(imageUrl)}
          onError={() => setLoadedUrl(null)}
        />
      )}
    </div>
  );
});

const BASE_HEROES = [
  { name: 'Единорог Радуга', emoji: '🦄', image: '/heroes/unicorn.png' },
  { name: 'Мудрая Сова',     emoji: '🦉', image: '/heroes/owl.png'     },
  { name: 'Добрый Дракон',   emoji: '🐉', image: '/heroes/dragon.png'  },
  { name: 'Фея Звёздочка',   emoji: '🧚', image: '/heroes/fairy.png'   },
  { name: 'Храбрый Лев',     emoji: '🦁', image: '/heroes/lion.png'    },
  { name: 'Волшебный Кот',   emoji: '🐱', image: '/heroes/cat.png'     },
];

interface SelectedHero {
  name: string;
  emoji: string;
  image?: string;
  imageUrl?: string;
}

function buildPollinationsUrl(name: string): string {
  const prompt = encodeURIComponent(
    `${name} cute cartoon character children book illustration friendly colorful simple white background`
  );
  const seed = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 99999;
  return `https://image.pollinations.ai/prompt/${prompt}?width=256&height=256&nologo=true&nofeed=true&model=turbo&seed=${seed}`;
}

function sanitizeHeroImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const proxyMatch = url.match(/[?&]name=([^&]+)/);
  if (url.includes('/api/hero-image/img') && proxyMatch) {
    return buildPollinationsUrl(decodeURIComponent(proxyMatch[1]));
  }
  return url;
}

const QUICK_QUESTIONS = [
  { emoji: '🌧️', text: 'Почему идёт дождь?' },
  { emoji: '⭐', text: 'Почему звёзды светят ночью?' },
  { emoji: '🌈', text: 'Почему бывает радуга?' },
  { emoji: '👶', text: 'Почему я расту?' },
  { emoji: '😴', text: 'Зачем нужно спать?' },
  { emoji: '🌍', text: 'Почему все люди разные?' },
  { emoji: '🤝', text: 'Что такое настоящая дружба?' },
  { emoji: '😢', text: 'Почему иногда бывает грустно?' },
];

export default function NewStory() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { children, loadChildren, generateStory, isGenerating } = useApp();
  const [question, setQuestion] = useState('');
  const [questionFocused, setQuestionFocused] = useState(false);
  const [context, setContext] = useState('');
  const [contextOpen, setContextOpen] = useState(false);
  const [ctaPressed, setCtaPressed] = useState(false);
  const [error, setError] = useState('');
  const [selectedHero, setSelectedHero] = useState<SelectedHero | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [urlImgStatus, setUrlImgStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [savedCustomHeroes, setSavedCustomHeroes] = useState<SelectedHero[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);
  const heroRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (children.length === 0) loadChildren();
  }, []);

  const child = children.find(c => c.id === childId);

  useEffect(() => {
    if (!childId) return;
    try {
      const stored = localStorage.getItem(`pochemu4ki_custom_heroes_${childId}`);
      if (stored) {
        const heroes = JSON.parse(stored) as SelectedHero[];
        const migrated = heroes.map(h => ({ ...h, imageUrl: sanitizeHeroImageUrl(h.imageUrl) }));
        setSavedCustomHeroes(migrated);
        localStorage.setItem(`pochemu4ki_custom_heroes_${childId}`, JSON.stringify(migrated));
      }
    } catch {}
  }, [childId]);

  useEffect(() => {
    const el = heroRowRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };
    check();
    el.addEventListener('scroll', check);
    return () => el.removeEventListener('scroll', check);
  }, [savedCustomHeroes]);

  useEffect(() => {
    if (child && !selectedHero) {
      const preset = BASE_HEROES.find(h => h.emoji === child.hero.emoji);
      setSelectedHero(preset ?? { name: child.hero.name, emoji: child.hero.emoji });
    }
  }, [child]);

  const handleSelectPreset = (h: typeof BASE_HEROES[0]) => {
    setCustomMode(false);
    setCustomName('');
    setCustomImageUrl('');
    setSelectedHero(h);
  };

  const handleEnableCustom = () => {
    setCustomMode(true);
    setSelectedHero(null);
    setTimeout(() => customInputRef.current?.focus(), 80);
  };

  const handleCustomNameChange = (name: string) => {
    setCustomName(name);
    if (name.trim().length >= 2) {
      setSelectedHero({ name: name.trim(), emoji: '✨', imageUrl: customImageUrl || undefined });
    } else {
      setSelectedHero(null);
    }
  };

  const handleUrlInputChange = (val: string) => {
    setCustomUrlInput(val);
    setUrlImgStatus(val.trim() ? 'loading' : 'idle');
  };

  const handleUrlApply = () => {
    const url = customUrlInput.trim();
    if (!url || !customName.trim()) return;
    setCustomImageUrl(url);
    setSelectedHero({ name: customName.trim(), emoji: '✨', imageUrl: url });
    setCustomUrlInput('');
    setUrlImgStatus('idle');
  };

  const saveCustomHero = (hero: SelectedHero) => {
    if (!childId) return;
    const updated = [hero, ...savedCustomHeroes.filter(h => h.name !== hero.name)].slice(0, 5);
    setSavedCustomHeroes(updated);
    localStorage.setItem(`pochemu4ki_custom_heroes_${childId}`, JSON.stringify(updated));
  };

  const handleDeleteSavedHero = (heroName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = savedCustomHeroes.filter(h => h.name !== heroName);
    setSavedCustomHeroes(updated);
    if (childId) localStorage.setItem(`pochemu4ki_custom_heroes_${childId}`, JSON.stringify(updated));
    if (selectedHero?.name === heroName) setSelectedHero(null);
  };

  const handleGenerate = async () => {
    if (!question.trim() || !childId) return;
    setError('');
    if (customMode && selectedHero && customName.trim().length >= 2) {
      saveCustomHero(selectedHero);
    }
    const heroOverride = selectedHero
      ? { name: selectedHero.name, emoji: selectedHero.emoji, imageUrl: selectedHero.imageUrl }
      : undefined;
    try {
      const story = await generateStory(childId, question, context, heroOverride);
      if (story) navigate(`/app/story/${story.id}`);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'LIMIT_REACHED') {
        navigate('/app/pricing');
      } else {
        setError(e.message || 'Не удалось создать историю');
      }
    }
  };

  if (isGenerating) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--gradient-button)' }}
      >
        <DecorationLayer preset="minimal" />
        <div className="text-center text-white relative">
          <div className="flex justify-center mb-4 animate-float">
            <Mascot emotion="think" size="sm" style={{ filter: 'drop-shadow(0 8px 24px rgba(255,255,255,0.25))' }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Создаём сказку для {child ? declineName(child.name, child.gender, 'родительный') : 'вашего ребёнка'}...
          </h2>
          <p className="mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>Собираем все ингредиенты волшебства</p>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-3 h-3 bg-white rounded-full"
                style={{ animation: `bounce-in 0.9s ease-in-out ${i * 0.2}s infinite alternate` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden page-enter"
      style={{ background: 'var(--bg-primary)' }}
    >
      <DecorationLayer preset="minimal" />
      <div className="max-w-lg mx-auto px-4 pt-5 pb-6 relative">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/app')}
            className="w-11 h-11 rounded-full flex items-center justify-center transition"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--accent-primary)',
              flexShrink: 0,
            }}
            aria-label="Назад"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              lineHeight: 'var(--leading-tight)',
            }}>
              Новая сказка
            </h1>
            {child && (
              <p style={{
                margin: 0,
                fontSize: 'var(--text-sm)',
                color: 'var(--accent-primary)',
                fontWeight: 'var(--weight-medium)',
              }}>
                для {declineName(child.name, child.gender, 'родительный')}
              </p>
            )}
          </div>
        </div>

        {/* ── 1. Hero picker — flat section ──────────────────── */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-default)',
          padding: '14px 16px 16px',
          marginBottom: 12,
        }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--accent-primary)" style={{ flexShrink: 0 }}>
              <path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/>
            </svg>
            <p style={{
              margin: 0,
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)',
            }}>
              Выбери героя сказки
            </p>
          </div>

          {/* Scrollable hero row */}
          <div style={{ position: 'relative' }}>
            {/* Left fade edge — visual scroll hint */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 8, width: 28,
              background: 'linear-gradient(to right, var(--bg-surface), transparent)',
              pointerEvents: 'none', zIndex: 3,
              opacity: canScrollLeft ? 1 : 0, transition: 'opacity 0.2s',
            }} />
            {/* Right fade edge */}
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 8, width: 28,
              background: 'linear-gradient(to left, var(--bg-surface), transparent)',
              pointerEvents: 'none', zIndex: 3,
              opacity: canScrollRight ? 1 : 0, transition: 'opacity 0.2s',
            }} />

            {/* Left scroll arrow — larger touch target */}
            {canScrollLeft && (
              <button
                onClick={() => heroRowRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                style={{
                  position: 'absolute', left: -10, top: '38%', transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 4,
                }}
                aria-label="Назад"
              >
                <ChevronLeft size={16} color="var(--accent-primary)" strokeWidth={2.5} />
              </button>
            )}

            <div
              ref={heroRowRef}
              style={{
                display: 'flex', gap: 10, overflowX: 'auto',
                paddingBottom: 6, paddingTop: 2,
                scrollbarWidth: 'none', msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              } as React.CSSProperties}
            >
              {BASE_HEROES.map(h => {
                const active = !customMode && selectedHero?.name === h.name;
                return (
                  <button
                    key={h.name}
                    onClick={() => handleSelectPreset(h)}
                    style={{
                      flexShrink: 0, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 6, minWidth: 76,
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <div style={{
                      width: 68, height: 68, borderRadius: '50%',
                      border: active ? '3px solid var(--accent-primary)' : '2px solid var(--border-muted)',
                      background: active
                        ? 'linear-gradient(135deg, var(--accent-primary-100) 0%, var(--accent-primary-50) 100%)'
                        : '#F5F3FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.18s var(--ease-bounce)',
                      boxShadow: active
                        ? '0 0 0 4px var(--accent-primary-100), var(--shadow-sm)'
                        : 'var(--shadow-xs)',
                      position: 'relative',
                      transform: active ? 'scale(1.06)' : 'scale(1)',
                    }}>
                      <img src={h.image} alt={h.name} style={{ width: 46, height: 46, objectFit: 'contain' }} />
                      {active && (
                        <div style={{
                          position: 'absolute', bottom: -1, right: -1,
                          width: 22, height: 22, background: 'var(--accent-primary)',
                          borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', border: '2.5px solid var(--bg-surface)',
                          boxShadow: 'var(--shadow-xs)',
                        }}>
                          <Check size={12} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: active ? 14 : 13,
                      color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: active ? 700 : 500,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      maxWidth: 76,
                      transition: 'color 0.15s, font-size 0.15s',
                    }}>
                      {h.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}

              {/* Saved custom heroes */}
              {savedCustomHeroes.map(h => {
                const active = !customMode && selectedHero?.name === h.name;
                return (
                  <div
                    key={`saved-${h.name}`}
                    style={{
                      flexShrink: 0, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 6, minWidth: 76,
                      cursor: 'pointer', position: 'relative',
                    }}
                    onClick={() => { setCustomMode(false); setCustomName(''); setCustomImageUrl(''); setSelectedHero(h); }}
                  >
                    {/* Delete button — 40px touch target */}
                    <button
                      onClick={e => handleDeleteSavedHero(h.name, e)}
                      style={{
                        position: 'absolute', top: -10, right: -4,
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'transparent', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 3,
                      }}
                      aria-label={`Удалить ${h.name}`}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#EF4444', border: '2.5px solid var(--bg-surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)', flexShrink: 0,
                      }}>
                        <X size={10} color="#fff" strokeWidth={3} />
                      </span>
                    </button>

                    <div style={{
                      width: 68, height: 68, borderRadius: '50%',
                      border: active ? '3px solid var(--accent-primary)' : '2px solid var(--border-default)',
                      background: active
                        ? 'linear-gradient(135deg, var(--accent-primary-100) 0%, var(--accent-primary-50) 100%)'
                        : '#FAF5FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.18s var(--ease-bounce)',
                      boxShadow: active
                        ? '0 0 0 4px var(--accent-primary-100), var(--shadow-sm)'
                        : 'var(--shadow-xs)',
                      position: 'relative', overflow: 'hidden',
                      transform: active ? 'scale(1.06)' : 'scale(1)',
                    }}>
                      <HeroCircle imageUrl={h.imageUrl} size={68} />
                      {active && (
                        <div style={{
                          position: 'absolute', bottom: -1, right: -1,
                          width: 22, height: 22, background: 'var(--accent-primary)',
                          borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', border: '2.5px solid var(--bg-surface)',
                          boxShadow: 'var(--shadow-xs)', zIndex: 2,
                        }}>
                          <Check size={12} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: active ? 14 : 13,
                      color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: active ? 700 : 500,
                      textAlign: 'center', lineHeight: 1.2, maxWidth: 76,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      transition: 'color 0.15s',
                    }}>
                      {h.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}

              {/* Add custom hero button */}
              <button
                onClick={handleEnableCustom}
                style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6, minWidth: 76,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <div style={{
                  width: 68, height: 68, borderRadius: '50%',
                  border: customMode ? '3px solid var(--accent-primary)' : '2px dashed var(--accent-primary-200)',
                  background: customMode
                    ? 'linear-gradient(135deg, var(--accent-primary-100) 0%, var(--accent-primary-50) 100%)'
                    : 'var(--bg-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s var(--ease-bounce)',
                  boxShadow: customMode
                    ? '0 0 0 4px var(--accent-primary-100), var(--shadow-sm)'
                    : 'var(--shadow-xs)',
                  transform: customMode ? 'scale(1.06)' : 'scale(1)',
                }}>
                  {customMode ? (
                    <HeroCircle imageUrl={customImageUrl || undefined} size={52} />
                  ) : (
                    <Pencil size={22} color="var(--accent-primary-light)" />
                  )}
                </div>
                <span style={{
                  fontSize: customMode ? 14 : 13,
                  color: customMode ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: customMode ? 700 : 500,
                  textAlign: 'center', lineHeight: 1.2, maxWidth: 76,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}>
                  {customMode && customName.trim() ? customName.trim().split(' ')[0] : 'Свой герой'}
                </span>
              </button>
            </div>

            {/* Right scroll arrow */}
            {canScrollRight && (
              <button
                onClick={() => heroRowRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                style={{
                  position: 'absolute', right: -10, top: '38%', transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 4,
                }}
                aria-label="Показать больше героев"
              >
                <ChevronRight size={16} color="var(--accent-primary)" strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Custom hero inputs — inline, no extra card */}
          {customMode && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                ref={customInputRef}
                type="text"
                value={customName}
                onChange={e => handleCustomNameChange(e.target.value)}
                placeholder="Имя героя, например: Леди Баг"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1.5px solid var(--border-default)', borderRadius: 14,
                  padding: '11px 14px', fontSize: 14,
                  color: 'var(--text-primary)', background: 'var(--bg-subtle)',
                  outline: 'none', minHeight: 44,
                }}
              />

              {customName.trim().length >= 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      inputMode="url"
                      value={customUrlInput}
                      onChange={e => handleUrlInputChange(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUrlApply()}
                      placeholder="Вставьте ссылку на картинку"
                      style={{
                        flex: 1, border: `1.5px solid ${urlImgStatus === 'error' ? 'var(--color-error)' : urlImgStatus === 'ok' ? 'var(--color-success)' : 'var(--border-default)'}`,
                        borderRadius: 14,
                        padding: '11px 14px', fontSize: 14, color: 'var(--text-primary)',
                        outline: 'none', background: 'var(--bg-subtle)', minHeight: 44,
                        transition: 'border-color 0.2s',
                      }}
                    />
                    <button
                      onClick={handleUrlApply}
                      disabled={!customUrlInput.trim() || urlImgStatus === 'error'}
                      style={{
                        minHeight: 44, padding: '0 18px', borderRadius: 14, fontSize: 14, fontWeight: 700,
                        background: (customUrlInput.trim() && urlImgStatus !== 'error') ? 'var(--accent-primary)' : 'var(--accent-primary-100)',
                        color: '#fff', border: 'none',
                        cursor: (customUrlInput.trim() && urlImgStatus !== 'error') ? 'pointer' : 'default',
                        flexShrink: 0,
                        touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                      } as React.CSSProperties}
                    >
                      ОК
                    </button>
                  </div>

                  {/* Live preview */}
                  {customUrlInput.trim() && (() => {
                    const previewUrl = customUrlInput.trim();
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 52 }}>
                        {/* Hidden img to test load */}
                        <img
                          key={previewUrl}
                          src={previewUrl}
                          referrerPolicy="no-referrer"
                          style={{ display: 'none' }}
                          onLoad={() => setUrlImgStatus('ok')}
                          onError={() => setUrlImgStatus('error')}
                        />
                        {urlImgStatus === 'loading' && (
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                            Проверяем ссылку…
                          </p>
                        )}
                        {urlImgStatus === 'ok' && (
                          <>
                            <img
                              src={previewUrl}
                              referrerPolicy="no-referrer"
                              style={{
                                width: 48, height: 48, borderRadius: '50%',
                                objectFit: 'cover', flexShrink: 0,
                                border: '2px solid var(--color-success)',
                              }}
                            />
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-success)', fontWeight: 600 }}>
                              ✓ Картинка загружена
                            </p>
                          </>
                        )}
                        {urlImgStatus === 'error' && (
                          <div style={{
                            background: 'var(--color-error-bg)',
                            border: '1px solid var(--color-error-border)',
                            borderRadius: 12, padding: '10px 12px',
                          }}>
                            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--color-error)' }}>
                              Не удалось загрузить картинку
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              Нужна прямая ссылка на файл (.jpg, .png). Откройте картинку в полный размер, зажмите → «Скопировать адрес изображения».
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Найти картинку:{' '}
                    <a href="https://yandex.ru/images" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Яндекс</a>
                    {' · '}
                    <a href="https://images.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Google</a>
                    {' · '}
                    <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Pinterest</a>
                  </p>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
                    borderRadius: 14, border: '1.5px solid var(--border-muted)',
                    background: 'var(--bg-subtle)', opacity: 0.6, cursor: 'not-allowed',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                      Превратить фото в мультяшного героя
                    </span>
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                      background: 'var(--accent-primary-100)', color: 'var(--accent-primary)',
                      padding: '2px 8px', borderRadius: 20,
                    }}>
                      Скоро
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 2. Question input — PRIMARY focus ──────────────── */}
        <div style={{
          background: 'var(--accent-primary-50)',
          borderRadius: 'var(--radius-xl)',
          border: `1.5px solid ${questionFocused ? 'var(--accent-primary)' : 'var(--accent-primary-200)'}`,
          padding: '14px 14px 12px',
          marginBottom: 10,
          transition: 'border-color 0.18s, box-shadow 0.18s',
          boxShadow: questionFocused
            ? '0 0 0 3px var(--accent-primary-100), var(--shadow-sm)'
            : 'none',
        }}>
          {/* Label row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--accent-primary)" style={{ flexShrink: 0 }}>
              <path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/>
            </svg>
            <span style={{
              fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)', flex: 1,
            }}>
              Вопрос или тема сказки
            </span>
            {/* Required / filled badge */}
            <span style={{
              fontSize: 11, fontWeight: 700, lineHeight: 1,
              padding: '3px 9px', borderRadius: 99,
              transition: 'all 0.2s',
              ...(question.trim()
                ? {
                    color: 'var(--color-success)',
                    background: 'var(--color-success-bg)',
                    border: '1px solid var(--color-success-border)',
                  }
                : {
                    color: 'var(--color-warning)',
                    background: 'var(--color-warning-bg)',
                    border: '1px solid var(--color-warning-border)',
                  }
              ),
            }}>
              {question.trim() ? '✓ заполнено' : 'обязательно'}
            </span>
          </div>

          {/* Textarea */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onFocus={() => setQuestionFocused(true)}
              onBlur={() => setQuestionFocused(false)}
              placeholder="Что спросил ребёнок? Или опишите ситуацию..."
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box',
                border: `1.5px solid ${questionFocused ? 'var(--accent-primary)' : 'var(--accent-primary-200)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 52px 12px 14px',
                fontSize: 'var(--text-base)',
                color: 'var(--text-primary)',
                background: 'var(--bg-surface)',
                outline: 'none',
                resize: 'none',
                lineHeight: 'var(--leading-normal)',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.18s',
              }}
            />
            <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
              <VoiceInput onTranscript={text => setQuestion(prev => prev ? `${prev} ${text}` : text)} />
            </div>
          </div>
        </div>

        {/* ── 3. Context — collapsible ────────────────────────── */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: `1px solid ${context.trim() ? 'var(--color-success-border)' : 'var(--border-default)'}`,
          marginBottom: 10,
          overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}>
          <button
            onClick={() => setContextOpen(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '13px 14px',
              background: 'none', border: 'none', cursor: 'pointer',
              minHeight: 48,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              {/* Green dot when context is filled */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: context.trim() ? 'var(--color-success)' : 'var(--border-default)',
                transition: 'background 0.2s',
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text-primary)',
                }}>
                  Добавить контекст
                </span>
                {!contextOpen && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {context.trim()
                      ? `${context.trim().length} симв. — отлично!`
                      : 'необязательно — история будет точнее'}
                  </span>
                )}
              </div>
            </div>
            {contextOpen
              ? <ChevronUp size={18} color="var(--text-muted)" />
              : <ChevronDown size={18} color="var(--text-muted)" />
            }
          </button>

          {contextOpen && (
            <div style={{ padding: '0 14px 14px' }}>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Например: Сегодня в садике поспорили с подружкой у кого красивее волосы..."
                  rows={3}
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1.5px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 52px 12px 14px',
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-subtle)',
                    outline: 'none', resize: 'none',
                    lineHeight: 'var(--leading-normal)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                  <VoiceInput
                    onTranscript={text => setContext(prev => prev ? `${prev} ${text}` : text)}
                  />
                </div>
              </div>
              {context.trim().length > 0 && (
                <p style={{
                  margin: '6px 0 0', fontSize: 11,
                  color: 'var(--color-success)', textAlign: 'right',
                }}>
                  {context.trim().length} симв.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── 4. Quick questions — secondary suggestions ──────── */}
        <div style={{ marginBottom: 10 }}>
          <p style={{
            margin: '0 0 7px',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-muted)',
            letterSpacing: 'var(--letter-caps)',
            textTransform: 'uppercase',
          }}>
            или выберите тему:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {QUICK_QUESTIONS.map((q, i) => {
              const active = question === q.text;
              return (
                <button
                  key={i}
                  onClick={() => setQuestion(active ? '' : q.text)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: active
                      ? '1.5px solid var(--accent-primary)'
                      : '1px solid var(--border-muted)',
                    background: active
                      ? 'var(--accent-primary-50)'
                      : 'var(--bg-subtle)',
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minHeight: 44,
                    transition: 'all 0.15s',
                    lineHeight: 1.35,
                    boxShadow: active ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  <span style={{ flexShrink: 0, fontSize: 14 }}>{q.emoji}</span>
                  <span style={{ overflow: 'hidden' }}>{q.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toys note */}
        {child && child.toys.length > 0 && (
          <p style={{
            textAlign: 'center', fontSize: 'var(--text-xs)',
            color: 'var(--accent-primary-light)', marginBottom: 8,
          }}>
            В сказке появятся: {child.toys.map(t => t.nickname).join(', ')} 🧸
          </p>
        )}

        {error && (
          <div style={{
            background: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            fontSize: 'var(--text-sm)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
            marginBottom: 10,
            border: '1px solid var(--color-error-border)',
          }}>
            {error}
          </div>
        )}

        {/* ── 5. Generate CTA — sticky frosted tray ───────────── */}
        <div style={{
          position: 'sticky',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)',
          zIndex: 50,
          marginLeft: -16, marginRight: -16,   /* bleed to edge of parent px-4 */
          padding: '12px 16px 10px',
          background: 'linear-gradient(to top, var(--bg-primary) 72%, transparent)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        } as React.CSSProperties}>
          <button
            onClick={handleGenerate}
            onPointerDown={() => setCtaPressed(true)}
            onPointerUp={() => setCtaPressed(false)}
            onPointerLeave={() => setCtaPressed(false)}
            disabled={!question.trim() || isGenerating || (customMode && !customName.trim())}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--gradient-button)',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-lg)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: (!question.trim() || (customMode && !customName.trim()))
                ? 'none'
                : 'var(--shadow-button)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.15s, transform 0.12s var(--ease-smooth)',
              opacity: (!question.trim() || isGenerating || (customMode && !customName.trim())) ? 0.48 : 1,
              transform: ctaPressed && question.trim() ? 'scale(0.97)' : 'scale(1)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/>
            </svg>
            {selectedHero ? `Создать сказку с ${selectedHero.name.split(' ')[0]}` : 'Создать сказку'}
          </button>
        </div>

      </div>
    </div>
  );
}
