import { useEffect, useRef } from 'react';
import type { Story, ChildProfile } from '../../types';

/* ── Hero colour theming ──────────────────────────────────────── */
const HERO_THEMES: Record<string, { accent: string; glow: string }> = {
  '🦄': { accent: '#C084FC', glow: 'rgba(192,132,252,0.6)' },   // unicorn — lavender
  '🦉': { accent: '#D97706', glow: 'rgba(217,119,6,0.5)' },     // owl — dark gold
  '🐉': { accent: '#F59E0B', glow: 'rgba(245,158,11,0.5)' },    // dragon — amber
  '🧚': { accent: '#F472B6', glow: 'rgba(244,114,182,0.5)' },   // fairy — pink
  '🦁': { accent: '#B45309', glow: 'rgba(180,83,9,0.45)' },     // lion — bronze
  '🐱': { accent: '#818CF8', glow: 'rgba(129,140,248,0.5)' },   // cat — indigo
};

function getHeroTheme(emoji: string) {
  return HERO_THEMES[emoji] ?? { accent: '#F9D56E', glow: 'rgba(249,213,110,0.5)' };
}

/* ── Russian genitive case (родительный падеж) ────────────────── */
export function toGenitive(name: string): string {
  if (!name) return '';
  const n = name.trim();
  const last = n[n.length - 1].toLowerCase();
  const slast = n.length > 1 ? n[n.length - 2].toLowerCase() : '';
  // Ends in -ья / -ия → -ьи / -ии
  if (n.toLowerCase().endsWith('ья')) return n.slice(0, -2) + 'ьи';
  if (n.toLowerCase().endsWith('ия')) return n.slice(0, -2) + 'ии';
  // Ends in -а → -ы (except after ж ш щ ч → -и)
  if (last === 'а') {
    const softeners = ['ж', 'ш', 'щ', 'ч', 'г', 'к', 'х'];
    return n.slice(0, -1) + (softeners.includes(slast) ? 'и' : 'ы');
  }
  // Ends in -я → -и
  if (last === 'я') return n.slice(0, -1) + 'и';
  // Masculine hard consonant — add -а
  const vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];
  if (!vowels.includes(last) && last !== 'ь' && last !== 'й') return n + 'а';
  // Ends in -й → -я
  if (last === 'й') return n.slice(0, -1) + 'я';
  // Ends in -ь — try -я for male names (best guess)
  if (last === 'ь') return n.slice(0, -1) + 'я';
  return n;
}

/* ── SVG star sparkle ─────────────────────────────────────────── */
function Star({ x, y, size, delay, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        animation: `bookstar ${2.2 + delay * 0.4}s ease-in-out infinite`,
        animationDelay: `${delay * 0.35}s`,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          d="M12 2l2.09 6.26L21 9.27l-5 4.73 1.18 6.9L12 17.77l-5.18 3.13L8 14l-5-4.73 6.91-1.01z"
          fill={color}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
    </div>
  );
}

/* ── BookCover ────────────────────────────────────────────────── */
interface BookCoverProps {
  story: Story;
  child: ChildProfile | undefined;
  onOpen: () => void;
}

export default function BookCover({ story, child, onOpen }: BookCoverProps) {
  const theme = child ? getHeroTheme(child.hero.emoji) : { accent: '#F9D56E', glow: 'rgba(249,213,110,0.5)' };
  const mascotRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = mascotRef.current;
    if (!el) return;
    el.style.animation = 'bookMascotFloat 3s ease-in-out infinite';
  }, []);

  const stars = [
    { x: 8,  y: 10, size: 16, delay: 0,   color: '#F9D56E' },
    { x: 85, y: 14, size: 22, delay: 1,   color: theme.accent },
    { x: 15, y: 72, size: 14, delay: 2,   color: '#C084FC' },
    { x: 80, y: 65, size: 18, delay: 0.5, color: '#F9D56E' },
    { x: 50, y: 6,  size: 12, delay: 1.5, color: theme.accent },
    { x: 92, y: 42, size: 10, delay: 2.5, color: '#fff' },
    { x: 5,  y: 45, size: 11, delay: 0.8, color: '#fff' },
  ];

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #4c1d95 0%, #6d28d9 45%, #7e22ce 100%)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onOpen}
    >
      {/* Background texture circles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '55%', paddingBottom: '55%', borderRadius: '50%', background: 'rgba(167,139,250,0.12)' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-8%', width: '45%', paddingBottom: '45%', borderRadius: '50%', background: 'rgba(196,181,253,0.10)' }} />
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)', width: '70%', paddingBottom: '70%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Stars */}
      {stars.map((s, i) => <Star key={i} {...s} />)}

      {/* Ornamental frame */}
      <div style={{
        position: 'absolute',
        inset: '20px',
        border: `2px solid ${theme.accent}`,
        borderRadius: 24,
        opacity: 0.35,
        boxShadow: `inset 0 0 32px ${theme.glow}`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        inset: '28px',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 20,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '40px 32px', maxWidth: 380 }}>

        {/* Series label */}
        <p style={{
          fontFamily: 'Comfortaa, sans-serif',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: theme.accent,
          marginBottom: 24,
          opacity: 0.9,
        }}>
          ✦ Почему-Ка! ✦
        </p>

        {/* Mascot */}
        <img
          ref={mascotRef}
          src="/assets/mascot/mascot-joy.png"
          alt="Маскот"
          style={{
            width: 120,
            height: 120,
            objectFit: 'contain',
            marginBottom: 20,
            filter: `drop-shadow(0 8px 24px ${theme.glow})`,
          }}
        />

        {/* Title */}
        <h1 style={{
          fontFamily: 'Literata, Georgia, serif',
          fontWeight: 700,
          fontSize: 'clamp(1.5rem, 5vw, 2.1rem)',
          color: '#fff',
          lineHeight: 1.2,
          marginBottom: 12,
          textShadow: `0 2px 16px ${theme.glow}`,
        }}>
          {story.title}
        </h1>

        {/* Gold ornamental line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '16px 0' }}>
          <div style={{ height: 1, width: 40, background: `linear-gradient(to right, transparent, ${theme.accent})` }} />
          <span style={{ fontSize: 16, color: theme.accent }}>✦</span>
          <div style={{ height: 1, width: 40, background: `linear-gradient(to left, transparent, ${theme.accent})` }} />
        </div>

        {/* Child name in genitive */}
        {child && (
          <p style={{
            fontFamily: 'Comfortaa, sans-serif',
            fontSize: 15,
            color: theme.accent,
            fontWeight: 600,
            marginBottom: 6,
            textShadow: `0 0 12px ${theme.glow}`,
          }}>
            Для {toGenitive(child.name)}
          </p>
        )}

        {/* Question label */}
        <p style={{
          fontFamily: 'Literata, Georgia, serif',
          fontSize: 13,
          color: 'rgba(255,255,255,0.65)',
          fontStyle: 'italic',
          marginBottom: 36,
          lineHeight: 1.4,
        }}>
          «{story.question}»
        </p>

        {/* Open button */}
        <button
          onClick={e => { e.stopPropagation(); onOpen(); }}
          style={{
            fontFamily: 'Comfortaa, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: '#4c1d95',
            background: `linear-gradient(135deg, ${theme.accent}, #fff9c4)`,
            border: 'none',
            borderRadius: 50,
            padding: '14px 36px',
            cursor: 'pointer',
            boxShadow: `0 4px 20px ${theme.glow}`,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            letterSpacing: '0.04em',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
          📖 Читать сказку
        </button>
      </div>
    </div>
  );
}
