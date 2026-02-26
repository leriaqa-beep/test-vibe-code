const EMOJI_TO_IMAGE: Record<string, string> = {
  '🦄': '/heroes/unicorn.png',
  '🦉': '/heroes/owl.png',
  '🐉': '/heroes/dragon.png',
  '🧚': '/heroes/fairy.png',
  '🦁': '/heroes/lion.png',
  '🐱': '/heroes/cat.png',
};

const SIZES = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

interface HeroImageProps {
  emoji: string;
  size?: keyof typeof SIZES;
  className?: string;
  style?: React.CSSProperties;
}

export default function HeroImage({ emoji, size = 'md', className = '', style }: HeroImageProps) {
  const src = EMOJI_TO_IMAGE[emoji] ?? '/heroes/unicorn.png';
  return (
    <img
      src={src}
      alt=""
      className={`${SIZES[size]} object-contain flex-shrink-0 ${className}`}
      style={style}
    />
  );
}
