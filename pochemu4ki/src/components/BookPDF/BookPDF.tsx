import {
  Document, Page, View, Text, Image, Svg, Rect, Circle, Defs,
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
const DEEP    = '#1A0D55';

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

// ── Cover background SVG ──────────────────────────────────────────────────────
function CoverBg() {
  return (
    <Svg width={595} height={842} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <PdfGrad id="cBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"    stopColor="#1A0D55" stopOpacity={1} />
          <Stop offset="0.5"  stopColor="#5B4BA8" stopOpacity={1} />
          <Stop offset="1"    stopColor="#9B8EC4" stopOpacity={1} />
        </PdfGrad>
        <PdfGrad id="cTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity={0.3} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0}   />
        </PdfGrad>
        <PdfGrad id="cBot" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#000000" stopOpacity={0.35} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0}    />
        </PdfGrad>
        <PdfGrad id="gLine" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0"    stopColor={GOLD} stopOpacity={0} />
          <Stop offset="0.2"  stopColor={GOLD} stopOpacity={1} />
          <Stop offset="0.8"  stopColor={GOLD} stopOpacity={1} />
          <Stop offset="1"    stopColor={GOLD} stopOpacity={0} />
        </PdfGrad>
      </Defs>

      {/* Gradient fill */}
      <Rect x={0} y={0} width={595} height={842} fill="url(#cBg)" />
      {/* Depth vignette */}
      <Rect x={0} y={0}   width={595} height={180} fill="url(#cTop)" />
      <Rect x={0} y={662} width={595} height={180} fill="url(#cBot)" />

      {/* Ornamental double border */}
      <Rect x={18} y={18} width={559} height={806} rx={20} fill="none" strokeWidth={1.5} stroke="rgba(255,255,255,0.27)" />
      <Rect x={28} y={28} width={539} height={786} rx={14} fill="none" strokeWidth={0.7}  stroke="rgba(249,213,110,0.22)" />

      {/* Corner accent circles */}
      <Circle cx={48}  cy={48}  r={5} fill="rgba(255,255,255,0.1)" />
      <Circle cx={547} cy={48}  r={5} fill="rgba(255,255,255,0.1)" />
      <Circle cx={48}  cy={794} r={5} fill="rgba(255,255,255,0.1)" />
      <Circle cx={547} cy={794} r={5} fill="rgba(255,255,255,0.1)" />

      {/* Gold horizontal divider */}
      <Rect x={148} y={516} width={300} height={1.5} rx={0.75} fill="url(#gLine)" />

      {/* Stars top */}
      <Circle cx={65}  cy={72}  r={2.5} fill="rgba(255,255,255,0.85)" />
      <Circle cx={125} cy={44}  r={1.5} fill="rgba(249,213,110,0.9)"  />
      <Circle cx={210} cy={82}  r={2}   fill="rgba(255,255,255,0.55)" />
      <Circle cx={297} cy={36}  r={3}   fill="rgba(255,255,255,0.65)" />
      <Circle cx={375} cy={58}  r={1.5} fill="rgba(249,213,110,0.75)" />
      <Circle cx={466} cy={46}  r={2}   fill="rgba(255,255,255,0.7)"  />
      <Circle cx={528} cy={90}  r={2.5} fill="rgba(249,213,110,0.65)" />
      <Circle cx={58}  cy={138} r={1.5} fill="rgba(255,255,255,0.4)"  />
      <Circle cx={492} cy={118} r={2}   fill="rgba(255,255,255,0.5)"  />
      <Circle cx={160} cy={108} r={1}   fill="rgba(249,213,110,0.8)"  />
      <Circle cx={435} cy={93}  r={1}   fill="rgba(255,255,255,0.6)"  />
      <Circle cx={320} cy={110} r={1.5} fill="rgba(249,213,110,0.5)"  />

      {/* Stars bottom */}
      <Circle cx={78}  cy={742} r={2}   fill="rgba(255,255,255,0.4)"  />
      <Circle cx={162} cy={788} r={1.5} fill="rgba(249,213,110,0.6)"  />
      <Circle cx={298} cy={758} r={2.5} fill="rgba(255,255,255,0.35)" />
      <Circle cx={442} cy={778} r={1.5} fill="rgba(249,213,110,0.7)"  />
      <Circle cx={518} cy={748} r={2}   fill="rgba(255,255,255,0.5)"  />
      <Circle cx={200} cy={808} r={1}   fill="rgba(255,255,255,0.4)"  />
      <Circle cx={390} cy={818} r={1}   fill="rgba(249,213,110,0.5)"  />
    </Svg>
  );
}

// ── Back cover background ─────────────────────────────────────────────────────
function BackCoverBg() {
  return (
    <Svg width={595} height={842} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <PdfGrad id="backBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2A1870" stopOpacity={1} />
          <Stop offset="1" stopColor="#1A0D55" stopOpacity={1} />
        </PdfGrad>
      </Defs>
      <Rect x={0} y={0} width={595} height={842} fill="url(#backBg)" />
      <Rect x={18} y={18} width={559} height={806} rx={20} fill="none" strokeWidth={1.5} stroke="rgba(255,255,255,0.2)" />
      {/* Soft glow */}
      <Circle cx={297} cy={380} r={230} fill="rgba(124,107,196,0.07)" />
      <Circle cx={297} cy={380} r={140} fill="rgba(124,107,196,0.09)" />
      {/* Stars */}
      <Circle cx={100} cy={100} r={2}   fill="rgba(255,255,255,0.5)"  />
      <Circle cx={500} cy={80}  r={1.5} fill="rgba(249,213,110,0.7)"  />
      <Circle cx={150} cy={700} r={1.5} fill="rgba(255,255,255,0.4)"  />
      <Circle cx={450} cy={720} r={2}   fill="rgba(249,213,110,0.6)"  />
      <Circle cx={297} cy={60}  r={2.5} fill="rgba(255,255,255,0.6)"  />
      <Circle cx={297} cy={780} r={2}   fill="rgba(255,255,255,0.4)"  />
    </Svg>
  );
}

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
      <Page size="A4" style={{ backgroundColor: DEEP }}>
        {/* Gradient stars background */}
        <CoverBg />

        {/* All cover content - absolute layer on top of SVG */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '0 60',
        }}>

          {/* Top label */}
          <Text style={{
            fontFamily: 'PTSans', fontSize: 9,
            color: 'rgba(249,213,110,0.82)', letterSpacing: 3,
            marginBottom: 24, textAlign: 'center',
          }}>
            СКАЗКИ ДЛЯ ДЕТЕЙ
          </Text>

          {/* Mascot */}
          <Image
            src={mascotUrl}
            style={{ width: 150, height: 150, objectFit: 'contain', marginBottom: 28 }}
          />

          {/* Book title */}
          <Text style={{
            fontFamily: 'PTSans', fontWeight: 'bold',
            fontSize: 28, color: '#FFFFFF',
            textAlign: 'center', lineHeight: 1.3,
            marginBottom: 20, letterSpacing: -0.3,
          }}>
            {title}
          </Text>

          {/* Gold accent line */}
          <GradLine id="covLine1" color={GOLD} width={280} />

          {/* "ДЛЯ" label */}
          <Text style={{
            fontFamily: 'PTSans', fontWeight: 'bold',
            fontSize: 11, color: 'rgba(255,255,255,0.55)',
            letterSpacing: 4, marginTop: 22, marginBottom: 10,
            textAlign: 'center',
          }}>
            ДЛЯ
          </Text>

          {/* ★ Child name — THE WOW MOMENT ★ */}
          <Text style={{
            fontFamily: 'PTSans', fontWeight: 'bold',
            fontSize: 52, color: GOLD,
            textAlign: 'center', lineHeight: 1.05,
            marginBottom: 14,
          }}>
            {child.name}
          </Text>

          {/* Age + story count */}
          <Text style={{
            fontFamily: 'PTSans', fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
          }}>
            {child.age} {ageWord(child.age)}  •  {stories.length} {storiesWord(stories.length)}
          </Text>
        </View>

        {/* Brand at bottom — separate absolute element */}
        <View style={{ position: 'absolute', bottom: 36, left: 0, right: 0, alignItems: 'center' }}>
          <Text style={{
            fontFamily: 'PTSans', fontWeight: 'bold',
            fontSize: 9, color: 'rgba(255,255,255,0.3)',
            letterSpacing: 3, textAlign: 'center',
          }}>
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
      <Page size="A4" style={{ backgroundColor: DEEP }}>
        <BackCoverBg />

        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '0 60',
        }}>
          {/* Mascot */}
          <Image
            src={mascotUrl}
            style={{ width: 110, height: 110, objectFit: 'contain', marginBottom: 36 }}
          />

          <Text style={{
            fontFamily: 'PTSans', fontWeight: 'bold',
            fontSize: 16, color: 'rgba(255,255,255,0.65)',
            textAlign: 'center', lineHeight: 1.5, marginBottom: 8,
          }}>
            Эта книга создана специально для
          </Text>

          {/* Child name */}
          <Text style={{
            fontFamily: 'PTSans', fontWeight: 'bold',
            fontSize: 44, color: GOLD,
            textAlign: 'center', marginBottom: 36,
          }}>
            {child.name}
          </Text>

          <GradLine id="dedLine" color="rgba(255,255,255,0.35)" width={200} />

          <Text style={{
            fontFamily: 'PTSans', fontStyle: 'italic',
            fontSize: 14, color: 'rgba(255,255,255,0.5)',
            textAlign: 'center', lineHeight: 1.8, marginTop: 28,
          }}>
            Пусть вопросы никогда не заканчиваются,{'\n'}а ответы всегда звучат как сказка.
          </Text>
        </View>

        {/* Brand */}
        <View style={{ position: 'absolute', bottom: 36, left: 0, right: 0, alignItems: 'center' }}>
          <Text style={{
            fontFamily: 'PTSans', fontSize: 9,
            color: 'rgba(255,255,255,0.28)', letterSpacing: 3, textAlign: 'center',
          }}>
            ПОЧЕМУ-КА!  •  pochemu4ki-app.onrender.com
          </Text>
        </View>
      </Page>

    </Document>
  );
}

