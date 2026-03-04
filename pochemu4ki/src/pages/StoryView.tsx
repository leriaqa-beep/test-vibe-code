import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, BookOpen, Library } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Story } from '../types';
import { api } from '../api/client';
import BookReader from '../components/BookReader/BookReader';

export default function StoryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stories, updateStory, children } = useApp();
  const [story, setStory] = useState<Story | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [poppedStar, setPoppedStar] = useState<number | null>(null);
  const [showActions, setShowActions] = useState(false);

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#4c1d95' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src="/assets/mascot/mascot-think.png"
            alt=""
            style={{ width: 96, height: 96, objectFit: 'contain', marginBottom: 20, animation: 'bookMascotFloat 3s ease-in-out infinite' }}
          />
          <p style={{ color: '#C4B5FD', fontFamily: 'Comfortaa, sans-serif', fontWeight: 600, fontSize: 16 }}>
            Загружаем историю…
          </p>
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

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Back button — always on top */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 200,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(76,29,149,0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
        aria-label="Назад"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Actions toggle (top-right) */}
      <button
        onClick={() => setShowActions(a => !a)}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 200,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: story.isSaved ? 'rgba(232,160,191,0.85)' : 'rgba(76,29,149,0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
        aria-label="Сохранить"
      >
        <Heart size={17} style={{ fill: story.isSaved ? '#fff' : 'none' }} />
      </button>

      {/* Action panel */}
      {showActions && (
        <div style={{
          position: 'fixed',
          top: 64,
          right: 16,
          zIndex: 200,
          background: 'rgba(76,29,149,0.92)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16,
          padding: '16px',
          boxShadow: '0 8px 32px rgba(76,29,149,0.4)',
          border: '1px solid rgba(255,255,255,0.15)',
          minWidth: 200,
        }}>
          {/* Stars rating */}
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'Comfortaa, sans-serif', marginBottom: 8, textAlign: 'center' }}>
            Понравилась история?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map(r => {
              const active = r <= (hoverRating || rating);
              const isPopped = poppedStar !== null && r <= poppedStar;
              return (
                <button
                  key={r}
                  onClick={() => handleRate(r)}
                  onMouseEnter={() => setHoverRating(r)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    width: 36,
                    height: 36,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transform: isPopped ? 'scale(1.3)' : active ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <svg width={28} height={28} viewBox="0 0 24 24" style={{ fill: active ? '#F9D56E' : 'rgba(255,255,255,0.3)', transition: 'fill 0.15s' }}>
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handleSave}
              style={{ ...actionBtnStyle, background: story.isSaved ? 'rgba(232,160,191,0.5)' : 'rgba(255,255,255,0.1)' }}
            >
              <Heart size={14} style={{ fill: story.isSaved ? '#fff' : 'none' }} />
              {story.isSaved ? 'Сохранено' : 'Сохранить'}
            </button>
            <button
              onClick={() => navigate(`/app/children/${story.childId}/story`)}
              style={actionBtnStyle}
            >
              <BookOpen size={14} />
              Ещё сказку
            </button>
            <button
              onClick={() => navigate('/app/library')}
              style={actionBtnStyle}
            >
              <Library size={14} />
              Библиотека
            </button>
          </div>
        </div>
      )}

      {/* BookReader */}
      <BookReader story={story} child={child} />
    </div>
  );
}

const actionBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'Comfortaa, sans-serif',
  fontSize: 13,
  fontWeight: 600,
  color: '#fff',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 10,
  padding: '8px 12px',
  cursor: 'pointer',
  width: '100%',
  transition: 'background 0.15s',
};
