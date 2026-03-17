import Groq from 'groq-sdk';
import { ChildProfile } from '../db/store';
import { logger } from '../utils/logger';

interface StoryInput {
  storyId: string;
  question: string;
  context: string;
  child: ChildProfile;
  heroOverride?: { name: string; emoji: string; imageUrl?: string };
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

// Compute all 6 Russian case forms for a name and return as a prompt-ready string
function declineNameFull(name: string, gender: string): string {
  if (!name) return name;
  const g = normalizeGender(gender);
  const last = name[name.length - 1].toLowerCase();
  const stem = name.slice(0, -1);
  const sibilants = 'жшщчх';
  const sibilantsEm = 'жшщч';
  const vowels = 'аеёиоуыэюя';

  let им = name, род = name, дат = name, вин = name, тв = name, пред = name;

  if (last === 'а') {
    const prev = (stem[stem.length - 1] ?? '').toLowerCase();
    const soft = sibilants.includes(prev);
    род = stem + (soft ? 'и' : 'ы');
    дат = stem + 'е';
    вин = stem + 'у';
    тв  = stem + (soft ? 'ей' : 'ой');
    пред = stem + 'е';
  } else if (last === 'я') {
    род = stem + 'и';
    дат = stem + 'е';
    вин = stem + 'ю';
    тв  = stem + 'ей';
    пред = stem + 'е';
  } else if (last === 'й') {
    род = stem + 'я';
    дат = stem + 'ю';
    вин = stem + 'я';
    тв  = stem + 'ем';
    пред = stem + 'е';
  } else if (last === 'ь') {
    if (g !== 'girl') {
      род = stem + 'я';
      дат = stem + 'ю';
      вин = stem + 'я';
      тв  = stem + 'ем';
      пред = stem + 'е';
    }
    // female names ending in -ь are indeclinable (Любовь etc.)
  } else if (!vowels.includes(last) && g !== 'girl') {
    const tvSuffix = sibilantsEm.includes(last) ? 'ем' : 'ом';
    род = name + 'а';
    дат = name + 'у';
    вин = name + 'а';
    тв  = name + tvSuffix;
    пред = name + 'е';
  }
  // else: indeclinable (foreign names, names ending in -о/-е/-и/-у/-э)

  return `${им} (именительный — кто?), ${род} (родительный — кого?/у кого?), ${дат} (дательный — кому?), ${вин} (винительный — вижу кого?), ${тв} (творительный — с кем?), о ${пред} (предложный — о ком?)`;
}

interface AgeProfile {
  wordRange: string;
  complexity: string;
  style: string;
}

function getAgeProfile(age: number): AgeProfile {
  if (age <= 4) {
    return {
      wordRange: '120–160 слов',
      complexity: 'Предложения очень короткие — 3–5 слов. Конкретные, осязаемые образы (трава, небо, тёплое одеяло). Никаких абстракций. Ритм как у колыбельной.',
      style: 'нежно и просто, как колыбельная — ритмично, с повторами, очень коротко',
    };
  } else if (age <= 6) {
    return {
      wordRange: '200–280 слов',
      complexity: 'Предложения короткие и средние — 5–8 слов. 1–2 простых сравнения. Минимум абстракций. Много действия и диалогов.',
      style: 'живо и игриво, с простыми диалогами и понятными образами',
    };
  } else if (age <= 9) {
    return {
      wordRange: '350–450 слов',
      complexity: 'Предложения средней длины. Метафоры понятные, через знакомые образы. Диалоги развёрнутые. Можно лёгкую интригу.',
      style: 'увлекательно, с интригой и живыми характерами',
    };
  } else {
    return {
      wordRange: '450–550 слов',
      complexity: 'Богатый язык. Образные сравнения. Развёрнутые диалоги с характерами. Можно философские нотки.',
      style: 'как настоящая детская литература — богато, образно, с глубиной',
    };
  }
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
  tidiness:   "neat and cozy child's room with sunshine streaming in, toy shelves",
  general:    'magical fairytale landscape, glowing forest path, warm golden light',
};

// Pollinations.AI — free, no API key, returns image URL directly
function generateStoryImage(_storyId: string, category: string): string {
  const scene = CATEGORY_SCENE[category] || CATEGORY_SCENE.general;
  const prompt = encodeURIComponent(
    `Children's picture book illustration, soft watercolor style, ${scene}, warm pastel tones, cozy and dreamy atmosphere, gentle golden light, no text, no letters`
  );
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&seed=${seed}`;
  logger.ai(`[Image] Pollinations URL generated for category: ${category}`);
  return url;
}

// Fallback when Groq is unavailable
async function generateFallback(input: StoryInput): Promise<GeneratedStory> {
  const { storyId, question, context, child, heroOverride } = input;
  const childName = child.name;
  const hero = heroOverride ?? getHero(child);
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

  const imageUrl = generateStoryImage(storyId, category);
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

function detectHeroGender(heroName: string): 'masculine' | 'feminine' {
  const n = heroName.toLowerCase();
  const feminineWords = ['леди', 'принцесса', 'фея', 'ведьма', 'волшебница', 'девочка', 'девушка', 'кошка', 'лиса', 'белка', 'сова', 'бабочка'];
  if (feminineWords.some(w => n.includes(w))) return 'feminine';
  // Russian name ending: -а/-я → feminine
  const last = n[n.length - 1];
  if (last === 'а' || last === 'я') return 'feminine';
  return 'masculine';
}

function buildSystemPrompt(heroName: string, childName: string, childAge: number, childGender: string): string {
  const ageProfile = getAgeProfile(childAge);
  const declinedForms = declineNameFull(childName, childGender);
  const heroGender = detectHeroGender(heroName);
  const heroGenderLine = heroGender === 'feminine'
    ? `РОД ГЕРОЯ ${heroName.toUpperCase()}: ЖЕНСКИЙ — используй только: она, её, пришла, сказала, рассказала, улыбнулась, ответила, посмотрела`
    : `РОД ГЕРОЯ ${heroName.toUpperCase()}: МУЖСКОЙ — используй только: он, его, пришёл, сказал, рассказал, улыбнулся, ответил, посмотрел`;

  return `Ты пишешь детскую сказку. Герой этой сказки — ${heroName}.

САМОЕ ВАЖНОЕ ПРАВИЛО ЭТОЙ СКАЗКИ:
Единственный персонаж-помощник — ${heroName}.
НЕ кот. НЕ сова. НЕ фея. НЕ волшебник. Только ${heroName}.
Если ты напишешь другого персонажа вместо ${heroName} — ты нарушишь задание.

${heroGenderLine}

ВОЗРАСТ РЕБЁНКА: ${childAge} ${childAge === 1 ? 'год' : childAge < 5 ? 'года' : 'лет'} — АДАПТИРУЙ СКАЗКУ ПОД ЭТОТ ВОЗРАСТ:
- Длина: РОВНО ${ageProfile.wordRange} (не короче и не длиннее!)
- Язык: ${ageProfile.complexity}
- Тон: пиши ${ageProfile.style}

СКЛОНЕНИЕ ИМЕНИ РЕБЁНКА — ИСПОЛЬЗУЙ ТОЛЬКО ЭТИ ФОРМЫ:
${childName}: ${declinedForms}
ЗАПРЕЩЕНО изменять имя как-либо иначе. Запрещены суффиксы вроде "-ыч", "-ых", "-ич", "-ёнка".

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
- ГЛАВНАЯ ЧАСТЬ (самая длинная!) — УКАЗАННЫЙ герой ОТВЕЧАЕТ на вопрос через волшебную метафору или мини-историю внутри истории. Ребёнок задаёт уточняющие вопросы, герой отвечает. Объяснение должно быть научно верным, но подано через сказочные образы.
- Тёплый финал — ребёнок понял ответ, улыбается, чувствует себя умнее и счастливее

КРИТИЧЕСКИ ВАЖНО:
- Главная часть — это ЯДРО сказки, она должна занимать 50-60% текста
- Ребёнок ДОЛЖЕН получить понятный ответ на свой вопрос
- Ответ должен быть научно корректным, но подан через метафору

ЗАПРЕЩЁННЫЕ КЛИШЕ — НИКОГДА не используй:
- "одолевает любопытство" / "охватило любопытство" / "переполняло любопытство"
- "сердечко сжалось" / "сердечко забилось быстрее"
- "глаза загорелись" (как шаблон)
- "это был не простой вечер"
- "вдруг раздался голос"
- "улыбнулся загадочно"
- Канцелярские обороты: "в связи с тем", "данный вопрос", "следует отметить"
Вместо них — свежие, конкретные образы и живые глаголы.

РАЗНООБРАЗИЕ ЗАЧИНОВ — начинай каждую историю по-новому:
Варьируй: время суток, погоду, место, первое действие ребёнка.
Примеры разных зачинов (вдохновляться, не копировать):
- Через действие: "Лёша тащил за собой синий зонт и смотрел под ноги."
- Через деталь: "Лужа была огромная — почти как море."
- Через диалог: "— Смотри! — крикнул Лёша и остановился."
- Через чувство: "Что-то щекотало в носу — весна пахла совсем близко."
- Через звук: "За окном шуршал дождь. Тихо, как будто кто-то листал книгу."

ЕСТЕСТВЕННОСТЬ РУССКОГО ЯЗЫКА — КРИТИЧЕСКИ ВАЖНО:
- Используй только живые, устойчивые обороты
- Глаголы выбирай точно по смыслу: "удивилась / загорелась любопытством / обрадовалась"
- Прочитай каждую фразу мысленно вслух — если звучит странно, перепиши
- Не используй кальки с иностранных языков. Все обороты — родная русская речь
- Прилагательные и существительные всегда согласовывай в роде, числе и падеже

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

ЕСЛИ ЕСТЬ КОНТЕКСТ ОТ РОДИТЕЛЯ:
Контекст описывает реальную ситуацию. Превращай эту ситуацию в волшебную историю:
- Реальные детали (шли по улице, поссорились, увидели что-то) становятся началом сказки
- Вопрос ребёнка звучит в истории естественно, как часть диалога
- Ответ на вопрос приходит через волшебство, метафору или мудрость персонажа

ЕСЛИ КОНТЕКСТА НЕТ:
Придумай атмосферную ситуацию — прогулка, вечер дома, игра во дворе.

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
  const { storyId, question, context, child, heroOverride } = input;
  const category = categorize(question);

  if (!groq) {
    logger.ai('GROQ_API_KEY not configured, using fallback template');
    return generateFallback(input);
  }

  const hero = heroOverride ?? getHero(child);
  const genderLabel = normalizeGender(child.gender) === 'girl' ? 'девочка' : 'мальчик';
  const shouldUseToys = child.useToys !== false && child.toys?.length > 0;

  const ageProfile = getAgeProfile(child.age);
  const userMessage = `Напиши тёплую сказку для ${child.name} (${genderLabel}, ${child.age} лет).
Вопрос ребёнка: «${question}»${context ? `\nСитуация (от родителя): ${context}` : ''}
ОБЯЗАТЕЛЬНЫЙ герой сказки (используй ТОЧНО это имя): ${hero.name}${shouldUseToys && child.toys?.length > 0 ? `\nОБЯЗАТЕЛЬНО включи в сказку любимую игрушку ребёнка (выбери одну): ${child.toys.map(t => `${t.nickname} — ${t.type}${t.description ? ', ' + t.description : ''}`).join('; ')}. Игрушка должна быть живым участником сцены (рядом лежала, слушала, ждала дома), НЕ просто упоминанием. ЗАПРЕЩЕНО придумывать другие игрушки.` : ''}
ВАЖНО: единственный герой-помощник в этой сказке — ${hero.name}. Никаких котов, сов, фей и других персонажей вместо него.
ОБЯЗАТЕЛЬНАЯ ДЛИНА: ровно ${ageProfile.wordRange}. Не заканчивай сказку раньше — раскрой ответ на вопрос полностью, через диалоги и образы.`;

  const systemPrompt = buildSystemPrompt(hero.name, child.name, child.age, child.gender);
  logger.info(`[Groq] Sending prompt:\n--- SYSTEM ---\n${systemPrompt}\n--- USER ---\n${userMessage}`);

  try {
    const imageUrl = generateStoryImage(storyId, category);
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

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
