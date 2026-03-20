import { useState, useEffect, useRef, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Check, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import VoiceInput from '../components/VoiceInput';
import DecorationLayer from '../components/Decorations';
import Mascot from '../components/Mascot/Mascot';
import { declineName } from '../utils/declineName';

/** Small circle that shows a mascot until hero image loads, then swaps to it */
const HeroCircle = memo(function HeroCircle({ imageUrl, size }: { imageUrl?: string; size: number }) {
  // Track which URL has actually loaded — derived `loaded` has no useEffect race condition
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
          style={{
            position: 'absolute', inset: 0, width: size, height: size,
            objectFit: 'cover', borderRadius: '50%',
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
  image?: string;   // local /heroes/*.png for presets
  imageUrl?: string; // Pollinations URL for custom
}

/** Build Pollinations URL directly — fallback if backend is down */
function buildPollinationsUrl(name: string): string {
  const prompt = encodeURIComponent(
    `${name} cute cartoon character children book illustration friendly colorful simple white background`
  );
  const seed = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 99999;
  return `https://image.pollinations.ai/prompt/${prompt}?width=256&height=256&nologo=true&nofeed=true&model=turbo&seed=${seed}`;
}

/** Small avatar circle for the selected hero — shown in the "selected" banner */
function SelectedHeroAvatar({ hero }: { hero: SelectedHero }) {
  const src = hero.imageUrl ?? hero.image;
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: '#EDE9FE', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, fontSize: 22,
      }}>
        {hero.emoji}
      </div>
    );
  }
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%', overflow: 'hidden',
      flexShrink: 0, border: '2px solid #C4B5FD', background: '#F5F3FF',
    }}>
      <img
        src={src}
        alt={hero.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/** Replace old backend proxy URLs with direct Pollinations URLs */
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
  const [context, setContext] = useState('');
  const [error, setError] = useState('');
  const [selectedHero, setSelectedHero] = useState<SelectedHero | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [savedCustomHeroes, setSavedCustomHeroes] = useState<SelectedHero[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);
  const heroRowRef = useRef<HTMLDivElement>(null);
  const imageDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (children.length === 0) loadChildren();
  }, []);

  const child = children.find(c => c.id === childId);

  // Load saved custom heroes from localStorage
  useEffect(() => {
    if (!childId) return;
    try {
      const stored = localStorage.getItem(`pochemu4ki_custom_heroes_${childId}`);
      if (stored) {
        const heroes = JSON.parse(stored) as SelectedHero[];
        // Migrate stale proxy URLs → direct Pollinations URLs
        const migrated = heroes.map(h => ({ ...h, imageUrl: sanitizeHeroImageUrl(h.imageUrl) }));
        setSavedCustomHeroes(migrated);
        // Persist the migrated version back
        localStorage.setItem(`pochemu4ki_custom_heroes_${childId}`, JSON.stringify(migrated));
      }
    } catch {}
  }, [childId]);

  // Track scroll position to show/hide arrows
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

  // Pre-select the child's default hero once child is loaded
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
    if (imageDebounceRef.current) clearTimeout(imageDebounceRef.current);

    if (name.trim().length >= 2) {
      // Optimistically set hero name immediately (no image yet)
      setImageLoading(true);
      setCustomImageUrl('');
      setSelectedHero({ name: name.trim(), emoji: '✨' });

      // Debounce: wait 700ms after user stops typing before fetching
      imageDebounceRef.current = setTimeout(async () => {
        const trimmed = name.trim();
        let imageUrl = buildPollinationsUrl(trimmed); // fallback: direct Pollinations

        try {
          // Try backend first — it translates Russian name to English for better results
          const result = await api.heroes.getImage(trimmed);
          imageUrl = result.imageUrl; // may be Wikipedia URL or Pollinations URL
        } catch {
          // Backend unavailable — use direct Pollinations URL built on client
        }

        // Set URL immediately — HeroCircle handles mascot→image transition on its own.
        // No preload: Pollinations can take 30-60s and preloading just blocks the UI.
        setCustomImageUrl(imageUrl);
        setSelectedHero({ name: trimmed, emoji: '✨', imageUrl });
        setImageLoading(false);
      }, 700);
    } else {
      setImageLoading(false);
      setCustomImageUrl('');
      setSelectedHero(null);
    }
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
    // Auto-save custom hero when generating a story
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
      <div className="max-w-lg mx-auto px-4 py-6 relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/app')}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-purple-600 hover:bg-purple-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Новая сказка</h1>
            {child && <p className="text-sm text-purple-600">для {declineName(child.name, child.gender, 'родительный')}</p>}
          </div>
        </div>

        {/* Mascot */}
        <div className="flex justify-center mb-4 animate-float">
          <Mascot
            emotion="explain"
            size="sm"
            style={{ filter: 'drop-shadow(0 8px 28px rgba(124,107,196,0.22))' }}
          />
        </div>

        {/* Hero picker */}
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-4">
          <p className="text-sm font-semibold text-text-primary mb-3">Кто будет героем сказки?</p>
          <div style={{ position: 'relative' }}>
            {/* Left scroll arrow */}
            {canScrollLeft && (
              <button
                onClick={() => heroRowRef.current?.scrollBy({ left: -160, behavior: 'smooth' })}
                style={{
                  position: 'absolute', left: -8, top: '50%', transform: 'translateY(-60%)',
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#7C3AED', border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 2,
                }}
                aria-label="Назад"
              >
                <ChevronLeft size={14} color="#fff" strokeWidth={3} />
              </button>
            )}

            <div ref={heroRowRef} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
              {BASE_HEROES.map(h => {
                const active = !customMode && selectedHero?.name === h.name;
                return (
                  <button
                    key={h.name}
                    onClick={() => handleSelectPreset(h)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 focus:outline-none"
                    style={{ minWidth: 64 }}
                  >
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      border: active ? '2.5px solid #7C3AED' : '2px solid transparent',
                      background: active ? '#F3EEFF' : '#F5F3FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      boxShadow: active ? '0 0 0 3px rgba(124,58,237,0.2)' : 'none',
                      position: 'relative',
                    }}>
                      <img src={h.image} alt={h.name} style={{ width: 40, height: 40, objectFit: 'contain' }} />
                      {active && (
                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, background: '#7C3AED', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                          <Check size={10} color="#fff" />
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: active ? '#7C3AED' : '#7A7890', fontFamily: 'Comfortaa, sans-serif', fontWeight: active ? 700 : 400, textAlign: 'center', lineHeight: 1.2, maxWidth: 60 }}>
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
                    className="flex-shrink-0 flex flex-col items-center gap-1"
                    style={{ minWidth: 64, cursor: 'pointer', position: 'relative' }}
                    onClick={() => { setCustomMode(false); setCustomName(''); setCustomImageUrl(''); setSelectedHero(h); }}
                  >
                    {/* Delete button */}
                    <button
                      onClick={e => handleDeleteSavedHero(h.name, e)}
                      style={{
                        position: 'absolute', top: -2, right: 2,
                        width: 16, height: 16, borderRadius: '50%',
                        background: '#EF4444', border: '1.5px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 3,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }}
                      aria-label={`Удалить ${h.name}`}
                    >
                      <X size={8} color="#fff" strokeWidth={3} />
                    </button>

                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      border: active ? '2.5px solid #7C3AED' : '2px solid #E9D5FF',
                      background: active ? '#F3EEFF' : '#FAF5FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      boxShadow: active ? '0 0 0 3px rgba(124,58,237,0.2)' : 'none',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                        <HeroCircle imageUrl={h.imageUrl} size={56} />
                      {active && (
                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, background: '#7C3AED', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', zIndex: 2 }}>
                          <Check size={10} color="#fff" />
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: active ? '#7C3AED' : '#7A7890', fontFamily: 'Comfortaa, sans-serif', fontWeight: active ? 700 : 400, textAlign: 'center', lineHeight: 1.2, maxWidth: 60 }}>
                      {h.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}

              {/* Add new custom hero button */}
              <button
                onClick={handleEnableCustom}
                className="flex-shrink-0 flex flex-col items-center gap-1 focus:outline-none"
                style={{ minWidth: 64 }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: customMode ? '2.5px solid #7C3AED' : '2px dashed #C4B5FD',
                  background: customMode ? '#F3EEFF' : '#FAF8FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                  boxShadow: customMode ? '0 0 0 3px rgba(124,58,237,0.2)' : 'none',
                }}>
                  {customMode && imageLoading ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#C4B5FD" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                      </path>
                    </svg>
                  ) : customMode ? (
                    <HeroCircle imageUrl={customImageUrl || undefined} size={44} />
                  ) : (
                    <Pencil size={20} color="#C4B5FD" />
                  )}
                </div>
                <span style={{ fontSize: 10, color: customMode ? '#7C3AED' : '#ABA9C0', fontFamily: 'Comfortaa, sans-serif', fontWeight: customMode ? 700 : 400, textAlign: 'center', lineHeight: 1.2, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {customMode && customName.trim() ? customName.trim().split(' ')[0] : 'Свой'}
                </span>
              </button>
            </div>

            {/* Right scroll arrow */}
            {canScrollRight && (
              <button
                onClick={() => heroRowRef.current?.scrollBy({ left: 160, behavior: 'smooth' })}
                style={{
                  position: 'absolute', right: -8, top: '50%', transform: 'translateY(-60%)',
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#7C3AED', border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 2,
                }}
                aria-label="Показать больше героев"
              >
                <ChevronRight size={14} color="#fff" strokeWidth={3} />
              </button>
            )}
          </div>

          {/* Custom hero name input */}
          {customMode && (
            <div className="mt-3">
              <input
                ref={customInputRef}
                type="text"
                value={customName}
                onChange={e => handleCustomNameChange(e.target.value)}
                placeholder="Введите имя героя, например: Леди Баг"
                className="w-full border border-purple-200 rounded-2xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              {customName.trim().length >= 2 && (
                <p className="text-xs text-purple-500 mt-1.5 flex items-center gap-1">
                  {imageLoading
                    ? <><span>🔍</span> Ищем картинку персонажа...</>
                    : <><span>✨</span> Картинка загружается в кружочке</>
                  }
                </p>
              )}
            </div>
          )}

          {/* Selected hero indicator */}
          {selectedHero && (
            <div style={{
              marginTop: 12,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: 'rgba(124,58,237,0.07)',
              borderRadius: 12,
              border: '1px solid rgba(124,58,237,0.15)',
            }}>
              <SelectedHeroAvatar hero={selectedHero} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#7A7890' }}>Выбранный герой</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#4C1D95', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedHero.name}
                </p>
              </div>
              <svg width="18" height="18" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                <circle cx="10" cy="10" r="10" fill="#7C3AED" />
                <path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          )}
        </div>

        {/* Question input */}
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-4">
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Вопрос или тема сказки *
          </label>
          <div className="relative">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Что спросил ребёнок? Или опишите ситуацию..."
              rows={3}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-16 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition"
            />
            <div className="absolute bottom-3 right-3">
              <VoiceInput onTranscript={text => setQuestion(prev => prev ? `${prev} ${text}` : text)} />
            </div>
          </div>
        </div>

        {/* Context input */}
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-4">
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Контекст (необязательно)
          </label>
          <p className="text-xs text-text-muted mb-2">
            Расскажите ситуацию, которая привела к вопросу — история будет точнее
          </p>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Например: Сегодня в садике поспорили с подружкой у кого красивее волосы..."
            rows={3}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition"
          />
          <div className="mt-2">
            <VoiceInput
              onTranscript={text => setContext(prev => prev ? `${prev} ${text}` : text)}
              className="inline-flex"
            />
          </div>
        </div>

        {/* Quick questions */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Популярные вопросы
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q.text)}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition ${question === q.text ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-text-secondary hover:border-purple-300'}`}
              >
                {q.emoji} {q.text}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!question.trim() || isGenerating || (customMode && !customName.trim())}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/></svg>
          {selectedHero ? `Создать сказку с ${selectedHero.name.split(' ')[0]}` : 'Создать сказку'}
        </button>

        {child && child.toys.length > 0 && (
          <p className="text-center text-xs text-purple-400 mt-3">
            В сказке появятся: {child.toys.map(t => t.nickname).join(', ')} 🧸
          </p>
        )}
      </div>

    </div>
  );
}
