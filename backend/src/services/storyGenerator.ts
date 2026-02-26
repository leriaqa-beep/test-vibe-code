import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChildProfile } from '../db/store';
import { logger } from '../utils/logger';

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

function declineName(name: string, gender: string, padezh: 'родительный' | 'предложный'): string {
  if (!name) return name;
  const last = name[name.length - 1].toLowerCase();
  const stem = name.slice(0, -1);
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
    return padezh === 'родительный' ? name + 'а' : name + 'е';
  }
  return name;
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

function genderForm(child: ChildProfile) {
  const f = child.gender === 'girl';
  return {
    asked:    f ? 'задала'        : 'задал',
    listened: f ? 'слушала'       : 'слушал',
    smiled:   f ? 'улыбнулась'    : 'улыбнулся',
    hugged:   f ? 'обняла'        : 'обнял',
    knew:     f ? 'знала'         : 'знал',
    adj:      f ? 'замечательная' : 'замечательный',
    curious:  f ? 'любопытной'    : 'любопытным',
    suffix:   f ? 'а'             : '',
  };
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
  const hero = getHero(child);
  const category = categorize(question);
  const g = genderForm(child);

  const shouldUseToys = child.useToys !== false && child.toys?.length > 0;
  const toy = shouldUseToys ? pickToy(child) : null;

  const opening = context
    ? `${context}\n\n${childName} остановил${g.suffix === 'а' ? 'ась' : 'ся'} и тихо спросил${g.suffix}:`
    : `Был тихий вечер. ${childName} смотрел${g.suffix} в окно и вдруг спросил${g.suffix}:`;

  const toyMoment = toy
    ? `\n\n${toy.nickname} лежал${g.suffix === 'а' ? '' : ''} рядом и, кажется, тоже слушал${g.suffix === 'а' ? 'а' : ''} — не моргая.`
    : '';

  const closing = toy
    ? `${childName} ${g.smiled} и прижал${g.suffix === 'а' ? 'ась' : 'ся'} к ${toy.nickname}. За окном мигнула звезда — будто тоже услышала.`
    : `${childName} ${g.smiled} и посмотрел${g.suffix} на небо. Казалось, оно стало чуть ближе.`;

  return {
    title: `Ответ для ${declineName(childName, child.gender, 'родительный')}`,
    content: `${opening}

— ${question}

${hero.name} оказался рядом — он всегда появлялся именно тогда, когда нужен.${toyMoment}

— Знаешь, — тихо сказал${g.suffix} ${hero.name}, — это один из самых важных вопросов на свете.

И ${hero.name} рассказал${g.suffix} — не торопясь, мягко, как будто раскрывал${g.suffix} секрет.

${childName} ${g.listened} и не перебивал${g.suffix}. Слова складывались в картинки, картинки — в тепло внутри.

${closing}`,
    imageUrl: getImageUrl(category),
  };
}

const SYSTEM_PROMPT = `Ты — мастер тёплых детских историй. Ты пишешь сказки которые родители читают детям перед сном. Твои истории — как объятия: уютные, мягкие, волшебные.

СТИЛЬ НАПИСАНИЯ:
- Пиши как будто рассказываешь историю шёпотом перед сном
- Короткие, образные предложения. Каждое предложение — картинка
- Много живых диалогов (формат: — реплика). Диалоги звучат как настоящие детские разговоры
- Эмоции показывай через действия и жесты, НЕ через описание ("замерла с открытым ртом" вместо "была удивлена")
- Волшебство — в обычных вещах. Звёзды подмигивают, ветер шепчет, лужи отражают небо
- Финал — тёплый, с ощущением чуда и лёгкой улыбкой

СТРУКТУРА ИСТОРИИ:
- Атмосферное начало — место, время, настроение (2-3 предложения)
- Ситуация — вплети контекст от родителя как живую сцену с диалогами
- Появление волшебства или друга-помощника (герой из профиля)
- Мягкое объяснение через метафору или волшебную историю внутри истории
- Тёплый финал — ребёнок улыбается, обнимает маму, шепчет звёздам

СТРОГИЕ ЗАПРЕТЫ:
- НИКОГДА не пересказывай контекст дословно. Вплетай его в сюжет естественно
- НИКОГДА не пиши блоки "ВЫВОД", "А ты знал?", "Мораль"
- НИКОГДА не пиши заголовки глав, нумерацию, форматирование markdown
- НИКОГДА не используй морализаторский тон ("нужно быть добрым", "это важно потому что")
- НИКОГДА не начинай с "Жила-была" если можно начать атмосфернее
- НЕ делай историю длиннее 250-350 слов

ЕСЛИ ЕСТЬ КОНТЕКСТ ОТ РОДИТЕЛЯ:
Контекст описывает реальную ситуацию. Превращай эту ситуацию в волшебную историю:
- Реальные детали (шли по улице, поссорились, увидели что-то) становятся началом сказки
- Вопрос ребёнка звучит в истории естественно, как часть диалога
- Ответ на вопрос приходит через волшебство, метафору или мудрость персонажа

ЕСЛИ КОНТЕКСТА НЕТ:
Придумай атмосферную ситуацию сама — прогулка, вечер дома, игра во дворе.

ФОРМАТ ОТВЕТА — только JSON, без markdown:
{"title": "Короткое поэтичное название", "content": "Текст сказки"}
Заголовок — короткий и поэтичный, например: "Звезда, которая услышала", "Облако с секретом", "Почему дождик танцует"

Абзацы разделяй двумя переносами строки (\\n\\n).`;

// Initialize Gemini (only if API key is provided)
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey && apiKey !== 'your_gemini_api_key_here' ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI
  ? genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { temperature: 1.0 },
    })
  : null;

export async function generateStory(input: StoryInput): Promise<GeneratedStory> {
  const { question, context, child } = input;
  const category = categorize(question);

  if (!model) {
    logger.ai('GEMINI_API_KEY not configured, using fallback template');
    return generateFallback(input);
  }

  const hero = getHero(child);
  const genderLabel = child.gender === 'girl' ? 'девочка' : 'мальчик';
  // useToys defaults to true for profiles created before this field was added
  const shouldUseToys = child.useToys !== false && child.toys?.length > 0;

  const userMessage = `Напиши тёплую сказку для ${child.name} (${genderLabel}, ${child.age} лет).
Вопрос ребёнка: «${question}»${context ? `\nСитуация (от родителя): ${context}` : ''}
Герой-помощник: ${hero.name}${shouldUseToys && child.toys?.length > 0 ? `\nЛюбимые игрушки (могут появиться в истории): ${child.toys.map(t => t.nickname).join(', ')}` : ''}
Помни: имя ${child.name} склоняй правильно по падежам. Пол: ${genderLabel}.`;

  logger.info(`[Gemini] Sending prompt:\n--- SYSTEM ---\n${SYSTEM_PROMPT}\n--- USER ---\n${userMessage}`);

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    });
    const raw = result.response.text().trim();
    logger.info(`[Gemini] Raw response:\n${raw}`);
    // Strip markdown code fences if Gemini adds them
    const jsonText = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonText) as { title: string; content: string };

    if (!parsed.title || !parsed.content) {
      throw new Error('Invalid response shape from Gemini');
    }

    logger.info(`[Gemini] Story generated: "${parsed.title}"`);
    return {
      title: parsed.title,
      content: parsed.content,
      imageUrl: getImageUrl(category),
    };
  } catch (err) {
    logger.ai('Generation failed, using fallback', err instanceof Error ? err : new Error(String(err)));
    return generateFallback(input);
  }
}
