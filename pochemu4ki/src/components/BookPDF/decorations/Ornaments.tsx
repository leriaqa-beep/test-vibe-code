import { View, Svg, Rect, Path, Circle, Defs, LinearGradient as PdfGrad, Stop } from '@react-pdf/renderer';
import { C } from '../constants';

// ── Gradient line ── ✦ ──────────────────────────────────────────────────────
export function GradLine({ id, color, width = 260, height = 2, opacity = 1 }: {
  id: string; color: string; width?: number; height?: number; opacity?: number;
}) {
  return (
    <View style={{ alignItems: 'center', opacity }}>
      <Svg width={width} height={height + 2}>
        <Defs>
          <PdfGrad id={id} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0"   stopColor={color} stopOpacity={0} />
            <Stop offset="0.2" stopColor={color} stopOpacity={1} />
            <Stop offset="0.8" stopColor={color} stopOpacity={1} />
            <Stop offset="1"   stopColor={color} stopOpacity={0} />
          </PdfGrad>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} rx={height / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

// ── Diamond divider ───────────────────────────────────────────────────────────
export function Diamond({ color = C.gold, mt = 8, mb = 8 }: { color?: string; mt?: number; mb?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: mt, marginBottom: mb }}>
      <View style={{ flex: 1, height: 0.8, backgroundColor: color, opacity: 0.3 }} />
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color, opacity: 0.65, marginLeft: 7, marginRight: 7 }} />
      <View style={{ flex: 1, height: 0.8, backgroundColor: color, opacity: 0.3 }} />
    </View>
  );
}

// ── Ornamental divider ── ✦ ── ────────────────────────────────────────────────
export function OrnamentalDivider({ mt = 6, mb = 8 }: { mt?: number; mb?: number }) {
  return (
    <View style={{ marginTop: mt, marginBottom: mb, alignItems: 'center' }}>
      <Svg width={340} height={14} viewBox="0 0 340 14">
        <Path d="M 10,7 L 156,7" stroke="#C9A96E" strokeWidth={0.4} fill="none" />
        <Path d="M 170,3 L 174,7 L 170,11 L 166,7 Z" fill="#C9A96E" opacity={0.65} />
        <Path d="M 184,7 L 330,7" stroke="#C9A96E" strokeWidth={0.4} fill="none" />
      </Svg>
    </View>
  );
}

// ── Paragraph separator ── ✿ ── ──────────────────────────────────────────────
export function ParaSeparator() {
  return (
    <View style={{ marginTop: 8, marginBottom: 8, alignItems: 'center' }}>
      <Svg width={180} height={14} viewBox="0 0 180 14">
        <Path d="M 10,7 L 76,7"   stroke="#C9A96E" strokeWidth={0.3} fill="none" />
        <Circle cx={90} cy={7} r={2.8} fill="#C9A96E" opacity={0.45} />
        <Path d="M 104,7 L 170,7" stroke="#C9A96E" strokeWidth={0.3} fill="none" />
      </Svg>
    </View>
  );
}

// ── Cover star decoration ─────────────────────────────────────────────────────
export function CoverStars() {
  const dots: { x: number; y: number; r: number; gold: boolean }[] = [
    { x:50,  y:42,  r:2.5, gold:false }, { x:88,  y:30,  r:1.5, gold:true  },
    { x:135, y:60,  r:2,   gold:false }, { x:192, y:36,  r:1.5, gold:true  },
    { x:297, y:24,  r:4,   gold:false }, { x:388, y:42,  r:1.5, gold:true  },
    { x:458, y:34,  r:2.5, gold:false }, { x:512, y:58,  r:2,   gold:true  },
    { x:546, y:28,  r:1.5, gold:false }, { x:160, y:108, r:1,   gold:true  },
    { x:430, y:94,  r:1,   gold:false }, { x:312, y:118, r:1.5, gold:true  },
    { x:48,  y:748, r:2,   gold:true  }, { x:96,  y:782, r:1.5, gold:false },
    { x:202, y:760, r:2.5, gold:true  }, { x:297, y:804, r:3,   gold:false },
    { x:394, y:752, r:1.5, gold:true  }, { x:470, y:776, r:2,   gold:false },
    { x:542, y:744, r:2.5, gold:true  }, { x:28,  y:220, r:2,   gold:false },
    { x:568, y:262, r:2.5, gold:true  }, { x:24,  y:402, r:1.5, gold:true  },
    { x:570, y:382, r:2,   gold:false }, { x:30,  y:578, r:2,   gold:false },
    { x:568, y:522, r:1.5, gold:true  },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <View key={i} style={{
          position: 'absolute',
          left: d.x - d.r, top: d.y - d.r,
          width: d.r * 2, height: d.r * 2, borderRadius: d.r,
          backgroundColor: d.gold ? C.goldLt : C.white,
          opacity: 0.65,
        }} />
      ))}
    </>
  );
}
