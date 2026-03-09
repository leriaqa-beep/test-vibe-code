# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Почему-Ка!** — a Russian-language AI-powered storytelling app for children. Parents create child profiles, children ask questions, and the app generates personalized stories using Groq (`llama-3.3-70b-versatile`). Freemium model: 3 free stories (`FREE_STORY_LIMIT = 3` in `types.ts`), then subscription required.

**Deployed on Render.com:**
- Frontend: https://pochemu4ki-app.onrender.com
- Backend: https://pochemu4ki-api.onrender.com

## Commands

### Backend

```bash
cd backend
npm run dev    # ts-node-dev hot reload, port 3001
npm run build  # tsc → dist/
npm start      # run dist/index.js
```

### Frontend

```bash
cd pochemu4ki
npm run dev     # Vite dev server, port 5173 (may bind to 5174/5175)
npm run build   # tsc -b && vite build → dist/
npm run lint    # ESLint
```

No test framework is configured.

## Environment Variables

**backend/.env** — required in production:
```
GROQ_API_KEY=               # Story generation via llama-3.3-70b-versatile
SUPABASE_URL=               # Supabase project URL
SUPABASE_ANON_KEY=          # Supabase public anon key
SUPABASE_SERVICE_ROLE_KEY=  # Supabase service role key (secret)
FRONTEND_URL=               # Allowed CORS origin (prod)
JWT_SECRET=                 # fallback: 'pochemu-ka-secret-key-2024'
SESSION_SECRET=             # fallback: same as JWT_SECRET
GEMINI_API_KEY=             # optional — AI image generation; falls back to Unsplash URLs
GOOGLE_CLIENT_ID=           # optional — Google OAuth
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
RESEND_API_KEY=             # optional — password reset emails
ADMIN_EMAIL=                # optional — feedback notifications
PORT=3001
```

**pochemu4ki/.env** — only needed to point at a non-default backend:
```
VITE_API_URL=http://localhost:3001/api
```
`VITE_SUPABASE_*` keys are present but unused (placeholder for future migration).

## Architecture

### Backend (`backend/src/`)

- **Database:** `db/store.ts` is a typed Supabase wrapper. All DB operations go through `store.*` — never query Supabase directly from routes. `data/db.json` is a local JSON fallback for dev only.
- **Auth:** JWT Bearer tokens (30-day expiry) + Passport.js Google OAuth2. OAuth callback stores the frontend origin in `express-session` so redirects work across Vite ports.
- **CORS:** Dynamically allows any `http://localhost:<port>` — safe for Vite binding to 5173/5174/5175.
- **Story generation** (`services/storyGenerator.ts`):
  - Calls Groq `llama-3.3-70b-versatile` with a long system prompt (hero identity, Russian grammar rules, toy inclusion rules) + per-request user prompt (child profile, question, context).
  - Toy rule: when `child.useToys === true`, the prompt **requires** the toy to appear in the story — not just "may appear".
  - Optionally generates an image via `gemini-2.5-flash-image` → uploads to Supabase Storage `story-images` bucket. Falls back to Unsplash URL by category.
  - Falls back to hard-coded templates if Groq is unavailable.
  - `cleanStoryText()` strips Latin/CJK characters Llama sometimes injects.
- **Routes:** `auth.ts`, `children.ts`, `stories.ts`, `users.ts` (premium, feedback, delete account), `admin.ts` (analytics, admin-only guard in `middleware/admin.ts`).

### Frontend (`pochemu4ki/src/`)

- **State:** `AuthContext` (JWT + user, token in `localStorage['auth_token']`) and `AppContext` (children profiles + stories list, `isGenerating` flag).
- **API:** All calls go through `api/client.ts` which injects the Bearer token. Namespaces: `api.auth.*`, `api.children.*`, `api.stories.*`, `api.users.*`, `api.admin.*`.
- **Protected routes:** `ProtectedRoute.tsx` guards all `/app/*` routes.
- **Voice input:** `VoiceInput.tsx` uses Web Speech API with `ru-RU` locale.
- **Mascot:** Always use PNG files from `pochemu4ki/public/assets/mascot/mascot-{emotion}.png`. Never render characters in SVG/CSS. Supported emotions: `joy | think | explain | surprise | calm | hero | logo`.

### BookPDF (`pochemu4ki/src/components/BookPDF/`)

Modular `@react-pdf/renderer` v4 document. `BookPDF.tsx` is a thin orchestrator (~65 lines); all logic is in sub-modules:

```
BookPDF/
  constants.ts          # Palette (C.*), HERO map, HERO_BG map, helper functions
  fonts.ts              # Registers Comfortaa, Literata, PTSans from /assets/fonts/*.ttf
  decorations/
    Ornaments.tsx       # GradLine, Diamond, OrnamentalDivider, ParaSeparator, CoverStars
    PageFrames.tsx      # ParchFrame (double gold border), HeroFrame (thin border + corner diamonds)
    DropCap.tsx         # 42pt Comfortaa drop cap + Literata body in a flex row
    PageFooter.tsx      # mascot-calm + "─ ✦ N ✦ ─" footer
  pages/
    BookCover.tsx / BookBackCover.tsx   # Purple gradient, gold stars/borders
    BookEndpaper.tsx                    # Lavender #F3EEFF, SVG star grid
    BookToC.tsx                         # Dot-leader table of contents (only if stories > 1)
    BookChapterDivider.tsx              # Parchment divider per story
    BookStoryPage.tsx                   # Combined question block + story text
```

**Critical react-pdf constraints:**
- `<Page>` must be a **direct child of `<Document>`** — never wrap pages in `<View>`. Use `<Fragment key={id}>` when mapping multiple pages per story.
- `lineHeight` must be ≥ 1 — values below 1 cause `unsupported number: Infinity` in the yoga layout engine.
- Only use `fontStyle: 'italic'` with fonts that have an italic variant registered in `fonts.ts`. Comfortaa has **no italic** — use PTSans italic instead.
- `overflow: 'hidden'` on `<Text>` can cause layout Infinity — wrap in a `<View>` instead.
- Absolutely positioned `<Svg>` renders above all `<View>/<Text>` content (separate PDF layer). Use `<View>` elements for backgrounds instead.

**Page numbering:** `cover(1) + endpaper(1) + toc(0|1) + per story: divider + text = 2 pages` → story text page number = `4 + tocOffset + idx * 2`.

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Email/password registration |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/google` | — | Start Google OAuth |
| GET | `/api/auth/me` | Bearer | Validate token |
| POST | `/api/auth/forgot-password` | — | Request reset email |
| POST | `/api/auth/reset-password` | — | Confirm reset |
| GET/POST | `/api/children` | Bearer | List / create child profiles |
| PUT/DELETE | `/api/children/:id` | Bearer | Update / delete profile |
| POST | `/api/stories/generate` | Bearer | Generate story (checks free limit first) |
| GET | `/api/stories` | Bearer | List stories (`?childId=` filter) |
| GET/PUT/DELETE | `/api/stories/:id` | Bearer | Read / update (`isSaved`, `rating`) / delete |
| POST | `/api/users/activate-premium` | Bearer | Demo premium activation |
| GET | `/api/users/subscription-status` | Bearer | `isPremium`, `storiesUsed`, `freeLimit` |
| DELETE | `/api/users/me` | Bearer | Delete account + all data |
| POST | `/api/users/feedback` | Bearer | Submit feedback |
| GET | `/api/admin/stats` | Admin | Analytics |
| GET | `/api/health` | — | Health check |

## Key Design Decisions

- **Language:** Entire product (UI, AI prompts, generated content) is in Russian.
- **LLM:** Groq `llama-3.3-70b-versatile` — do not change without re-testing Russian grammar output and hero/toy compliance.
- **Icons:** Lucide icons have `stroke="currentColor"` and no fill. For gold stars use custom `<svg fill="#F9D56E">`, for lavender sparkles `fill="#9B8EC4"` — never Lucide Star/Sparkle on light backgrounds.
- **Design tokens:** All CSS variables are in `pochemu4ki/src/styles/tokens.css`. Never use raw hex for page backgrounds or text — use `var(--bg-primary)`, `var(--text-primary)`, etc.
- **No pure black/white:** `#000000` is forbidden. Page backgrounds must use `var(--bg-primary)` (#FFFBF5 warm cream), not `#FFFFFF`.
