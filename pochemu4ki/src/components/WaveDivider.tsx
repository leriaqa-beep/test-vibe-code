/**
 * WaveDivider — SVG-разделители между секциями страницы.
 * Заменяют прямые линии мягкими волнами с 2-3 изгибами.
 *
 * Использование:
 *   <WaveDivider from="#FFFBF5" to="#F5F0FF" />
 *   <WaveDivider variant="gentle" from="#F5F0FF" to="#FFFBF5" flip />
 */

interface WaveDividerProps {
  /** Цвет фона секции ВЫШЕ волны */
  from?: string;
  /** Цвет фона секции НИЖЕ волны (цвет заливки SVG) */
  to?: string;
  /** Форма волны */
  variant?: 'gentle' | 'deep' | 'cloud' | 'tilt';
  /** Перевернуть по горизонтали */
  flip?: boolean;
  /** Высота SVG в px */
  height?: number;
  className?: string;
}

export default function WaveDivider({
  from,
  to = '#FFFBF5',
  variant = 'gentle',
  flip = false,
  height = 72,
  className = '',
}: WaveDividerProps) {
  const transform = flip ? 'scale(-1, 1)' : undefined;
  const viewBox = `0 0 1440 ${height}`;

  const paths: Record<string, string> = {
    /* Плавная 3-изгибная волна */
    gentle: `M0,${height} C240,${height * 0.3} 480,${height} 720,${height * 0.5} S1200,${height * 0.1} 1440,${height * 0.6} L1440,${height} L0,${height} Z`,

    /* Более глубокая волна */
    deep: `M0,${height * 0.7} C180,0 360,${height} 540,${height * 0.4} C720,${height * -0.1} 900,${height} 1080,${height * 0.3} C1260,${height * -0.2} 1440,${height * 0.6} 1440,${height * 0.6} L1440,${height} L0,${height} Z`,

    /* «Облачная» волна с округлыми буграми */
    cloud: `M0,${height} Q120,${height * 0.2} 240,${height * 0.5} Q360,${height * 0.85} 480,${height * 0.4} Q600,${height * 0.05} 720,${height * 0.45} Q840,${height * 0.85} 960,${height * 0.35} Q1080,${height * -0.05} 1200,${height * 0.4} Q1320,${height * 0.8} 1440,${height * 0.5} L1440,${height} L0,${height} Z`,

    /* Лёгкий наклон с одним изгибом */
    tilt: `M0,${height * 0.9} C480,${height * 0.1} 960,${height} 1440,${height * 0.4} L1440,${height} L0,${height} Z`,
  };

  return (
    <div
      className={`wave-divider ${className}`}
      style={{ background: from }}
      aria-hidden="true"
    >
      <svg
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          height,
          transform,
          display: 'block',
          width: '100%',
        }}
      >
        <path d={paths[variant]} fill={to} />
      </svg>
    </div>
  );
}

/* ── Предустановленные переходы между секциями ──────────────── */

/** Кремовый → Лавандовый */
export function WaveCreamToLavender({ flip = false }: { flip?: boolean }) {
  return <WaveDivider from="#FFFBF5" to="#F5F0FF" variant="gentle" flip={flip} height={48} />;
}

/** Лавандовый → Кремовый */
export function WaveLavenderToCream({ flip = false }: { flip?: boolean }) {
  return <WaveDivider from="#F5F0FF" to="#FFFBF5" variant="cloud" flip={flip} height={48} />;
}

/** Кремовый → Персиковый */
export function WaveCreamToWarm({ flip = false }: { flip?: boolean }) {
  return <WaveDivider from="#FFFBF5" to="#FFF5EE" variant="tilt" flip={flip} height={64} />;
}

/** Персиковый → Кремовый */
export function WaveWarmToCream({ flip = false }: { flip?: boolean }) {
  return <WaveDivider from="#FFF5EE" to="#FFFBF5" variant="gentle" flip={flip} height={64} />;
}

/** Кремовый → Белый (карточки) */
export function WaveCreamToWhite({ flip = false }: { flip?: boolean }) {
  return <WaveDivider from="#FFFBF5" to="#FFFFFF" variant="deep" flip={flip} height={56} />;
}

/** Любые два цвета → тонкая волна */
export function WaveThin({
  from = '#FFFBF5',
  to = '#F5F0FF',
  flip = false,
}: {
  from?: string;
  to?: string;
  flip?: boolean;
}) {
  return <WaveDivider from={from} to={to} variant="tilt" flip={flip} height={48} />;
}
