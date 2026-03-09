import { View, Text } from '@react-pdf/renderer';

interface DropCapProps {
  firstChar: string;
  firstRest: string;
}

// ── Large decorative first letter + continuation text ─────────────────────────
export function DropCap({ firstChar, firstRest }: DropCapProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
      <Text style={{ fontFamily: 'Comfortaa', fontWeight: 'bold', fontSize: 42, color: '#7C3AED', lineHeight: 0.92, marginRight: 3 }}>
        {firstChar}
      </Text>
      <Text style={{ fontFamily: 'Literata', fontSize: 14, color: '#3D2B1F', lineHeight: 1.8, flex: 1, marginTop: 8 }}>
        {firstRest}
      </Text>
    </View>
  );
}
