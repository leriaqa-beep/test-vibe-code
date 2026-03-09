import { Page, View, Text, Image, Svg, Path } from '@react-pdf/renderer';
import { getHeroBg, splitParas } from '../constants';
import { OrnamentalDivider, ParaSeparator, Diamond } from '../decorations/Ornaments';
import { HeroFrame } from '../decorations/PageFrames';
import { DropCap } from '../decorations/DropCap';
import { TextPageFooter } from '../decorations/PageFooter';
import type { Story, ChildProfile } from '../../../types';

interface BookStoryPageProps {
  story: Story;
  child: ChildProfile;
  heroUrl: string | null;
  pageNum: number;
  mascotExplainUrl: string;
  mascotHeroUrl: string;
  mascotJoyUrl: string;
  mascotCalmUrl: string;
}

export function BookStoryPage({
  story, child, heroUrl, pageNum,
  mascotExplainUrl, mascotHeroUrl, mascotJoyUrl, mascotCalmUrl,
}: BookStoryPageProps) {
  const paras     = splitParas(story.content);
  const firstPara = paras[0] ?? '';
  const firstChar = firstPara[0] ?? '';
  const firstRest = firstPara.slice(1);
  const restParas = paras.slice(1);

  return (
    <Page size="A4" style={{ backgroundColor: getHeroBg(child.hero?.emoji), flexDirection: 'column' }}>
      <HeroFrame />

      {/* Content area */}
      <View style={{ paddingTop: 71, paddingLeft: 57, paddingRight: 57, paddingBottom: 85 }}>

        {/* Header: title + mascot-explain */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10, borderBottom: '0.3pt solid #E8D5B7', marginBottom: 0 }}>
          <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 22, color: '#5B2C8B', flex: 1, lineHeight: 1.25 }}>
            {story.title}
          </Text>
          <Image src={mascotExplainUrl} style={{ width: 34, height: 39, flexShrink: 0, marginLeft: 10 }} />
        </View>

        {/* ── ✦ ── */}
        <OrnamentalDivider mt={8} mb={10} />

        {/* Question block */}
        <View style={{ backgroundColor: '#F3EEFF', borderRadius: 8, padding: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>
          <Image src={mascotHeroUrl} style={{ width: 43, height: 47, marginRight: 10, flexShrink: 0 }} />
          <Text style={{ fontFamily: 'Literata', fontStyle: 'italic', fontSize: 16, color: '#7C3AED', flex: 1, lineHeight: 1.6 }}>
            «{story.question}»
          </Text>
        </View>

        {/* Drop cap first paragraph */}
        {firstPara.length > 0 && (
          <DropCap firstChar={firstChar} firstRest={firstRest} />
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
          <Image src={mascotJoyUrl} style={{ width: 113, height: 113, marginBottom: 10 }} />
          <Text style={{ fontFamily: 'Comfortaa', fontStyle: 'italic', fontSize: 12, color: '#8B7355', textAlign: 'center' }}>
            Сказка создана специально для {child.name}
          </Text>
        </View>
      </View>

      <TextPageFooter pageNum={pageNum} mascotUrl={mascotCalmUrl} />
    </Page>
  );
}

// Re-export Diamond for backward compat if needed
export { Diamond };
