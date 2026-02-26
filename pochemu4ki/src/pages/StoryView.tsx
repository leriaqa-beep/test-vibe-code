import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, BookOpen, Library } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Story } from '../types';
import { api } from '../api/client';
import DecorationLayer from '../components/Decorations';
import Mascot from '../components/Mascot/Mascot';
import HeroImage from '../components/HeroImage';

/* ── Парсер контента истории ────────────────────────────────── */
type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'bold'; text: string };

function parseContent(raw: string): Block[] {
  return raw.split('\n\n')
    .filter(p => p.trim())
    .map(p => {
      const t = p.trim();
      if (t.startsWith('**') && t.endsWith('**')) {
        return { type: 'bold' as const, text: t.replace(/\*\*/g, '') };
      }
      return { type: 'paragraph' as const, text: t };
    });
}

/* Рендер inline-разметки **bold** */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
      : p
  );
}

/* ── Компонент ──────────────────────────────────────────────── */
export default function StoryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stories, updateStory, children } = useApp();
  const [story, setStory] = useState<Story | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [poppedStar, setPoppedStar] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const local = stories.find(s => s.id === id);
    if (local) {
      setStory(local);
      setRating(local.rating);
      setLoading(false);
    } else {
      api.stories.get(id)
        .then(s => { setStory(s); setRating(s.rating); })
        .finally(() => setLoading(false));
    }
  }, [id, stories]);

  const handleSave = useCallback(async () => {
    if (!story) return;
    await updateStory(story.id, { isSaved: !story.isSaved });
    setStory(prev => prev ? { ...prev, isSaved: !prev.isSaved } : prev);
  }, [story, updateStory]);

  const handleRate = useCallback(async (r: number) => {
    if (!story) return;
    setRating(r);
    setPoppedStar(r);
    setTimeout(() => setPoppedStar(null), 450);
    await updateStory(story.id, { rating: r });
    setStory(prev => prev ? { ...prev, rating: r } : prev);
  }, [story, updateStory]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 'var(--space-4)' }} className="animate-float">📖</div>
          <p style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Загружаем историю…
          </p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 'var(--space-3)' }}>
            {[0,1,2].map(i => (
              <div key={i} className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', animationDelay: `${i * 180}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>История не найдена</p>
          <button onClick={() => navigate('/app')} className="btn btn-secondary btn-sm">На главную</button>
        </div>
      </div>
    );
  }

  const child = children.find(c => c.id === story.childId);
  const blocks = parseContent(story.content);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>

      {/* ── Hero-изображение ── */}
      <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
        <img
          src={story.imageUrl}
          alt={story.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Градиент поверх фото */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(45,43,61,0.4) 0%, rgba(45,43,61,0) 45%, rgba(255,251,245,0.8) 100%)',
        }} />

        {/* Назад */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: 16, left: 16,
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Сохранить */}
        <button
          onClick={handleSave}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 40, height: 40, borderRadius: '50%',
            background: story.isSaved ? 'rgba(232,160,191,0.85)' : 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: story.isSaved ? '#fff' : '#fff', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Heart size={17} style={{ fill: story.isSaved ? '#fff' : 'none' }} />
        </button>

        {/* Бейдж ребёнка */}
        {child && (
          <div style={{
            position: 'absolute', bottom: 16, left: 16,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-full)',
            padding: '5px 14px',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <HeroImage emoji={child.hero.emoji} size="xs" />
            <span style={{ color: '#fff', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{child.name}</span>
          </div>
        )}
      </div>

      {/* ── Контент — белая карточка ── */}
      <div className="story-content" style={{
        maxWidth: 720,
        margin: '-28px auto 0',
        background: 'var(--bg-surface)',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -4px 24px rgba(45,43,61,0.06)',
        padding: 'var(--space-8) var(--space-5) var(--space-16)',
        position: 'relative',
      }}>

        {/* Вопрос */}
        <div style={{
          marginBottom: 'var(--space-5)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4) var(--space-5)',
          borderLeft: '3px solid var(--accent-primary)',
        }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>
            Вопрос ребёнка
          </p>
          <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--text-base)', fontStyle: 'italic' }}>
            «{story.question}»
          </p>
        </div>

        {/* Mascot + Заголовок */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <div style={{ flexShrink: 0, marginTop: 4 }}>
            <Mascot
              emotion="explain"
              size="sm"
              style={{ width: 80, height: 96, filter: 'drop-shadow(0 4px 16px rgba(124,107,196,0.2))' }}
            />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            margin: 0,
            lineHeight: 1.2,
          }}>
            {story.title}
          </h1>
        </div>

        {/* ── Контент истории ── */}
        <div className="story-text">
          {blocks.map((block, i) => {
            if (block.type === 'bold') {
              return (
                <p key={i} style={{
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  marginBottom: 'var(--space-4)',
                }}>
                  {block.text}
                </p>
              );
            }
            return (
              <p key={i} style={{ marginBottom: 'var(--space-5)' }}>
                {renderInline(block.text)}
              </p>
            );
          })}
        </div>

        {/* ── Оценка ── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(124,107,196,0.08)',
          borderRadius: 20,
          padding: 'var(--space-6)',
          boxShadow: '0 2px 16px rgba(124,107,196,0.08)',
          marginTop: 'var(--space-8)',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'var(--text-lg)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-5)',
          }}>
            Понравилась история?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
            {[1, 2, 3, 4, 5].map(r => {
              const active = r <= (hoverRating || rating);
              const isPopped = poppedStar !== null && r <= poppedStar;
              return (
                <button
                  key={r}
                  onClick={() => handleRate(r)}
                  onMouseEnter={() => setHoverRating(r)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={isPopped ? 'animate-star-pop' : ''}
                  style={{
                    width: 48, height: 48,
                    background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.15s var(--ease-bounce)',
                    transform: active && !isPopped ? 'scale(1.1)' : 'scale(1)',
                  }}
                  aria-label={`Оценить ${r} звёзд`}
                >
                  <svg
                    width={36}
                    height={36}
                    viewBox="0 0 24 24"
                    style={{
                      fill: active ? 'var(--accent-yellow)' : 'var(--border-default)',
                      transition: 'all 0.2s var(--ease-smooth)',
                      filter: active ? 'drop-shadow(0 2px 6px rgba(249,213,110,0.5))' : 'none',
                    }}
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                </button>
              );
            })}
          </div>
          {rating > 0 && (
            <p style={{
              marginTop: 'var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--accent-secondary)',
              fontWeight: 600,
              animation: 'fade-in 0.3s ease',
            }}>
              {rating === 5 ? '✨ Прекрасная история!' : rating >= 4 ? '😊 Хорошая история' : rating >= 3 ? '🙂 Неплохо' : '📝 Спасибо за оценку'}
            </p>
          )}
        </div>

        {/* ── Действия ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          <button
            onClick={() => navigate(`/app/children/${story.childId}/story`)}
            className="btn btn-primary btn-sm"
            style={{ justifyContent: 'center', gridColumn: '1 / -1' }}
          >
            <BookOpen size={16} />
            Ещё сказку
          </button>
          <button
            onClick={() => navigate('/app/library')}
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'center' }}
          >
            <Library size={16} />
            Библиотека
          </button>
          <button
            onClick={handleSave}
            className="btn btn-sm"
            style={{
              justifyContent: 'center',
              background: story.isSaved ? 'var(--accent-pink-100)' : 'transparent',
              color: story.isSaved ? 'var(--accent-pink-dark)' : 'var(--text-secondary)',
              border: `2px solid ${story.isSaved ? 'var(--accent-pink)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-full)',
            }}
          >
            <Heart size={15} style={{ fill: story.isSaved ? 'currentColor' : 'none' }} />
            {story.isSaved ? 'Сохранено' : 'Сохранить'}
          </button>
        </div>
      </div>

      {/* Фоновые декорации */}
      <DecorationLayer preset="story" />
    </div>
  );
}
