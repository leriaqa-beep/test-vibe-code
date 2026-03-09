# Почему-Ка! — Аналитический документ проекта

> Дата анализа: 9 марта 2026
> Версия: актуальная (ветка `main`, Render deployment)

---

## 1. ОБЩЕЕ ОПИСАНИЕ

**Почему-Ка!** — русскоязычное приложение для детей с AI-генерацией сказок.
Родители создают профили ребёнка, дети задают вопросы, приложение генерирует персонализированные сказки через Groq LLM. Freemium-модель: 3 бесплатные сказки, затем подписка.

**Целевая аудитория:** дети 3–7 лет, родители как основные пользователи
**Деплой:** Render.com
- Frontend: https://pochemu4ki-app.onrender.com
- Backend: https://pochemu4ki-api.onrender.com

---

## 2. ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Backend
| Компонент | Технология | Версия |
|-----------|-----------|--------|
| Фреймворк | Express.js | ^4.18.2 |
| Язык | TypeScript | ^5.3.2 |
| Runtime | Node.js | >= 18 |
| База данных | Supabase (PostgreSQL) | ^2.98.0 |
| AI генерация | Groq SDK (`llama-3.3-70b-versatile`) | ^0.37.0 |
| AI изображения | Google Gemini 2.5 Flash (опционально) | via REST |
| Аутентификация | JWT (30 дней) + Passport.js Google OAuth2 | ^9.0.2 / ^0.7.0 |
| Email | Resend.io (сброс пароля, уведомления) | ^6.9.3 |
| Пароли | bcryptjs (10 rounds) | ^2.4.3 |
| Порт | 3001 | — |

### Frontend
| Компонент | Технология | Версия |
|-----------|-----------|--------|
| UI фреймворк | React 19 (StrictMode) | ^19.2.0 |
| Сборщик | Vite | ^7.3.1 |
| Язык | TypeScript | ~5.9.3 |
| Роутер | React Router v7 | ^7.13.0 |
| Стили | Tailwind CSS v4 + CSS токены | ^4.1.18 |
| PDF генерация | @react-pdf/renderer | ^4.3.2 |
| Иконки | Lucide React | ^0.574.0 |
| Голосовой ввод | Web Speech API (ru-RU) | native |
| State Management | React Context (2 контекста) | — |
| PWA | manifest.json + InstallPrompt | — |
| Порты (dev) | 5173 / 5174 / 5175 | — |

---

## 3. СТРУКТУРА РЕПОЗИТОРИЯ

```
test-vibe-code/
├── backend/
│   └── src/
│       ├── index.ts               # Точка входа, middleware-стек, роуты
│       ├── routes/
│       │   ├── auth.ts            # Регистрация, вход, Google OAuth, сброс пароля
│       │   ├── children.ts        # CRUD профилей детей
│       │   ├── stories.ts         # Генерация, список, чтение, обновление, удаление
│       │   ├── users.ts           # Премиум, подписка, удаление аккаунта, фидбек
│       │   └── admin.ts           # Аналитика (только для admin)
│       ├── services/
│       │   └── storyGenerator.ts  # Groq + Gemini + fallback шаблоны
│       ├── db/
│       │   ├── store.ts           # Supabase-обёртка (users, children, stories, tokens)
│       │   └── supabase.ts        # Инициализация Supabase клиента
│       ├── middleware/
│       │   ├── auth.ts            # JWT верификация
│       │   └── admin.ts           # Admin-only guard
│       └── utils/
│           └── logger.ts          # HTTP и AI логи
│
├── pochemu4ki/                    # Frontend
│   └── src/
│       ├── context/
│       │   ├── AuthContext.tsx    # JWT + user state + localStorage
│       │   └── AppContext.tsx     # Дети, сказки, isGenerating
│       ├── pages/                 # 16 страниц (см. раздел 8)
│       ├── components/
│       │   ├── BookPDF/                    # PDF-книга (модульная архитектура)
│       │   │   ├── BookPDF.tsx             # Тонкий оркестратор (~65 строк)
│       │   │   ├── constants.ts            # Палитра, HERO-карта, функции-хелперы
│       │   │   ├── fonts.ts                # Регистрация TTF-шрифтов
│       │   │   ├── decorations/
│       │   │   │   ├── Ornaments.tsx       # GradLine, Diamond, OrnamentalDivider, ParaSeparator, CoverStars
│       │   │   │   ├── PageFrames.tsx      # ParchFrame, HeroFrame
│       │   │   │   ├── DropCap.tsx         # Буквица (42pt Comfortaa + Literata body)
│       │   │   │   └── PageFooter.tsx      # TextPageFooter (mascot-calm + ─ ✦ N ✦ ─)
│       │   │   └── pages/
│       │   │       ├── BookCover.tsx       # Передняя обложка
│       │   │       ├── BookEndpaper.tsx    # Форзац
│       │   │       ├── BookToC.tsx         # Оглавление
│       │   │       ├── BookChapterDivider.tsx  # Страница-разделитель главы
│       │   │       ├── BookStoryPage.tsx   # Вопрос + текст сказки (объединённая)
│       │   │       └── BookBackCover.tsx   # Задняя обложка
│       │   ├── BookReader/        # Интерактивный ридер (BookReader, BookPage, BookCover)
│       │   ├── Mascot/            # Маскот с 7 эмоциями
│       │   ├── ProtectedRoute.tsx
│       │   ├── VoiceInput.tsx
│       │   ├── WaveDivider.tsx
│       │   ├── Decorations.tsx
│       │   ├── HeroImage.tsx
│       │   ├── FeedbackButton.tsx
│       │   └── InstallPrompt.tsx
│       ├── styles/
│       │   └── tokens.css         # Все CSS-переменные дизайна
│       ├── api/
│       │   └── client.ts          # Централизованный API-клиент
│       └── utils/
│           └── declineName.ts     # Склонение русских имён
│
├── data/
│   └── db.json                    # Локальный JSON-фолбэк (авто-создаётся)
│
└── docs/                          # Документация проекта
    └── PROJECT_ANALYSIS.md        # Этот документ
```

---

## 4. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

### Backend (`backend/.env`)

| Ключ | Назначение | Обязательный |
|------|-----------|-------------|
| `JWT_SECRET` | Подпись JWT-токенов | Нет (fallback: 'pochemu-ka-secret-key-2024') |
| `SESSION_SECRET` | Шифрование сессий OAuth | Нет (fallback тот же) |
| `GROQ_API_KEY` | Groq LLM для генерации сказок | **Да** |
| `GEMINI_API_KEY` | Google Gemini для AI-изображений | Нет (fallback: Unsplash URL) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Нет (OAuth отключён) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | Нет |
| `GOOGLE_CALLBACK_URL` | URL коллбэка OAuth | Нет |
| `FRONTEND_URL` | Origin фронтенда для CORS и редиректов | **Да** (prod) |
| `SUPABASE_URL` | Supabase проект URL | **Да** |
| `SUPABASE_ANON_KEY` | Supabase публичный ключ | **Да** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase сервисный ключ (секретный) | **Да** |
| `RESEND_API_KEY` | Resend email API | Нет |
| `EMAIL_FROM` | Email отправителя | Нет (fallback: 'Почему-Ка! <noreply@pochemu4ki.app>') |
| `ADMIN_EMAIL` | Email для уведомлений фидбека | Нет |
| `PORT` | Порт сервера | Нет (fallback: 3001) |

### Frontend (`pochemu4ki/.env`)

| Ключ | Назначение |
|------|-----------|
| `VITE_API_URL` | URL бэкенда (`http://localhost:3001/api` для dev) |
| `VITE_SUPABASE_URL` | Не используется (плейсхолдер) |
| `VITE_SUPABASE_ANON_KEY` | Не используется (плейсхолдер) |

---

## 5. API ENDPOINTS

### Аутентификация (`/api/auth`)

| Метод | Путь | Auth | Описание |
|-------|------|------|---------|
| POST | `/register` | — | Регистрация email+пароль |
| POST | `/login` | — | Вход → JWT токен |
| GET | `/google` | — | Редирект на Google OAuth |
| GET | `/google/callback` | — | Коллбэк OAuth → редирект с токеном |
| GET | `/me` | Bearer JWT | Получить текущего пользователя |
| POST | `/forgot-password` | — | Запрос письма для сброса пароля |
| POST | `/reset-password` | — | Подтверждение сброса (token в теле) |

### Профили детей (`/api/children`) — JWT обязателен

| Метод | Путь | Описание |
|-------|------|---------|
| GET | `/` | Список профилей текущего пользователя |
| POST | `/` | Создать профиль ребёнка |
| PUT | `/:id` | Обновить профиль |
| DELETE | `/:id` | Удалить профиль |

### Сказки (`/api/stories`) — JWT обязателен

| Метод | Путь | Описание |
|-------|------|---------|
| POST | `/generate` | Сгенерировать сказку (проверяет лимит для free tier) |
| GET | `/` | Список сказок (`?childId=` — фильтр по ребёнку) |
| GET | `/:id` | Получить сказку (увеличивает readCount) |
| PUT | `/:id` | Обновить (`isSaved`, `rating`) |
| DELETE | `/:id` | Удалить |

**Тело запроса для генерации:**
```json
{ "childId": "uuid", "question": "Почему небо синее?", "context": "Мы гуляли в парке..." }
```

### Пользователи (`/api/users`) — JWT обязателен

| Метод | Путь | Описание |
|-------|------|---------|
| POST | `/activate-premium` | Включить премиум (demo) |
| GET | `/subscription-status` | isPremium, storiesUsed, freeLimit |
| DELETE | `/me` | Удалить аккаунт + все данные |
| POST | `/feedback` | Отправить фидбэк с опциональным рейтингом |

### Admin (`/api/admin`) — admin only

| Метод | Путь | Описание |
|-------|------|---------|
| GET | `/stats` | Аналитика: пользователи, сказки, рейтинги, рост |

---

## 6. СХЕМА БАЗЫ ДАННЫХ (Supabase / PostgreSQL)

### `users`
```sql
id              uuid    PK
email           text    UNIQUE
password_hash   text
google_id       text    NULLABLE UNIQUE
created_at      timestamp
is_premium      boolean
stories_used    integer
```

### `children`
```sql
id          uuid    PK
user_id     uuid    FK → users
name        text
age         integer
gender      text    -- 'boy' | 'girl'
hero        jsonb   -- { name: string, emoji: string }
toys        jsonb   -- [{ id, nickname, type, description }]
use_toys    boolean
interests   text[]
created_at  timestamp
```

### `stories`
```sql
id          uuid    PK
user_id     uuid    FK → users
child_id    uuid    FK → children NULLABLE
title       text
question    text
context     text
content     text
image_url   text
is_saved    boolean
rating      integer -- 0-5
read_count  integer
created_at  timestamp
```

### `password_reset_tokens`
```sql
token       text    PK
user_id     uuid    FK → users
expires_at  timestamp  -- 1 час
```

### `feedback`
```sql
id          uuid    PK
user_id     uuid    FK → users NULLABLE
text        text
rating      integer NULLABLE
page        text    NULLABLE
created_at  timestamp
```

---

## 7. СИСТЕМА ГЕНЕРАЦИИ СКАЗОК

### Поток генерации

```
POST /api/stories/generate
  │
  ├─ Проверка лимита (storiesUsed >= 3 && !isPremium → 403)
  │
  ├─ Categorize question (regex по 12+ категориям)
  │
  ├─ Build System Prompt (500+ строк):
  │   - Роль: добрый сказочник для детей
  │   - Структура: завязка → вопрос → герой → ответ → окончание
  │   - Правила: только герой ребёнка, грамматика согласно полу, 400-500 слов
  │   - Запрет: морализаторство, латиница, незавершённые сказки
  │
  ├─ Build User Prompt:
  │   - Имя, возраст, пол ребёнка
  │   - Вопрос + контекст
  │   - Список игрушек (если useToys=true)
  │
  ├─ Groq API Call (llama-3.3-70b-versatile):
  │   - temperature: 0.9
  │   - max_tokens: 4096
  │   - response_format: JSON { title, content }
  │
  ├─ (Параллельно) Image Generation:
  │   ├─ GEMINI_API_KEY? → gemini-2.5-flash-image → base64 PNG
  │   │                     → Supabase Storage (story-images bucket)
  │   └─ Fallback: Unsplash URL по категории
  │
  ├─ Text Cleanup (убрать латиницу, CJK)
  │
  └─ Сохранить в stories, storiesUsed++
```

### Fallback шаблоны

Если Groq недоступен — используются жёстко заданные шаблоны с подстановкой:
- Имя ребёнка в родительном падеже
- Имя игрушки, имя героя
- Контекст (опционально)

### Склонение по роду

```typescript
// Глагольные формы зависят от gender ребёнка:
{ asked: 'задала'|'задал', listened: 'слушала'|'слушал', ... }
```

---

## 8. СТРАНИЦЫ ФРОНТЕНДА

| Страница | Маршрут | Auth | Назначение |
|----------|--------|------|-----------|
| Landing | `/` | Public | Hero-секция, фичи, CTA |
| Auth | `/auth` | Public | Вход/регистрация + Google OAuth |
| AuthCallback | `/auth/callback` | Public | Обработка редиректа после Google OAuth |
| Dashboard | `/app` | ✓ | Главная: профили детей, быстрый доступ |
| ChildSetup | `/app/child/setup` | ✓ | Создание профиля ребёнка |
| ChildEdit | `/app/child/:id/edit` | ✓ | Редактирование профиля |
| NewStory | `/app/child/:childId/new-story` | ✓ | Форма генерации + голосовой ввод |
| StoryView | `/app/story/:id` | ✓ | Ридер сказки + рейтинг/сохранение |
| Library | `/app/library` | ✓ | Библиотека с поиском, сортировкой, фильтром |
| BookCreate | `/app/book/create` | ✓ | Компиляция сказок в PDF-книгу |
| Settings | `/app/settings` | ✓ | Настройки аккаунта |
| AdminDashboard | `/app/admin` | Admin | Аналитика, рост, пользователи |
| Pricing | `/app/pricing` | Public | Страница подписки |
| Privacy | `/privacy` | Public | Политика конфиденциальности |
| ForgotPassword | `/forgot-password` | Public | Запрос сброса пароля |
| ResetPassword | `/reset-password` | Public | Подтверждение сброса |
| Onboarding | `/app/onboarding` | ✓ | Первичная настройка |

---

## 9. КОМПОНЕНТЫ ФРОНТЕНДА

### Основные

| Компонент | Файл | Назначение |
|-----------|------|-----------|
| ProtectedRoute | ProtectedRoute.tsx | Guard для `/app/*`, редирект на `/auth` |
| VoiceInput | VoiceInput.tsx | Web Speech API (ru-RU), речь → текст |
| Mascot | Mascot/Mascot.tsx | PNG маскот с 7 эмоциями |
| HeroImage | HeroImage.tsx | Иллюстрация героя персонажа |
| WaveDivider | WaveDivider.tsx | SVG волны (gentle, deep, cloud, tilt) |
| Decorations | Decorations.tsx | SVG фоновые декорации (hero, auth, dashboard, story, minimal) |
| FeedbackButton | FeedbackButton.tsx | Плавающий виджет обратной связи |
| InstallPrompt | InstallPrompt.tsx | PWA Install prompt |

### BookReader (интерактивный ридер)

| Компонент | Назначение |
|-----------|-----------|
| BookReader.tsx | Контейнер: навигация по страницам, анимации slide, свайп, клавиатура |
| BookPage.tsx | Одна страница ридера: текст + декоративная рамка |
| BookCover.tsx | Обложка ридера |

### BookPDF (экспорт в PDF)

Модульная архитектура: `BookPDF.tsx` — тонкий оркестратор (~65 строк), логика вынесена в отдельные файлы.

**Декорации (`decorations/`):**

| Файл | Экспорты | Назначение |
|------|---------|-----------|
| Ornaments.tsx | `GradLine`, `Diamond`, `OrnamentalDivider`, `ParaSeparator`, `CoverStars` | SVG-разделители и декоры |
| PageFrames.tsx | `ParchFrame`, `HeroFrame` | Рамки страниц |
| DropCap.tsx | `DropCap` | Буквица (42pt Comfortaa + 14pt Literata) |
| PageFooter.tsx | `TextPageFooter` | Нижний колонтитул mascot-calm + ─ ✦ N ✦ ─ |

**Страницы (`pages/`):**

| Файл | Назначение |
|------|-----------|
| BookCover.tsx | Передняя обложка |
| BookEndpaper.tsx | Форзац |
| BookToC.tsx | Оглавление (только при сказок > 1) |
| BookChapterDivider.tsx | Страница-разделитель главы |
| BookStoryPage.tsx | Вопрос + текст сказки (объединённая) |
| BookBackCover.tsx | Задняя обложка |

**Структура PDF-книги:**

| Страница | Дизайн |
|----------|-------|
| 1. Обложка | Тёмно-фиолетовый `#4C1D95`, золотые звёзды/рамки, mascot-logo, имя ребёнка в родительном падеже (52pt Comfortaa) |
| 2. Форзац | Лавандовый `#F3EEFF`, сетка 8×7 звёзд SVG (quadratic bezier ✦), дата |
| 3. Оглавление *(если сказок > 1)* | Пергамент, точки-лидеры, Literata 14pt, mascot-think, номера страниц |
| 4a. Разделитель главы | Пергамент `#FDF6E3`, СКАЗКА N, mascot-surprise 142pt, заголовок 24pt, SVG-завитки с бриллиантом |
| 4b. Вопрос + текст | Фон адаптирован к герою (`HERO_BG`), рамка `HeroFrame` с угловыми ромбами, блок вопроса `#F3EEFF`, буквица 42pt, Literata 14pt lineHeight 1.8, картинка героя после 3-го абзаца, `ParaSeparator` каждые 3 абзаца, завершение mascot-joy |
| 5. Задняя обложка | Зеркало передней, mascot-calm 142pt, «Почемучки» + whykids.app |

**Нумерация страниц:** cover(1) + endpaper(1) + toc(0\|1) + на каждую сказку: разделитель + текст (2 стр.) → `pageNum = 4 + tocOffset + idx * 2`

**Адаптация к герою (`HERO_BG` в `constants.ts`):**

| Emoji | Фон страницы |
|-------|-------------|
| 🦄 | `#FAF5FF` (лаванда) |
| 🦉 | `#FEFCE8` (жёлтый крем) |
| 🐉 | `#FFFBEB` (янтарь) |
| 🧚 | `#FDF2F8` (розовый) |
| 🦁 | `#FFF7ED` (персик) |
| 🐱 | `#F5F3FF` (бледно-фиолетовый) |

**PDF Шрифты (зарегистрированы локально):**
- Comfortaa Regular/Bold (`/assets/fonts/Comfortaa-*.ttf`)
- Literata Regular/Bold/Italic (`/assets/fonts/Literata-*.ttf`)
- PTSans Regular/Bold/Italic (`/assets/fonts/PTSans-*.ttf`)

---

## 10. ДИЗАЙН-ТОКЕНЫ

### Цвета (tokens.css)

| Переменная | Значение | Применение |
|-----------|---------|-----------|
| `--bg-primary` | #FFFBF5 | Фон страниц (тёплый крем) |
| `--bg-surface` | #FFFFFF | Фон карточек |
| `--bg-secondary` | #F5F0FF | Лавандовые акцентные блоки |
| `--bg-warm` | #FFF5EE | Тёплые акценты |
| `--bg-mint` | #F0FAF7 | Успех, позитив |
| `--text-primary` | #2D2B3D | Заголовки, основной текст |
| `--text-secondary` | #7A7890 | Подписи, подтекст |
| `--text-muted` | #ABA9C0 | Плейсхолдеры, disabled |
| `--accent-primary` | #7C6BC4 | Кнопки, ссылки (фиолетовый) |
| `--accent-secondary` | #6BB89C | Успех (мятный) |
| `--accent-warm` | #F4A261 | Уведомления (оранжевый) |
| `--accent-yellow` | #F9D56E | Звёзды, рейтинги (золото) |

### Типографика

| Семейство | Использование |
|-----------|-------------|
| Comfortaa | Заголовки, логотип, кнопки |
| Nunito | Основной текст интерфейса |
| Literata | Текст сказок, PDF |

### Радиусы

- Малые элементы: min 12px
- Карточки: 20px
- Кнопки: 16px
- Пилюли: 9999px

### Правила дизайна (строгие)

- **НЕЛЬЗЯ:** чистый чёрный (#000000) → использовать `--text-primary` (#2D2B3D)
- **НЕЛЬЗЯ:** чисто белый (#FFFFFF) для фона страниц → только крем `--bg-primary`
- **Тени:** только мягкие, с фиолетовым оттенком (никаких серых)
- **Настроение:** тёплое, уютное, безопасное — как акварельная детская книга

---

## 11. АССЕТЫ

### Маскот (`public/assets/mascot/`)
| Файл | Эмоция | Применение |
|------|--------|-----------|
| mascot-joy.png | Радость | Завершение сказки, успех |
| mascot-think.png | Размышление | Оглавление PDF, загрузка |
| mascot-explain.png | Объяснение | Заголовки страниц сказки |
| mascot-surprise.png | Удивление | Форзац, разделители глав |
| mascot-calm.png | Спокойствие | Колонтитулы, фоновые элементы |
| mascot-hero.png | Героизм | Страница вопроса |
| mascot-logo.png | Лого | Обложка книги, favicon |

### Герои (`public/assets/heroes/`)
| Файл | Emoji | Персонаж |
|------|-------|---------|
| unicorn.png | 🦄 | Единорог Радуга |
| owl.png | 🦉 | Мудрая Сова |
| dragon.png | 🐉 | Добрый Дракон |
| fairy.png | 🧚 | Фея Звёздочка |
| lion.png | 🦁 | Храбрый Рыцарь |
| cat.png | 🐱 | Котик-Мурлыка |

### Шрифты (`public/assets/fonts/`)
- Comfortaa-Regular.ttf, Comfortaa-Bold.ttf
- Literata-Regular.ttf, Literata-Bold.ttf, Literata-Italic.ttf
- PTSans-Regular.ttf, PTSans-Bold.ttf, PTSans-Italic.ttf

---

## 12. КОНТЕКСТЫ STATE MANAGEMENT

### AuthContext

```typescript
// Состояние
user: User | null
token: string | null       // localStorage['auth_token']
isLoading: boolean

// Методы
loginWithEmail(email, password): Promise<void>
registerWithEmail(email, password): Promise<void>
loginWithToken(token): Promise<void>
refreshUser(): Promise<void>
logout(): void
```

**Инициализация:** при монтировании проверяет токен через `/api/auth/me`

### AppContext

```typescript
// Состояние
children: ChildProfile[]
stories: Story[]
isGenerating: boolean

// Методы
loadChildren(): Promise<void>
loadStories(childId?): Promise<void>
generateStory(childId, question, context): Promise<Story>
updateStory(id, data): Promise<void>
deleteStory(id): Promise<void>
addChild(data): Promise<ChildProfile>
updateChild(id, data): Promise<ChildProfile>
deleteChild(id): Promise<void>
```

---

## 13. API КЛИЕНТ (client.ts)

Централизованный fetch-враппер:
- Автоматически вставляет Bearer-токен из localStorage
- Обработка ошибок: бросает `{ status, message, code }`
- Base URL: `import.meta.env.VITE_API_URL` || `http://localhost:3001/api`

```typescript
// Неймспейсы:
api.auth.me()
api.children.list() | create(data) | update(id, data) | delete(id)
api.stories.list(childId?) | get(id) | generate(...) | update(id, data) | delete(id)
api.admin.stats()
api.users.activatePremium() | subscriptionStatus() | deleteAccount() | sendFeedback(...)
```

---

## 14. АУТЕНТИФИКАЦИЯ

### Поток Email/Password

```
/auth (форма) → POST /api/auth/register|login
→ JWT (30 дней) → localStorage['auth_token']
→ AuthContext.loginWithToken() → /api/auth/me
→ Редирект на /app
```

### Поток Google OAuth

```
/auth (кнопка Google) → /api/auth/google
→ Google Consent Screen
→ /api/auth/google/callback
→ JWT генерация → редирект на /auth/callback?token=<jwt>
→ AuthCallback.tsx → AuthContext.loginWithToken()
→ Редирект на /app
```

### Protected Routes

```
/app/* → <ProtectedRoute>
  → AuthContext.token && user? → рендер
  → иначе → Navigate to /auth
```

---

## 15. FREEMIUM МОДЕЛЬ

| | Free | Premium |
|--|------|---------|
| Сказки | 3 истории | Неограниченно |
| PDF книга | ✓ | ✓ |
| Профили детей | Все | Все |
| Голосовой ввод | ✓ | ✓ |
| Сохранение/оценка | ✓ | ✓ |

**Лимит:** `FREE_STORY_LIMIT = 3` (в `types.ts`)
**Проверка:** `POST /api/stories/generate` → если `storiesUsed >= 3 && !isPremium` → 403 `LIMIT_REACHED`
**Активация:** `POST /api/users/activate-premium` (demo, без оплаты)

---

## 16. MIDDLEWARE СТЕК (backend)

```
Incoming Request
  │
  ├─ cors() — разрешить http://localhost:* + FRONTEND_URL
  ├─ express.json() — парсинг JSON тел
  ├─ express-session() — OAuth сессии
  ├─ passport.initialize() — инициализация аутентификации
  ├─ request logger — логирование METHOD URL STATUS ms
  │
  ├─ /api/auth/* → routes/auth.ts
  ├─ /api/children/* → middleware/auth.ts → routes/children.ts
  ├─ /api/stories/* → middleware/auth.ts → routes/stories.ts
  ├─ /api/users/* → middleware/auth.ts → routes/users.ts
  ├─ /api/admin/* → middleware/auth.ts → middleware/admin.ts → routes/admin.ts
  ├─ /api/health → { status: 'ok' }
  │
  └─ globalErrorHandler → 500 { error: 'Internal server error' }
```

**CORS политика:** динамическая, разрешает любой `http://localhost:<порт>` — удобно для Vite (5173/5174/5175)

---

## 17. БЕЗОПАСНОСТЬ

| Аспект | Реализация |
|--------|-----------|
| JWT | 30-дневный срок, подпись JWT_SECRET |
| Пароли | bcryptjs, 10 rounds |
| OAuth | Passport.js Google Strategy, CSRF через state |
| Сброс пароля | crypto.randomBytes токены, 1 час срок |
| CORS | Строго: localhost + FRONTEND_URL |
| API ключи | Только в backend .env, никогда в клиенте |
| Supabase | Row-Level Security (настраивается в dashboard) |

---

## 18. ЛОГИРОВАНИЕ (logger.ts)

```typescript
logger.request(method, url, status, ms)  // HTTP доступ
logger.info(message)                      // Информационные (OAuth, генерация)
logger.warn(message)                      // Предупреждения (ошибки auth)
logger.error(message, err)               // Ошибки (необработанные исключения)
logger.ai(message, err?)                 // AI-сервисы (Groq, Gemini)
```

---

## 19. СБОРКА И ДЕПЛОЙ

### Локальная разработка

```bash
# Backend
cd backend && npm run dev        # ts-node-dev, порт 3001

# Frontend
cd pochemu4ki && npm run dev     # Vite, порт 5173/5174
```

### Production сборка

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd pochemu4ki && npm run build   # tsc -b && vite build → dist/
```

### Render.com

- **Frontend:** Static Site → `pochemu4ki/` → `npm run build` → `dist/`
- **Backend:** Web Service → `backend/` → `npm run build && npm start`
- **Переменные окружения:** настраиваются в Render Dashboard
- **Auto-deploy:** при каждом `git push` в ветку `main`

---

## 20. ТЕКУЩЕЕ СОСТОЯНИЕ / ИЗВЕСТНЫЕ ОСОБЕННОСТИ

### Что реализовано
- ✅ Полная аутентификация (email + Google OAuth + сброс пароля)
- ✅ CRUD профилей детей с игрушками, интересами, героями
- ✅ AI-генерация сказок через Groq (`llama-3.3-70b-versatile`)
- ✅ Опциональная генерация изображений через Gemini + Supabase Storage
- ✅ Библиотека сказок с поиском, сортировкой, фильтрацией (без thumbnail-изображений)
- ✅ PDF экспорт книги сказок — полный арт-директорский редизайн (9 марта 2026):
  - Форзац: лавандовый фон, SVG-сетка звёзд ✦
  - Оглавление: точки-лидеры, показывается только при 2+ сказках
  - Разделитель главы: пергамент, mascot-surprise 50мм, SVG-завитки
  - Страница сказки: объединённый блок вопроса + текст, адаптивный фон по герою, угловые ромбы, буквица 42pt, `ParaSeparator` каждые 3 абзаца
  - Задняя обложка: зеркало передней с mascot-calm и whykids.app
- ✅ BookPDF рефакторинг (9 марта 2026): монолит ~570 строк → 10 модульных файлов (`constants`, `decorations/`, `pages/`)
- ✅ Интерактивный книжный ридер (BookReader) со свайп/клавиатурой (без изображений в сказках)
- ✅ Голосовой ввод вопросов (Web Speech API, ru-RU)
- ✅ Freemium: лимит 3 сказки, страница подписки
- ✅ Admin-панель с аналитикой
- ✅ PWA (manifest, InstallPrompt)
- ✅ Персонализированные локальные TTF-шрифты (Comfortaa, Literata)
- ✅ Склонение русских имён по падежам

### Изменения (9 марта 2026)

| Изменение | Детали |
|-----------|-------|
| Удалены изображения из UI | Убран thumbnail из карточек Library; удалён `imageUrl` prop из `BookPage` и `BookReader` (fix Render build: TS6133 + TS2322) |
| PDF: страница вопроса удалена | Страница 4b (только вопрос) слита со страницей текста → 2 стр. на сказку вместо 3 |
| PDF: нумерация ToC исправлена | Формула `4 + idx * 3` → `4 + tocOffset + idx * 2` |
| BookPDF → модули | `BookPDF.tsx` (~570 строк) разбит на 10 файлов в `decorations/` и `pages/` |

### Технический долг / Особенности
- ⚠️ `@supabase/supabase-js` установлен во frontend, но не используется (плейсхолдер для будущей миграции)
- ⚠️ Нет тестов (ни unit, ни e2e) — рекомендуется Vitest/Playwright
- ⚠️ Оплата подписки — demo-режим (нет Stripe/Paddle интеграции)
- ⚠️ PDF не поддерживает автоматический перенос страниц для длинных сказок (react-pdf auto-break)
- ⚠️ `data/db.json` — fallback для local dev; в prod данные в Supabase
- ⚠️ `image_url` хранится в БД (`stories`), но больше не отображается в UI и PDF

---

*Документ обновлён: 9 марта 2026*
