import { Page, View, Text, Image, Svg, Path } from '@react-pdf/renderer';
import { C } from '../constants';
import { ParchFrame } from '../decorations/PageFrames';

interface BookChapterDividerProps {
  title: string;
  chapterIndex: number; // 1-based
  mascotUrl: string;
  mascotCalmUrl: string;
}

export function BookChapterDivider({ title, chapterIndex, mascotUrl, mascotCalmUrl }: BookChapterDividerProps) {
  return (
    <Page size="A4" style={{ backgroundColor: C.parchment, flexDirection: 'column' }}>
      <ParchFrame />

      <View style={{ flex: 1 }} />
      <View style={{ alignItems: 'center', paddingLeft: 52, paddingRight: 52 }}>
        {/* Chapter label */}
        <Text style={{ fontFamily: 'Comfortaa', fontSize: 9, color: C.purple, letterSpacing: 3, marginBottom: 22, opacity: 0.5 }}>
          СКАЗКА {chapterIndex}
        </Text>

        {/* Mascot ~50mm = 142pt */}
        <Image src={mascotUrl} style={{ width: 142, height: 142, marginBottom: 26 }} />

        {/* Story title */}
        <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 24, color: '#5B2C8B', textAlign: 'center', lineHeight: 1.35, marginBottom: 28 }}>
          {title}
        </Text>

        {/* Decorative curl divider */}
        <Svg width={280} height={22} viewBox="0 0 280 22">
          <Path d="M 10,11 C 20,4 30,4 40,11 C 50,18 60,18 70,11 C 75,7 80,6 85,11" stroke={C.gold} strokeWidth={1.2} fill="none" opacity={0.55} />
          <Path d="M 85,11 L 112,11" stroke={C.gold} strokeWidth={0.8} fill="none" opacity={0.4} />
          <Path d="M 140,5 L 146,11 L 140,17 L 134,11 Z" fill={C.gold} opacity={0.6} />
          <Path d="M 168,11 L 195,11" stroke={C.gold} strokeWidth={0.8} fill="none" opacity={0.4} />
          <Path d="M 195,11 C 200,6 205,7 210,11 C 220,18 230,18 240,11 C 250,4 260,4 270,11" stroke={C.gold} strokeWidth={1.2} fill="none" opacity={0.55} />
        </Svg>
      </View>
      <View style={{ flex: 1 }} />

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Image src={mascotCalmUrl} style={{ width: 16, height: 19, marginRight: 6 }} />
        <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: C.muted }}>Почему-Ка!</Text>
      </View>
    </Page>
  );
}
