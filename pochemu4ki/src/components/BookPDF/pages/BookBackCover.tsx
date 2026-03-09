import { Page, View, Text, Image } from '@react-pdf/renderer';
import { C } from '../constants';
import { GradLine, CoverStars } from '../decorations/Ornaments';

interface BookBackCoverProps {
  mascotUrl: string;
}

export function BookBackCover({ mascotUrl }: BookBackCoverProps) {
  return (
    <Page size="A4" style={{ backgroundColor: C.coverBg, flexDirection: 'column' }}>
      {/* Gradient overlays — same as front cover */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320, backgroundColor: C.coverMid, opacity: 0.28 }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, backgroundColor: C.coverBot, opacity: 0.45 }} />

      <CoverStars />

      {/* Frame — same as front cover */}
      <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 14, border: `1.5pt solid ${C.gold}`, opacity: 0.6 }} />
      <View style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, borderRadius: 10, border: `0.5pt solid rgba(255,255,255,0.22)` }} />
      {([{t:36,l:36},{t:36,r:36},{b:36,l:36},{b:36,r:36}] as Record<string,number>[]).map((pos, i) => (
        <View key={i} style={{ position: 'absolute', ...pos, width: 12, height: 12, borderRadius: 6, backgroundColor: C.goldLt, opacity: 0.5 }} />
      ))}

      <View style={{ flex: 1 }} />
      <View style={{ alignItems: 'center', paddingLeft: 60, paddingRight: 60 }}>
        <Image src={mascotUrl} style={{ width: 142, height: 142, marginBottom: 28 }} />
        <GradLine id="back0" color={C.gold} width={220} opacity={0.4} />
        <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 20, color: '#F6D365', textAlign: 'center', marginTop: 22, marginBottom: 8 }}>
          Почемучки
        </Text>
        <Text style={{ fontFamily: 'Comfortaa', fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', letterSpacing: 0.5 }}>
          whykids.app
        </Text>
      </View>
      <View style={{ flex: 1 }} />
    </Page>
  );
}
