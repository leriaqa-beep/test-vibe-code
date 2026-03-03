import {
  Document, Page, View, Text, Image, Svg, Rect, Defs,
  LinearGradient as PdfLinearGradient, Stop,
  StyleSheet,
} from '@react-pdf/renderer';
import './fonts';
import type { Story, ChildProfile } from '../../types';

// ── Styles ────────────────────────────────────────────────────────────────────

const CREAM   = '#FFFBF5';
const PURPLE  = '#7C6BC4';
const DARK    = '#2D2B3D';
const MUTED   = '#7A7890';
const LIGHT_P = '#EDE8FA';

const s = StyleSheet.create({
  // Cover
  cover: {
    backgroundColor: CREAM,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40 48',
    position: 'relative',
  },
  coverMascot: { width: 140, height: 140, objectFit: 'contain', marginBottom: 24 },
  coverTitle: {
    fontFamily: 'PTSans', fontWeight: 'bold',
    fontSize: 28, color: DARK, textAlign: 'center',
    marginBottom: 8, lineHeight: 1.3,
  },
  coverChildName: {
    fontFamily: 'PTSans', fontSize: 16, color: PURPLE,
    textAlign: 'center', marginBottom: 6,
  },
  coverSubtitle: {
    fontFamily: 'PTSans', fontSize: 12, color: MUTED,
    textAlign: 'center', marginBottom: 32,
  },
  coverBrand: {
    fontFamily: 'PTSans', fontWeight: 'bold',
    fontSize: 11, color: PURPLE, textAlign: 'center', marginTop: 16,
    letterSpacing: 1,
  },

  // Story page
  page: {
    backgroundColor: '#FFFFFF',
    padding: '40 52 52 52',
    fontFamily: 'PTSans',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: `1px solid ${LIGHT_P}`,
  },
  storyNum: {
    width: 28, height: 28,
    backgroundColor: PURPLE,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  storyNumText: {
    fontFamily: 'PTSans', fontWeight: 'bold',
    fontSize: 12, color: '#FFFFFF',
  },
  storyTitle: {
    fontFamily: 'PTSans', fontWeight: 'bold',
    fontSize: 18, color: DARK, flex: 1, lineHeight: 1.3,
  },
  storyQuestion: {
    fontFamily: 'PTSans', fontStyle: 'italic',
    fontSize: 11, color: MUTED,
    marginBottom: 18,
    paddingLeft: 4,
    borderLeft: `3px solid ${LIGHT_P}`,
    paddingTop: 2, paddingBottom: 2,
  },
  storyContent: {
    fontFamily: 'PTSans', fontSize: 12,
    color: DARK, lineHeight: 1.85,
  },
  pageFooter: {
    position: 'absolute', bottom: 24, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8,
  },
  pageFooterText: {
    fontFamily: 'PTSans', fontSize: 9, color: MUTED,
  },
});

// ── Helper: split long story text into paragraphs ─────────────────────────────

function splitParagraphs(text: string) {
  return text.split(/\n+/).filter(p => p.trim().length > 0);
}

// ── Cover accent SVG stripe ───────────────────────────────────────────────────

function CoverAccent() {
  return (
    <Svg width={240} height={10} style={{ marginBottom: 0 }}>
      <Defs>
        <PdfLinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#7C6BC4" stopOpacity={1} />
          <Stop offset="0.5" stopColor="#C86DD7" stopOpacity={1} />
          <Stop offset="1" stopColor="#7C6BC4" stopOpacity={1} />
        </PdfLinearGradient>
      </Defs>
      <Rect x={0} y={0} width={240} height={10} rx={5} fill="url(#grad)" />
    </Svg>
  );
}

// ── Interfaces ────────────────────────────────────────────────────────────────

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
      {/* ── Cover page ── */}
      <Page size="A4" style={s.cover}>
        <Image src={mascotUrl} style={s.coverMascot} />
        <Text style={s.coverTitle}>{title}</Text>
        <Text style={s.coverChildName}>Для {child.name}, {child.age} {ageWord(child.age)}</Text>
        <Text style={s.coverSubtitle}>{stories.length} {storiesWord(stories.length)}</Text>
        <CoverAccent />
        <Text style={s.coverBrand}>Почему-Ка! · pochemu4ki-app.onrender.com</Text>
      </Page>

      {/* ── Story pages ── */}
      {stories.map((story, idx) => (
        <Page key={story.id} size="A4" style={s.page}>
          {/* Header with number + title */}
          <View style={s.pageHeader}>
            <View style={s.storyNum}>
              <Text style={s.storyNumText}>{idx + 1}</Text>
            </View>
            <Text style={s.storyTitle}>{story.title}</Text>
          </View>

          {/* Question */}
          <Text style={s.storyQuestion}>«{story.question}»</Text>

          {/* Content — split into paragraphs for proper rendering */}
          {splitParagraphs(story.content).map((para, pIdx) => (
            <Text key={pIdx} style={{ ...s.storyContent, marginBottom: 10 }}>
              {para}
            </Text>
          ))}

          {/* Footer */}
          <View style={s.pageFooter} fixed>
            <Text style={s.pageFooterText}>Почему-Ка!</Text>
            <Text style={{ ...s.pageFooterText, color: '#D1C8F5' }}>·</Text>
            <Text style={s.pageFooterText} render={({ pageNumber }) => `${pageNumber}`} />
          </View>
        </Page>
      ))}
    </Document>
  );
}

// ── Word-form helpers ─────────────────────────────────────────────────────────

function ageWord(n: number) {
  if (n >= 11 && n <= 19) return 'лет';
  const last = n % 10;
  if (last === 1) return 'год';
  if (last >= 2 && last <= 4) return 'года';
  return 'лет';
}

function storiesWord(n: number) {
  if (n >= 11 && n <= 19) return 'историй';
  const last = n % 10;
  if (last === 1) return 'история';
  if (last >= 2 && last <= 4) return 'истории';
  return 'историй';
}
