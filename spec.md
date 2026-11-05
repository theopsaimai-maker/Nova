# Spec: AI Assistant App (Gemini-style clone)

> Working name: **Nova** (placeholder). Build an original product inspired by Gemini's UX and features. Do not copy Google's branding, logos, icons, or proprietary assets.

---

## 1. Overview

A multimodal AI chat assistant available on web and mobile. Users chat with an LLM using text, voice, images, and files, get streamed responses, and keep a searchable history of conversations.

**Goals**
- Fast, clean, streaming chat experience
- Multimodal input (text, image, file, voice)
- Persistent conversations with search
- Grounded answers via web search with citations
- Simple, scalable architecture that can swap LLM providers

**Non-goals (v1)**
- Training or hosting a custom foundation model
- Deep OS-level integration (replacing the phone assistant)
- Third-party app extensions/marketplace

---

## 2. Target Users

- General consumers who want a helpful everyday assistant
- Students and professionals (writing, summarizing, coding, research)

---

## 3. Core Features

### 3.1 Chat (MVP)
- New chat, continue chat, rename, delete, pin
- Streaming token-by-token responses (SSE or WebSocket)
- Markdown rendering: headings, lists, tables, code blocks with syntax highlighting and copy button, LaTeX math
- Stop generation, regenerate response, edit last user message
- Message actions: copy, thumbs up/down, share
- Suggested follow-up prompts after each answer
- System prompt + per-conversation context window management (truncate/summarize old turns)

### 3.2 Multimodal Input (MVP)
- Image upload (camera or gallery) with image understanding
- File upload: PDF, DOCX, TXT, CSV (extract text, answer questions about it)
- Voice input (speech-to-text) and optional voice output (text-to-speech)

### 3.3 Web Grounding (v1.1)
- Toggle "Search the web"
- Show inline citations and a sources list
- Fresh-information queries route through a search API

### 3.4 Chat History & Search (MVP)
- Sidebar list grouped by Today / Yesterday / Previous 7 days / Older
- Full-text search across conversations

### 3.5 Personalization (v1.1)
- Custom instructions ("how should the assistant respond?")
- Optional long-term memory: user can view, edit, and delete saved facts
- Theme: light / dark / system

### 3.6 Image Generation (v2)
- Text-to-image generation with gallery in chat
- Safety filters on prompts and outputs

### 3.7 Canvas / Artifacts (v2)
- Side panel for editable documents and runnable code previews

### 3.8 Deep Research (v2)
- Long-running multi-step research job that produces a cited report

---

## 4. Safety & Policy

- Content moderation on input and output (provider moderation API + custom rules)
- Refusals for clearly harmful requests with a polite explanation
- Rate limiting and abuse detection per user/IP
- Age gate (13+, or per local law), parental-consent handling where required
- Clear AI disclosure; "AI can make mistakes" notice
- Privacy: data deletion on request, option to disable history/training use, encryption in transit and at rest
- Compliance: GDPR/CCPA, and NDPR (Nigeria) if serving Nigerian users

---

## 5. Recommended Tech Stack

| Layer | Choice |
|---|---|
| Web | Next.js (React, TypeScript), Tailwind CSS |
| Mobile | Expo / React Native (shared TypeScript types) |
| Backend API | Node.js (Fastify/NestJS) or Python (FastAPI) |
| Streaming | Server-Sent Events (SSE) |
| Database | PostgreSQL (users, chats, messages) |
| Vector store | pgvector (memory, file Q&A / RAG) |
| Cache / queue | Redis + BullMQ (jobs, rate limits) |
| Object storage | S3-compatible (uploads, generated images) |
| Auth | Email + OAuth (Google, Apple) via Auth.js / Clerk / Supabase Auth |
| LLM | Provider-agnostic adapter (Claude API, OpenAI, Gemini API, or open-source via vLLM/Ollama) |
| Search | Tavily / Brave / SerpAPI |
| STT / TTS | Whisper or provider speech APIs |
| Hosting | Vercel (web), Fly.io/Railway/AWS (API), Cloudflare R2 |
| Observability | Sentry, PostHog, OpenTelemetry |

---

## 6. Architecture

```
Client (Web / Mobile)
   │  HTTPS + SSE
   ▼
API Gateway / Backend
   ├── Auth & Rate limiting
   ├── Conversation service  ──► PostgreSQL
   ├── Orchestrator
   │     ├── Prompt builder (system + history + memory + RAG)
   │     ├── Tool router (web search, file reader, image gen)
   │     └── LLM adapter ──► LLM provider(s)
   ├── Moderation service
   ├── File service ──► Object storage ──► Text extractor ──► pgvector
   └── Job queue (Redis) ──► long-running tasks
```

**Key principle:** the LLM adapter exposes one interface (`generate(messages, tools, stream)`) so providers can be swapped without touching the rest of the app.

---

## 7. Data Model

**users**: `id, email, name, avatar_url, created_at, settings_json`

**conversations**: `id, user_id, title, pinned, created_at, updated_at, model`

**messages**: `id, conversation_id, role (user|assistant|system|tool), content, attachments_json, citations_json, token_count, created_at, feedback`

**attachments**: `id, user_id, message_id, type, url, mime, size, extracted_text`

**memories**: `id, user_id, text, embedding, created_at`

**usage**: `id, user_id, date, tokens_in, tokens_out, requests`

---

## 8. API Endpoints (REST + SSE)

| Method | Path | Description |
|---|---|---|
| POST | `/auth/*` | Sign up, sign in, OAuth callbacks |
| GET | `/conversations` | List (paginated, searchable) |
| POST | `/conversations` | Create |
| PATCH | `/conversations/:id` | Rename / pin |
| DELETE | `/conversations/:id` | Delete |
| GET | `/conversations/:id/messages` | Fetch messages |
| POST | `/conversations/:id/messages` | Send message; returns SSE stream |
| POST | `/messages/:id/regenerate` | Regenerate answer |
| POST | `/messages/:id/feedback` | Thumbs up/down |
| POST | `/uploads` | Upload file/image (presigned URL) |
| GET/PUT | `/me/settings` | Preferences, custom instructions |
| GET/DELETE | `/me/memories` | View / delete memory items |
| POST | `/speech/transcribe` | STT |
| POST | `/speech/synthesize` | TTS |

**SSE event types:** `token`, `tool_call`, `citation`, `done`, `error`.

---

## 9. UI / UX Requirements

- Layout: collapsible left sidebar (history), centered chat column, bottom composer
- Composer: multiline input, attach button, mic button, send/stop button
- Empty state: greeting + 4 suggested prompt cards
- Smooth auto-scroll with "jump to latest" button
- Fully responsive; keyboard shortcuts on web (Enter to send, Shift+Enter newline, Cmd/Ctrl+K new chat)
- Accessibility: WCAG 2.1 AA, screen-reader labels, focus states, reduced-motion support
- Loading states: skeleton and typing indicator; error toasts with retry

---

## 10. Non-Functional Requirements

| Area | Target |
|---|---|
| Time to first token | < 1.5 s (p50) |
| Availability | 99.5% |
| Max message size | 32k tokens input (configurable) |
| Upload limit | 20 MB per file, 10 files per message |
| Concurrency | 1,000 simultaneous streams (v1) |
| Offline | Read cached history on mobile |

---

## 11. Monetization (optional)

- Free tier: daily message cap, smaller model
- Pro tier: higher limits, best model, image generation, deep research
- Payments: Stripe (global), Paystack/Flutterwave (Africa)

---

## 12. Milestones

| Phase | Scope | Est. time |
|---|---|---|
| **M0** | Repo, design system, auth, DB schema | 1 week |
| **M1 (MVP)** | Streaming chat, history, markdown/code rendering, settings | 2–3 weeks |
| **M2** | Image + file upload, voice input/output | 2 weeks |
| **M3** | Web search with citations, moderation, rate limits | 2 weeks |
| **M4** | Memory, custom instructions, mobile app polish | 2 weeks |
| **M5** | Image generation, canvas, deep research, billing | 4+ weeks |

---

## 13. Success Metrics

- Day-1 / Day-7 / Day-30 retention
- Messages per active user per day
- Thumbs-up ratio
- p50/p95 time to first token
- Cost per conversation (tokens + infra)
- Safety incident rate

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| High LLM costs | Model tiering, caching, per-user quotas, summarize long contexts |
| Hallucinations | Web grounding + citations, visible disclaimer, feedback loop |
| Abuse / unsafe content | Moderation layers, rate limits, reporting tools |
| Provider outage | Multi-provider adapter with automatic fallback |
| Trademark / IP issues | Original name, logo, and visuals; no use of Google assets |

---

## 15. Open Questions

1. Web-first, mobile-first, or both at launch?
2. Which LLM provider(s) for v1, and what is the monthly budget?
3. Is user sign-in required, or is a guest mode allowed?
4. Target regions and languages at launch?
5. Is monetization part of v1?