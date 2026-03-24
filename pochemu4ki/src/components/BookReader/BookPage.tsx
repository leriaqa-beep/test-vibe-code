import { useState } from 'react';
import type { ChildProfile } from '../../types';

/* ── Hero image circle with proper load-state ─────────────────── */
function HeroImageCircle({ src, accent, light, border }: { src?: string; accent: string; light: string; border: string }) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = !!src && loadedSrc === src;
  return (
    <div style={{ textAlign: 'center', margin: '24px 0 28px' }}>
      <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: light, border: `2px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src="/assets/mascot/mascot-calm.png"
            alt=""
            style={{
              width: 56, height: 64, objectFit: 'contain',
              filter: `drop-shadow(0 2px 6px ${accent}30)`,
              opacity: loaded ? 0 : 1, transition: 'opacity 0.3s',
            }}
          />
        </div>
        {src && (
          <img
            src={src}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: 100, height: 100,
              objectFit: 'cover', objectPosition: 'top center', borderRadius: '50%',
              opacity: loaded ? 1 : 0, transition: 'opacity 0.4s',
              filter: `drop-shadow(0 4px 12px ${accent}40)`,
            }}
            onLoad={() => setLoadedSrc(src)}
            onError={() => setLoadedSrc(null)}
          />
        )}
      </div>
    </div>
  );
}

/* ── Hero image large card — used on the last page ────────────── */
function HeroImageLarge({ src, accent, light, border }: { src?: string; accent: string; light: string; border: string }) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = !!src && loadedSrc === src;
  return (
    <div style={{
      display: 'block',
      position: 'relative',
      width: '100%',
      maxWidth: 300,
      aspectRatio: '3 / 4',
      margin: '0 auto 24px',
      borderRadius: 20,
      overflow: 'hidden',
      border: `2px solid ${border}`,
      boxShadow: `0 8px 32px ${accent}28`,
      background: `linear-gradient(160deg, ${light} 0%, ${border}60 100%)`,
    }}>
      {/* placeholder while loading */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: loaded ? 0 : 1, transition: 'opacity 0.3s',
      }}>
        <img src="/assets/mascot/mascot-surprise.png" alt=""
          style={{ width: 80, height: 80, objectFit: 'contain' }} />
      </div>
      {/* hero image */}
      {src && (
        <img
          src={src}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'top center',
            opacity: loaded ? 1 : 0, transition: 'opacity 0.45s',
          }}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setLoadedSrc(null)}
        />
      )}
    </div>
  );
}

/* ── Hero colour theming ──────────────────────────────────────── */
const HERO_THEMES: Record<string, { accent: string; light: string; border: string }> = {
  '🦄': { accent: '#7C3AED', light: '#EDE9FE', border: '#C4B5FD' },
  '🦉': { accent: '#92400E', light: '#FEF3C7', border: '#FCD34D' },
  '🐉': { accent: '#B45309', light: '#FFF7ED', border: '#FDE68A' },
  '🧚': { accent: '#BE185D', light: '#FCE7F3', border: '#FBCFE8' },
  '🦁': { accent: '#78350F', light: '#FEF9EF', border: '#FDE68A' },
  '🐱': { accent: '#4338CA', light: '#EEF2FF', border: '#C7D2FE' },
};

function getHeroTheme(emoji: string) {
  return HERO_THEMES[emoji] ?? { accent: '#7C3AED', light: '#EDE9FE', border: '#C4B5FD' };
}

/* ── Inline **bold** renderer ─────────────────────────────────── */
function renderInline(text: string, accentColor: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ color: accentColor, fontWeight: 700 }}>{p.slice(2, -2)}</strong>
      : p
  );
}

/* ── Paragraph with optional drop-cap ────────────────────────── */
interface ParagraphProps {
  text: string;
  isFirst: boolean;
  accentColor: string;
}
function Paragraph({ text, isFirst, accentColor }: ParagraphProps) {
  if (isFirst && text.length > 0) {
    const firstChar = text[0];
    const rest = text.slice(1);
    return (
      <p style={{
        fontFamily: 'Literata, Georgia, serif',
        fontSize: 'clamp(1.0625rem, 2.5vw, 1.125rem)',
        lineHeight: 1.9,
        color: '#2D1B0E',
        marginBottom: '1.55em',
        textAlign: 'justify',
        hyphens: 'auto',
      }}>
        <span style={{
          float: 'left',
          fontFamily: 'Literata, Georgia, serif',
          fontSize: '3.5em',
          fontWeight: 700,
          lineHeight: 0.78,
          marginTop: '0.08em',
          marginRight: '0.06em',
          marginBottom: '-0.05em',
          color: accentColor,
          textShadow: `0 2px 8px ${accentColor}40`,
        }}>
          {firstChar}
        </span>
        {renderInline(rest, accentColor)}
      </p>
    );
  }
  return (
    <p style={{
      fontFamily: 'Literata, Georgia, serif',
      fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
      lineHeight: 1.85,
      color: '#2D1B0E',
      marginBottom: '1.4em',
      textAlign: 'justify',
      hyphens: 'auto',
    }}>
      {renderInline(text, accentColor)}
    </p>
  );
}

/* ── BookPage ─────────────────────────────────────────────────── */
export interface BookPageProps {
  paragraphs: string[];
  pageNumber: number;
  totalPages: number;
  storyTitle: string;
  question: string;
  heroImage?: string;
  heroEmoji?: string;
  storyImageUrl?: string;
  child?: ChildProfile;
  isFirst?: boolean;   // first content page — shows title + question + mascot
  isLast?: boolean;    // last content page — shows mascot-joy at end
}

export default function BookPage({
  paragraphs,
  pageNumber,
  totalPages,
  storyTitle,
  question,
  heroImage,
  heroEmoji,
  storyImageUrl,
  child,
  isFirst = false,
  isLast = false,
}: BookPageProps) {
  const theme = getHeroTheme(heroEmoji ?? (child ? child.hero.emoji : '🦄'));

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at 20% 10%, rgba(253,246,227,0.95) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 90%, rgba(245,235,210,0.9) 0%, transparent 60%),
          #FDF6E3
        `,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Subtle texture overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 28px,
            rgba(139,90,43,0.035) 28px,
            rgba(139,90,43,0.035) 29px
          )
        `,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Page border — centered, follows reader width */}
      <div style={{
        position: 'absolute',
        top: 12,
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(680px, calc(100% - 24px))',
        border: `1.5px solid ${theme.border}`,
        borderRadius: 16,
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '68px 22px 24px', flex: 1, maxWidth: 680, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>

        {/* First page: title block */}
        {isFirst && (
          <div style={{ marginBottom: 28 }}>
            {/* Mascot */}
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <img
                src="/assets/mascot/mascot-explain.png"
                alt=""
                style={{ width: 72, height: 84, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(124,58,237,0.25))' }}
              />
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'Literata, Georgia, serif',
              fontWeight: 700,
              fontSize: 'clamp(1.25rem, 4.5vw, 1.75rem)',
              color: theme.accent,
              lineHeight: 1.25,
              margin: '0 0 14px',
              textAlign: 'center',
              letterSpacing: '-0.01em',
            }}>
              {storyTitle}
            </h2>

            {/* Question block */}
            <div style={{
              background: theme.light,
              border: `1px solid ${theme.border}`,
              borderRadius: 14,
              padding: '11px 14px',
              marginBottom: 22,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}>
              <img
                src="/assets/mascot/mascot-hero.png"
                alt=""
                style={{ width: 34, height: 38, objectFit: 'contain', flexShrink: 0, marginTop: 3 }}
              />
              <p style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: 14,
                color: theme.accent,
                fontStyle: 'italic',
                lineHeight: 1.65,
                margin: 0,
              }}>
                «{question}»
              </p>
            </div>

            {/* Ornamental divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, opacity: 0.45 }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${theme.border})` }} />
              <span style={{ fontSize: 13, color: theme.accent, letterSpacing: '0.15em' }}>✦ ✦ ✦</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${theme.border})` }} />
            </div>
          </div>
        )}

        {/* Running title — shown on all pages except the first */}
        {!isFirst && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, gap: 8, opacity: 0.5,
          }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${theme.border})` }} />
            <p style={{
              fontFamily: 'Literata, Georgia, serif',
              fontSize: 11,
              color: theme.accent,
              fontStyle: 'italic',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '55%',
              textAlign: 'center',
            }}>
              {storyTitle}
            </p>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${theme.border})` }} />
          </div>
        )}

        {/* Paragraphs */}
        <div style={{ position: 'relative' }}>
          {paragraphs.map((para, i) => {
            // Insert hero image after 2nd paragraph, but not on the last page
            // (last page shows hero in the illustration slot instead)
            const showHero = !!heroImage && !isLast && i === Math.min(2, Math.floor(paragraphs.length / 2));
            return (
              <div key={i}>
                <Paragraph
                  text={para}
                  isFirst={i === 0 && isFirst}
                  accentColor={theme.accent}
                />
                {showHero && (
                  <HeroImageCircle src={heroImage} accent={theme.accent} light={theme.light} border={theme.border} />
                )}
              </div>
            );
          })}
        </div>

        {/* Last page: illustration + mascot-joy ending */}
        {isLast && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, opacity: 0.4 }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${theme.border})` }} />
              <span style={{ fontSize: 12, color: theme.accent, letterSpacing: '0.18em' }}>✦ ✦ ✦</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${theme.border})` }} />
            </div>
            {/* Hero image large card — shown on last page */}
            {heroImage && (
              <HeroImageLarge
                src={heroImage}
                accent={theme.accent}
                light={theme.light}
                border={theme.border}
              />
            )}

            {/* Story illustration — only shown if no hero image */}
            {!heroImage && storyImageUrl && (
              <div style={{ marginBottom: 24, display: 'inline-block', position: 'relative', width: 220, height: 160 }}>
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 16,
                  background: `linear-gradient(135deg, ${theme.light} 0%, ${theme.border}40 100%)`,
                  border: `1.5px solid ${theme.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img
                    src="/assets/mascot/mascot-think.png"
                    alt=""
                    style={{ width: 72, height: 72, objectFit: 'contain', opacity: 0.6, animation: 'bookMascotFloat 3s ease-in-out infinite' }}
                  />
                </div>
                <img
                  src={storyImageUrl}
                  alt=""
                  style={{
                    position: 'absolute', inset: 0,
                    width: 220, height: 160,
                    objectFit: 'cover', borderRadius: 16,
                    boxShadow: `0 4px 20px ${theme.accent}30`,
                    border: `1.5px solid ${theme.border}`,
                    opacity: 0, transition: 'opacity 0.4s',
                  }}
                  onLoad={e => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <img
              src="/assets/mascot/mascot-joy.png"
              alt=""
              style={{
                width: 88,
                height: 88,
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto 14px',
                animation: 'bookMascotFloat 3s ease-in-out infinite',
                filter: 'drop-shadow(0 6px 20px rgba(124,58,237,0.32))',
              }}
            />
            <p style={{
              fontFamily: 'Literata, Georgia, serif',
              fontSize: 15,
              color: theme.accent,
              fontStyle: 'italic',
              opacity: 0.85,
              letterSpacing: '0.06em',
              margin: 0,
            }}>
              — ✦ Конец ✦ —
            </p>
          </div>
        )}
      </div>

      {/* Footer: mascot-calm + page number */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `14px 22px calc(env(safe-area-inset-bottom, 0px) + 108px)`,
        borderTop: `1px solid ${theme.border}`,
        opacity: 0.78,
        maxWidth: 680,
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <img
          src="/assets/mascot/mascot-calm.png"
          alt=""
          style={{ width: 26, height: 30, objectFit: 'contain' }}
        />
        <p style={{
          fontFamily: 'Literata, Georgia, serif',
          fontSize: 13,
          color: '#8B5E3C',
          fontStyle: 'italic',
          margin: 0,
          letterSpacing: '0.04em',
        }}>
          {pageNumber} / {totalPages}
        </p>
        <div style={{ width: 26 }} />
      </div>
    </div>
  );
}
