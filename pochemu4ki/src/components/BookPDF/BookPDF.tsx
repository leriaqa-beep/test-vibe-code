import {
  Document, Page, View, Text, Image, Svg, Rect, Defs,
  LinearGradient as PdfGrad, Stop, StyleSheet,
} from '@react-pdf/renderer';
import './fonts';
import type { Story, ChildProfile } from '../../types';

// ── Palette ───────────────────────────────────────────────────────────────────
const CREAM   = '#FFFBF5';
const PURPLE  = '#7C6BC4';
const DARK    = '#2D2B3D';
const MUTED   = '#7A7890';
const LIGHT_P = '#EDE8FA';
const GOLD    = '#F9D56E';

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // ToC
  tocPage: { backgroundColor: CREAM, padding: '60 56', fontFamily: 'PTSans' },
  tocHeading: { fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 28, color: DARK, textAlign: 'center', marginBottom: 6 },
  tocRow: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid ${LIGHT_P}` },
  tocBadge: { width: 28, height: 28, backgroundColor: PURPLE, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0, marginTop: 1 },
  tocBadgeText: { fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 11, color: '#FFF' },
  tocTitle: { fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 13, color: DARK, lineHeight: 1.35 },
  tocQuestion: { fontFamily: 'PTSans', fontStyle: 'italic', fontSize: 10, color: MUTED, marginTop: 3 },

  // Story page
  storyPage: { backgroundColor: '#FFFFFF', fontFamily: 'PTSans' },
  storyImg: { width: '100%', height: 220, objectFit: 'cover' },
  imgFallback: { height: 80, backgroundColor: LIGHT_P },
  storyBody: { padding: '22 48 52 48' },
  storyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingBottom: 13, borderBottom: `1.5px solid ${LIGHT_P}` },
  badge: { width: 32, height: 32, backgroundColor: PURPLE, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  badgeText: { fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 13, color: '#FFF' },
  storyTitle: { fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 18, color: DARK, flex: 1, lineHeight: 1.3 },
  qBox: { backgroundColor: LIGHT_P, borderRadius: 10, padding: '10 14', marginBottom: 18 },
  qText: { fontFamily: 'PTSans', fontStyle: 'italic', fontSize: 11, color: PURPLE, lineHeight: 1.5 },
  para: { fontFamily: 'PTSans', fontSize: 12, color: DARK, lineHeight: 1.9, marginBottom: 10 },
  footer: { position: 'absolute', bottom: 22, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerTxt: { fontFamily: 'PTSans', fontSize: 9, color: MUTED },
  footerDot: { fontFamily: 'PTSans', fontSize: 9, color: '#D1C8F5', marginLeft: 5, marginRight: 5 },
});


// ── Small gradient line divider ───────────────────────────────────────────────
function GradLine({ id, color, width = 280 }: { id: string; color: string; width?: number }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={4}>
        <Defs>
          <PdfGrad id={id} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0"   stopColor={color} stopOpacity={0} />
            <Stop offset="0.2" stopColor={color} stopOpacity={1} />
            <Stop offset="0.8" stopColor={color} stopOpacity={1} />
            <Stop offset="1"   stopColor={color} stopOpacity={0} />
          </PdfGrad>
        </Defs>
        <Rect x={0} y={0} width={width} height={4} rx={2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
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

function splitParagraphs(text: string) {
  return text.split(/\n+/).filter(p => p.trim().length > 0);
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface BookDocumentProps {
  title: string;
  child: ChildProfile;
  stories: Story[];
  mascotUrl: string;
}

// ── Document ──────────────────────────────────────────────────────────────────
export function BookDocument({ title, child, stories, mascotUrl }: BookDocumentProps) {
  return (
    <Document
      title={title}
      author="Почему-Ка!"
      subject={`Сборник сказок для ${child.name}`}
      creator="pochemu4ki-app.onrender.com"
    >

      {/* ══════════════════════════════════════════════════
          ОБЛОЖКА
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={{ backgroundColor: '#1E1060', flexDirection: 'column' }}>

        {/* ── Decorative borders (View-based, no SVG z-order issues) ── */}
        <View style={{ position: 'absolute', top: 18, left: 18, right: 18, bottom: 18, borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.22)' }} />
        <View style={{ position: 'absolute', top: 28, left: 28, right: 28, bottom: 28, borderRadius: 14, border: '0.7px solid rgba(249,213,110,0.25)' }} />

        {/* ── Corner star dots ── */}
        <View style={{ position: 'absolute', top: 55, left: 55, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.7)' }} />
        <View style={{ position: 'absolute', top: 55, right: 55, width: 3, height: 3, borderRadius: 1.5, backgroundColor: GOLD }} />
        <View style={{ position: 'absolute', bottom: 55, left: 55, width: 3, height: 3, borderRadius: 1.5, backgroundColor: GOLD }} />
        <View style={{ position: 'absolute', bottom: 55, right: 55, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.7)' }} />
        <View style={{ position: 'absolute', top: 38, left: 120, width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(249,213,110,0.8)' }} />
        <View style={{ position: 'absolute', top: 44, right: 140, width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: 'rgba(255,255,255,0.6)' }} />
        <View style={{ position: 'absolute', top: 60, left: 240, width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.5)' }} />

        {/* ── Top spacer ── */}
        <View style={{ flex: 1 }} />

        {/* ── Main content — normal flow, no absolute ── */}
        <View style={{ flexDirection: 'column', alignItems: 'center', paddingLeft: 60, paddingRight: 60 }}>

          {/* Series label */}
          <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: GOLD, letterSpacing: 3, marginBottom: 22, textAlign: 'center' }}>
            СКАЗКИ ДЛЯ ДЕТЕЙ
          </Text>

          {/* Mascot image */}
          <Image src={mascotUrl} style={{ width: 140, height: 140, marginBottom: 26 }} />

          {/* Book title */}
          <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 26, color: '#FFFFFF', textAlign: 'center', lineHeight: 1.35, marginBottom: 18 }}>
            {title}
          </Text>

          {/* Gold divider */}
          <GradLine id="covLine1" color={GOLD} width={260} />

          {/* "ДЛЯ" */}
          <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 4, marginTop: 20, marginBottom: 8, textAlign: 'center' }}>
            ДЛЯ
          </Text>

          {/* Child name */}
          <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 52, color: GOLD, textAlign: 'center', lineHeight: 1.05, marginBottom: 12 }}>
            {child.name}
          </Text>

          {/* Age + count */}
          <Text style={{ fontFamily: 'PTSans', fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            {child.age} {ageWord(child.age)}  ·  {stories.length} {storiesWord(stories.length)}
          </Text>

        </View>

        {/* ── Bottom spacer ── */}
        <View style={{ flex: 1 }} />

        {/* ── Brand ── */}
        <View style={{ paddingBottom: 36, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: 3 }}>
            ПОЧЕМУ-КА!
          </Text>
        </View>

      </Page>

      {/* ══════════════════════════════════════════════════
          ОГЛАВЛЕНИЕ
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={s.tocPage}>
        <Text style={s.tocHeading}>Содержание</Text>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <GradLine id="tocDiv" color={PURPLE} width={260} />
        </View>

        {stories.map((story, idx) => (
          <View key={story.id} style={s.tocRow}>
            <View style={s.tocBadge}>
              <Text style={s.tocBadgeText}>{idx + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.tocTitle}>{story.title}</Text>
              <Text style={s.tocQuestion}>«{story.question}»</Text>
            </View>
          </View>
        ))}

        {/* Bottom brand */}
        <View style={{ position: 'absolute', bottom: 36, left: 0, right: 0, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: 'rgba(45,43,61,0.3)', letterSpacing: 2 }}>
            ПОЧЕМУ-КА!
          </Text>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════
          СТРАНИЦЫ СКАЗОК
      ══════════════════════════════════════════════════ */}
      {stories.map((story, idx) => (
        <Page key={story.id} size="A4" style={s.storyPage}>

          {/* Illustration at top */}
          {story.imageUrl && story.imageUrl.startsWith('http') ? (
            <Image src={story.imageUrl} style={s.storyImg} />
          ) : (
            <View style={s.imgFallback} />
          )}

          {/* Story content */}
          <View style={s.storyBody}>
            {/* Header: number badge + title */}
            <View style={s.storyHeader}>
              <View style={s.badge}>
                <Text style={s.badgeText}>{idx + 1}</Text>
              </View>
              <Text style={s.storyTitle}>{story.title}</Text>
            </View>

            {/* Question block */}
            <View style={s.qBox}>
              <Text style={s.qText}>«{story.question}»</Text>
            </View>

            {/* Story text paragraphs */}
            {splitParagraphs(story.content).map((para, pIdx) => (
              <Text key={pIdx} style={s.para}>{para}</Text>
            ))}
          </View>

          {/* Page footer */}
          <View style={s.footer}>
            <Text style={s.footerTxt}>Почему-Ка!</Text>
            <Text style={s.footerDot}>·</Text>
            <Text style={s.footerTxt}>{idx + 1}</Text>
          </View>
        </Page>
      ))}

      {/* ══════════════════════════════════════════════════
          ФИНАЛЬНАЯ СТРАНИЦА — ПОСВЯЩЕНИЕ
      ══════════════════════════════════════════════════ */}
      <Page size="A4" style={{ backgroundColor: '#1A0D55', flexDirection: 'column' }}>

        {/* Decorative border */}
        <View style={{ position: 'absolute', top: 18, left: 18, right: 18, bottom: 18, borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.18)' }} />

        {/* Top spacer */}
        <View style={{ flex: 1 }} />

        {/* Content */}
        <View style={{ flexDirection: 'column', alignItems: 'center', paddingLeft: 60, paddingRight: 60 }}>
          <Image src={mascotUrl} style={{ width: 110, height: 110, marginBottom: 32 }} />

          <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.5, marginBottom: 10 }}>
            Эта книга создана специально для
          </Text>

          <Text style={{ fontFamily: 'PTSans', fontWeight: 'bold', fontSize: 44, color: GOLD, textAlign: 'center', marginBottom: 32 }}>
            {child.name}
          </Text>

          <GradLine id="dedLine" color="rgba(255,255,255,0.3)" width={200} />

          <Text style={{ fontFamily: 'PTSans', fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.8, marginTop: 26 }}>
            Пусть вопросы никогда не заканчиваются,{'\n'}а ответы всегда звучат как сказка.
          </Text>
        </View>

        {/* Bottom spacer */}
        <View style={{ flex: 1 }} />

        {/* Brand */}
        <View style={{ paddingBottom: 36, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 3 }}>
            ПОЧЕМУ-КА!  •  pochemu4ki-app.onrender.com
          </Text>
        </View>

      </Page>

    </Document>
  );
}

