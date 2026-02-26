import type { CSSProperties } from 'react';

export type MascotEmotion = 'joy' | 'think' | 'explain' | 'surprise' | 'calm' | 'hero' | 'logo';
export type MascotSize = 'sm' | 'md' | 'lg';

interface MascotProps {
  emotion?: MascotEmotion;
  size?: MascotSize;
  className?: string;
  style?: CSSProperties;
}

const SIZE_PX: Record<MascotSize, number> = { sm: 120, md: 280, lg: 420 };

export default function Mascot({ emotion = 'joy', size = 'md', className, style }: MascotProps) {
  const px = SIZE_PX[size];
  return (
    <img
      src={`/assets/mascot/mascot-${emotion}.png`}
      alt="Почему-Ка"
      width={px}
      className={className}
      style={{ height: 'auto', ...style }}
    />
  );
}
