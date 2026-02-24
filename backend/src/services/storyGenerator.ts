import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChildProfile } from '../db/store';

interface StoryInput {
  question: string;
  context: string;
  child: ChildProfile;
}

interface GeneratedStory {
  title: string;
  content: string;
  imageUrl: string;
}

function pickToy(child: ChildProfile): { nickname: string; type: string; description: string } {
  if (child.toys && child.toys.length > 0) {
    const toy = child.toys[Math.floor(Math.random() * child.toys.length)];
    return { nickname: toy.nickname, type: toy.type, description: toy.description };
  }
  return { nickname: 'Плюшка', type: 'медвежонок', description: 'маленький коричневый' };
}

function getHero(child: ChildProfile): { name: string; emoji: string } {
  return child.hero || { name: 'Волшебный Дракон', emoji: '🐉' };
}

function categorize(question: string): string {
  const q = question.toLowerCase();
  if (/почему|отчего/.test(q) && /дождь|снег|гром|молния|ветер|радуга|облак|туч/.test(q)) return 'nature';
  if (/почему|отчего/.test(q) && /небо|звезд|солнц|луна|планет|космос/.test(q)) return 'space';
  if (/почему|зачем/.test(q) && /люди|человек|дети|взросл/.test(q)) return 'people';
  if (/почему|как/.test(q) && /расту|большой|маленьк|вырасту/.test(q)) return 'growth';
  if (/почему|зачем/.test(q) && /спать|сон|ночь/.test(q)) return 'sleep';
  if (/почему|зачем/.test(q) && /есть|кушать|еда|вкусно|вкус/.test(q)) return 'food';
  if (/почему|зачем/.test(q) && /дружба|друг|поссорил|играть|вместе/.test(q)) return 'friendship';
  if (/почему|зачем/.test(q) && /плакать|грустно|обидно|злой|злост/.test(q)) return 'emotions';
  if (/почему|зачем/.test(q) && /помогать|добрый|добро|плохо|хорош/.test(q)) return 'kindness';
  if (/почему|как/.test(q) && /другой|разный|непохожий|цвет кожи|волосы/.test(q)) return 'diversity';
  if (/что будет если|а что если/.test(q)) return 'whatif';
  if (/зачем|почему/.test(q) && /убират|убрат|порядок|чист/.test(q)) return 'tidiness';
  return 'general';
}

function getImageUrl(category: string): string {
  const images: Record<string, string> = {
    nature: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    space: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
    people: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    growth: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
    sleep: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80',
    food: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&q=80',
    friendship: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80',
    emotions: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80',
    kindness: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    diversity: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    whatif: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80',
    tidiness: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    general: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=800&q=80',
  };
  return images[category] || images.general;
}

// Fallback when Gemini is unavailable
function generateFallback(input: StoryInput): GeneratedStory {
  const { question, context, child } = input;
  const childName = child.name;
  const toy = pickToy(child);
  const hero = getHero(child);
  const category = categorize(question);

  return {
    title: `Волшебная история для ${childName}`,
    content: `${context ? `${context}\n\nИ тогда` : 'Однажды'} ${childName} задал(а) очень важный вопрос: «${question}»

Рядом был верный ${toy.type} ${toy.nickname}. Он(а) моргнул(а) большими глазами — такого вопроса ещё никто не задавал!

К счастью, рядом оказался мудрый ${hero.name} ${hero.emoji}.

— ${childName}, это отличный вопрос! — сказал(а) ${hero.name}. — Знаешь, самые умные люди на свете — это те, кто не боится спрашивать.

${hero.name} рассказал(а) ${childName}у всё, что знал(а) об этом. История была долгой и интересной. ${childName} слушал(а), широко раскрыв глаза, а ${toy.nickname} тихонечко кивал(а) рядом.

В конце ${hero.name} сказал(а):

— ${childName}, ты замечательный(ая)! Тот, кто задаёт вопросы, всегда узнаёт что-то новое. Продолжай быть любопытным(ой)!

${childName} улыбнулся(ась) и крепко обнял(а) ${toy.nickname}. Теперь ${childName} знал(а) ответ — и мир стал немного понятнее.

✨ **Вывод для ${childName}:** Задавать вопросы — это здорово! Любопытные дети узнают о мире больше всех. Не останавливайся — спрашивай!`,
    imageUrl: getImageUrl(category),
  };
}

// Initialize Gemini (only if API key is provided)
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey && apiKey !== 'your_gemini_api_key_here' ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null;

export async function generateStory(input: StoryInput): Promise<GeneratedStory> {
  const { question, context, child } = input;
  const category = categorize(question);

  if (!model) {
    console.warn('[Gemini] GEMINI_API_KEY not configured, using fallback template');
    return generateFallback(input);
  }

  const toy = pickToy(child);
  const hero = getHero(child);
  const toysDesc = child.toys?.length
    ? child.toys.map(t => `${t.nickname} (${t.type}${t.description ? ', ' + t.description : ''})`).join(', ')
    : `${toy.nickname} (${toy.type})`;

  const prompt = `Создай образовательную сказку на русском языке.

Параметры ребёнка:
- Имя: ${child.name}
- Возраст: ${child.age} лет
- Любимый герой: ${hero.name} ${hero.emoji}
- Любимые игрушки: ${toysDesc}

Вопрос ребёнка: ${question}${context ? `\nКонтекст: ${context}` : ''}

Требования:
- Длина: 500-700 слов
- Простой язык для ребёнка ${child.age} лет
- Объясни ответ на вопрос через увлекательную сказку
- Используй имя ребёнка (${child.name}) в тексте несколько раз
- Упомяни любимого героя ${hero.name} ${hero.emoji} или игрушку ${toy.nickname}
- Весёлый и добрый тон, никаких страшных сцен
- Абзацы разделяй двумя переносами строки (\\n\\n)
- В конце добавь вывод: "✨ **Вывод для ${child.name}:** ..."

Верни ТОЛЬКО валидный JSON без markdown-обёртки:
{
  "title": "Название сказки (до 60 символов)",
  "content": "Полный текст сказки"
}`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    // Strip markdown code fences if Gemini adds them
    const jsonText = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonText) as { title: string; content: string };

    if (!parsed.title || !parsed.content) {
      throw new Error('Invalid response shape from Gemini');
    }

    console.log(`[Gemini] Story generated: "${parsed.title}"`);
    return {
      title: parsed.title,
      content: parsed.content,
      imageUrl: getImageUrl(category),
    };
  } catch (err) {
    console.error('[Gemini] Generation failed, using fallback:', err);
    return generateFallback(input);
  }
}
