import {
  Document, Page, View, Text, Image, Svg, Rect, Defs, Circle, Path,
  LinearGradient as PdfGrad, Stop,
} from '@react-pdf/renderer';
import './fonts';
import type { Story, ChildProfile } from '../../types';

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  coverBg:    '#4C1D95',
  coverMid:   '#6B21A8',
  coverBot:   '#3B0764',
  parchment:  '#FDF6E3',
  parchDark:  '#F0E4C0',
  warmCream:  '#FFF8EC',
  purple:     '#5B21B6',
  purpleLt:   '#EDE9FE',
  dark:       '#2D1B0E',
  muted:      '#8B6B3C',
  gold:       '#D4A853',
  goldLt:     '#F9D56E',
  white:      '#FFFFFF',
};

// ── Hero image map (emoji → path segment) ────────────────────────────────────
const HERO: Record<string, string> = {
  '🦄': '/heroes/unicorn.png',
  '🦉': '/heroes/owl.png',
  '🐉': '/heroes/dragon.png',
  '🧚': '/heroes/fairy.png',
  '🦁': '/heroes/lion.png',
  '🐱': '/heroes/cat.png',
};

// ── Russian genitive name declension ─────────────────────────────────────────
function declineNameGenitive(name: string): string {
  if (!name) return '';
  const n = name.trim();
  const last  = n[n.length - 1].toLowerCase();
  const slast = n.length > 1 ? n[n.length - 2].toLowerCase() : '';
  if (n.toLowerCase().endsWith('ия'))  return n.slice(0, -2) + 'ии';
  if (n.toLowerCase().endsWith('ья'))  return n.slice(0, -2) + 'ьи';
  const soft = ['ж', 'ш', 'щ', 'ч', 'г', 'к', 'х'];
  if (last === 'а') return n.slice(0, -1) + (soft.includes(slast) ? 'и' : 'ы');
  if (last === 'я') return n.slice(0, -1) + 'и';
  const vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];
  if (!vowels.includes(last) && last !== 'ь' && last !== 'й') return n + 'а';
  if (last === 'й') return n.slice(0, -1) + 'я';
  if (last === 'ь') return n.slice(0, -1) + 'я';
  return n;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ageWord(n: number) {
  if (n >= 11 && n <= 19) return 'лет';
  const r = n % 10;
  if (r === 1) return 'год';  if (r >= 2 && r <= 4) return 'года';  return 'лет';
}
function storiesWord(n: number) {
  if (n >= 11 && n <= 19) return 'историй';
  const r = n % 10;
  if (r === 1) return 'история';  if (r >= 2 && r <= 4) return 'истории';  return 'историй';
}
function splitParas(text: string): string[] {
  return text.split(/\n+/).map(p => p.trim()).filter(Boolean);
}

// ── Gradient line divider (small inline SVG, safe to use in normal flow) ─────
function GradLine({ id, color, width = 260, height = 2, opacity = 1 }: {
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
function Diamond({ color = C.gold, mt = 8, mb = 8 }: { color?: string; mt?: number; mb?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: mt, marginBottom: mb }}>
      <View style={{ flex: 1, height: 0.8, backgroundColor: color, opacity: 0.3 }} />
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color, opacity: 0.65, marginLeft: 7, marginRight: 7 }} />
      <View style={{ flex: 1, height: 0.8, backgroundColor: color, opacity: 0.3 }} />
    </View>
  );
}

// ── Cover star decoration (position:absolute Views, declared before content) ──
function CoverStars() {
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

// ── Hero-adaptive page backgrounds ───────────────────────────────────────────
const HERO_BG: Record<string, string> = {
  '🦄': '#FAF5FF',
  '🦉': '#FEFCE8',
  '🐉': '#FFFBEB',
  '🧚': '#FDF2F8',
  '🦁': '#FFF7ED',
  '🐱': '#F5F3FF',
};
function getHeroBg(emoji?: string): string {
  return (emoji && HERO_BG[emoji]) ?? '#FDF6E3';
}

// ── Ornamental divider ── ✦ ── ────────────────────────────────────────────────
function OrnamentalDivider({ mt = 6, mb = 8 }: { mt?: number; mb?: number }) {
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
function ParaSeparator() {
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

// ── Props ─────────────────────────────────────────────────────────────────────
interface BookDocumentProps {
  title: string;
  child: ChildProfile;
  stories: Story[];
  baseUrl: string;
}

// ── Document ──────────────────────────────────────────────────────────────────
export function BookDocument({ title, child, stories, baseUrl }: BookDocumentProps) {
  const m = (name: string) => `${baseUrl}/assets/mascot/${name}`;
  const heroUrl = child.hero?.emoji && HERO[child.hero.emoji]
    ? `${baseUrl}${HERO[child.hero.emoji]}` : null;

  // ── Shared page frame (ToC, divider pages) ───────────────────────────────
  const ParchFrame = () => (
    <>
      <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 10, border: `1pt solid ${C.gold}`, opacity: 0.18 }} />
      <View style={{ position: 'absolute', top: 22, left: 22, right: 22, bottom: 22, borderRadius: 6,  border: `0.5pt solid ${C.gold}`, opacity: 0.12 }} />
    </>
  );

  // ── Story text page frame with corner diamonds ────────────────────────────
  const HeroFrame = () => (
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

  // ── Story text page footer ─ ✦ N ✦ ─ ────────────────────────────────────
  const TextPageFooter = ({ pageNum }: { pageNum: number }) => (
    <View style={{ position: 'absolute', bottom: 18, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      <Image src={m('mascot-calm.png')} style={{ width: 23, height: 26, marginRight: 10 }} />
      <Text style={{ fontFamily: 'Comfortaa', fontSize: 10, color: '#8B7355' }}>
        {'─ ✦ '}{pageNum}{' ✦ ─'}
      </Text>
    </View>
  );

  return (
    <Document title={title} author="Почему-Ка!" subject={`Сборник сказок для ${child.name}`} creator="pochemu4ki-app.onrender.com">

      {/* ════════════════════════════════════════════════════════════════
          1. ОБЛОЖКА
      ════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={{ backgroundColor: C.coverBg, flexDirection: 'column' }}>

        {/* Gradient simulation overlays — position:absolute, declared BEFORE content */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320, backgroundColor: C.coverMid, opacity: 0.28 }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, backgroundColor: C.coverBot, opacity: 0.45 }} />

        {/* Stars */}
        <CoverStars />

        {/* Outer gold border */}
        <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 14, border: `1.5pt solid ${C.gold}`, opacity: 0.6 }} />
        {/* Inner white border */}
        <View style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, borderRadius: 10, border: `0.5pt solid rgba(255,255,255,0.22)` }} />

        {/* Corner accents */}
        {[{t:36,l:36},{t:36,r:36},{b:36,l:36},{b:36,r:36}].map((pos, i) => (
          <View key={i} style={{ position: 'absolute', ...pos, width: 12, height: 12, borderRadius: 6, backgroundColor: C.goldLt, opacity: 0.5 }} />
        ))}

        {/* ── Content — normal flow (renders on top of absolute decoration) ── */}
        <View style={{ height: 56 }} />

        <View style={{ alignItems: 'center', paddingLeft: 52, paddingRight: 52 }}>
          {/* Series line */}
          <Text style={{ fontFamily: 'Comfortaa', fontSize: 9, color: C.goldLt, letterSpacing: 2.5, marginBottom: 20, textAlign: 'center', opacity: 0.85 }}>
            ✦  ПЕРСОНАЛЬНАЯ КНИГА СКАЗОК  ✦
          </Text>

          {/* "Почему-Ка" */}
          <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 38, color: C.goldLt, textAlign: 'center', lineHeight: 1.1, marginBottom: 6 }}>
            Почему-Ка
          </Text>
          {/* subtitle */}
          <Text style={{ fontFamily: 'Comfortaa', fontSize: 18, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.3, marginBottom: 22 }}>
            и волшебная книга сказок
          </Text>

          <GradLine id="cov1" color={C.gold} width={240} />

          <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 5, marginTop: 20, marginBottom: 10, textAlign: 'center' }}>
            ДЛЯ
          </Text>
          <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 52, color: C.goldLt, textAlign: 'center', lineHeight: 1.0, marginBottom: 8 }}>
            {declineNameGenitive(child.name)}
          </Text>
          <Text style={{ fontFamily: 'PTSans', fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            {child.age} {ageWord(child.age)}  ·  {stories.length} {storiesWord(stories.length)}
          </Text>
        </View>

        {/* Mascot */}
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Image src={m('mascot-logo.png')} style={{ width: 190, height: 190 }} />
          <Text style={{ fontFamily: 'Comfortaa', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 12, textAlign: 'center' }}>
            Персональная книга сказок
          </Text>
        </View>

        <View style={{ flex: 1 }} />
        <View style={{ paddingBottom: 30, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: 'rgba(255,255,255,0.22)', letterSpacing: 3 }}>ПОЧЕМУ-КА!</Text>
        </View>
      </Page>

      {/* ════════════════════════════════════════════════════════════════
          2. ФОРЗАЦ (декоративная страница)
      ════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={{ backgroundColor: '#F3EEFF', flexDirection: 'column' }}>
        {/* Thin lavender border */}
        <View style={{ position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, borderRadius: 10, border: '0.8pt solid #C4B5FD', opacity: 0.4 }} />

        <View style={{ flex: 1 }} />

        {/* Centered star/curl pattern */}
        <View style={{ alignItems: 'center' }}>
          <Svg width={440} height={380} viewBox="0 0 440 380">
            {(() => {
              const items: React.ReactElement[] = [];
              const cols = 8, rows = 7;
              const colStep = 55, rowStep = 52;
              const startX = 27, startY = 26;
              for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                  const cx = startX + c * colStep + (r % 2 === 1 ? colStep / 2 : 0);
                  const cy = startY + r * rowStep;
                  if (cx > 440) continue;
                  const sz = 3.2 + Math.abs(Math.sin((r * 3 + c * 2) * 1.1)) * 1.8;
                  const isGold = (r + c) % 6 === 0;
                  const op = 0.22 + Math.abs(Math.sin((r + c) * 0.9)) * 0.28;
                  const fill = isGold ? '#D4A853' : '#9B8EC4';
                  // 4-pointed star (✦) via quadratic bezier
                  const d = `M ${cx},${cy - sz} Q ${cx + sz * 0.28},${cy - sz * 0.28} ${cx + sz},${cy} Q ${cx + sz * 0.28},${cy + sz * 0.28} ${cx},${cy + sz} Q ${cx - sz * 0.28},${cy + sz * 0.28} ${cx - sz},${cy} Q ${cx - sz * 0.28},${cy - sz * 0.28} ${cx},${cy - sz} Z`;
                  items.push(<Path key={`s${r}-${c}`} d={d} fill={fill} opacity={op} />);
                  // Small dot between columns
                  if (c < cols - 1) {
                    const dx = cx + colStep / 2 - (r % 2 === 1 ? colStep / 2 : 0) + (r % 2 === 0 ? colStep / 2 : 0);
                    if (dx < 440) {
                      items.push(<Circle key={`d${r}-${c}`} cx={dx} cy={cy} r={1.1} fill="#9B8EC4" opacity={0.18} />);
                    }
                  }
                }
              }
              return items;
            })()}
          </Svg>
        </View>

        <View style={{ flex: 1 }} />

        {/* Bottom text */}
        <View style={{ paddingBottom: 44, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: '#7C6BC4', textAlign: 'center', letterSpacing: 0.5, opacity: 0.7 }}>
            Создано с любовью в приложении Почемучки
          </Text>
          <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: '#9B8EC4', textAlign: 'center', marginTop: 5, opacity: 0.5 }}>
            {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
      </Page>

      {/* ════════════════════════════════════════════════════════════════
          3. ОГЛАВЛЕНИЕ (если сказок > 1)
      ════════════════════════════════════════════════════════════════ */}
      {stories.length > 1 && (
      <Page size="A4" style={{ backgroundColor: C.parchment, flexDirection: 'column' }}>
        <ParchFrame />
        <View style={{ paddingTop: 52, paddingLeft: 52, paddingRight: 52, paddingBottom: 72, flex: 1 }}>

          {/* Header: mascot-think + title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Image src={m('mascot-think.png')} style={{ width: 42, height: 48, marginRight: 14, flexShrink: 0 }} />
            <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 28, color: '#5B2C8B' }}>Оглавление</Text>
          </View>
          <GradLine id="toc0" color={C.gold} width={360} opacity={0.45} />
          <View style={{ height: 24 }} />

          {/* Story list with dot leaders */}
          {stories.map((story, idx) => {
            // page layout: cover(1) + endpaper(1) + toc(1) + per-story: 2 pages each
            const pageNum = 4 + idx * 2;
            return (
              <View key={story.id} style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 18 }}>
                {/* Number */}
                <Text style={{ fontFamily: 'Literata', fontSize: 14, color: '#5B2C8B', marginRight: 8, flexShrink: 0, opacity: 0.7 }}>
                  {idx + 1}.
                </Text>
                {/* Title */}
                <Text style={{ fontFamily: 'Literata', fontSize: 14, color: C.dark, flexShrink: 1 }}>
                  {story.title}
                </Text>
                {/* Dot leaders */}
                <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: C.muted, flexGrow: 1, letterSpacing: 4, marginLeft: 6, marginRight: 6, overflow: 'hidden', opacity: 0.5 }}>
                  {' ·····················································································'}
                </Text>
                {/* Page number */}
                <Text style={{ fontFamily: 'Literata', fontSize: 14, color: C.muted, flexShrink: 0 }}>
                  {pageNum}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Image src={m('mascot-calm.png')} style={{ width: 16, height: 19, marginRight: 6 }} />
          <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: C.muted }}>Почему-Ка!</Text>
        </View>
      </Page>
      )}

      {/* ════════════════════════════════════════════════════════════════
          4. СТРАНИЦЫ СКАЗОК
      ════════════════════════════════════════════════════════════════ */}
      {stories.map((story, idx) => {
        const paras      = splitParas(story.content);
        const firstPara  = paras[0] ?? '';
        const firstChar  = firstPara[0] ?? '';
        const firstRest  = firstPara.slice(1);
        const restParas  = paras.slice(1);

        return (
          <View key={story.id}>
            {/* ── 4a. Страница-разделитель ─── */}
            <Page size="A4" style={{ backgroundColor: C.parchment, flexDirection: 'column' }}>
              <ParchFrame />

              <View style={{ flex: 1 }} />
              <View style={{ alignItems: 'center', paddingLeft: 52, paddingRight: 52 }}>
                {/* Chapter label */}
                <Text style={{ fontFamily: 'Comfortaa', fontSize: 9, color: C.purple, letterSpacing: 3, marginBottom: 22, opacity: 0.5 }}>
                  СКАЗКА {idx + 1}
                </Text>

                {/* Mascot ~50mm = 142pt */}
                <Image src={m('mascot-surprise.png')} style={{ width: 142, height: 142, marginBottom: 26 }} />

                {/* Story title */}
                <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 24, color: '#5B2C8B', textAlign: 'center', lineHeight: 1.35, marginBottom: 28 }}>
                  {story.title}
                </Text>

                {/* Decorative curl divider */}
                <Svg width={280} height={22} viewBox="0 0 280 22">
                  {/* Left curl */}
                  <Path d="M 10,11 C 20,4 30,4 40,11 C 50,18 60,18 70,11 C 75,7 80,6 85,11" stroke={C.gold} strokeWidth={1.2} fill="none" opacity={0.55} />
                  {/* Left line */}
                  <Path d="M 85,11 L 112,11" stroke={C.gold} strokeWidth={0.8} fill="none" opacity={0.4} />
                  {/* Center diamond */}
                  <Path d="M 140,5 L 146,11 L 140,17 L 134,11 Z" fill={C.gold} opacity={0.6} />
                  {/* Right line */}
                  <Path d="M 168,11 L 195,11" stroke={C.gold} strokeWidth={0.8} fill="none" opacity={0.4} />
                  {/* Right curl */}
                  <Path d="M 195,11 C 200,6 205,7 210,11 C 220,18 230,18 240,11 C 250,4 260,4 270,11" stroke={C.gold} strokeWidth={1.2} fill="none" opacity={0.55} />
                </Svg>
              </View>
              <View style={{ flex: 1 }} />

              <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={m('mascot-calm.png')} style={{ width: 16, height: 19, marginRight: 6 }} />
                <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: C.muted }}>Почему-Ка!</Text>
              </View>
            </Page>

            {/* ── 4b. Вопрос + текст сказки (объединённая страница) ─── */}
            {(() => {
              const tocOffset = stories.length > 1 ? 1 : 0;
              const pageNum   = 4 + tocOffset + idx * 2;
              return (
                <Page size="A4" style={{ backgroundColor: getHeroBg(child.hero?.emoji), flexDirection: 'column' }}>
                  <HeroFrame />

                  {/* Content area */}
                  <View style={{ paddingTop: 71, paddingLeft: 57, paddingRight: 57, paddingBottom: 85 }}>

                    {/* Header: title left + mascot-explain right */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10, borderBottom: '0.3pt solid #E8D5B7', marginBottom: 0 }}>
                      <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 22, color: '#5B2C8B', flex: 1, lineHeight: 1.25 }}>
                        {story.title}
                      </Text>
                      <Image src={m('mascot-explain.png')} style={{ width: 34, height: 39, flexShrink: 0, marginLeft: 10 }} />
                    </View>

                    {/* ── ✦ ── */}
                    <OrnamentalDivider mt={8} mb={10} />

                    {/* Question block */}
                    <View style={{ backgroundColor: '#F3EEFF', borderRadius: 8, padding: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>
                      <Image src={m('mascot-hero.png')} style={{ width: 43, height: 47, marginRight: 10, flexShrink: 0 }} />
                      <Text style={{ fontFamily: 'Literata', fontStyle: 'italic', fontSize: 16, color: '#7C3AED', flex: 1, lineHeight: 1.6 }}>
                        «{story.question}»
                      </Text>
                    </View>

                    {/* Drop cap first paragraph */}
                    {firstPara.length > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                        <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 42, color: '#7C3AED', lineHeight: 0.92, marginRight: 3 }}>
                          {firstChar}
                        </Text>
                        <Text style={{ fontFamily: 'Literata', fontSize: 14, color: '#3D2B1F', lineHeight: 1.8, flex: 1, marginTop: 8 }}>
                          {firstRest}
                        </Text>
                      </View>
                    )}

                    {/* Rest of paragraphs */}
                    {restParas.map((para, pIdx) => (
                      <View key={pIdx}>
                        <Text style={{ fontFamily: 'Literata', fontSize: 14, color: '#3D2B1F', lineHeight: 1.8, textIndent: 20, marginBottom: 10 }}>
                          {para}
                        </Text>
                        {/* Hero image once — after paragraph index 1 (3rd paragraph total) */}
                        {pIdx === 1 && heroUrl && (
                          <View style={{ alignItems: 'center', marginTop: 15, marginBottom: 15 }}>
                            <Image src={heroUrl} style={{ width: 170, height: 170 }} />
                            <View style={{ marginTop: 10, width: 200, height: 0.5, backgroundColor: '#C9A96E', opacity: 0.4 }} />
                          </View>
                        )}
                        {/* Paragraph separator every 3 paragraphs */}
                        {(pIdx + 1) % 3 === 0 && pIdx < restParas.length - 1 && <ParaSeparator />}
                      </View>
                    ))}

                    {/* Ending: ── ✦ КОНЕЦ ✦ ── */}
                    <View style={{ marginTop: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>
                      <Svg width={100} height={14}>
                        <Path d="M 4,7 L 86,7"  stroke="#C9A96E" strokeWidth={0.5} fill="none" />
                        <Path d="M 96,3 L 100,7 L 96,11 L 92,7 Z" fill="#C9A96E" opacity={0.7} />
                      </Svg>
                      <Text style={{ fontFamily: 'Comfortaa', fontSize: 10, color: '#8B7355', marginLeft: 8, marginRight: 8 }}>
                        КОНЕЦ
                      </Text>
                      <Svg width={100} height={14}>
                        <Path d="M 4,3 L 8,7 L 4,11 L 0,7 Z"  fill="#C9A96E" opacity={0.7} />
                        <Path d="M 14,7 L 96,7" stroke="#C9A96E" strokeWidth={0.5} fill="none" />
                      </Svg>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Image src={m('mascot-joy.png')} style={{ width: 113, height: 113, marginBottom: 10 }} />
                      <Text style={{ fontFamily: 'Comfortaa', fontStyle: 'italic', fontSize: 12, color: '#8B7355', textAlign: 'center' }}>
                        Сказка создана специально для {child.name}
                      </Text>
                    </View>
                  </View>

                  <TextPageFooter pageNum={pageNum} />
                </Page>
              );
            })()}
          </View>
        );
      })}

      {/* ════════════════════════════════════════════════════════════════
          5. ЗАДНЯЯ ОБЛОЖКА
      ════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={{ backgroundColor: C.coverBg, flexDirection: 'column' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280, backgroundColor: C.coverMid, opacity: 0.25 }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, backgroundColor: C.coverBot, opacity: 0.4 }} />
        {[{x:60,y:50,r:2},{x:535,y:40,r:2.5},{x:297,y:26,r:3.5},{x:80,y:790,r:2},{x:515,y:768,r:2.5},{x:160,y:60,r:1.5},{x:430,y:45,r:1.5}].map((d,i) => (
          <View key={i} style={{ position: 'absolute', left: d.x-d.r, top: d.y-d.r, width: d.r*2, height: d.r*2, borderRadius: d.r, backgroundColor: C.goldLt, opacity: 0.6 }} />
        ))}
        <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 14, border: `1.5pt solid ${C.gold}`, opacity: 0.55 }} />

        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'column', alignItems: 'center', paddingLeft: 60, paddingRight: 60 }}>
          <Image src={m('mascot-joy.png')} style={{ width: 120, height: 120, marginBottom: 28 }} />
          <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.5, marginBottom: 10 }}>
            Эта книга создана специально для
          </Text>
          <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 46, color: C.goldLt, textAlign: 'center', marginBottom: 28 }}>
            {child.name}
          </Text>
          <GradLine id="back1" color="rgba(255,255,255,0.3)" width={200} />
          <Text style={{ fontFamily: 'Literata', fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.85, marginTop: 24 }}>
            Пусть вопросы никогда не заканчиваются,{'\n'}а ответы всегда звучат как сказка.
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ paddingBottom: 30, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: 'rgba(255,255,255,0.22)', letterSpacing: 3 }}>
            ПОЧЕМУ-КА!  •  pochemu4ki-app.onrender.com
          </Text>
        </View>
      </Page>

    </Document>
  );
}
