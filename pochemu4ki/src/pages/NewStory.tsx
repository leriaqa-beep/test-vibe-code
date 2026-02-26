import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import VoiceInput from '../components/VoiceInput';
import DecorationLayer from '../components/Decorations';
import Mascot from '../components/Mascot/Mascot';
import { declineName } from '../utils/declineName';
import HeroImage from '../components/HeroImage';

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

  useEffect(() => {
    if (children.length === 0) loadChildren();
  }, []);

  const child = children.find(c => c.id === childId);

  const handleGenerate = async () => {
    if (!question.trim() || !childId) return;
    setError('');
    try {
      const story = await generateStory(childId, question, context);
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
            {child && <p className="text-sm text-purple-600 flex items-center gap-1">для {declineName(child.name, child.gender, 'родительный')} <HeroImage emoji={child.hero.emoji} size="xs" /></p>}
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
          disabled={!question.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/></svg>
          Создать сказку
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
