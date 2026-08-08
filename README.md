# Kaj Shohayok — Enterprise Task Management Platform

> **Live Demo:** _Deploy to Vercel first (see deployment guide below), then add your link here._
> **Full Docs:** [PROJECT_DOCS.md](./PROJECT_DOCS.md) | **Postman Collection:** [KajShohayok_API_Collection.json](./KajShohayok_API_Collection.json)

A production-grade, full-stack task management platform built with **Next.js 15**, **TypeScript**, and a **dual-database architecture** (PostgreSQL + MongoDB + Redis). Features AI-powered task assistance via **Google Gemini 2.0 Flash**, a **drag-and-drop Kanban board**, **real-time updates** via Server-Sent Events, and a **CI/CD pipeline** with GitHub Actions.

---

## Key Features

| Category | Features |
|----------|---------|
| **Security** | Clerk auth, RBAC (4 roles × 12 permissions), rate limiting, Clerk webhooks |
| **Architecture** | 3-tier (Repository → Service → API), EventBus, Factory Pattern, DI container |
| **Databases** | PostgreSQL/Prisma (RBAC data), MongoDB/Mongoose (tasks/projects), Redis (cache/rate-limit) |
| **AI** | Gemini 2.0 Flash: task breakdown, completion prediction, workload balancing, semantic search |
| **Real-Time** | Server-Sent Events (SSE) — Vercel-compatible live updates |
| **Kanban** | @dnd-kit drag-and-drop with Framer Motion animations + optimistic updates |
| **Analytics** | Recharts — pie, bar, area, line charts + productivity trends |
| **Dark Mode** | next-themes — system preference + sidebar toggle, fully persisted |
| **Reporting** | Factory Pattern: CSV/JSON reports + raw data export |
| **Testing** | Jest unit tests — RBAC matrix, status utilities, Zod validation, EventBus |
| **CI/CD** | GitHub Actions: type-check → lint → test → build → Vercel deploy |
| **Docker** | 6-service Compose: PostgreSQL, MongoDB, Redis, Next.js, Adminer, Mongo Express |

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── ai/              ← task-assist, predict-completion, workload, search
│   │   ├── analytics/       ← dashboard stats
│   │   ├── events/          ← SSE real-time stream
│   │   ├── export/          ← raw CSV/JSON data export
│   │   ├── health/          ← DB + service health check
│   │   ├── notifications/
│   │   ├── projects/
│   │   ├── reports/         ← factory-pattern report generation
│   │   ├── tasks/[id]/comments & activity
│   │   └── users/
│   └── dashboard/
│       ├── analytics/       ← Recharts visualizations
│       ├── projects/[id]/   ← Kanban board (dnd-kit)
│       └── reports/         ← report generator page
├── components/
│   ├── ai/                  ← AITaskAssist panel
│   ├── kanban/              ← KanbanBoard, SortableTaskCard
│   └── layout/              ← Sidebar (dark mode toggle), Header
├── lib/
│   ├── container.ts         ← DI: wires repos → services
│   ├── EventBus.ts          ← Observer pattern
│   ├── errors.ts            ← Custom error hierarchy
│   ├── logger.ts            ← Structured logging
│   └── permissions.ts       ← RBAC
├── repositories/            ← TaskRepository, ProjectRepository, AuditRepository
├── services/                ← TaskService, AuditService, NotificationService, AIService, ReportService
└── tests/unit/              ← Jest unit tests
```

---

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Source |
|----------|----------|--------|
| `DATABASE_URL` | ✅ | [Neon](https://neon.tech) free tier or local PostgreSQL |
| `MONGODB_URI` | ✅ | [MongoDB Atlas](https://mongodb.com/atlas) M0 free or local |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_SECRET_KEY` | ✅ | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | ✅ | Clerk Dashboard → Webhooks |
| `GEMINI_API_KEY` | optional | [Google AI Studio](https://aistudio.google.com/app/apikey) — AI degrades to mocks without it |
| `UPSTASH_REDIS_REST_URL` | optional | [Upstash](https://upstash.com) — falls back to in-memory |
| `UPSTASH_REDIS_REST_TOKEN` | optional | Upstash |

For CI/CD, also add **GitHub Secrets**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## Quick Start

### Option A — Local (npm)

```bash
# 1. Clone and install
git clone https://github.com/Shefwef/kaj-shohayok.git
cd kaj-shohayok
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — add DATABASE_URL, MONGODB_URI, and Clerk keys

# 3. Run database migrations
npx prisma migrate dev

# 4. Start development server
npm run dev
# Open http://localhost:3000
```

### Option B — Docker (all 6 services)

```bash
docker compose up -d
# App:              http://localhost:3000
# PostgreSQL admin: http://localhost:8080
# MongoDB admin:    http://localhost:8081
```

---

## Deployment to Vercel (Free)

### Free-tier cloud stack

| Service | Provider | Notes |
|---------|----------|-------|
| App | Vercel | Auto-detected Next.js |
| PostgreSQL | [Neon](https://neon.tech) | Free 0.5 GB |
| MongoDB | [Atlas M0](https://mongodb.com/atlas) | Free 512 MB |
| Redis | [Upstash](https://upstash.com) | Free 10K commands/day |
| Auth | Clerk | Free 10K MAU |
| AI | Gemini 2.0 Flash | Free quota |

### Steps

```bash
# 1. Push repo to GitHub
git push origin main

# 2. Import at vercel.com/new → add all env vars from .env.example
# 3. Deploy

# 4. Run migrations against Neon (one-time)
npx vercel env pull .env.local
npx prisma migrate deploy
```

---

## Available Scripts

```bash
npm run dev            # Development (Turbopack)
npm run build          # Production build
npm run start          # Production server
npm run lint           # ESLint
npm run type-check     # TypeScript (no emit)
npm test               # Jest unit tests
npm run test:coverage  # Coverage report
npm run test:watch     # Watch mode
```

---

## API Reference

```
# System
GET  /api/health

# Projects
GET  /api/projects          POST /api/projects
GET  /api/projects/:id      PUT  /api/projects/:id     DELETE /api/projects/:id

# Tasks
GET  /api/tasks             POST /api/tasks
GET  /api/tasks/:id         PUT  /api/tasks/:id         DELETE /api/tasks/:id
GET  /api/tasks/:id/comments    POST /api/tasks/:id/comments
GET  /api/tasks/:id/activity

# AI
POST /api/ai/task-assist          ← AI task breakdown
POST /api/ai/predict-completion   ← estimated completion time
GET  /api/ai/workload             ← team imbalance analysis
POST /api/ai/search               ← semantic task search

# Analytics & Reports
GET  /api/analytics
GET  /api/reports?format=csv&type=summary
GET  /api/export?type=tasks&format=csv

# Real-Time
GET  /api/events                  ← SSE stream
GET  /api/notifications           PATCH /api/notifications
```

Full Postman collection: [KajShohayok_API_Collection.json](./KajShohayok_API_Collection.json)

---

## RBAC Roles

| Role | Permissions |
|------|------------|
| **Admin** | All 12 permissions |
| **Manager** | Projects (create/update), tasks (create/update/assign), users, analytics |
| **Member** | Tasks (create/update), read projects, analytics |
| **Viewer** | Read-only: projects, tasks, analytics |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| UI | @dnd-kit (Kanban), Recharts (charts), next-themes (dark mode) |
| Auth | Clerk |
| ORM/ODM | Prisma (PostgreSQL), Mongoose (MongoDB) |
| Validation | Zod |
| State | TanStack Query |
| AI | Google Gemini 2.0 Flash (REST) |
| Real-Time | Server-Sent Events |
| Testing | Jest, @testing-library/react |
| CI/CD | GitHub Actions → Vercel |
| DevOps | Docker Compose (6 services) |

---

## QA Testing Guide

After setup, follow the 16-step QA checklist in [PROJECT_DOCS.md § 17](./PROJECT_DOCS.md#17-qa-testing-guide).

Covers: health check, auth flow, projects CRUD, Kanban drag-and-drop, AI features, analytics, reports, dark mode, SSE, rate limiting, RBAC enforcement, and admin panel.

---

## Characteristics


**The dual-database design** (PostgreSQL for RBAC + MongoDB for tasks) is a deliberate architectural tradeoff. Role changes need transactional guarantees — PostgreSQL delivers that. Tasks and projects benefit from MongoDB's flexible schemas and aggregation pipeline for analytics.

**The clean architecture** (Repository → Service → API) means I can swap the database ORM, the AI provider, or add new side effects without touching unrelated code. The EventBus decouples notifications from business logic — adding a Slack integration would be one new subscriber, zero service changes.

**The AI layer degrades gracefully** — every endpoint has a deterministic fallback. The app is fully functional without a Gemini API key.

---

*Built by [Shefwef](https://github.com/Shefwef) · Next.js 15 + Google Gemini 2.0 Flash*
