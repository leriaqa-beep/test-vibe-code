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

  const toyLine1 = toy
    ? `\n\nРядом был верный ${toy.type} ${toy.nickname}. Он моргнул большими глазами — такого вопроса ещё никто не задавал!`
    : '';
  const toyLine2 = toy
    ? `, а ${toy.nickname} тихонечко кивал рядом`
    : '';
  const toyLine3 = toy
    ? `\n\n${childName} ${g.smiled} и крепко ${g.hugged} ${toy.nickname}. Теперь ${childName} ${g.knew} ответ — и мир стал немного понятнее.`
    : `\n\n${childName} ${g.smiled}. Теперь ${childName} ${g.knew} ответ — и мир стал немного понятнее.`;

  return {
    title: `Волшебная история для ${childName}`,
    content: `${context ? `${context}\n\nИ тогда` : 'Однажды'} ${childName} ${g.asked} очень важный вопрос: «${question}»${toyLine1}

К счастью, рядом оказался мудрый ${hero.name} ${hero.emoji}.

— ${childName}, это отличный вопрос! — сказал${g.suffix} ${hero.name}. — Знаешь, самые умные люди на свете — это те, кто не боится спрашивать.

${hero.name} рассказал${g.suffix} ${childName} всё, что знал${g.suffix} об этом. История была долгой и интересной. ${childName} ${g.listened}, широко раскрыв глаза${toyLine2}.

В конце ${hero.name} сказал${g.suffix}:

— ${childName}, ты ${g.adj}! Тот, кто задаёт вопросы, всегда узнаёт что-то новое. Продолжай быть ${g.curious}!
${toyLine3}

✨ **Вывод для ${childName}:** Задавать вопросы — это здорово! Любопытные дети узнают о мире больше всех. Не останавливайся — спрашивай!`,
    imageUrl: getImageUrl(category),
  };
}

const SYSTEM_PROMPT = `Ты — талантливый детский писатель. Ты создаёшь волшебные, познавательные истории для детей 3-7 лет.

ПРАВИЛА СОЗДАНИЯ ИСТОРИИ:

1. СТРУКТУРА (используй классическую драматургию):
   - Завязка: ребёнок-персонаж попадает в необычную ситуацию, связанную с вопросом
   - Приключение: герой отправляется в путешествие/квест, чтобы найти ответ
   - Препятствие: на пути встречается трудность, которую нужно преодолеть
   - Кульминация: герой находит ответ через собственный опыт, а не от "мудрого персонажа"
   - Развязка: герой возвращается с новым знанием и делится им

2. НАУЧНАЯ ТОЧНОСТЬ:
   - Обязательно дай НАСТОЯЩИЙ научный ответ на вопрос ребёнка, адаптированный по возрасту
   - Вплети факты в сюжет естественно, через приключения и открытия
   - Не ограничивайся моралью "спрашивать — это хорошо". Дай реальное знание

3. ПЕРСОНАЖИ:
   - Главный герой — сам ребёнок (используй его имя)
   - У каждого персонажа должен быть характер, мотивация, особенности речи
   - Избегай шаблонных "мудрых фей" и "добрых волшебников", которые просто дают ответы
   - Создавай оригинальных персонажей: говорящая молекула, путешествующий ветер, хранитель леса

4. ЯЗЫК И СТИЛЬ:
   - Пиши живым, образным языком с метафорами, понятными ребёнку
   - Используй звукоподражания, ритмичные фразы
   - Добавляй диалоги — живые, с юмором
   - Описывай запахи, звуки, цвета — создавай атмосферу
   - Подстраивай сложность под возраст

5. УНИКАЛЬНОСТЬ:
   - Каждая история должна быть в новом сеттинге (подводный мир, космос, микромир клетки, облака, вулкан, корни дерева)
   - Не повторяй шаблон "вопрос → мудрец → ответ → мораль"
   - Придумывай неожиданные повороты сюжета

6. ПОУЧИТЕЛЬНОСТЬ:
   - Вывод должен быть связан с КОНКРЕТНЫМ вопросом, а не быть общей фразой
   - Помимо научного знания, вплетай одну мягкую жизненную ценность (доброта, смелость, терпение, дружба)
   - Не морализируй прямо — пусть ребёнок сам сделает вывод из истории

7. ФОРМАТ ОТВЕТА (строго обязательно):
   - Длина: 800-1500 слов (зависит от возраста)
   - Раздели на 5-8 коротких глав с названиями (например: ## Глава 1. Название)
   - В конце добавь блок "🔬 А ты знал?" с 2-3 интересными фактами по теме
   - В самом конце добавь один вопрос для обсуждения с родителями: "💬 Поговорите вместе: ..."
   - Абзацы разделяй двумя переносами строки (\\n\\n)

Верни ТОЛЬКО валидный JSON без markdown-обёртки:
{
  "title": "Название сказки (до 60 символов)",
  "content": "Полный текст сказки со всеми главами, блоком фактов и вопросом"
}`;

// Initialize Gemini (only if API key is provided)
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey && apiKey !== 'your_gemini_api_key_here' ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI
  ? genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { temperature: 0.9 },
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
  const interestsDesc = child.interests?.length
    ? child.interests.join(', ')
    : 'разные темы';

  const genderLabel = child.gender === 'girl' ? 'девочка' : 'мальчик';
  const genderVerbs = child.gender === 'girl'
    ? 'пошла, сказала, обрадовалась, нашла, решила, умная, добрая, любопытная, весёлая'
    : 'пошёл, сказал, обрадовался, нашёл, решил, умный, добрый, любопытный, весёлый';

  // useToys defaults to true for profiles created before this field was added
  const shouldUseToys = child.useToys !== false && child.toys?.length > 0;

  const toysSection = shouldUseToys
    ? `- Любимые игрушки (ЖЁСТКОЕ ПРАВИЛО — читай внимательно):
  ${child.toys.map(t => `  • ${t.nickname} — ${t.type}${t.description ? ` (${t.description})` : ''}`).join('\n')}
  ⚠️ ОБЯЗАТЕЛЬНО: если в сказке появляются игрушки — используй ТОЛЬКО имена из списка выше, точно как написаны.
  ЗАПРЕЩЕНО выдумывать других игрушек или персонажей-игрушек с другими именами.`
    : '- Игрушки: НЕ включай в историю (ребёнок не хочет игрушки в историях)';

  const userMessage = `ВХОДНЫЕ ДАННЫЕ:
- Имя ребёнка: ${child.name} (пол: ${genderLabel})
- Возраст ребёнка: ${child.age} лет
- Вопрос, который задал ребёнок: ${question}${context ? `\n- Контекст: ${context}` : ''}

ПЕРСОНАЛИЗАЦИЯ (обязательно используй):
- Любимый герой: ${hero.name} ${hero.emoji}
${toysSection}
- Интересы ребёнка: ${interestsDesc}

ГРАММАТИКА (строго обязательно):
- Ребёнок — ${genderLabel.toUpperCase()}. Все глаголы, прилагательные и причастия согласуй с полом: ${genderVerbs}
- Имя «${child.name}» склоняй правильно по всем падежам в тексте`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    });
    const raw = result.response.text().trim();
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
