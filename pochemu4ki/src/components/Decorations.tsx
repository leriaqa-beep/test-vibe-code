/**
 * Decorations — фоновые SVG-элементы в едином пастельном стиле.
 * Тонкие линии, мягкие цвета, opacity 0.12–0.28.
 * Используй <DecorationLayer preset="hero" /> внутри page-container.
 */

interface DecorProps {
  x?: string | number;
  y?: string | number;
  size?: number;
  color?: string;
  delay?: number;
  rotate?: number;
  className?: string;
}

/* ── Отдельные SVG-фигуры ──────────────────────────────────── */

export function Cloud({ x = 0, y = 0, size = 80, color = '#7C6BC4', delay = 0, rotate = 0 }: DecorProps) {
  return (
    <div
      className="decor-element"
      style={{
        left: x,
        top: y,
        animationDelay: `${delay}s`,
        animationDuration: `${6 + delay}s`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none">
        <path
          d="M20 45C11 45 4 38.3 4 30C4 22.3 9.8 16 17.3 15.1C18.3 8.2 24.3 3 31.6 3C35.3 3 38.7 4.4 41.2 6.7C43.5 4 46.9 2.3 50.8 2.3C57.7 2.3 63.3 7.9 63.3 14.8C63.3 14.9 63.3 15 63.3 15.1C63.8 15 64.4 15 65 15C73.3 15 80 21.7 80 30C80 38.3 73.3 45 65 45H20Z"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function SmallCloud({ x = 0, y = 0, size = 56, color = '#E8A0BF', delay = 0 }: DecorProps) {
  return (
    <div
      className="decor-element"
      style={{ left: x, top: y, animationDelay: `${delay}s`, animationDuration: `${7 + delay}s` }}
    >
      <svg width={size} height={size * 0.55} viewBox="0 0 80 44" fill="none">
        <path
          d="M15 34C8 34 2 28.3 2 21C2 14 7.3 8.2 14.3 7.6C15.7 3.3 19.7 0.2 24.4 0.2C27 0.2 29.5 1.2 31.3 2.9C33 1 35.5 0 38.2 0C43.5 0 47.8 4.3 47.8 9.6V9.7C48.2 9.6 48.6 9.6 49 9.6C55.1 9.6 60 14.5 60 20.6C60 26.8 55.1 31.7 49 31.7L15 34Z"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function Star({ x = 0, y = 0, size = 24, color = '#F9D56E', delay = 0, rotate = 0 }: DecorProps) {
  return (
    <div
      className="decor-element-pulse"
      style={{
        left: x,
        top: y,
        animationDelay: `${delay}s`,
        animationDuration: `${4 + delay * 0.5}s`,
      }}
    >
      {/* Мягкая 4-конечная звёздочка */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        <path
          d="M12 2C12 2 13 7 16 10C19 13 22 12 22 12C22 12 17 13 14 16C11 19 12 22 12 22C12 22 11 17 8 14C5 11 2 12 2 12C2 12 7 11 10 8C13 5 12 2 12 2Z"
          stroke={color}
          strokeWidth="1.5"
          fill={color}
          fillOpacity="0.3"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function TinyStars({ x = 0, y = 0, color = '#F9D56E', delay = 0 }: DecorProps) {
  return (
    <div className="decor-element-pulse" style={{ left: x, top: y, animationDelay: `${delay}s` }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="8"  cy="8"  r="1.8" fill={color} />
        <circle cx="40" cy="12" r="2.4" fill={color} opacity="0.7"/>
        <circle cx="16" cy="36" r="1.4" fill={color} opacity="0.8"/>
        <circle cx="38" cy="38" r="2"   fill={color} opacity="0.6"/>
        <circle cx="24" cy="4"  r="1.2" fill={color} opacity="0.9"/>
      </svg>
    </div>
  );
}

export function Heart({ x = 0, y = 0, size = 28, color = '#E8A0BF', delay = 0 }: DecorProps) {
  return (
    <div
      className="decor-element"
      style={{ left: x, top: y, animationDelay: `${delay}s`, animationDuration: `${5 + delay}s` }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
          stroke={color}
          strokeWidth="1.8"
          fill={color}
          fillOpacity="0.25"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function Planet({ x = 0, y = 0, size = 52, color = '#7BBCD8', delay = 0 }: DecorProps) {
  return (
    <div
      className="decor-element"
      style={{ left: x, top: y, animationDelay: `${delay}s`, animationDuration: `${8 + delay}s` }}
    >
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
        {/* Кольцо */}
        <ellipse cx="26" cy="26" rx="22" ry="8"
          stroke={color} strokeWidth="1.8" fill="none" opacity="0.6"
          transform="rotate(-20 26 26)"
        />
        {/* Планета */}
        <circle cx="26" cy="26" r="12"
          stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15"
        />
        {/* Блик */}
        <circle cx="21" cy="22" r="3" fill="white" opacity="0.4" />
      </svg>
    </div>
  );
}

export function Leaf({ x = 0, y = 0, size = 36, color = '#6BB89C', delay = 0, rotate = 0 }: DecorProps) {
  return (
    <div
      className="decor-element"
      style={{
        left: x,
        top: y,
        animationDelay: `${delay}s`,
        animationDuration: `${7 + delay}s`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <path
          d="M18 4C18 4 28 10 28 20C28 27 22 32 18 32C14 32 8 27 8 20C8 10 18 4 18 4Z"
          stroke={color}
          strokeWidth="2"
          fill={color}
          fillOpacity="0.2"
          strokeLinejoin="round"
        />
        <path
          d="M18 4C18 4 18 18 18 32"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18 14C18 14 24 18 26 24"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M18 14C18 14 12 18 10 24"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

export function Flower({ x = 0, y = 0, size = 40, color = '#E8A0BF', delay = 0 }: DecorProps) {
  return (
    <div
      className="decor-element-pulse"
      style={{ left: x, top: y, animationDelay: `${delay}s`, animationDuration: `${6 + delay}s` }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="20" cy="20" rx="5" ry="9"
            fill={color}
            fillOpacity="0.3"
            stroke={color}
            strokeWidth="1.2"
            transform={`rotate(${angle} 20 20) translate(0 -9)`}
          />
        ))}
        <circle cx="20" cy="20" r="5" fill={color} fillOpacity="0.5" stroke={color} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function WavyLine({ x = 0, y = 0, width = 120, color = '#7C6BC4', delay = 0 }: DecorProps) {
  const h = 20;
  return (
    <div
      className="decor-element-pulse"
      style={{ left: x, top: y, animationDelay: `${delay}s` }}
    >
      <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} fill="none">
        <path
          d={`M0 ${h / 2} C${width * 0.15} 0, ${width * 0.35} ${h}, ${width * 0.5} ${h / 2} S${width * 0.85} 0, ${width} ${h / 2}`}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function DotGrid({ x = 0, y = 0, color = '#7C6BC4', cols = 5, rows = 4 }: DecorProps & { cols?: number; rows?: number }) {
  const spacing = 14;
  return (
    <div className="decor-element-pulse" style={{ left: x, top: y }}>
      <svg
        width={spacing * cols}
        height={spacing * rows}
        viewBox={`0 0 ${spacing * cols} ${spacing * rows}`}
        fill="none"
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <circle
              key={`${r}-${c}`}
              cx={c * spacing + spacing / 2}
              cy={r * spacing + spacing / 2}
              r="2"
              fill={color}
              opacity={0.4 + (r + c) % 3 * 0.15}
            />
          ))
        )}
      </svg>
    </div>
  );
}

/* ── Готовые наборы декораций для страниц ──────────────────── */

type DecorationPreset = 'hero' | 'auth' | 'dashboard' | 'story' | 'minimal';

interface DecorationLayerProps {
  preset?: DecorationPreset;
}

export default function DecorationLayer({ preset = 'minimal' }: DecorationLayerProps) {
  if (preset === 'hero') {
    return (
      <div className="decor-layer">
        <Cloud x="5%"  y="8%"   size={100} color="#7C6BC4" delay={0} />
        <Cloud x="62%" y="5%"   size={80}  color="#6BB89C" delay={1.5} />
        <SmallCloud x="78%" y="18%"  size={60} color="#E8A0BF" delay={0.8} />
        <SmallCloud x="15%" y="30%"  size={50} color="#7BBCD8" delay={2} />

        <Planet x="82%" y="8%"  size={64} color="#7BBCD8" delay={0.5} />
        <Planet x="3%"  y="55%" size={44} color="#9B8EC4" delay={2} />

        <Star x="45%" y="7%"  size={20} color="#F9D56E" delay={0}   rotate={15} />
        <Star x="88%" y="35%" size={16} color="#F9D56E" delay={1}   rotate={30} />
        <Star x="20%" y="60%" size={14} color="#F4A261" delay={0.5} rotate={0} />
        <Star x="68%" y="70%" size={18} color="#F9D56E" delay={2}   rotate={20} />
        <TinyStars x="55%" y="25%" color="#F9D56E" delay={0} />

        <Heart x="90%" y="60%" size={30} color="#E8A0BF" delay={1} />
        <Heart x="8%"  y="82%" size={24} color="#F4A261" delay={2.5} />

        <Leaf x="92%" y="80%" size={44} color="#6BB89C" delay={0.3} rotate={-30} />
        <Leaf x="2%"  y="15%" size={32} color="#6BB89C" delay={1.8} rotate={20} />

        <WavyLine x="35%" y="88%" width={160} color="#C9BCFD" delay={1} />
        <DotGrid  x="70%" y="55%" color="#9B8EC4" cols={4} rows={3} />
      </div>
    );
  }

  if (preset === 'auth') {
    return (
      <div className="decor-layer">
        <Cloud x="5%"  y="5%"  size={80} color="#7C6BC4" delay={0} />
        <Cloud x="65%" y="10%" size={64} color="#E8A0BF" delay={1} />
        <Planet x="80%" y="3%"  size={48} color="#7BBCD8" delay={0.5} />
        <Star   x="50%" y="5%"  size={18} color="#F9D56E" delay={0}  rotate={10} />
        <Star   x="88%" y="45%" size={14} color="#F9D56E" delay={1.2} rotate={30} />
        <Heart  x="6%"  y="70%" size={26} color="#E8A0BF" delay={0.8} />
        <Leaf   x="90%" y="75%" size={36} color="#6BB89C" delay={1.5} rotate={-25} />
        <DotGrid x="3%" y="40%" color="#9B8EC4" cols={3} rows={4} />
      </div>
    );
  }

  if (preset === 'dashboard') {
    return (
      <div className="decor-layer">
        <Cloud   x="0%"  y="0%"  size={88} color="#7C6BC4" delay={0} />
        <Cloud   x="70%" y="5%"  size={70} color="#7BBCD8" delay={1.2} />
        <Star    x="88%" y="2%"  size={20} color="#F9D56E" delay={0}   rotate={15} />
        <Star    x="40%" y="5%"  size={14} color="#F4A261" delay={0.8} rotate={30} />
        <TinyStars x="55%" y="0%" color="#F9D56E" delay={0.3} />
        <Flower  x="93%" y="15%" size={44} color="#E8A0BF" delay={1} />
        <Leaf    x="5%"  y="40%" size={36} color="#6BB89C" delay={0.6} rotate={15} />
        <WavyLine x="20%" y="92%" width={140} color="#C9BCFD" delay={0.5} />
        <DotGrid  x="80%" y="60%" color="#9B8EC4" cols={3} rows={3} />
      </div>
    );
  }

  if (preset === 'story') {
    return (
      <div className="decor-layer">
        <TinyStars x="2%"  y="12%" color="#C9BCFD" delay={0} />
        <TinyStars x="89%" y="18%" color="#C9BCFD" delay={1} />
        <Heart x="5%"  y="65%" size={22} color="#E8A0BF" delay={0.5} />
        <Heart x="91%" y="70%" size={18} color="#F4A261" delay={1.5} />
        <Leaf  x="92%" y="45%" size={32} color="#6BB89C" delay={0.3} rotate={-20} />
        <WavyLine x="30%" y="5%" width={120} color="#C9BCFD" delay={0} />
      </div>
    );
  }

  /* minimal */
  return (
    <div className="decor-layer">
      <Star x="90%" y="5%"  size={16} color="#F9D56E" delay={0}   rotate={15} />
      <Star x="5%"  y="10%" size={12} color="#F9D56E" delay={1.5} rotate={30} />
      <WavyLine x="35%" y="90%" width={100} color="#C9BCFD" delay={0.5} />
    </div>
  );
}
