import {
  Document, Page, View, Text, Image, Svg, Rect, Defs,
  LinearGradient as PdfGrad, Stop,
} from '@react-pdf/renderer';
import './fonts';
import type { Story, ChildProfile } from '../../types';

// ── Palette ───────────────────────────────────────────────────────────────────
const PARCHMENT  = '#FDF6E3';
const PARCH_DARK = '#F0E4C0';
const PURPLE     = '#5B21B6';
const PURPLE_LT  = '#EDE9FE';
const DARK       = '#2D1B0E';
const MUTED      = '#8B6B3C';
const GOLD       = '#D4A853';
const GOLD_LT    = '#F9D56E';
const COVER_BG   = '#4c1d95';

// ── Hero image map ────────────────────────────────────────────────────────────
const HERO_IMGS: Record<string, string> = {
  '🦄': '/heroes/unicorn.png',
  '🦉': '/heroes/owl.png',
  '🐉': '/heroes/dragon.png',
  '🧚': '/heroes/fairy.png',
  '🦁': '/heroes/lion.png',
  '🐱': '/heroes/cat.png',
};

// ── Russian genitive name declension ─────────────────────────────────────────
function toGenitive(name: string): string {
  if (!name) return '';
  const n = name.trim();
  const last  = n[n.length - 1].toLowerCase();
  const slast = n.length > 1 ? n[n.length - 2].toLowerCase() : '';
  if (n.toLowerCase().endsWith('ия'))  return n.slice(0, -2) + 'ии';
  if (n.toLowerCase().endsWith('ья'))  return n.slice(0, -2) + 'ьи';
  const softeners = ['ж','ш','щ','ч','г','к','х'];
  if (last === 'а') return n.slice(0, -1) + (softeners.includes(slast) ? 'и' : 'ы');
  if (last === 'я') return n.slice(0, -1) + 'и';
  const vowels = ['а','е','ё','и','о','у','ы','э','ю','я'];
  if (!vowels.includes(last) && last !== 'ь' && last !== 'й') return n + 'а';
  if (last === 'й') return n.slice(0, -1) + 'я';
  if (last === 'ь') return n.slice(0, -1) + 'я';
  return n;
}

// ── Word helpers ──────────────────────────────────────────────────────────────
function ageWord(n: number) {
  if (n >= 11 && n <= 19) return 'лет';
  const r = n % 10;
  if (r === 1) return 'год';
  if (r >= 2 && r <= 4) return 'года';
  return 'лет';
}
function storiesWord(n: number) {
  if (n >= 11 && n <= 19) return 'историй';
  const r = n % 10;
  if (r === 1) return 'история';
  if (r >= 2 && r <= 4) return 'истории';
  return 'историй';
}
function splitParas(text: string): string[] {
  return text.split(/\n+/).map(p => p.trim()).filter(Boolean);
}

// ── Thin gradient divider line ────────────────────────────────────────────────
function GradLine({ id, color, width = 260, opacity = 1 }: { id: string; color: string; width?: number; opacity?: number }) {
  return (
    <View style={{ alignItems: 'center', opacity }}>
      <Svg width={width} height={3}>
        <Defs>
          <PdfGrad id={id} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0"   stopColor={color} stopOpacity={0} />
            <Stop offset="0.2" stopColor={color} stopOpacity={1} />
            <Stop offset="0.8" stopColor={color} stopOpacity={1} />
            <Stop offset="1"   stopColor={color} stopOpacity={0} />
          </PdfGrad>
        </Defs>
        <Rect x={0} y={0} width={width} height={3} rx={1.5} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

// ── Diamond ornamental divider ────────────────────────────────────────────────
function Divider({ color = GOLD }: { color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.35 }} />
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color, marginLeft: 6, marginRight: 6, opacity: 0.7 }} />
      <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.35 }} />
    </View>
  );
}

// ── Cover star dots (decorative, position:absolute, render before content) ────
function CoverStars() {
  const dots: { x: number; y: number; r: number; c: string }[] = [
    // top area
    { x: 50,  y: 42,  r: 2.5, c: '#fff' },
    { x: 88,  y: 32,  r: 1.5, c: GOLD_LT },
    { x: 130, y: 62,  r: 2,   c: '#fff' },
    { x: 195, y: 38,  r: 1.5, c: GOLD_LT },
    { x: 297, y: 26,  r: 4,   c: '#fff' },
    { x: 390, y: 44,  r: 1.5, c: GOLD_LT },
    { x: 455, y: 36,  r: 2.5, c: '#fff' },
    { x: 510, y: 60,  r: 2,   c: GOLD_LT },
    { x: 545, y: 30,  r: 1.5, c: '#fff' },
    { x: 160, y: 105, r: 1,   c: GOLD_LT },
    { x: 430, y: 92,  r: 1,   c: '#fff' },
    { x: 310, y: 115, r: 1.5, c: GOLD_LT },
    // bottom area
    { x: 48,  y: 748, r: 2,   c: GOLD_LT },
    { x: 95,  y: 780, r: 1.5, c: '#fff' },
    { x: 200, y: 760, r: 2.5, c: GOLD_LT },
    { x: 297, y: 802, r: 3,   c: '#fff' },
    { x: 395, y: 752, r: 1.5, c: GOLD_LT },
    { x: 470, y: 775, r: 2,   c: '#fff' },
    { x: 540, y: 745, r: 2.5, c: GOLD_LT },
    // sides
    { x: 28,  y: 220, r: 2,   c: '#fff' },
    { x: 566, y: 260, r: 2.5, c: GOLD_LT },
    { x: 24,  y: 400, r: 1.5, c: GOLD_LT },
    { x: 570, y: 380, r: 2,   c: '#fff' },
    { x: 30,  y: 580, r: 2,   c: '#fff' },
    { x: 568, y: 520, r: 1.5, c: GOLD_LT },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: d.x - d.r,
            top:  d.y - d.r,
            width:  d.r * 2,
            height: d.r * 2,
            borderRadius: d.r,
            backgroundColor: d.c,
            opacity: 0.7,
          }}
        />
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
  const heroImgUrl = child.hero?.emoji && HERO_IMGS[child.hero.emoji]
    ? `${baseUrl}${HERO_IMGS[child.hero.emoji]}`
    : null;

  return (
    <Document title={title} author="Почему-Ка!" subject={`Сборник сказок для ${child.name}`} creator="pochemu4ki-app.onrender.com">

      {/* ══════════════════════════════════════════════════════════════
          ОБЛОЖКА
      ══════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={{ backgroundColor: COVER_BG, flexDirection: 'column' }}>

        {/* Stars — absolute Views, rendered before content, so appear behind it */}
        <CoverStars />

        {/* Outer gold border */}
        <View style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, borderRadius: 16, border: `2px solid ${GOLD}`, opacity: 0.6 }} />
        {/* Inner white border */}
        <View style={{ position: 'absolute', top: 22, left: 22, right: 22, bottom: 22, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)' }} />

        {/* Top padding */}
        <View style={{ height: 60 }} />

        {/* ── Title block ── */}
        <View style={{ alignItems: 'center', paddingLeft: 52, paddingRight: 52 }}>
          <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: GOLD_LT, letterSpacing: 3, marginBottom: 18, textAlign: 'center', opacity: 0.85 }}>
            ✦  ПЕРСОНАЛЬНАЯ КНИГА СКАЗОК  ✦
          </Text>

          {/* "Почему-Ка" — biggest, gold */}
          <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 38, color: GOLD_LT, textAlign: 'center', lineHeight: 1.1, marginBottom: 4 }}>
            Почему-Ка
          </Text>
          {/* subtitle */}
          <Text style={{ fontFamily: 'PTSans', fontSize: 18, color: 'rgba(255,255,255,0.88)', textAlign: 'center', lineHeight: 1.3, marginBottom: 18 }}>
            и волшебная книга сказок
          </Text>

          {/* Gold divider */}
          <GradLine id="cov1" color={GOLD} width={240} />

          {/* "для" */}
          <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 5, marginTop: 18, marginBottom: 10, textAlign: 'center' }}>
            ДЛЯ
          </Text>

          {/* Child name — hero moment, large gold */}
          <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 54, color: GOLD_LT, textAlign: 'center', lineHeight: 1.0, marginBottom: 6 }}>
            {toGenitive(child.name)}
          </Text>
          <Text style={{ fontFamily: 'PTSans', fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
            {child.age} {ageWord(child.age)}  ·  {stories.length} {storiesWord(stories.length)}
          </Text>
        </View>

        {/* ── Mascot ── */}
        <View style={{ alignItems: 'center', marginTop: 22 }}>
          <Image src={m('mascot-logo.png')} style={{ width: 200, height: 200 }} />
          <Text style={{ fontFamily: 'PTSans', fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 10, textAlign: 'center' }}>
            Персональная сказка
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Brand */}
        <View style={{ paddingBottom: 32, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 3 }}>
            ПОЧЕМУ-КА!
          </Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════════
          ОГЛАВЛЕНИЕ
      ══════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={{ backgroundColor: PARCHMENT, flexDirection: 'column', fontFamily: 'PTSans' }}>

        {/* Subtle parchment border */}
        <View style={{ position: 'absolute', top: 18, left: 18, right: 18, bottom: 18, borderRadius: 12, border: `1.5px solid ${GOLD}`, opacity: 0.25 }} />

        <View style={{ padding: '56 56 80 56', flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Image src={m('mascot-explain.png')} style={{ width: 40, height: 46, marginRight: 12 }} />
            <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 26, color: DARK }}>
              Содержание
            </Text>
          </View>

          <GradLine id="toc0" color={GOLD} width={340} opacity={0.6} />
          <View style={{ height: 24 }} />

          {stories.map((story, idx) => (
            <View key={story.id} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingTop: 12, paddingBottom: 12, borderBottom: `1px solid ${PARCH_DARK}` }}>
              {/* Number badge */}
              <View style={{ width: 26, height: 26, backgroundColor: PURPLE, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0, marginTop: 1 }}>
                <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 11, color: '#fff' }}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 13, color: DARK, lineHeight: 1.35 }}>{story.title}</Text>
                <Text style={{ fontFamily: 'PTSans', fontStyle: 'italic', fontSize: 10, color: MUTED, marginTop: 3 }}>«{story.question}»</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Image src={m('mascot-calm.png')} style={{ width: 22, height: 26, marginRight: 8 }} />
          <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: MUTED }}>Почему-Ка!</Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════════
          СТРАНИЦЫ СКАЗОК
      ══════════════════════════════════════════════════════════════ */}
      {stories.map((story, idx) => {
        const paras = splitParas(story.content);
        const firstPara   = paras[0] ?? '';
        const firstChar   = firstPara[0] ?? '';
        const firstRest   = firstPara.slice(1);
        const restParas   = paras.slice(1);
        const heroInsertAt = 3; // insert hero image after this paragraph index (1-based in restParas)

        return (
          <Page key={story.id} size="A4" style={{ backgroundColor: PARCHMENT, fontFamily: 'PTSans' }}>

            {/* Parchment border decoration */}
            <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 10, border: `1px solid ${GOLD}`, opacity: 0.2 }} />

            {/* ── Story header ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 30, paddingLeft: 48, paddingRight: 48, paddingBottom: 14, borderBottom: `2px solid ${PARCH_DARK}` }}>
              <Image src={m('mascot-explain.png')} style={{ width: 44, height: 50, marginRight: 12, flexShrink: 0 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 8, color: PURPLE, letterSpacing: 2, marginBottom: 4, opacity: 0.75 }}>
                  СКАЗКА {idx + 1}
                </Text>
                <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 19, color: DARK, lineHeight: 1.25 }}>
                  {story.title}
                </Text>
              </View>
            </View>

            {/* ── Question block ── */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, marginLeft: 48, marginRight: 48, backgroundColor: PURPLE_LT, borderRadius: 10, padding: '9 12' }}>
              <Image src={m('mascot-hero.png')} style={{ width: 32, height: 36, marginRight: 10, flexShrink: 0, marginTop: 1 }} />
              <Text style={{ fontFamily: 'PTSans', fontStyle: 'italic', fontSize: 11, color: PURPLE, lineHeight: 1.55, flex: 1 }}>
                «{story.question}»
              </Text>
            </View>

            {/* ── AI illustration (if available) ── */}
            {story.imageUrl && story.imageUrl.startsWith('http') && (
              <View style={{ marginTop: 12, marginLeft: 48, marginRight: 48, borderRadius: 10, overflow: 'hidden' }}>
                <Image src={story.imageUrl} style={{ width: '100%', height: 160 }} />
              </View>
            )}

            {/* ── Ornamental divider ── */}
            <View style={{ paddingLeft: 48, paddingRight: 48, marginTop: 14, marginBottom: 4 }}>
              <Divider color={GOLD} />
            </View>

            {/* ── Story text ── */}
            <View style={{ paddingLeft: 48, paddingRight: 48, paddingBottom: 72 }}>

              {/* First paragraph — drop cap */}
              {firstPara.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 11 }}>
                  <View style={{ marginRight: 3 }}>
                    <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 46, color: PURPLE, lineHeight: 0.93 }}>
                      {firstChar}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'PTSans', fontSize: 12, color: DARK, lineHeight: 1.9, flex: 1, marginTop: 9 }}>
                    {firstRest}
                  </Text>
                </View>
              )}

              {/* Remaining paragraphs */}
              {restParas.map((para, pIdx) => (
                <View key={pIdx}>
                  <Text style={{ fontFamily: 'PTSans', fontSize: 12, color: DARK, lineHeight: 1.9, marginBottom: 11 }}>
                    {para}
                  </Text>
                  {/* Hero character image — insert after 3rd paragraph */}
                  {pIdx === heroInsertAt - 1 && heroImgUrl && (
                    <View style={{ alignItems: 'center', marginTop: 6, marginBottom: 14 }}>
                      <Image src={heroImgUrl} style={{ width: 80, height: 80 }} />
                    </View>
                  )}
                </View>
              ))}

              {/* mascot-joy — end of story */}
              <View style={{ alignItems: 'center', marginTop: 16 }}>
                <Divider color={GOLD} />
                <Image src={m('mascot-joy.png')} style={{ width: 52, height: 52, marginTop: 10, marginBottom: 4 }} />
                <Text style={{ fontFamily: 'PTSans', fontStyle: 'italic', fontSize: 9, color: MUTED }}>
                  ✦ Конец ✦
                </Text>
              </View>
            </View>

            {/* ── Footer ── */}
            <View style={{ position: 'absolute', bottom: 22, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Image src={m('mascot-calm.png')} style={{ width: 18, height: 22, marginRight: 6 }} />
              <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: MUTED }}>Почему-Ка!</Text>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: GOLD, marginLeft: 7, marginRight: 7, opacity: 0.6 }} />
              <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: MUTED }}>{idx + 1}</Text>
            </View>
          </Page>
        );
      })}

      {/* ══════════════════════════════════════════════════════════════
          ФИНАЛЬНАЯ СТРАНИЦА
      ══════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={{ backgroundColor: '#1A0D55', flexDirection: 'column' }}>

        {/* Stars */}
        <View style={{ position: 'absolute', top: 60,  left: 80,  width: 4, height: 4, borderRadius: 2, backgroundColor: GOLD_LT, opacity: 0.7 }} />
        <View style={{ position: 'absolute', top: 48,  right: 90, width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#fff', opacity: 0.6 }} />
        <View style={{ position: 'absolute', bottom: 70, left: 70,  width: 3, height: 3, borderRadius: 1.5, backgroundColor: GOLD_LT, opacity: 0.6 }} />
        <View style={{ position: 'absolute', bottom: 55, right: 80, width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', opacity: 0.5 }} />

        {/* Border */}
        <View style={{ position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, borderRadius: 16, border: `1.5px solid rgba(255,255,255,0.18)` }} />

        <View style={{ flex: 1 }} />

        <View style={{ flexDirection: 'column', alignItems: 'center', paddingLeft: 60, paddingRight: 60 }}>
          <Image src={m('mascot-joy.png')} style={{ width: 110, height: 110, marginBottom: 28 }} />

          <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.5, marginBottom: 10 }}>
            Эта книга создана специально для
          </Text>
          <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 46, color: GOLD_LT, textAlign: 'center', marginBottom: 28 }}>
            {child.name}
          </Text>

          <GradLine id="ded1" color="rgba(255,255,255,0.3)" width={200} />

          <Text style={{ fontFamily: 'PTSans', fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.85, marginTop: 24 }}>
            Пусть вопросы никогда не заканчиваются,{'\n'}а ответы всегда звучат как сказка.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ paddingBottom: 32, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: 3 }}>
            ПОЧЕМУ-КА!  •  pochemu4ki-app.onrender.com
          </Text>
        </View>
      </Page>

    </Document>
  );
}
