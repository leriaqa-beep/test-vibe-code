import { View, Text, Image } from '@react-pdf/renderer';

interface TextPageFooterProps {
  pageNum: number;
  mascotUrl: string;
}

// ── Story text page footer: mascot-calm + ─ ✦ N ✦ ─ ──────────────────────────
export function TextPageFooter({ pageNum, mascotUrl }: TextPageFooterProps) {
  return (
    <View style={{ position: 'absolute', bottom: 18, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      <Image src={mascotUrl} style={{ width: 23, height: 26, marginRight: 10 }} />
      <Text style={{ fontFamily: 'Comfortaa', fontSize: 10, color: '#8B7355' }}>
        {'─ ✦ '}{pageNum}{' ✦ ─'}
      </Text>
    </View>
  );
}
