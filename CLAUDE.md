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
│       ├── db/       # store.ts (Supabase client wrapper)
│       └── middleware/auth.ts  # JWT verification
├── pochemu4ki/       # React 19 + Vite + TypeScript frontend (port 5173)
│   └── src/
│       ├── context/  # AuthContext.tsx, AppContext.tsx
│       ├── pages/    # Landing, Auth, Dashboard, ChildSetup, NewStory, StoryView, Library...
│       ├── api/      # client.ts (centralized API client with Bearer token injection)
│       └── types.ts  # Shared TypeScript interfaces, FREE_STORY_LIMIT = 3
└── data/             # Local data storage (legacy)
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

### Full startup

```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd pochemu4ki && npm install && npm run dev
```

No test framework is configured — tests do not exist yet.

## Required Environment Variables

**backend/.env:**
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
SESSION_SECRET=
GEMINI_API_KEY=           # optional — falls back to templates if missing
GOOGLE_CLIENT_ID=         # optional — for OAuth
GOOGLE_CLIENT_SECRET=     # optional — for OAuth
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
PORT=3001
```

**pochemu4ki/.env:**
```
VITE_API_URL=http://localhost:3001/api
```

## Architecture

### Backend

- **Auth:** JWT (Bearer token) for API calls + Passport.js Google OAuth2 for social login. Tokens stored in localStorage on the frontend.
- **Database:** All DB operations go through `backend/src/db/store.ts` — a typed wrapper around the Supabase client. Never call Supabase directly from routes.
- **Story generation** (`backend/src/services/storyGenerator.ts`): Sends a structured prompt to Gemini 2.0 Flash with child profile data (name, age, gender, interests, toys, hero). Falls back to 12+ hard-coded category templates if Gemini fails. Includes Russian gender-aware grammar for verb conjugation.
- **Usage limits:** `storiesUsed` counter on the user record, enforced in `backend/src/routes/stories.ts` before calling the generator.

### Frontend

- **State:** Two contexts — `AuthContext` (JWT + user identity) and `AppContext` (children profiles + stories).
- **API calls:** All go through `pochemu4ki/src/api/client.ts` which injects the Bearer token automatically.
- **Routes:** Protected routes are wrapped in `ProtectedRoute.tsx`. Key protected routes: `/app/*`.
- **Voice input:** `VoiceInput.tsx` uses Web Speech API with `ru-RU` locale.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Email/password registration |
| POST | `/api/auth/login` | Email/password login |
| GET | `/api/auth/google` | Start Google OAuth |
| GET | `/api/auth/me` | Validate token, get current user |
| GET/POST | `/api/children` | List / create child profiles |
| PUT/DELETE | `/api/children/:id` | Update / delete child profile |
| POST | `/api/stories/generate` | Generate story via Gemini (body: `{ childId, question }`) |
| GET | `/api/stories` | List stories (`?childId=` filter supported) |
| GET/PUT/DELETE | `/api/stories/:id` | Read / update (save/rate) / delete story |
| GET | `/api/health` | Health check |

## Key Design Decisions

- **Language:** The entire product (UI, AI prompts, generated content) is in Russian.
- **Gemini model:** Uses `gemini-2.0-flash` — do not change without testing prompt quality.
- **CORS:** Backend only allows `localhost:5173` and `localhost:5174` in dev. Update `backend/src/index.ts` for production.
- **Supabase service role key** is used server-side only — never expose it to the frontend.
