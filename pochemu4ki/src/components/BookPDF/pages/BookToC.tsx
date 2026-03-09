import { Page, View, Text, Image } from '@react-pdf/renderer';
import { C } from '../constants';
import { GradLine } from '../decorations/Ornaments';
import { ParchFrame } from '../decorations/PageFrames';
import type { Story } from '../../../types';

interface BookToCProps {
  stories: Story[];
  mascotThinkUrl: string;
  mascotCalmUrl: string;
  tocPageOffset: number; // page number of the first story's text page (= 4 + tocOffset)
}

export function BookToC({ stories, mascotThinkUrl, mascotCalmUrl, tocPageOffset }: BookToCProps) {
  return (
    <Page size="A4" style={{ backgroundColor: C.parchment, flexDirection: 'column' }}>
      <ParchFrame />
      <View style={{ paddingTop: 52, paddingLeft: 52, paddingRight: 52, paddingBottom: 72, flex: 1 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Image src={mascotThinkUrl} style={{ width: 42, height: 48, marginRight: 14, flexShrink: 0 }} />
          <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 28, color: '#5B2C8B' }}>Оглавление</Text>
        </View>
        <GradLine id="toc0" color={C.gold} width={360} opacity={0.45} />
        <View style={{ height: 24 }} />

        {/* Story entries with dot leaders */}
        {stories.map((story, idx) => {
          // cover(1) + endpaper(1) + toc(1) + per-story: divider + text = 2 pages each
          const pageNum = tocPageOffset + idx * 2;
          return (
            <View key={story.id} style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 18 }}>
              <Text style={{ fontFamily: 'Literata', fontSize: 14, color: '#5B2C8B', marginRight: 8, flexShrink: 0, opacity: 0.7 }}>
                {idx + 1}.
              </Text>
              <Text style={{ fontFamily: 'Literata', fontSize: 14, color: C.dark, flexShrink: 1 }}>
                {story.title}
              </Text>
              <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: C.muted, flexGrow: 1, letterSpacing: 4, marginLeft: 6, marginRight: 6, overflow: 'hidden', opacity: 0.5 }}>
                {' ·····················································································'}
              </Text>
              <Text style={{ fontFamily: 'Literata', fontSize: 14, color: C.muted, flexShrink: 0 }}>
                {pageNum}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Image src={mascotCalmUrl} style={{ width: 16, height: 19, marginRight: 6 }} />
        <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: C.muted }}>Почему-Ка!</Text>
      </View>
    </Page>
  );
}
