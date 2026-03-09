import type { ChildProfile } from '../../types';

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
        fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
        lineHeight: 1.85,
        color: '#2D1B0E',
        marginBottom: '1.4em',
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
  storyImageUrl,
  child,
  isFirst = false,
  isLast = false,
}: BookPageProps) {
  const theme = child ? getHeroTheme(child.hero.emoji) : getHeroTheme('🦄');

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

      {/* Page border */}
      <div style={{
        position: 'absolute',
        inset: '12px',
        border: `1.5px solid ${theme.border}`,
        borderRadius: 16,
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '36px 28px 28px', flex: 1 }}>

        {/* First page: title block */}
        {isFirst && (
          <div style={{ marginBottom: 28 }}>
            {/* Mascot-explain centered, larger */}
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <img
                src="/assets/mascot/mascot-explain.png"
                alt=""
                style={{ width: 80, height: 92, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(124,58,237,0.28))' }}
              />
            </div>

            {/* Title centered */}
            <h2 style={{
              fontFamily: 'Literata, Georgia, serif',
              fontWeight: 700,
              fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
              color: theme.accent,
              lineHeight: 1.2,
              margin: '0 0 16px',
              textAlign: 'center',
            }}>
              {storyTitle}
            </h2>

            {/* Question block */}
            <div style={{
              background: theme.light,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 20,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}>
              <img
                src="/assets/mascot/mascot-hero.png"
                alt=""
                style={{ width: 36, height: 40, objectFit: 'contain', flexShrink: 0, marginTop: 2 }}
              />
              <p style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: 13,
                color: theme.accent,
                fontStyle: 'italic',
                lineHeight: 1.5,
                margin: 0,
              }}>
                «{question}»
              </p>
            </div>

            {/* Ornamental divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, opacity: 0.5 }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${theme.border})` }} />
              <span style={{ fontSize: 14, color: theme.accent }}>✦</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${theme.border})` }} />
            </div>
          </div>
        )}

        {/* Paragraphs */}
        <div style={{ position: 'relative' }}>
          {paragraphs.map((para, i) => {
            // Insert hero image after 2nd paragraph on middle pages
            const showHero = !isFirst && heroImage && i === 2 && paragraphs.length > 3;
            return (
              <div key={i}>
                <Paragraph
                  text={para}
                  isFirst={i === 0 && isFirst}
                  accentColor={theme.accent}
                />
                {showHero && (
                  <div style={{ textAlign: 'center', margin: '16px 0 20px' }}>
                    <img
                      src={heroImage}
                      alt=""
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'contain',
                        opacity: 0.85,
                        filter: `drop-shadow(0 4px 12px ${theme.accent}40)`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Last page: illustration + mascot-joy ending */}
        {isLast && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, opacity: 0.45 }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${theme.border})` }} />
              <span style={{ fontSize: 14, color: theme.accent }}>✦</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${theme.border})` }} />
            </div>
            {storyImageUrl && (
              <div style={{ marginBottom: 24, display: 'inline-block' }}>
                <img
                  src={storyImageUrl}
                  alt=""
                  style={{
                    width: 220,
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 16,
                    boxShadow: `0 4px 20px ${theme.accent}30`,
                    border: `1.5px solid ${theme.border}`,
                  }}
                  onError={e => { (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none'; }}
                />
              </div>
            )}
            <img
              src="/assets/mascot/mascot-joy.png"
              alt=""
              style={{
                width: 80,
                height: 80,
                objectFit: 'contain',
                marginBottom: 12,
                display: 'block',
                margin: '0 auto 12px',
                animation: 'bookMascotFloat 3s ease-in-out infinite',
                filter: 'drop-shadow(0 4px 16px rgba(124,58,237,0.3))',
              }}
            />
            <p style={{
              fontFamily: 'Literata, Georgia, serif',
              fontSize: 14,
              color: theme.accent,
              fontStyle: 'italic',
              opacity: 0.8,
            }}>
              Конец ✦
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
        padding: '12px 28px 20px',
        borderTop: `1px solid ${theme.border}`,
        opacity: 0.6,
      }}>
        <img
          src="/assets/mascot/mascot-calm.png"
          alt=""
          style={{ width: 28, height: 32, objectFit: 'contain' }}
        />
        <p style={{
          fontFamily: 'Literata, Georgia, serif',
          fontSize: 12,
          color: '#8B5E3C',
          fontStyle: 'italic',
          margin: 0,
        }}>
          {pageNumber} / {totalPages}
        </p>
        <div style={{ width: 28 }} />
      </div>
    </div>
  );
}
