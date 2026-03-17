import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Check, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import VoiceInput from '../components/VoiceInput';
import DecorationLayer from '../components/Decorations';
import Mascot from '../components/Mascot/Mascot';
import { declineName } from '../utils/declineName';

const BASE_HEROES = [
  { name: 'Единорог Радуга', emoji: '🦄', image: '/heroes/unicorn.png' },
  { name: 'Мудрая Сова',     emoji: '🦉', image: '/heroes/owl.png'     },
  { name: 'Добрый Дракон',   emoji: '🐉', image: '/heroes/dragon.png'  },
  { name: 'Фея Звёздочка',   emoji: '🧚', image: '/heroes/fairy.png'   },
  { name: 'Храбрый Лев',     emoji: '🦁', image: '/heroes/lion.png'    },
  { name: 'Волшебный Кот',   emoji: '🐱', image: '/heroes/cat.png'     },
];

function getPollinationsUrl(heroName: string): string {
  const prompt = encodeURIComponent(`${heroName} cute cartoon character children book illustration friendly colorful simple white background`);
  return `https://image.pollinations.ai/prompt/${prompt}?width=256&height=256&nologo=true`;
}

interface SelectedHero {
  name: string;
  emoji: string;
  image?: string;   // local /heroes/*.png for presets
  imageUrl?: string; // Pollinations URL for custom
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
  const customInputRef = useRef<HTMLInputElement>(null);
  const heroRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (children.length === 0) loadChildren();
  }, []);

  const child = children.find(c => c.id === childId);

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
    if (name.trim().length >= 2) {
      const url = getPollinationsUrl(name.trim());
      setCustomImageUrl(url);
      setSelectedHero({ name: name.trim(), emoji: '✨', imageUrl: url });
    } else {
      setCustomImageUrl('');
      setSelectedHero(null);
    }
  };

  const handleGenerate = async () => {
    if (!question.trim() || !childId) return;
    setError('');
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
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: active ? '2.5px solid #7C3AED' : '2px solid transparent',
                    background: active ? '#F3EEFF' : '#F5F3FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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

            {/* Custom hero button */}
            <button
              onClick={handleEnableCustom}
              className="flex-shrink-0 flex flex-col items-center gap-1 focus:outline-none"
              style={{ minWidth: 64 }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                border: customMode ? '2.5px solid #7C3AED' : '2px dashed #C4B5FD',
                background: customMode ? '#F3EEFF' : '#FAF8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                boxShadow: customMode ? '0 0 0 3px rgba(124,58,237,0.2)' : 'none',
              }}>
                {customMode && customImageUrl ? (
                  <img
                    src={customImageUrl}
                    alt=""
                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '50%' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <Pencil size={20} color={customMode ? '#7C3AED' : '#C4B5FD'} />
                )}
              </div>
              <span style={{ fontSize: 10, color: customMode ? '#7C3AED' : '#ABA9C0', fontFamily: 'Comfortaa, sans-serif', fontWeight: customMode ? 700 : 400, textAlign: 'center', lineHeight: 1.2 }}>
                Свой
              </span>
            </button>
          </div>
          {/* Scroll arrow */}
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
                  <span>✨</span> Картинка героя загрузится из Pollinations AI
                </p>
              )}
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
