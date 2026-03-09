import { View, Svg, Path } from '@react-pdf/renderer';
import { C } from '../constants';

// ── Parchment double-border frame (ToC, chapter divider pages) ────────────────
export function ParchFrame() {
  return (
    <>
      <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 10, border: `1pt solid ${C.gold}`, opacity: 0.18 }} />
      <View style={{ position: 'absolute', top: 22, left: 22, right: 22, bottom: 22, borderRadius: 6,  border: `0.5pt solid ${C.gold}`, opacity: 0.12 }} />
    </>
  );
}

// ── Hero text page frame: thin border + corner SVG diamonds ───────────────────
export function HeroFrame() {
  return (
    <>
      <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 8, border: '0.5pt solid #E8D5B7' }} />
      {([
        { top: 8,    left:  8 },
        { top: 8,    right: 8 },
        { bottom: 8, left:  8 },
        { bottom: 8, right: 8 },
      ] as Record<string, number>[]).map((pos, i) => (
        <Svg key={i} width={12} height={12} style={{ position: 'absolute', ...pos }}>
          <Path d="M6,1 L11,6 L6,11 L1,6 Z" fill="#C9A96E" opacity={0.55} />
        </Svg>
      ))}
    </>
  );
}
