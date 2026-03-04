import {
  Document, Page, View, Text, Image, Svg, Rect, Defs,
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

  // ── Shared page frame ─────────────────────────────────────────────────────
  const ParchFrame = () => (
    <>
      <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 10, border: `1pt solid ${C.gold}`, opacity: 0.18 }} />
      <View style={{ position: 'absolute', top: 22, left: 22, right: 22, bottom: 22, borderRadius: 6,  border: `0.5pt solid ${C.gold}`, opacity: 0.12 }} />
    </>
  );

  // ── Story text page footer ────────────────────────────────────────────────
  const StoryFooter = ({ storyIdx }: { storyIdx: number }) => (
    <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      <Image src={m('mascot-calm.png')} style={{ width: 16, height: 19, marginRight: 6 }} />
      <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: C.muted }}>Почему-Ка!</Text>
      <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: C.gold, marginLeft: 6, marginRight: 6, opacity: 0.6 }} />
      <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: C.muted }}>{storyIdx + 1}</Text>
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
      <Page size="A4" style={{ backgroundColor: C.warmCream, flexDirection: 'column' }}>
        <ParchFrame />

        {/* Decorative background dots */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = 30 + (i * 97) % 535;
          const y = 30 + (i * 137) % 782;
          return <View key={i} style={{ position: 'absolute', left: x, top: y, width: 3, height: 3, borderRadius: 1.5, backgroundColor: C.gold, opacity: 0.12 }} />;
        })}

        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'column', alignItems: 'center', paddingLeft: 60, paddingRight: 60 }}>
          <Image src={m('mascot-surprise.png')} style={{ width: 90, height: 90, marginBottom: 24 }} />

          <Text style={{ fontFamily: 'Comfortaa', fontSize: 13, color: C.muted, textAlign: 'center', letterSpacing: 1, marginBottom: 10 }}>
            Эта волшебная книга принадлежит
          </Text>
          <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 44, color: C.purple, textAlign: 'center', lineHeight: 1.05, marginBottom: 16 }}>
            {child.name}
          </Text>

          <GradLine id="endp1" color={C.gold} width={220} opacity={0.5} />

          {heroUrl && (
            <Image src={heroUrl} style={{ width: 72, height: 72, marginTop: 20, marginBottom: 16 }} />
          )}
          <Text style={{ fontFamily: 'Literata', fontStyle: 'italic', fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 1.7 }}>
            Любимый герой: {child.hero?.name ?? '—'}
          </Text>
          <Text style={{ fontFamily: 'Literata', fontStyle: 'italic', fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.7, marginTop: 4, opacity: 0.75 }}>
            {child.age} {ageWord(child.age)} · Создано с любовью в Почему-Ка!
          </Text>
        </View>
        <View style={{ flex: 1 }} />

        <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Image src={m('mascot-calm.png')} style={{ width: 16, height: 19, marginRight: 6 }} />
          <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: C.muted }}>Почему-Ка!</Text>
        </View>
      </Page>

      {/* ════════════════════════════════════════════════════════════════
          3. ОГЛАВЛЕНИЕ
      ════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={{ backgroundColor: C.parchment, flexDirection: 'column' }}>
        <ParchFrame />
        <View style={{ padding: '52 52 72 52', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Image src={m('mascot-think.png')} style={{ width: 38, height: 44, marginRight: 12 }} />
            <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 26, color: C.dark }}>Содержание</Text>
          </View>
          <GradLine id="toc0" color={C.gold} width={320} opacity={0.5} />
          <View style={{ height: 20 }} />

          {stories.map((story, idx) => (
            <View key={story.id} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingTop: 11, paddingBottom: 11, borderBottom: `0.8pt solid ${C.parchDark}` }}>
              <View style={{ width: 24, height: 24, backgroundColor: C.purple, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0, marginTop: 1 }}>
                <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 10, color: C.white }}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 12, color: C.dark, lineHeight: 1.3 }}>{story.title}</Text>
                <Text style={{ fontFamily: 'Literata', fontStyle: 'italic', fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>«{story.question}»</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Image src={m('mascot-calm.png')} style={{ width: 16, height: 19, marginRight: 6 }} />
          <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: C.muted }}>Почему-Ка!</Text>
        </View>
      </Page>

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
            <Page size="A4" style={{ backgroundColor: C.coverBg, flexDirection: 'column' }}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, backgroundColor: C.coverMid, opacity: 0.25 }} />
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, backgroundColor: C.coverBot, opacity: 0.4 }} />
              {/* Stars (fewer) */}
              {[{x:60,y:50,r:2.5},{x:535,y:44,r:2},{x:297,y:28,r:3.5},{x:80,y:780,r:2},{x:510,y:762,r:2.5}].map((d,i) => (
                <View key={i} style={{ position: 'absolute', left: d.x-d.r, top: d.y-d.r, width: d.r*2, height: d.r*2, borderRadius: d.r, backgroundColor: C.goldLt, opacity: 0.6 }} />
              ))}
              <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 14, border: `1.5pt solid ${C.gold}`, opacity: 0.5 }} />

              <View style={{ flex: 1 }} />
              <View style={{ alignItems: 'center', paddingLeft: 52, paddingRight: 52 }}>
                <Text style={{ fontFamily: 'Comfortaa', fontSize: 10, color: C.goldLt, letterSpacing: 3, marginBottom: 16, opacity: 0.7 }}>СКАЗКА {idx + 1}</Text>
                <Image src={m('mascot-surprise.png')} style={{ width: 72, height: 72, marginBottom: 20 }} />
                <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 30, color: C.white, textAlign: 'center', lineHeight: 1.25, marginBottom: 20 }}>
                  {story.title}
                </Text>
                <GradLine id={`div${idx}`} color={C.gold} width={200} />
              </View>
              <View style={{ flex: 1 }} />
            </Page>

            {/* ── 4b. Страница с вопросом ─── */}
            <Page size="A4" style={{ backgroundColor: C.parchment, flexDirection: 'column' }}>
              <ParchFrame />
              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: 'column', alignItems: 'center', paddingLeft: 56, paddingRight: 56 }}>
                <Image src={m('mascot-hero.png')} style={{ width: 88, height: 96, marginBottom: 22 }} />

                <Text style={{ fontFamily: 'Comfortaa', fontSize: 10, color: C.purple, letterSpacing: 2, marginBottom: 14, opacity: 0.7 }}>ВОПРОС РЕБЁНКА</Text>

                <View style={{ backgroundColor: C.purpleLt, borderRadius: 14, padding: '18 22', marginBottom: 22, borderLeft: `3pt solid ${C.purple}` }}>
                  <Text style={{ fontFamily: 'Literata', fontStyle: 'italic', fontSize: 16, color: C.purple, textAlign: 'center', lineHeight: 1.65 }}>
                    «{story.question}»
                  </Text>
                </View>

                <Diamond color={C.gold} mt={0} mb={16} />

                <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 15, color: C.dark, textAlign: 'center' }}>
                  — {child.name}, {child.age} {ageWord(child.age)}
                </Text>
                {heroUrl && (
                  <Image src={heroUrl} style={{ width: 54, height: 54, marginTop: 16 }} />
                )}
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Image src={m('mascot-calm.png')} style={{ width: 16, height: 19, marginRight: 6 }} />
                <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: C.muted }}>Почему-Ка!</Text>
              </View>
            </Page>

            {/* ── 4c. Страницы текста сказки ─── */}
            <Page size="A4" style={{ backgroundColor: C.parchment, fontFamily: 'PTSans' }}>
              <ParchFrame />

              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 28, paddingLeft: 46, paddingRight: 46, paddingBottom: 12, borderBottom: `1.5pt solid ${C.parchDark}` }}>
                <Image src={m('mascot-explain.png')} style={{ width: 40, height: 46, marginRight: 12, flexShrink: 0 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Comfortaa', fontSize: 7, color: C.purple, letterSpacing: 2, marginBottom: 3, opacity: 0.65 }}>СКАЗКА {idx + 1}</Text>
                  <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 17, color: C.dark, lineHeight: 1.25 }}>{story.title}</Text>
                </View>
              </View>

              <Diamond color={C.gold} mt={10} mb={2} />

              {/* Story text */}
              <View style={{ paddingLeft: 46, paddingRight: 46, paddingBottom: 68 }}>

                {/* Drop cap first paragraph */}
                {firstPara.length > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                    <View style={{ marginRight: 3 }}>
                      <Text style={{ fontFamily: 'Literata', fontWeight: 'bold', fontSize: 50, color: C.purple, lineHeight: 0.92 }}>
                        {firstChar}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Literata', fontSize: 12, color: C.dark, lineHeight: 1.9, flex: 1, marginTop: 10 }}>
                      {firstRest}
                    </Text>
                  </View>
                )}

                {/* Rest of paragraphs */}
                {restParas.map((para, pIdx) => (
                  <View key={pIdx}>
                    <Text style={{ fontFamily: 'Literata', fontSize: 12, color: C.dark, lineHeight: 1.9, marginBottom: 10 }}>
                      {para}
                    </Text>
                    {/* Hero image after 3rd paragraph */}
                    {pIdx === 2 && heroUrl && (
                      <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 12 }}>
                        <Image src={heroUrl} style={{ width: 70, height: 70 }} />
                      </View>
                    )}
                  </View>
                ))}

                {/* Ending */}
                <Diamond color={C.gold} mt={14} mb={12} />
                <View style={{ alignItems: 'center' }}>
                  <Image src={m('mascot-joy.png')} style={{ width: 52, height: 52, marginBottom: 6 }} />
                  <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 14, color: C.purple }}>
                    Конец
                  </Text>
                </View>
              </View>

              <StoryFooter storyIdx={idx} />
            </Page>
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
