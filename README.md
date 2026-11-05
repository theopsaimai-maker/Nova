# Nova — AI Assistant (Gemini-style clone)

A fast, multimodal AI chat app built with Next.js, Gemini API, PostgreSQL, and Redis.

---

## Project Structure

```
gemini/
├── web/                        # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/chat/       # SSE streaming API route
│   │   │   ├── globals.css     # Design tokens + global styles
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        # Main app shell
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── Sidebar.tsx         # Conversation history
│   │   │   │   ├── ChatView.tsx        # Main chat area
│   │   │   │   ├── MessageList.tsx     # Messages + auto-scroll
│   │   │   │   ├── MessageItem.tsx     # Individual message bubble
│   │   │   │   ├── Composer.tsx        # Input area
│   │   │   │   ├── MarkdownRenderer.tsx # MD + code highlighting
│   │   │   │   └── EmptyState.tsx      # Greeting + prompt cards
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Tooltip.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   ├── ThemeProvider.tsx       # Light/dark/system
│   │   │   └── ThemeToggle.tsx
│   │   ├── hooks/
│   │   │   └── useChat.ts              # SSE streaming hook
│   │   ├── store/
│   │   │   └── chatStore.ts            # Zustand state (persisted)
│   │   ├── lib/
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   └── db/
│   │       └── schema.sql              # PostgreSQL schema
│   ├── .env.local                      # Your secrets (git-ignored)
│   ├── .env.example                    # Template
│   └── package.json
└── docker-compose.yml                  # PostgreSQL + Redis
```

---

## Quick Start

### 1. Install dependencies

```bash
cd web
npm install
```

> If npm is slow, try: `npm install --prefer-offline` or use `pnpm install`

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) → OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `DATABASE_URL` | Use the docker-compose default or your own Postgres |

### 3. Start the database (optional for MVP)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/):

```bash
# From the gemini/ root:
docker compose up -d
```

This starts:
- PostgreSQL 16 with pgvector on port 5432
- Redis 7 on port 6379
- Automatically runs `schema.sql` on first start

### 4. Run the dev server

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Getting Your Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API key**
3. Copy it into `.env.local` as `GEMINI_API_KEY`

The free tier includes generous usage for development.

---

## Features (MVP — M0 + M1)

- [x] Streaming chat via SSE (Gemini 2.0 Flash / 1.5 Pro / 1.5 Flash)
- [x] Markdown rendering with syntax-highlighted code blocks + copy button
- [x] Conversation history with grouping (Today / Yesterday / Last 7 days)
- [x] Sidebar: search, rename, pin, delete conversations
- [x] Empty state with suggested prompts
- [x] Auto-scroll with jump-to-bottom button
- [x] Stop generation mid-stream
- [x] Regenerate last response
- [x] Thumbs up/down feedback
- [x] Light / dark / system theme
- [x] Fully responsive layout
- [x] Keyboard shortcuts: `Enter` to send, `Shift+Enter` newline, `Ctrl+K` new chat
- [x] WCAG 2.1 AA: aria labels, focus states, live region for messages
- [x] Conversations persisted in localStorage (no DB required for MVP)

---

## Roadmap

| Phase | Features |
|---|---|
| M2 | Image + file upload, voice input/output |
| M3 | Web search with citations, moderation, rate limits |
| M4 | Long-term memory, custom instructions, mobile app |
| M5 | Image generation, canvas, deep research, billing |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand (with localStorage persistence) |
| LLM | Google Gemini API (`@google/generative-ai`) |
| Streaming | Server-Sent Events (SSE) |
| Database | PostgreSQL 16 + pgvector |
| Cache | Redis 7 |
| Auth | NextAuth.js v5 (Google OAuth + email) |
