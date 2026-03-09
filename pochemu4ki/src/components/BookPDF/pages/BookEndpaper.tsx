import { Page, View, Text, Svg, Path, Circle } from '@react-pdf/renderer';
import React from 'react';

export function BookEndpaper() {
  return (
    <Page size="A4" style={{ backgroundColor: '#F3EEFF', flexDirection: 'column' }}>
      {/* Thin lavender border */}
      <View style={{ position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, borderRadius: 10, border: '0.8pt solid #C4B5FD', opacity: 0.4 }} />

      <View style={{ flex: 1 }} />

      {/* Star/curl pattern */}
      <View style={{ alignItems: 'center' }}>
        <Svg width={440} height={380} viewBox="0 0 440 380">
          {(() => {
            const items: React.ReactElement[] = [];
            const cols = 8, rows = 7;
            const colStep = 55, rowStep = 52;
            const startX = 27, startY = 26;
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const cx = startX + c * colStep + (r % 2 === 1 ? colStep / 2 : 0);
                const cy = startY + r * rowStep;
                if (cx > 440) continue;
                const sz = 3.2 + Math.abs(Math.sin((r * 3 + c * 2) * 1.1)) * 1.8;
                const isGold = (r + c) % 6 === 0;
                const op = 0.22 + Math.abs(Math.sin((r + c) * 0.9)) * 0.28;
                const fill = isGold ? '#D4A853' : '#9B8EC4';
                const d = `M ${cx},${cy - sz} Q ${cx + sz * 0.28},${cy - sz * 0.28} ${cx + sz},${cy} Q ${cx + sz * 0.28},${cy + sz * 0.28} ${cx},${cy + sz} Q ${cx - sz * 0.28},${cy + sz * 0.28} ${cx - sz},${cy} Q ${cx - sz * 0.28},${cy - sz * 0.28} ${cx},${cy - sz} Z`;
                items.push(<Path key={`s${r}-${c}`} d={d} fill={fill} opacity={op} />);
                if (c < cols - 1) {
                  const dx = cx + colStep / 2 - (r % 2 === 1 ? colStep / 2 : 0) + (r % 2 === 0 ? colStep / 2 : 0);
                  if (dx < 440) {
                    items.push(<Circle key={`d${r}-${c}`} cx={dx} cy={cy} r={1.1} fill="#9B8EC4" opacity={0.18} />);
                  }
                }
              }
            }
            return items;
          })()}
        </Svg>
      </View>

      <View style={{ flex: 1 }} />

      {/* Bottom text */}
      <View style={{ paddingBottom: 44, alignItems: 'center' }}>
        <Text style={{ fontFamily: 'PTSans', fontSize: 9, color: '#7C6BC4', textAlign: 'center', letterSpacing: 0.5, opacity: 0.7 }}>
          Создано с любовью в приложении Почемучки
        </Text>
        <Text style={{ fontFamily: 'PTSans', fontSize: 8, color: '#9B8EC4', textAlign: 'center', marginTop: 5, opacity: 0.5 }}>
          {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>
    </Page>
  );
}
