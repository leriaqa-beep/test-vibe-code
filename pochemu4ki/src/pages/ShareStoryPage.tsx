import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

import BookReader from '../components/BookReader/BookReader';
import type { Story, ChildProfile } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const globalStyles = `
  @keyframes ctaPulse {
    0%, 100% { box-shadow: 0 4px 20px rgba(245,158,11,0.55); }
    50%       { box-shadow: 0 6px 36px rgba(245,158,11,0.85); }
  }
  @keyframes sheetUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes finalCtaIn {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ── Переиспользуемая обёртка шторки ────────────────────────── */
function Sheet({ onBackdropClick, children }: { onBackdropClick?: () => void; children: React.ReactNode }) {
  return (
    <>
      <div
        onClick={onBackdropClick}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(20,10,40,0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 300,
          animation: 'backdropIn 0.3s ease forwards',
        }}
      />
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 301,
        background: 'linear-gradient(160deg, #2D1B50 0%, #4C1D95 60%, #6D28D9 100%)',
        borderRadius: '24px 24px 0 0',
        padding: '28px 24px calc(env(safe-area-inset-bottom, 0px) + 28px)',
        textAlign: 'center',
        animation: 'sheetUp 0.4s cubic-bezier(0.34,1.2,0.64,1) forwards',
        boxShadow: '0 -8px 48px rgba(45,27,80,0.5)',
      }}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '-8px auto 20px' }} />
        {children}
      </div>
    </>
  );
}

/* ── 1. Мягкий попап при загрузке: «авторизуйся или позже» ─── */
function SoftGate({ onClose }: { onClose: () => void }) {
  return (
    <Sheet onBackdropClick={onClose}>
      <img src="/assets/mascot/mascot-think.png" alt="" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 14 }} />
      <h2 style={{ color: '#fff', fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 20, lineHeight: 1.3, margin: '0 0 10px' }}>
        Авторизуйтесь, чтобы создать свою сказку
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Comfortaa, sans-serif', fontSize: 13, lineHeight: 1.5, margin: '0 0 24px' }}>
        Персональные истории для вашего ребёнка · 3 сказки бесплатно · без карты
      </p>
      <Link
        to="/auth"
        style={{
          display: 'block',
          background: 'linear-gradient(135deg, #F59E0B 0%, #E8890A 100%)',
          color: '#3D1F00',
          fontFamily: 'Comfortaa, sans-serif',
          fontWeight: 800, fontSize: 16,
          padding: '16px 24px', borderRadius: 50,
          textDecoration: 'none',
          boxShadow: '0 6px 28px rgba(245,158,11,0.65)',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          animation: 'ctaPulse 2.8s ease-in-out infinite',
        } as React.CSSProperties}
      >
        ✨ Зарегистрироваться бесплатно
      </Link>
      <button
        onClick={onClose}
        style={{
          display: 'block', width: '100%', marginTop: 14,
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Comfortaa, sans-serif', fontSize: 13,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        Позже, сначала прочитаю →
      </button>
    </Sheet>
  );
}

/* ── 2. Шторка на последней странице ────────────────────────── */
function FinalCTA({ onClose }: { childName?: string; onClose: () => void }) {
  const headline = 'Создайте такую сказку для своего ребёнка!';

  return (
    <Sheet onBackdropClick={onClose}>
      <img src="/assets/mascot/mascot-joy.png" alt="" style={{ width: 96, height: 96, objectFit: 'contain', marginBottom: 16 }} />
      <h2 style={{ color: '#fff', fontFamily: 'Comfortaa, sans-serif', fontWeight: 800, fontSize: 22, lineHeight: 1.3, margin: '0 0 12px' }}>
        {headline}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.72)', fontFamily: 'Comfortaa, sans-serif', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
        Персонально — по имени, любимому герою и интересам. Первые 3 сказки бесплатно.
      </p>
      <Link
        to="/auth"
        style={{
          display: 'block',
          background: 'linear-gradient(135deg, #F59E0B 0%, #E8890A 100%)',
          color: '#3D1F00',
          fontFamily: 'Comfortaa, sans-serif',
          fontWeight: 800, fontSize: 17,
          padding: '18px 24px', borderRadius: 50,
          textDecoration: 'none',
          boxShadow: '0 6px 32px rgba(245,158,11,0.65)',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          animation: 'ctaPulse 2.8s ease-in-out infinite',
        } as React.CSSProperties}
      >
        ✨ Попробовать бесплатно
      </Link>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Comfortaa, sans-serif', fontSize: 12, margin: '14px 0 0' }}>
        Без банковской карты · 30 секунд на регистрацию
      </p>
      <button
        onClick={onClose}
        style={{
          display: 'block', width: '100%', marginTop: 16,
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.70)',
          fontFamily: 'Comfortaa, sans-serif', fontSize: 13,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        Создать позже
      </button>
    </Sheet>
  );
}

/* ── 3. Sticky бар (всегда виден внизу пока читает) ─────────── */
function StickyCTA() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 200,
      background: 'rgba(45,27,80,0.97)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(249,213,110,0.2)',
      padding: 'calc(env(safe-area-inset-bottom, 0px) + 10px) 16px 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Comfortaa, sans-serif', fontSize: 11, lineHeight: 1.4, margin: 0, flex: 1 }}>
        Создайте сказку<br />для своего ребёнка
      </p>
      <Link
        to="/auth"
        style={{
          display: 'flex', alignItems: 'center',
          background: 'linear-gradient(135deg, #F59E0B 0%, #E8890A 100%)',
          color: '#3D1F00',
          fontFamily: 'Comfortaa, sans-serif',
          fontWeight: 700, fontSize: 12,
          padding: '10px 16px',
          borderRadius: 50,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(245,158,11,0.5)',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          minHeight: 40,
          animation: 'ctaPulse 2.8s ease-in-out infinite',
        } as React.CSSProperties}
      >
        Попробовать →
      </Link>
    </div>
  );
}

/* ── Главный компонент ───────────────────────────────────────── */
export default function ShareStoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [showFinalCTA, setShowFinalCTA] = useState(false);
  const shownGateRef = useRef(false);
  const finalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE_URL}/stories/public/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error || !data.story) { setError(true); return; }
        setStory({
          id: data.story.id,
          userId: '', childId: '',
          title: data.story.title,
          question: data.story.question,
          context: '',
          content: data.story.content,
          imageUrl: data.story.imageUrl || '',
          isSaved: false, rating: 0, readCount: 0,
          createdAt: data.story.createdAt,
          heroUsed: data.story.heroUsed || undefined,
        });
        if (data.child) {
          setChild({
            id: '', userId: '',
            name: data.child.name, age: data.child.age,
            gender: data.child.gender, hero: data.child.hero,
            toys: [], useToys: false, interests: [], createdAt: '',
          });
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  /* Мягкий попап — через 2 сек после загрузки истории (один раз) */
  useEffect(() => {
    if (!story || shownGateRef.current) return;
    const t = setTimeout(() => {
      setShowGate(true);
      shownGateRef.current = true;
    }, 2000);
    return () => clearTimeout(t);
  }, [story]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#4c1d95' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/assets/mascot/mascot-think.png" alt="" style={{ width: 96, height: 96, objectFit: 'contain', marginBottom: 20 }} />
          <p style={{ color: '#C4B5FD', fontFamily: 'Comfortaa, sans-serif', fontWeight: 600, fontSize: 16, margin: 0 }}>
            Загружаем сказку…
          </p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', gap: 16, paddingBottom: 80 }}>
        <style>{globalStyles}</style>
        <img src="/assets/mascot/mascot-calm.png" alt="" style={{ width: 80, height: 80, objectFit: 'contain' }} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'Comfortaa, sans-serif', fontSize: 15 }}>Сказка не найдена</p>
        <Link to="/" style={{ background: 'var(--accent-primary)', color: '#fff', fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 50, textDecoration: 'none' }}>
          На главную
        </Link>
        <StickyCTA />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}>
      <style>{globalStyles}</style>

      <BookReader
        story={story}
        child={child ?? undefined}
        onLastPage={() => {
          // Даём 8 секунд дочитать прежде чем показать шторку
          if (finalTimerRef.current) clearTimeout(finalTimerRef.current);
          finalTimerRef.current = setTimeout(() => setShowFinalCTA(true), 8000);
        }}
      />

      {/* Шторка на последней странице */}
      {showFinalCTA && (
        <FinalCTA
          childName={child?.name}
          onClose={() => {
            setShowFinalCTA(false);
            // Скроллим к баннеру внизу чтобы пользователь увидел кнопку
            setTimeout(() => bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
          }}
        />
      )}

      {/* Мягкий попап через 2 сек после загрузки */}
      {showGate && !showFinalCTA && (
        <SoftGate onClose={() => setShowGate(false)} />
      )}

      {/* Нижний баннер — виден после закрытия шторки «Позже» */}
      <div ref={bannerRef} style={{
        background: 'linear-gradient(160deg, #2D1B50 0%, #4C1D95 60%, #6D28D9 100%)',
        padding: '40px 24px calc(env(safe-area-inset-bottom, 0px) + 56px)',
        textAlign: 'center',
      }}>
        <img src="/assets/mascot/mascot-joy.png" alt="" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 14 }} />
        <h3 style={{ color: '#fff', fontFamily: 'Comfortaa, sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 10px' }}>
          Создайте такую сказку для своего ребёнка!
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Comfortaa, sans-serif', fontSize: 13, lineHeight: 1.6, margin: '0 0 22px', maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
          Персонально — по имени, любимому герою и интересам. Первые 3 сказки бесплатно.
        </p>
        <Link
          to="/auth"
          style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'linear-gradient(135deg, #F59E0B 0%, #E8890A 100%)',
            color: '#3D1F00',
            fontFamily: 'Comfortaa, sans-serif',
            fontWeight: 800, fontSize: 15,
            padding: '16px 28px', borderRadius: 50,
            textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(245,158,11,0.6)',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            animation: 'ctaPulse 2.8s ease-in-out infinite',
          } as React.CSSProperties}
        >
          ✨ Попробовать бесплатно
        </Link>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Comfortaa, sans-serif', fontSize: 11, margin: '12px 0 0' }}>
          Без банковской карты · 30 секунд
        </p>
      </div>

      <StickyCTA />
    </div>
  );
}
