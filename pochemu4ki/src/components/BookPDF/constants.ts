// ── Colour palette ────────────────────────────────────────────────────────────
export const C = {
  coverBg:   '#4C1D95',
  coverMid:  '#6B21A8',
  coverBot:  '#3B0764',
  parchment: '#FDF6E3',
  parchDark: '#F0E4C0',
  warmCream: '#FFF8EC',
  purple:    '#5B21B6',
  purpleLt:  '#EDE9FE',
  dark:      '#2D1B0E',
  muted:     '#8B6B3C',
  gold:      '#D4A853',
  goldLt:    '#F9D56E',
  white:     '#FFFFFF',
};

// ── Hero image map (emoji → public path) ─────────────────────────────────────
export const HERO: Record<string, string> = {
  '🦄': '/heroes/unicorn.png',
  '🦉': '/heroes/owl.png',
  '🐉': '/heroes/dragon.png',
  '🧚': '/heroes/fairy.png',
  '🦁': '/heroes/lion.png',
  '🐱': '/heroes/cat.png',
};

// ── Hero-adaptive page backgrounds ───────────────────────────────────────────
export const HERO_BG: Record<string, string> = {
  '🦄': '#FAF5FF',
  '🦉': '#FEFCE8',
  '🐉': '#FFFBEB',
  '🧚': '#FDF2F8',
  '🦁': '#FFF7ED',
  '🐱': '#F5F3FF',
};

export function getHeroBg(emoji?: string): string {
  return (emoji && HERO_BG[emoji]) ?? '#FDF6E3';
}

// ── Russian genitive declension ───────────────────────────────────────────────
export function declineNameGenitive(name: string): string {
  if (!name) return '';
  const n     = name.trim();
  const last  = n[n.length - 1].toLowerCase();
  const slast = n.length > 1 ? n[n.length - 2].toLowerCase() : '';
  if (n.toLowerCase().endsWith('ия'))  return n.slice(0, -2) + 'ии';
  if (n.toLowerCase().endsWith('ья'))  return n.slice(0, -2) + 'ьи';
  const soft = ['ж', 'ш', 'щ', 'ч', 'г', 'к', 'х'];
  if (last === 'а') return n.slice(0, -1) + (soft.includes(slast) ? 'и' : 'ы');
  if (last === 'я') return n.slice(0, -1) + 'и';
  const vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];
  if (!vowels.includes(last) && last !== 'ь' && last !== 'й') return n + 'а';
  if (last === 'й') return n.slice(0, -1) + 'я';
  if (last === 'ь') return n.slice(0, -1) + 'я';
  return n;
}

export function ageWord(n: number): string {
  if (n >= 11 && n <= 19) return 'лет';
  const r = n % 10;
  if (r === 1) return 'год';
  if (r >= 2 && r <= 4) return 'года';
  return 'лет';
}

export function storiesWord(n: number): string {
  if (n >= 11 && n <= 19) return 'историй';
  const r = n % 10;
  if (r === 1) return 'история';
  if (r >= 2 && r <= 4) return 'истории';
  return 'историй';
}

export function splitParas(text: string): string[] {
  return text.split(/\n+/).map(p => p.trim()).filter(Boolean);
}
