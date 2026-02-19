# Почему-Ка! v2 — MVP

Персонализированные сказки для детей от 3 до 8 лет.

## Запуск

### 1. Backend (порт 3001)
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend (порт 5173)
```bash
cd pochemu4ki
npm install
npm run dev
```

Откройте `http://localhost:5173`

## Структура

```
backend/          Node.js + Express + TypeScript
  src/
    index.ts      Точка входа (порт 3001)
    routes/       auth, children, stories
    services/     storyGenerator.ts (10+ шаблонов)
    db/           store.ts (JSON flat-file)
    middleware/   auth.ts (JWT)
  data/db.json    База данных (создаётся автоматически)

pochemu4ki/       React + TypeScript + Vite + Tailwind
  src/
    pages/
      Landing.tsx    Лендинг (/)
      Auth.tsx       Авторизация (/auth)
      Dashboard.tsx  Главная (/app)
      ChildSetup.tsx Профиль ребёнка (/app/children/new)
      NewStory.tsx   Новая сказка (/app/children/:id/story)
      StoryView.tsx  Просмотр (/app/story/:id)
      Library.tsx    Библиотека (/app/library)
      Settings.tsx   Настройки (/app/settings)
      Pricing.tsx    Тарифы (/app/pricing)
    context/
      AuthContext.tsx  JWT аутентификация
      AppContext.tsx   Дети и истории
    api/client.ts      API-клиент (fetch + Bearer token)
    components/
      ProtectedRoute.tsx  Защита маршрутов
      VoiceInput.tsx      Web Speech API (ru-RU)
```

## API

```
POST /api/auth/register    { email, password }
POST /api/auth/login       { email, password }
GET  /api/auth/me

GET  /api/children
POST /api/children         { name, age, gender, hero, toys, interests }
PUT  /api/children/:id
DELETE /api/children/:id

POST /api/stories/generate { childId, question, context }
GET  /api/stories
GET  /api/stories/:id
PUT  /api/stories/:id      { isSaved, rating }
DELETE /api/stories/:id
```

## Игрушки (toys)

Каждая игрушка: `{ nickname, type, description }`
- nickname: "Пушинка"
- type: "зайка"
- description: "серый плюшевый"

Они становятся персонажами историй.

## Тарифы

- Бесплатно: 3 истории
- Премиум: 299₽/мес — безлимит + иллюстрации*
- Семейный: 499₽/мес — до 5 детей + голосовая озвучка*

*В разработке
