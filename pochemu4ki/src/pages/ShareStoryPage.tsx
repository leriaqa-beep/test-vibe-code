import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookReader from '../components/BookReader/BookReader';
import type { Story, ChildProfile } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ShareStoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE_URL}/stories/public/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error || !data.story) { setError(true); return; }

        setStory({
          id: data.story.id,
          userId: '',
          childId: '',
          title: data.story.title,
          question: data.story.question,
          context: '',
          content: data.story.content,
          imageUrl: data.story.imageUrl || '',
          isSaved: false,
          rating: 0,
          readCount: 0,
          createdAt: data.story.createdAt,
          heroUsed: data.story.heroUsed || undefined,
        });

        if (data.child) {
          setChild({
            id: '',
            userId: '',
            name: data.child.name,
            age: data.child.age,
            gender: data.child.gender,
            hero: data.child.hero,
            toys: [],
            useToys: false,
            interests: [],
            createdAt: '',
          });
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#4c1d95' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src="/assets/mascot/mascot-think.png"
            alt=""
            style={{ width: 96, height: 96, objectFit: 'contain', marginBottom: 20 }}
          />
          <p style={{ color: '#C4B5FD', fontFamily: 'Comfortaa, sans-serif', fontWeight: 600, fontSize: 16, margin: 0 }}>
            Загружаем сказку…
          </p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', gap: 16 }}>
        <img src="/assets/mascot/mascot-calm.png" alt="" style={{ width: 80, height: 80, objectFit: 'contain' }} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'Comfortaa, sans-serif', fontSize: 15 }}>
          Сказка не найдена
        </p>
        <Link
          to="/"
          style={{
            background: 'var(--accent-primary)',
            color: '#fff',
            fontFamily: 'Comfortaa, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            padding: '10px 20px',
            borderRadius: 50,
            textDecoration: 'none',
          }}
        >
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}>
      {/* BookReader — read-only, no action buttons */}
      <BookReader story={story} child={child ?? undefined} />

      {/* Full CTA banner at bottom for new visitors */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
        padding: '32px 20px 40px',
        textAlign: 'center',
      }}>
        <img
          src="/assets/mascot/mascot-joy.png"
          alt=""
          style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 16 }}
        />
        <h3 style={{
          color: '#fff',
          fontFamily: 'Comfortaa, sans-serif',
          fontWeight: 700,
          fontSize: 20,
          margin: '0 0 10px',
        }}>
          Создайте сказку для своего ребёнка
        </h3>
        <p style={{
          color: 'rgba(255,255,255,0.72)',
          fontFamily: 'Comfortaa, sans-serif',
          fontSize: 14,
          margin: '0 0 24px',
          maxWidth: 320,
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6,
        }}>
          Персональные истории на любой вопрос — по имени, герою и интересам ребёнка. Три сказки бесплатно.
        </p>
        <Link
          to="/auth"
          style={{
            display: 'inline-block',
            background: '#F9D56E',
            color: '#2D1B0E',
            fontFamily: 'Comfortaa, sans-serif',
            fontWeight: 700,
            fontSize: 15,
            padding: '14px 28px',
            borderRadius: 50,
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(249,213,110,0.4)',
          }}
        >
          Попробовать бесплатно →
        </Link>
      </div>

      {/* Sticky CTA — always visible at bottom while reading */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(76, 29, 149, 0.97)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(196, 181, 253, 0.2)',
        padding: 'calc(env(safe-area-inset-bottom, 0px) + 10px) 16px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontFamily: 'Comfortaa, sans-serif',
          fontSize: 12,
          lineHeight: 1.4,
          margin: 0,
          flex: 1,
        }}>
          Создайте сказку<br />для своего ребёнка
        </p>
        <Link
          to="/auth"
          style={{
            display: 'inline-block',
            background: '#F9D56E',
            color: '#2D1B0E',
            fontFamily: 'Comfortaa, sans-serif',
            fontWeight: 700,
            fontSize: 13,
            padding: '10px 18px',
            borderRadius: 50,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(249,213,110,0.35)',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          Попробовать →
        </Link>
      </div>
    </div>
  );
}
