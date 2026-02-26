# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Почему-Ка!** — a Russian-language AI-powered storytelling app for children. Parents create child profiles, children ask questions, and the app generates personalized stories using Google Gemini 2.0 Flash. Freemium model: 3 free stories, then subscription required.

## Repository Structure

```
test-vibe-code/
├── backend/          # Node.js/Express/TypeScript API (port 3001)
│   └── src/
│       ├── routes/   # auth.ts, children.ts, stories.ts
│       ├── services/ # storyGenerator.ts (Gemini AI + fallback templates)
│       ├── db/       # store.ts (local JSON flat-file persistence)
│       └── middleware/auth.ts  # JWT verification
├── pochemu4ki/       # React 19 + Vite + TypeScript frontend (port 5173)
│   └── src/
│       ├── context/    # AuthContext.tsx, AppContext.tsx
│       ├── pages/      # Landing, Auth, Dashboard, ChildSetup, NewStory, StoryView, Library...
│       ├── components/ # ProtectedRoute, VoiceInput, Mascot/, Decorations, WaveDivider
│       ├── api/        # client.ts (centralized API client with Bearer token injection)
│       └── types.ts    # Shared TypeScript interfaces, FREE_STORY_LIMIT = 3
└── data/db.json      # Flat-file database (auto-created on first run)
```

## Commands

### Backend

```bash
cd backend
npm run dev    # Dev server with hot reload (ts-node-dev), port 3001
npm run build  # Compile TypeScript → dist/
npm start      # Run compiled dist/index.js
```

### Frontend

```bash
cd pochemu4ki
npm run dev     # Vite dev server, port 5173
npm run build   # tsc -b && vite build
npm run lint    # ESLint
npm run preview # Preview production build
```

No test framework is configured.

## Environment Variables

**backend/.env:**
```
JWT_SECRET=                    # defaults to 'pochemu-ka-secret-key-2024'
SESSION_SECRET=                # defaults to same fallback
GEMINI_API_KEY=                # optional — falls back to templates if missing
GOOGLE_CLIENT_ID=              # optional — for Google OAuth
GOOGLE_CLIENT_SECRET=          # optional — for Google OAuth
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
PORT=3001
```

Frontend has no required env vars for local dev. `VITE_SUPABASE_*` in `.env` are unused placeholders.

## Architecture

### Backend

- **Database:** `backend/src/db/store.ts` is a typed wrapper over a local JSON file at `/data/db.json`. All DB operations (users, children, stories) go through `store.*` methods — never read/write `db.json` directly from routes.
- **Auth:** JWT (Bearer token, 30-day expiry) for API calls + Passport.js Google OAuth2. OAuth callback saves the frontend origin in `express-session` so the redirect goes to the correct localhost port.
- **CORS:** Dynamically allows any `http://localhost:<port>` origin — safe for dev where Vite may bind to 5173, 5174, 5175 etc.
- **Story generation** (`backend/src/services/storyGenerator.ts`): Sends a structured prompt to Gemini 2.0 Flash with the full child profile (name, age, gender, interests, toys, hero). Falls back to hard-coded category templates if Gemini fails or `GEMINI_API_KEY` is absent. Includes Russian gender-aware verb conjugation.
- **Usage limits:** `user.storiesUsed` counter enforced in `stories.ts` before calling the generator. Free tier = 3 stories.

### Frontend

- **State:** Two contexts — `AuthContext` (JWT + user identity, token in `localStorage['auth_token']`) and `AppContext` (children profiles + stories list).
- **API calls:** All go through `pochemu4ki/src/api/client.ts` which injects the Bearer token automatically.
- **Protected routes:** Wrapped in `ProtectedRoute.tsx`; all `/app/*` routes require authentication.
- **Voice input:** `VoiceInput.tsx` uses Web Speech API with `ru-RU` locale.
- **Mascot:** `components/Mascot/Mascot.tsx` renders `<img src="/assets/mascot/mascot-{emotion}.png">`. PNG files must exist in `pochemu4ki/public/assets/mascot/`. Supported emotions: `joy | think | explain | surprise | calm | hero | logo`.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Email/password registration |
| POST | `/api/auth/login` | Email/password login |
| GET | `/api/auth/google` | Start Google OAuth |
| GET | `/api/auth/me` | Validate token, get current user |
| GET/POST | `/api/children` | List / create child profiles |
| PUT/DELETE | `/api/children/:id` | Update / delete child profile |
| POST | `/api/stories/generate` | Generate story via Gemini (body: `{ childId, question, context }`) |
| GET | `/api/stories` | List stories (`?childId=` filter supported) |
| GET/PUT/DELETE | `/api/stories/:id` | Read (increments readCount) / update (isSaved, rating) / delete |
| GET | `/api/health` | Health check |

## Key Design Decisions

- **Language:** The entire product (UI, AI prompts, generated content) is in Russian.
- **Gemini model:** Uses `gemini-2.0-flash` — do not change without testing prompt quality.
- **No Supabase in current dev setup:** The `@supabase/supabase-js` package is installed but unused. `store.ts` uses `fs` + JSON. Future migration path is prepared.
- **Icons:** Lucide icons default to `stroke="currentColor"` with no fill. For star/sparkle icons, use custom inline `<svg fill="#F9D56E">` (gold stars) or `fill="#9B8EC4"` (lavender sparkles) instead of Lucide to avoid black strokes on light backgrounds.
- **Mascot images:** Never draw characters in SVG or CSS. Use PNG files from `pochemu4ki/public/assets/mascot/`.
