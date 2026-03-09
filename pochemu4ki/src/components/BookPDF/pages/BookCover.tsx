import { Page, View, Text, Image } from '@react-pdf/renderer';
import { C, declineNameGenitive, ageWord, storiesWord } from '../constants';
import { GradLine, CoverStars } from '../decorations/Ornaments';
import type { Story, ChildProfile } from '../../../types';

interface BookCoverProps {
  child: ChildProfile;
  stories: Story[];
  mascotUrl: string;
}

export function BookCover({ child, stories, mascotUrl }: BookCoverProps) {
  return (
    <Page size="A4" style={{ backgroundColor: C.coverBg, flexDirection: 'column' }}>

      {/* Gradient simulation overlays */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320, backgroundColor: C.coverMid, opacity: 0.28 }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, backgroundColor: C.coverBot, opacity: 0.45 }} />

      <CoverStars />

      {/* Outer gold border */}
      <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 14, border: `1.5pt solid ${C.gold}`, opacity: 0.6 }} />
      {/* Inner white border */}
      <View style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, borderRadius: 10, border: `0.5pt solid rgba(255,255,255,0.22)` }} />

      {/* Corner accents */}
      {([{t:36,l:36},{t:36,r:36},{b:36,l:36},{b:36,r:36}] as Record<string,number>[]).map((pos, i) => (
        <View key={i} style={{ position: 'absolute', ...pos, width: 12, height: 12, borderRadius: 6, backgroundColor: C.goldLt, opacity: 0.5 }} />
      ))}

      {/* Content */}
      <View style={{ height: 56 }} />

      <View style={{ alignItems: 'center', paddingLeft: 52, paddingRight: 52 }}>
        <Text style={{ fontFamily: 'Comfortaa', fontSize: 9, color: C.goldLt, letterSpacing: 2.5, marginBottom: 20, textAlign: 'center', opacity: 0.85 }}>
          ✦  ПЕРСОНАЛЬНАЯ КНИГА СКАЗОК  ✦
        </Text>

        <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 38, color: C.goldLt, textAlign: 'center', lineHeight: 1.1, marginBottom: 6 }}>
          Почему-Ка
        </Text>
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

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Image src={mascotUrl} style={{ width: 190, height: 190 }} />
        <Text style={{ fontFamily: 'Comfortaa', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 12, textAlign: 'center' }}>
          Персональная книга сказок
        </Text>
      </View>

      <View style={{ flex: 1 }} />
      <View style={{ paddingBottom: 30, alignItems: 'center' }}>
        <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: 'rgba(255,255,255,0.22)', letterSpacing: 3 }}>ПОЧЕМУ-КА!</Text>
      </View>
    </Page>
  );
}
