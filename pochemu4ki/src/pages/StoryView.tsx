import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, BookOpen, Library } from 'lucide-react';
import ShareButtons from '../components/ShareButtons';
import { useApp } from '../context/AppContext';
import type { Story } from '../types';
import { api } from '../api/client';
import BookReader from '../components/BookReader/BookReader';
import ReferralSourceModal, { isReferralDone } from '../components/ReferralSourceModal';

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
  const [showReferral, setShowReferral] = useState(false);

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

  // Show referral survey after first story if not yet answered
  useEffect(() => {
    if (loading || !story) return;
    if (isReferralDone()) return;
    // Show after short delay so user sees the story first
    const t = setTimeout(() => setShowReferral(true), 2000);
    return () => clearTimeout(t);
  }, [loading, story]);

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
      {showReferral && <ReferralSourceModal onClose={() => setShowReferral(false)} />}
      {/* Back button — top left, 44×44 */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 200,
          width: 44,
          height: 44,
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

      {/* Bottom action bar — Save + Share + Rating + Next */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}>
        {/* Action sheet (slides up) */}
        {showActions && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setShowActions(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 198 }}
            />
            <div style={{
              position: 'relative',
              zIndex: 199,
              background: 'rgba(76,29,149,0.95)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px 24px 0 0',
              padding: '20px 20px 12px',
              boxShadow: '0 -8px 40px rgba(76,29,149,0.35)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              {/* Drag handle — tappable to close */}
              <button
                onClick={() => setShowActions(false)}
                aria-label="Закрыть"
                style={{
                  display: 'block', margin: '0 auto 16px',
                  padding: '8px 24px', background: 'none', border: 'none', cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
                }}
              >
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)' }} />
              </button>

              {/* Stars rating */}
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'Comfortaa, sans-serif', marginBottom: 10, textAlign: 'center' }}>
                Понравилась история?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
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
                        width: 44, height: 44,
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        transform: isPopped ? 'scale(1.3)' : active ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <svg width={32} height={32} viewBox="0 0 24 24" style={{ fill: active ? '#F9D56E' : 'rgba(255,255,255,0.3)', transition: 'fill 0.15s' }}>
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <button onClick={handleSave} style={{ ...actionBtnStyle, background: story.isSaved ? 'rgba(232,160,191,0.4)' : 'rgba(255,255,255,0.1)', minHeight: 48 }}>
                  <Heart size={16} style={{ fill: story.isSaved ? '#fff' : 'none' }} />
                  {story.isSaved ? 'Сохранено' : 'Сохранить'}
                </button>
                <button onClick={() => navigate(`/app/children/${story.childId}/story`)} style={{ ...actionBtnStyle, minHeight: 48 }}>
                  <BookOpen size={16} />
                  Ещё сказку
                </button>
                <button onClick={() => navigate('/app/library')} style={{ ...actionBtnStyle, minHeight: 48 }}>
                  <Library size={16} />
                  Библиотека
                </button>
              </div>
            </div>
          </>
        )}

        {/* Always-visible bar */}
        {!showActions && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px 10px',
            background: 'rgba(76,29,149,0.82)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            {/* Save */}
            <button
              onClick={handleSave}
              style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: story.isSaved ? 'rgba(232,160,191,0.6)' : 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
              }}
              aria-label={story.isSaved ? 'Убрать из сохранённых' : 'Сохранить'}
            >
              <Heart size={18} style={{ fill: story.isSaved ? '#fff' : 'none' }} />
            </button>

            {/* Share */}
            <ShareButtons storyId={story.id} storyTitle={story.title} childName={child?.name} />

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Open action sheet (rating + next story) */}
            <button
              onClick={() => setShowActions(true)}
              style={{
                height: 44, borderRadius: 22, flexShrink: 0,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                color: '#fff', cursor: 'pointer', padding: '0 16px',
                fontFamily: 'Comfortaa, sans-serif', fontSize: 13, fontWeight: 600,
              }}
            >
              {rating > 0
                ? <>{'★'.repeat(rating)}</>
                : <>⭐ Оценить</>}
            </button>
          </div>
        )}
      </div>

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
