/** Normalize name: first letter upper, rest lower (Кира, Миша, Артём) */
export function normalizeName(name: string): string {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/** Decline a Russian name into родительный or предложный падеж */
export function declineName(
  name: string,
  gender: 'boy' | 'girl' | null | undefined,
  padezh: 'родительный' | 'предложный',
): string {
  if (!name) return name;
  const n = normalizeName(name);
  const last = n[n.length - 1].toLowerCase();
  const stem = n.slice(0, -1);
  const sibilants = 'жшщчх';
  const vowels = 'аеёиоуыэюя';

  if (last === 'а') {
    const prev = (stem[stem.length - 1] ?? '').toLowerCase();
    return padezh === 'родительный' ? stem + (sibilants.includes(prev) ? 'и' : 'ы') : stem + 'е';
  }
  if (last === 'я') return padezh === 'родительный' ? stem + 'и' : stem + 'е';
  if (last === 'й') return padezh === 'родительный' ? stem + 'я' : stem + 'е';
  if (last === 'ь') return stem + 'и';
  if (!vowels.includes(last) && gender !== 'girl') {
    return padezh === 'родительный' ? n + 'а' : n + 'е';
  }
  return n;
}

/** Select о/об before a word */
export function prepositionO(word: string): string {
  const vowels = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ';
  return vowels.includes(word[0] ?? '') ? 'об' : 'о';
}
