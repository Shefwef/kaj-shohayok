<div align="center">

# Kaj Shohayok
### Enterprise Task Management Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kaj--shohayok.vercel.app-emerald?logo=vercel&logoColor=white)](https://kaj-shohayok.vercel.app)
[![CI/CD Pipeline](https://github.com/Shefwef/kaj-shohayok/actions/workflows/ci.yml/badge.svg)](https://github.com/Shefwef/kaj-shohayok/actions)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

Kaj Shohayok is a production-ready, full-stack task management platform you can self-host or deploy to Vercel in minutes. It combines the project visibility of Jira with the simplicity of Linear — powered by AI, real-time collaboration, and a clean green-and-dark UI built for modern engineering teams.

- **AI-powered** — Gemini 2.0 Flash breaks down tasks, predicts completion, and balances team workload. Voice-to-text lets you create tasks hands-free.
- **Kanban boards** — drag-and-drop task management with instant optimistic updates and smooth animations.
- **Live updates** — Server-Sent Events push changes to every connected user in real time, no page refresh needed.
- **Role-based access** — four roles (Admin, Manager, Member, Viewer) with 12 granular permissions, enforced at every API endpoint.
- **Dual-database architecture** — PostgreSQL for transactional RBAC data, MongoDB for flexible task and project content.
- **Dark mode** — system-aware theme with persistent sidebar toggle.

**[Live Demo →](https://kaj-shohayok.vercel.app)**

[Quick Start](#quick-start) · [Architecture](#architecture) · [Features](#features) · [API Reference](#api-reference) · [Deploy](#deploy-to-vercel)

</div>

---

## Architecture

The app is split into three clear layers — each one only talks to the layer directly below it. This means you can swap the database, the AI provider, or add new features without breaking everything else.

```mermaid
graph TD
    subgraph Client["Browser / Client"]
        UI["Next.js 15 UI\n(React 19 + Tailwind)"]
        Chatbot["KS Assistant\n(AI Chatbot)"]
        Kanban["Kanban Board\n(@dnd-kit)"]
        Charts["Analytics\n(Recharts)"]
    end

    subgraph API["API Layer (Next.js App Router)"]
        Routes["Route Handlers\n/api/*"]
        Auth["Clerk Auth\nMiddleware"]
        RateLimit["Rate Limiter\n(In-Memory)"]
    end

    subgraph Services["Service Layer (Business Logic)"]
        TaskSvc["TaskService"]
        AuditSvc["AuditService"]
        NotifSvc["NotificationService"]
        AISvc["AIService"]
        ReportSvc["ReportService"]
        EventBus["EventBus\n(Observer Pattern)"]
    end

    subgraph Repos["Repository Layer (Data Access)"]
        TaskRepo["TaskRepository"]
        ProjectRepo["ProjectRepository"]
        AuditRepo["AuditRepository"]
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL\nUsers · Roles · Orgs")]
        Mongo[("MongoDB\nTasks · Projects · Comments")]
        Redis[("Redis\nCache · Rate Limits")]
    end

    subgraph External["External Services"]
        Clerk["Clerk\nAuthentication"]
        Gemini["Gemini 2.0 Flash\nAI API"]
        SSE["Server-Sent Events\nReal-Time Stream"]
    end

    Client --> API
    API --> Auth --> Clerk
    API --> RateLimit --> Redis
    API --> Services
    Services --> Repos
    Repos --> PG
    Repos --> Mongo
    AISvc --> Gemini
    NotifSvc --> SSE --> Client
    EventBus -.->|publishes| NotifSvc
    EventBus -.->|publishes| AuditSvc
```

---

## How Data Flows

Here's the exact path a request takes from the moment you click "Create Task" to the moment it appears on everyone's screen:

```mermaid
sequenceDiagram
    participant User as You (Browser)
    participant MW as Clerk Middleware
    participant API as /api/tasks
    participant Svc as TaskService
    participant Repo as TaskRepository
    participant DB as MongoDB
    participant Bus as EventBus
    participant SSE as SSE Stream
    participant Other as Other Users

    User->>MW: POST /api/tasks { title, priority, ... }
    MW->>MW: Verify Clerk session token
    MW->>API: Authenticated request + userId

    API->>Svc: createTask(data, actorId)
    Svc->>Svc: Validate permissions (RBAC check)
    Svc->>Repo: insert(taskData)
    Repo->>DB: db.tasks.insertOne(...)
    DB-->>Repo: saved task document
    Repo-->>Svc: Task object

    Svc->>Bus: publish("task:created", task)
    Bus->>Bus: fan out to all subscribers
    Bus-->>SSE: notify(assigneeId, task)
    Bus-->>DB: AuditService.log(action, actor)

    SSE-->>Other: event: task_assigned\ndata: {...}
    Other->>Other: UI updates live (no refresh)

    Svc-->>API: Task
    API-->>User: 201 { success: true, data: task }
    User->>User: Optimistic UI update on Kanban
```

---

## Auth & Role Flow

```mermaid
flowchart LR
    A["User Signs Up via Clerk"] --> B{Clerk Webhook}
    B --> C["POST /api/webhooks/clerk"]
    C --> D["Create User in PostgreSQL with default Member role"]

    E[User Logs In] --> F[Clerk Session Token]
    F --> G[Every API Request]
    G --> H{"Check Role in PostgreSQL"}
    H -->|Admin| I[Full Access]
    H -->|Manager| J[Projects + Team]
    H -->|Member| K[Tasks + Read]
    H -->|Viewer| L[Read Only]

    M[Admin Panel] --> N[Change User Role]
    N --> O[PostgreSQL UPDATE]
    O --> P["Takes effect immediately on next request"]
```

---

## Features

### Kanban Board
Drag tasks between columns with smooth animations. Optimistic updates mean the card moves instantly — the API call happens in the background.

```
┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐
│    TODO     │  │ IN PROGRESS  │  │    REVIEW    │  │    DONE     │
├─────────────┤  ├──────────────┤  ├──────────────┤  ├─────────────┤
│ 📋 Task A  │  │ 🔨 Task B   │  │ 👀 Task C   │  │ ✅ Task D  │
│ High · 2d  │──▶ Medium · 1d │  │ Low · done  │  │ Completed  │
├─────────────┤  ├──────────────┤  └──────────────┘  └─────────────┘
│ 📋 Task E  │  │              │
│ Low · 5d   │  └──────────────┘
└─────────────┘
        drag and drop any card to any column ↑
```

### AI Assistant (KS Assistant)
The chatbot in the bottom-right corner knows everything about the app. When you have a Gemini API key, it uses Gemini 2.0 Flash with a comprehensive system prompt. Without a key, it falls back to smart keyword-based responses — the app never breaks.

**What the AI can do:**
- Break down complex tasks into sub-tasks automatically
- Predict how long a task will take based on similar past work
- Analyze team workload and flag imbalances
- Answer any question about using the app

### Role-Based Access Control

| Permission | Admin | Manager | Member | Viewer |
|------------|:-----:|:-------:|:------:|:------:|
| Manage users & roles | ✅ | — | — | — |
| Create/delete projects | ✅ | ✅ | — | — |
| Create/update tasks | ✅ | ✅ | ✅ | — |
| Assign tasks to others | ✅ | ✅ | — | — |
| View analytics | ✅ | ✅ | ✅ | ✅ |
| Export reports | ✅ | ✅ | ✅ | — |
| Manage team members | ✅ | ✅ | — | — |

### Real-Time Updates (SSE)
When any user creates, moves, or completes a task, all other users with that project open see the change live. Built with Server-Sent Events — compatible with Vercel's serverless platform (no WebSocket server needed).

### Analytics Dashboard
Six chart types powered by Recharts:
- **Pie chart** — task status distribution
- **Bar chart** — tasks per project
- **Area chart** — completion trend over 7 days
- **Line chart** — productivity score
- **Progress bars** — per-project progress
- **Workload heatmap** — team member load

---

## Tech Stack

| What | Technology | Why |
|------|-----------|-----|
| Framework | Next.js 15 App Router | Full-stack, file-based routing, server components |
| Language | TypeScript 5 | Type safety from DB to UI |
| Styling | Tailwind CSS 4 | Utility-first, dark mode built in |
| UI | Lucide React, Framer Motion | Beautiful icons + smooth animations |
| Auth | Clerk | Handles email, OAuth, sessions, webhooks |
| RBAC DB | PostgreSQL + Prisma | Transactional role changes, relational integrity |
| Content DB | MongoDB + Mongoose | Flexible schemas for tasks, comments, activity |
| Cache | Redis (Upstash) | Rate limiting, optional response caching |
| AI | Gemini 2.0 Flash | Fast, free-tier available, multimodal |
| Kanban DnD | @dnd-kit | Accessible drag-and-drop, mobile-friendly |
| Charts | Recharts | Declarative, composable, responsive |
| Testing | Jest + Testing Library | Unit tests for RBAC, validation, services |
| CI/CD | GitHub Actions → Vercel | Type check → lint → test → build → deploy |
| DevOps | Docker Compose | 6-service local stack |

---

## Quick Start

### Option A — Local (5 minutes)

```bash
# 1. Clone
git clone https://github.com/Shefwef/kaj-shohayok.git
cd kaj-shohayok
npm install

# 2. Set up environment
cp .env.example .env
# Fill in your values (see Environment Variables below)

# 3. Run database migrations (PostgreSQL)
npx prisma migrate dev

# 4. Start
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Option B — Docker (everything in one command)

```bash
docker compose up -d
```

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| PostgreSQL admin (Adminer) | http://localhost:8080 |
| MongoDB admin (Mongo Express) | http://localhost:8081 |

---

## Environment Variables

Create a `.env` file (Prisma reads this, not `.env.local`):

```bash
# PostgreSQL — local or Neon free tier
DATABASE_URL="postgresql://user:password@localhost:5432/kaj_shohayok"

# MongoDB — local or Atlas M0 free tier
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/kaj_shohayok"

# Clerk — get from dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Gemini AI — optional, get from aistudio.google.com/app/apikey
# Without this the AI features use smart fallback responses
GEMINI_API_KEY="AIza..."

# Upstash Redis — optional, falls back to in-memory
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## Deploy to Vercel

### Free Cloud Stack

| Service | Provider | Free Tier |
|---------|----------|-----------|
| App hosting | [Vercel](https://vercel.com) | Unlimited hobby projects |
| PostgreSQL | [Neon](https://neon.tech) | 0.5 GB storage |
| MongoDB | [MongoDB Atlas](https://mongodb.com/atlas) | 512 MB storage |
| Redis | [Upstash](https://upstash.com) | 10,000 requests/day |
| Auth | [Clerk](https://clerk.com) | 10,000 MAU |
| AI | [Gemini 2.0 Flash](https://aistudio.google.com) | 1M tokens/day |

### Live Deployment

**[https://kaj-shohayok.vercel.app](https://kaj-shohayok.vercel.app)**

### Steps

**1.** Push your repo to GitHub  
**2.** Go to [vercel.com](https://vercel.com) → New Project → Import your repo  
**3.** Add all environment variables in the Vercel dashboard  
**4.** Click Deploy  
**5.** After deploy, run the DB migration once:

```bash
npx vercel env pull .env.local
npx prisma migrate deploy
```

### Automatic deploys via CI/CD

Every push to `main` runs this pipeline automatically:

```
push to main
    ↓
Type Check (tsc)
    ↓
Lint (ESLint)
    ↓
Unit Tests (Jest)
    ↓
Build (next build)
    ↓
Deploy to Vercel
```

Add these GitHub Secrets to enable the full pipeline:
- `VERCEL_TOKEN` — from Vercel account settings
- `VERCEL_ORG_ID` — from Vercel project settings
- `VERCEL_PROJECT_ID` — from Vercel project settings
- All env vars from the table above

---

## Getting Admin Access

New users are assigned the **Member** role by default. To grant yourself Admin:

```sql
-- Run this in pgAdmin or psql
UPDATE "User"
SET "roleId" = (SELECT id FROM "Role" WHERE name = 'admin')
WHERE "clerkId" = 'your_clerk_user_id';
```

Find your Clerk user ID: go to [dashboard.clerk.com](https://dashboard.clerk.com) → Users → click your account.

---

## API Reference

```
# System
GET  /api/health                      Health check (DB + services)

# Projects
GET  /api/projects                    List accessible projects
POST /api/projects                    Create project
GET  /api/projects/:id                Get project + kanban data
PUT  /api/projects/:id                Update project
DELETE /api/projects/:id              Delete project

# Tasks
GET  /api/tasks                       List tasks (with filters)
POST /api/tasks                       Create task
GET  /api/tasks/:id                   Get task detail
PUT  /api/tasks/:id                   Update task (status, priority, etc.)
DELETE /api/tasks/:id                 Delete task
GET  /api/tasks/:id/comments          Get task comments
POST /api/tasks/:id/comments          Add comment
GET  /api/tasks/:id/activity          Activity log

# AI Features
POST /api/ai/task-assist              Break down a task into sub-tasks
POST /api/ai/predict-completion       Estimate completion time
GET  /api/ai/workload                 Analyze team workload balance
POST /api/ai/search                   Semantic task search
POST /api/chat                        KS Assistant chatbot

# Analytics & Reports
GET  /api/analytics                   Dashboard stats + charts data
GET  /api/reports?format=csv          Generate report (csv/json)
GET  /api/export?type=tasks&format=csv  Raw data export

# Real-Time
GET  /api/events                      SSE stream (connect once, receive updates)
GET  /api/notifications               List unread notifications
PATCH /api/notifications              Mark notifications as read

# Users & Auth
GET  /api/users/me                    Current user profile + role
POST /api/sync-users                  Sync Clerk users to PostgreSQL
```

Full Postman collection: [KajShohayok_API_Collection.json](./KajShohayok_API_Collection.json)

---

## Project Structure

```
kaj-shohayok/
├── src/
│   ├── app/
│   │   ├── api/                    All API routes
│   │   │   ├── ai/                 AI endpoints (assist, predict, workload, search)
│   │   │   ├── analytics/          Dashboard data
│   │   │   ├── chat/               KS Assistant chatbot
│   │   │   ├── events/             SSE real-time stream
│   │   │   ├── export/             Raw CSV/JSON export
│   │   │   ├── projects/[id]/      Project CRUD + kanban
│   │   │   ├── tasks/[id]/         Task CRUD + comments + activity
│   │   │   └── webhooks/clerk/     Clerk user sync webhook
│   │   ├── dashboard/
│   │   │   ├── analytics/          Charts page
│   │   │   ├── projects/[id]/      Kanban board page
│   │   │   ├── reports/            Report generator
│   │   │   ├── tasks/              Task list + filters
│   │   │   └── admin/              User & role management
│   │   └── page.tsx                Landing page
│   │
│   ├── components/
│   │   ├── ai/                     AITaskAssist panel
│   │   ├── chat/                   KS Assistant chatbot (floating)
│   │   ├── dashboard/              Stats, QuickActions, RecentActivity
│   │   ├── kanban/                 KanbanBoard + SortableTaskCard
│   │   └── layout/                 Sidebar, Header, DashboardLayout
│   │
│   ├── lib/
│   │   ├── container.ts            Dependency injection wiring
│   │   ├── EventBus.ts             Observer pattern for side effects
│   │   ├── errors.ts               Custom error hierarchy
│   │   ├── permissions.ts          RBAC definitions + checks
│   │   └── validations/            Zod schemas for all inputs
│   │
│   ├── repositories/               Data access — one per entity
│   │   ├── TaskRepository.ts
│   │   ├── ProjectRepository.ts
│   │   └── AuditRepository.ts
│   │
│   └── services/                   Business logic — orchestrates repos
│       ├── TaskService.ts
│       ├── AIService.ts
│       ├── AuditService.ts
│       ├── NotificationService.ts
│       └── ReportService.ts
│
├── prisma/
│   ├── schema.prisma               PostgreSQL schema (Users, Roles, Orgs)
│   └── migrations/                 Migration history
│
├── tests/unit/                     Jest tests (RBAC, validation, EventBus)
├── docker-compose.yml              6-service local stack
└── .github/workflows/ci.yml        GitHub Actions pipeline
```

---

## Available Scripts

```bash
npm run dev            # Start dev server (Turbopack — fast HMR)
npm run build          # Production build
npm run start          # Production server
npm run lint           # ESLint
npm run type-check     # TypeScript check (no output files)
npm test               # Jest unit tests
npm run test:coverage  # Coverage report
npm run test:watch     # Watch mode for TDD
```

---

## Design Decisions

**Why two databases?**
PostgreSQL handles RBAC because role changes need ACID transactions — you don't want a race condition that accidentally gives someone admin. MongoDB handles tasks and projects because they benefit from flexible schemas (different task types have different fields) and MongoDB's aggregation pipeline makes analytics queries simpler.

**Why SSE instead of WebSockets?**
Vercel's serverless functions don't support persistent WebSocket connections. SSE works perfectly for one-way server-to-client updates and is natively supported by browsers. For a task management tool where "someone updated a card" is the main real-time event, SSE is more than enough.

**Why Gemini 2.0 Flash?**
It's fast, cheap, has a generous free tier (1M tokens/day), and supports function calling and multimodal inputs — which means future features like "extract tasks from this screenshot" are possible without changing the AI provider.

**Why the Repository → Service → API pattern?**
Each layer has one job. Repositories only care about reading/writing data. Services only care about business rules. API routes only care about HTTP. Adding a new feature (say, Slack notifications) means adding one new subscriber to the EventBus — zero changes to the service layer.

---

*Built by [Shefwef](https://github.com/Shefwef) · Next.js 15 · Gemini 2.0 Flash · PostgreSQL + MongoDB*
