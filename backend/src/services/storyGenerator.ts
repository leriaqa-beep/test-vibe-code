import Groq from 'groq-sdk';
import { ChildProfile } from '../db/store';
import { logger } from '../utils/logger';
import { supabase } from '../db/supabase';

interface StoryInput {
  storyId: string;
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
  if (!child.hero) return { name: 'Волшебный Дракон', emoji: '🐉' };
  if (typeof child.hero === 'string') return { name: child.hero as string, emoji: '🐉' };
  return child.hero;
}

function normalizeGender(gender: string): 'girl' | 'boy' {
  return gender === 'female' || gender === 'girl' ? 'girl' : 'boy';
}

function genderForm(child: ChildProfile) {
  const f = normalizeGender(child.gender) === 'girl';
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

const CATEGORY_SCENE: Record<string, string> = {
  nature:     'magical forest with rain and rainbow, lush green trees, colorful flowers',
  space:      'night sky full of stars, crescent moon, glowing galaxy, a small planet',
  people:     'diverse happy children playing together in a sunny park',
  growth:     'small child looking up at a tall tree, flowers blooming, sunrise',
  sleep:      'cozy bedroom at night, soft moonlight through curtains, stars visible outside',
  food:       'colorful fruits and vegetables arranged beautifully, warm kitchen',
  friendship: 'two children holding hands and laughing in a sunlit meadow',
  emotions:   'child with expressive face surrounded by glowing hearts and light',
  kindness:   'child helping another child, glowing aura of warmth around them',
  diversity:  'circle of joyful children of different backgrounds holding hands',
  whatif:     'whimsical portal to fantasy world, floating islands, magical creatures',
  tidiness:   'neat and cozy child\'s room with sunshine streaming in, toy shelves',
  general:    'magical fairytale landscape, glowing forest path, warm golden light',
};

async function generateStoryImage(storyId: string, category: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return getImageUrl(category);

  const scene = CATEGORY_SCENE[category] || CATEGORY_SCENE.general;
  const prompt = `Children's picture book illustration, soft watercolor style, ${scene}, warm pastel tones, cozy and dreamy atmosphere, gentle golden light, cute and friendly, no text, no letters`;

  try {
    // gemini-2.5-flash-image is the free-tier native image generation model (Nano Banana)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini generateContent ${response.status}: ${errText.slice(0, 300)}`);
    }

    type GeminiPart = { inlineData?: { mimeType: string; data: string }; text?: string };
    type GeminiResp = { candidates?: { content?: { parts?: GeminiPart[] } }[] };
    const data = await response.json() as GeminiResp;
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));
    const b64 = imagePart?.inlineData?.data;
    const mimeType = imagePart?.inlineData?.mimeType ?? 'image/png';
    if (!b64) throw new Error('No image part in Gemini response');

    const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
    const buffer = Buffer.from(b64, 'base64');
    const fileName = `${storyId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('story-images')
      .upload(fileName, buffer, { contentType: mimeType, upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('story-images')
      .getPublicUrl(fileName);

    logger.ai(`[Gemini Image] Generated and uploaded: ${fileName}`);
    return publicUrl;
  } catch (err) {
    logger.ai('Image generation failed, using fallback', err instanceof Error ? err : new Error(String(err)));
    return getImageUrl(category);
  }
}

// Fallback when Groq is unavailable
async function generateFallback(input: StoryInput): Promise<GeneratedStory> {
  const { storyId, question, context, child } = input;
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

  const imageUrl = await generateStoryImage(storyId, category);
  return {
    title: `Ответ для ${declineName(childName, child.gender, 'родительный')}`,
    content: `${opening}

— ${question}

${hero.name} оказался рядом — он всегда появлялся именно тогда, когда нужен.${toyMoment}

— Знаешь, — тихо сказал${g.suffix} ${hero.name}, — это один из самых важных вопросов на свете.

И ${hero.name} рассказал${g.suffix} — не торопясь, мягко, как будто раскрывал${g.suffix} секрет.

${childName} ${g.listened} и не перебивал${g.suffix}. Слова складывались в картинки, картинки — в тепло внутри.

${closing}`,
    imageUrl,
  };
}

function buildSystemPrompt(heroName: string): string {
  return `Ты пишешь детскую сказку. Герой этой сказки — ${heroName}.

САМОЕ ВАЖНОЕ ПРАВИЛО ЭТОЙ СКАЗКИ:
Единственный персонаж-помощник — ${heroName}.
НЕ кот. НЕ сова. НЕ фея. НЕ волшебник. Только ${heroName}.
Если ты напишешь другого персонажа вместо ${heroName} — ты нарушишь задание.

РОД ГЕРОЯ ${heroName.toUpperCase()} определяй по имени:
- Дракон, Кот, Лев, Единорог — мужской род (он, его, рассказал, сказал, пришёл)
- Сова, Фея — женский род (она, её, рассказала, сказала, пришла)

СТИЛЬ НАПИСАНИЯ:
- Пиши как будто рассказываешь историю шёпотом перед сном
- Короткие, образные предложения. Каждое предложение — картинка
- Много живых диалогов (формат: — реплика). Диалоги звучат как настоящие детские разговоры
- Эмоции показывай через действия и жесты, НЕ через описание ("замерла с открытым ртом" вместо "была удивлена")
- Волшебство — в обычных вещах. Звёзды подмигивают, ветер шепчет, лужи отражают небо
- Финал — тёплый, с ощущением чуда и лёгкой улыбкой

СТРУКТУРА ИСТОРИИ:
- Атмосферное начало — место, время, настроение (2-3 предложения)
- Ситуация — вплети контекст от родителя как живую сцену с диалогами. Если контекста нет — придумай уютную сцену
- Ребёнок задаёт свой вопрос вслух (естественно, в диалоге)
- Появление УКАЗАННОГО героя-помощника — он приходит мягко, ненавязчиво
- ГЛАВНАЯ ЧАСТЬ (самая длинная!) — УКАЗАННЫЙ герой ОТВЕЧАЕТ на вопрос через волшебную метафору или мини-историю внутри истории. Это развёрнутое, тёплое объяснение в 3-5 абзацев с диалогами. Ребёнок задаёт уточняющие вопросы, герой отвечает. Объяснение должно быть научно верным, но подано через сказочные образы.
- Тёплый финал — ребёнок понял ответ, улыбается, чувствует себя умнее и счастливее

КРИТИЧЕСКИ ВАЖНО:
- Пункт 5 — это ЯДРО сказки, он должен занимать 50-60% текста
- Ребёнок ДОЛЖЕН получить понятный ответ на свой вопрос
- Ответ должен быть научно корректным но поданным через метафору

РУССКАЯ ГРАММАТИКА — КРИТИЧЕСКИ ВАЖНО:
- Склоняй имена ребёнка строго по правилам русского языка. Примеры: Мира → Миры/Мире/Миру/Мирой/Мире. Никогда не добавляй несуществующие суффиксы вроде "-ыч", "-ых", "-ич" к именам
- Имена на -а (Мира, Катя, Соня, Даша): род. — -ы/-и, дат. — -е, вин. — -у, тв. — -ой/-ей, пред. — -е
- Имена на согласную (Артём, Миша, Саша мужской): склоняй как существительные мужского рода
- Каждое предложение должно быть ПОЛНЫМ. Прилагательное "хорошая/хороший" требует существительного — никогда не пиши "Это хорошая." или "Какой красивый." без существительного
- Перед тем как выдать ответ — проверь каждое предложение: есть ли у каждого подлежащее и сказуемое, завершено ли оно

СТРОГИЕ ЗАПРЕТЫ:
- Пиши ТОЛЬКО на русском языке. НИКАКИХ иностранных слов, иероглифов, латиницы в тексте сказки
- НИКОГДА не заменяй героя из запроса на другого персонажа
- НИКОГДА не пересказывай контекст дословно. Вплетай его в сюжет естественно
- НИКОГДА не пиши блоки "ВЫВОД", "А ты знал?", "Мораль"
- НИКОГДА не пиши заголовки глав, нумерацию, форматирование markdown
- НИКОГДА не используй морализаторский тон ("нужно быть добрым", "это важно потому что")
- НИКОГДА не начинай с "Жила-была" если можно начать атмосфернее
- НИКОГДА не пиши "и он рассказал секрет" / "и она объяснила" без самого рассказа — напиши ЧТО ИМЕННО было рассказано, словами, в диалогах
- НИКОГДА не обрывай историю до того как вопрос получил ответ
- НЕ делай историю короче 400 слов и длиннее 500 слов

ЕСЛИ ЕСТЬ КОНТЕКСТ ОТ РОДИТЕЛЯ:
Контекст описывает реальную ситуацию. Превращай эту ситуацию в волшебную историю:
- Реальные детали (шли по улице, поссорились, увидели что-то) становятся началом сказки
- Вопрос ребёнка звучит в истории естественно, как часть диалога
- Ответ на вопрос приходит через волшебство, метафору или мудрость персонажа

ЕСЛИ КОНТЕКСТА НЕТ:
Придумай атмосферную ситуацию сама — прогулка, вечер дома, игра во дворе.

ФОРМАТ ОТВЕТА — СТРОГО JSON, без markdown, без \`\`\`json обёртки:
{"title": "Короткое поэтичное название", "content": "Текст сказки"}
Заголовок — короткий и поэтичный, например: "Звезда, которая услышала", "Облако с секретом", "Почему дождик танцует"

Абзацы разделяй двумя переносами строки (\\n\\n).`;
}

// Strip any non-Russian characters (Chinese, Vietnamese, Latin, etc.) Llama may inject
function cleanStoryText(text: string): string {
  return text
    // Remove Latin words (Spanish "dijo", German "sagte", etc. that Llama injects)
    .replace(/[a-zA-Z]+/g, '')
    // Keep only Cyrillic, digits, common punctuation, whitespace, emoji
    .replace(/[^\u0400-\u04FF\u0020-\u0040\u005B-\u0060\u007B-\u007E\u00AB\u00BB\u2014\u2013\u2026\u201C\u201D\u201E\u2018\u2019\n\r\t\u2600-\u27BF\u{1F300}-\u{1F9FF}]/gu, '')
    // Fix spaces before punctuation left by removed words
    .replace(/ ([,!?.;:])/g, '$1')
    .replace(/ {2,}/g, ' ')
    .trim();
}

// Initialize Groq (only if API key is provided)
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

export async function generateStory(input: StoryInput): Promise<GeneratedStory> {
  const { storyId, question, context, child } = input;
  const category = categorize(question);

  if (!groq) {
    logger.ai('GROQ_API_KEY not configured, using fallback template');
    return generateFallback(input);
  }

  const hero = getHero(child);
  const genderLabel = normalizeGender(child.gender) === 'girl' ? 'девочка' : 'мальчик';
  const shouldUseToys = child.useToys !== false && child.toys?.length > 0;

  const userMessage = `Напиши тёплую сказку для ${child.name} (${genderLabel}, ${child.age} лет).
Вопрос ребёнка: «${question}»${context ? `\nСитуация (от родителя): ${context}` : ''}
ОБЯЗАТЕЛЬНЫЙ герой сказки (используй ТОЧНО это имя): ${hero.name}${shouldUseToys && child.toys?.length > 0 ? `\nЛюбимые игрушки (могут появиться в истории): ${child.toys.map(t => t.nickname).join(', ')}` : ''}
Помни: имя ${child.name} склоняй правильно по падежам. Пол: ${genderLabel}.
ВАЖНО: единственный герой-помощник в этой сказке — ${hero.name}. Никаких котов, сов, фей и других персонажей вместо него.`;

  const systemPrompt = buildSystemPrompt(hero.name);
  logger.info(`[Groq] Sending prompt:\n--- SYSTEM ---\n${systemPrompt}\n--- USER ---\n${userMessage}`);

  try {
    const [completion, imageUrl] = await Promise.all([
      groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.9,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
      generateStoryImage(storyId, category),
    ]);

    const responseText = completion.choices[0]?.message?.content || '';
    logger.info(`[Groq] Raw response:\n${responseText}`);

    const parsed = JSON.parse(responseText) as { title: string; content: string };

    if (!parsed.title || !parsed.content) {
      throw new Error('Invalid response shape from Groq');
    }

    parsed.title = cleanStoryText(parsed.title);
    parsed.content = cleanStoryText(parsed.content);

    logger.info(`[Groq] Story generated: "${parsed.title}"`);
    return {
      title: parsed.title,
      content: parsed.content,
      imageUrl,
    };
  } catch (err) {
    logger.ai('Generation failed, using fallback', err instanceof Error ? err : new Error(String(err)));
    return generateFallback(input);
  }
}
