# Kaj Shohayok — Complete Project Documentation

> Full technical reference for the Kaj Shohayok Enterprise Task Management Platform.

---

## Table of Contents

1. [What is Kaj Shohayok?](#1-what-is-kaj-shohayok)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Database Design](#4-database-design)
5. [RBAC Permission System](#5-rbac-permission-system)
6. [API Reference](#6-api-reference)
7. [AI Features](#7-ai-features)
8. [Real-Time Events (SSE)](#8-real-time-events-sse)
9. [Clean Architecture Layers](#9-clean-architecture-layers)
10. [Frontend Features](#10-frontend-features)
11. [Reporting & Export](#11-reporting--export)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [Test Suite](#13-test-suite)
14. [Environment Variables](#14-environment-variables)
15. [Deployment Guide](#15-deployment-guide)
16. [Docker Setup](#16-docker-setup)
17. [QA Testing Guide](#17-qa-testing-guide)

---

## 1. What is Kaj Shohayok?

**Kaj Shohayok** (Bengali: "Task Helper") is an enterprise-grade, full-stack task management platform built with Next.js 15, TypeScript, and a dual-database architecture. It is designed to demonstrate production-level engineering practices including:

- Role-Based Access Control (RBAC) with 4 hierarchical roles
- Dual-database design: PostgreSQL for relational RBAC data + MongoDB for flexible document storage
- Redis for caching, rate limiting, and pub/sub real-time messaging
- Google Gemini AI integration for task analysis, completion prediction, and workload balancing
- Real-time updates via Server-Sent Events (SSE)
- Clean Architecture: Repository → Service → API Route layers
- Observer pattern EventBus for decoupled side effects
- Factory Pattern for multi-format report generation
- GitHub Actions CI/CD pipeline
- Dark mode with `next-themes`
- Drag-and-drop Kanban board with `@dnd-kit`

---

## 2. Architecture Overview

### Three-Tier Architecture

```
┌────────────────────────────────────────────────────┐
│               Presentation Layer                    │
│   Next.js 15 App Router — Pages & API Routes        │
│   (No business logic — only request/response)       │
├────────────────────────────────────────────────────┤
│               Service Layer                         │
│   TaskService, AuditService, NotificationService    │
│   AIService, ReportService                          │
│   (All business rules, orchestration, side-effects) │
├────────────────────────────────────────────────────┤
│              Repository Layer                       │
│   TaskRepository, ProjectRepository, AuditRepository│
│   (All DB queries — Prisma ORM + Mongoose)          │
└────────────────────────────────────────────────────┘
```

### Request Flow — Task Status Change

```
1. User drags a Kanban card to a new column
2. PUT /api/tasks/[id]  →  { status: "done" }
3. Clerk JWT validated by middleware
4. TaskService.updateTask() called:
   a. TaskRepository.findById()  →  Mongoose  →  MongoDB
   b. Business rule check (is it the same status?)
   c. TaskRepository.update()   →  Mongoose  →  MongoDB
   d. In parallel (Promise.all):
      - AuditService.log(TASK_STATUS_CHANGED)  →  AuditRepository  →  MongoDB
      - NotificationService.notifyStatusChange() →  Notification model  →  MongoDB
      - EventBus.publish("task:updated")  →  all subscribers
5. KanbanBoard receives optimistic update instantly
6. SSE event pushes update to all connected clients on that project
```

### Request Flow — AI Task Assist

```
1. User clicks "AI Suggest" on a task
2. POST /api/ai/task-assist  →  { taskTitle, description, projectContext }
3. AIService.getTaskAssistance() called:
   - Builds structured prompt with task context
   - Calls Google Gemini 2.0 Flash REST API
   - Parses JSON response, validates shape
   - Falls back to deterministic mock if API unavailable
4. Response: { subtasks[], priority, estimatedHours, blockers[], confidence }
5. AITaskAssist component renders result with animations
```

---

## 3. Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 15.5.4 | Full-stack React framework with App Router |
| Language | TypeScript | 5.x | Type safety throughout |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Auth | Clerk | 6.x | Authentication + user management |
| ORM | Prisma | 6.x | PostgreSQL queries (RBAC data) |
| ODM | Mongoose | 8.x | MongoDB queries (projects/tasks) |
| State | TanStack Query | 5.x | Server state + caching |
| Forms | React Hook Form + Zod | 7.x / 4.x | Form management + validation |
| Charts | Recharts | 3.x | Analytics visualizations |
| Drag & Drop | @dnd-kit | 6/10 | Kanban board |
| Animations | Framer Motion | 13.x | UI transitions |
| Dark mode | next-themes | 0.4.x | Theme switching |
| AI | Google Gemini 2.0 Flash | REST | Task analysis + prediction |
| Real-time | Server-Sent Events | Native | Live updates |
| Rate Limiting | Custom in-memory | — | API protection |
| Logging | Custom structured logger | — | Structured JSON logs |
| Testing | Jest + Testing Library | — | Unit + integration tests |
| CI/CD | GitHub Actions | — | Automated pipeline |
| Deployment | Vercel | — | Edge-optimized hosting |

---

## 4. Database Design

### PostgreSQL (Prisma) — Relational / Identity Data

Used for data that needs strong consistency, foreign keys, and relational integrity.

```
User           → clerkId (unique), email, firstName, lastName, roleId, organizationId
Role           → name, permissions (JSON), organizationId
Organization   → name, slug (unique), settings (JSON)
AuditLog       → userId, action, resourceType, resourceId, details, ipAddress, createdAt
```

**Why PostgreSQL here?** RBAC permissions need transactional guarantees. A user's role change must be atomic — either fully applied or not at all.

### MongoDB (Mongoose) — Document / Flexible Data

Used for data that is written frequently, queried with varied shapes, and benefits from flexible schemas.

```
Project    → name, description, status, priority, ownerId, teamMembers[], tags[], progress
Task       → title, description, status, priority, projectId, assigneeId, dueDate, dependencies[]
Notification → userId, type, title, message, data, read
Comment    → taskId, authorId, authorName, content
AuditLogV2 → actor, action, target, targetType, metadata, timestamp (append-only)
```

**Why MongoDB here?** Tasks and projects have varying schemas (different metadata per project type). Analytics queries benefit from MongoDB's aggregation pipeline. Audit logs are append-only — MongoDB's write-optimized storage is ideal.

### Redis — Cache & Pub/Sub

- API rate limiting (per-IP token buckets)
- Session cache
- SSE pub/sub (production scale with Upstash)

---

## 5. RBAC Permission System

Four roles with a strict permission hierarchy:

| Permission | Admin | Manager | Member | Viewer |
|-----------|-------|---------|--------|--------|
| create:project | ✅ | ✅ | ❌ | ❌ |
| read:project | ✅ | ✅ | ✅ | ✅ |
| update:project | ✅ | ✅ | ❌ | ❌ |
| delete:project | ✅ | ❌ | ❌ | ❌ |
| create:task | ✅ | ✅ | ✅ | ❌ |
| read:task | ✅ | ✅ | ✅ | ✅ |
| update:task | ✅ | ✅ | ✅ | ❌ |
| delete:task | ✅ | ❌ | ❌ | ❌ |
| assign:task | ✅ | ✅ | ❌ | ❌ |
| view:analytics | ✅ | ✅ | ✅ | ✅ |
| manage:users | ✅ | ✅ | ❌ | ❌ |
| manage:roles | ✅ | ❌ | ❌ | ❌ |

**Implementation:** `src/lib/permissions.ts` — every API route calls `hasPermission()` before executing any business logic. Permissions are stored as a JSON array on the Role model in PostgreSQL.

---

## 6. API Reference

All API routes are under `/api/`. Authentication is required unless marked `[public]`.

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List projects (paginated, filterable) |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/[id]` | Get project details |
| PUT | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List tasks (filters: status, priority, assigneeId, projectId, search) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/[id]` | Get task details |
| PUT | `/api/tasks/[id]` | Update task (includes status change for Kanban) |
| DELETE | `/api/tasks/[id]` | Delete task |
| GET | `/api/tasks/[id]/comments` | Get task comments |
| POST | `/api/tasks/[id]/comments` | Add comment |
| GET | `/api/tasks/[id]/activity` | Get task audit history |

### AI Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/task-assist` | AI task breakdown + priority recommendation |
| POST | `/api/ai/predict-completion` | Predict days to complete a task |
| GET | `/api/ai/workload` | Team workload imbalance analysis |
| POST | `/api/ai/search` | Semantic search across tasks (NLP) |

### Analytics & Reporting
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/analytics` | Dashboard analytics (projects + tasks + productivity) |
| GET | `/api/reports` | Generate report (format: csv/json, type: summary/team) |
| GET | `/api/export` | Raw export (type: tasks/projects, format: csv/json) |

### Real-Time
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/events` | SSE stream for real-time updates |
| GET | `/api/notifications` | Get unread notifications |
| PATCH | `/api/notifications` | Mark notifications read |

### Auth & Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List users |
| GET | `/api/users/me` | Current user profile |
| POST | `/api/sync-users` | Sync Clerk users to database |
| POST | `/api/webhooks/clerk` | Clerk webhook handler |

### System
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/health` | Full health check with DB status | [public] |

---

## 7. AI Features

### AI Task Assistant (`POST /api/ai/task-assist`)

Given a task title and optional description/context, returns:
- `subtasks[]` — 3–5 concrete subtask breakdowns
- `priority` — recommended priority level (low/medium/high/urgent)
- `estimatedHours` — time estimate
- `blockers[]` — potential blockers to watch out for
- `confidence` — how confident the model is (low/medium/high)
- `reasoning` — brief explanation

**Fallback:** If `GEMINI_API_KEY` is not set, a deterministic mock response is returned so the UI still works without the API key.

### Completion Prediction (`POST /api/ai/predict-completion`)

Factors used:
- Assignee's completed tasks in the last 30 days
- Average completion time for past tasks
- Current active task count (workload factor)
- Task priority (priority factor)

Returns `estimatedDays`, `confidence`, `reasoning`.

### Workload Imbalance Detection (`GET /api/ai/workload`)

Scans all tasks across accessible projects, groups by assignee, and flags team members with significantly above-average active task counts. Returns alerts with suggestions for redistribution.

### Semantic Search (`POST /api/ai/search`)

Natural language query against all accessible tasks. Example queries:
- "find overdue authentication tasks"
- "what tasks are blocked on the API?"
- "tasks assigned to me that are in review"

---

## 8. Real-Time Events (SSE)

`GET /api/events` — Server-Sent Events stream, one per authenticated user.

The client connects once via `useRealtimeEvents()` hook. Events are pushed whenever:

| Event | Trigger |
|-------|---------|
| `task:created` | New task created in user's project |
| `task:updated` | Task status/assignment changed |
| `task:assigned` | Task assigned to user |
| `task:deleted` | Task deleted |
| `comment:added` | Comment added on user's task |
| `connected` | Initial connection confirmation |

The Kanban board listens for `task:updated` events and can invalidate its cache or re-fetch to reflect changes from other users.

**Production scaling:** For multi-instance deployments, replace the in-memory `clients` map in `src/app/api/events/route.ts` with Upstash Redis pub/sub. Each instance subscribes to a Redis channel and pushes SSE to its local connected clients.

---

## 9. Clean Architecture Layers

### Repository Layer (`src/repositories/`)

Pure data access — no business logic.

```typescript
// TaskRepository — example methods
findById(id)
findByProject(projectId, filters)
findByUser(userId, filters)
findOverdue(projectIds)
create(data)
update(id, data)
delete(id)
getAssigneeStats(projectIds)   // for workload analysis
getCompletionStats(assigneeId) // for AI prediction
```

### Service Layer (`src/services/`)

All business rules and orchestration.

```typescript
// TaskService
createTask(data, actorId)    // validate access, create, audit, notify
updateTask(id, data, actorId) // validate, update, emit events, audit
deleteTask(id, actorId)       // validate, delete, audit
assignTask(id, assigneeId, actorId) // check not completed, update, notify
```

### DI Container (`src/lib/container.ts`)

Single place to wire up all repositories and services. No `new` inside business code — everything injected via constructor.

### EventBus (`src/lib/EventBus.ts`)

Observer pattern. Services publish events (`task:created`, `task:updated`) and subscribers react (socket emit, audit log, analytics refresh) without coupling.

### Logger (`src/lib/logger.ts`)

Structured logging to stdout. In production, outputs JSON lines for log aggregation (Datadog, Papertrail, Vercel logs). In development, pretty-printed with context fields.

```typescript
logger.info({ taskId, actorId }, "Task assigned")
logger.error({ err, taskId }, "Failed to update task")
```

---

## 10. Frontend Features

### Kanban Board (dnd-kit)

- **Location:** Project detail page (`/dashboard/projects/[id]`)
- **4 columns:** To Do → In Progress → Review → Done
- **Drag & drop** moves tasks between columns with optimistic updates
- **DragOverlay** shows a floating card while dragging (rotated, shadow)
- **Framer Motion** animates card entry/exit
- **Revert on failure:** if the API call fails, the task snaps back to its original column
- **Toggle** between Kanban and List view

### Analytics Dashboard (Recharts)

- **Location:** `/dashboard/analytics`
- Pie charts for project status and task status distribution
- Area chart for productivity trend (7-day)
- Bar chart for priority breakdown
- Line chart for daily performance
- SVG gauge for overall completion rate

### Dark Mode (next-themes)

- System preference detection on first load
- Toggle button in the sidebar (Sun/Moon icon)
- Persistent across page refreshes (`localStorage`)
- All UI components support `dark:` variants

### AI Task Assistant Component

- **Location:** `src/components/ai/AITaskAssist.tsx`
- Appears on task detail views
- Lazy-loads AI suggestion on first click
- Animated expand/collapse with Framer Motion
- Subtask checklist, priority badge, estimated hours, blocker list

---

## 11. Reporting & Export

### Reports Dashboard (`/dashboard/reports`)

Generate and download reports in CSV or JSON format.

| Report Type | Contents |
|-------------|----------|
| Project Summary | Task counts by status, completion rate, overdue list, project list |
| Team Report | Same data, labelled as team-oriented |

### Factory Pattern

```
ReportFactory.create("csv")  →  CSVReportGenerator
ReportFactory.create("json") →  JSONReportGenerator
```

Both implement `IReportGenerator` interface with `generate(data): string`.

Adding a new format (e.g., XLSX) means adding one new class that implements `IReportGenerator` — no changes to the API route.

### Quick Exports (`/api/export`)

Direct raw export of tasks or projects, without report formatting.

---

## 12. CI/CD Pipeline

File: `.github/workflows/ci.yml`

### Jobs

| Job | Trigger | Steps |
|-----|---------|-------|
| `quality` | Every push/PR | `npm ci` → `prisma generate` → `tsc --noEmit` → `eslint` → `jest --coverage` |
| `build` | After quality passes | `npm ci` → `prisma generate` → `next build` |
| `deploy` | Push to `main` only | Vercel production deploy |

### Required GitHub Secrets

| Secret | Value |
|--------|-------|
| `DATABASE_URL` | Neon PostgreSQL URL |
| `MONGODB_URI` | MongoDB Atlas URI |
| `CLERK_PK` | Clerk publishable key |
| `CLERK_SK` | Clerk secret key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `VERCEL_TOKEN` | Vercel account token |
| `VERCEL_ORG_ID` | Vercel org ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

---

## 13. Test Suite

Files: `tests/unit/`

### What's tested

| File | Coverage |
|------|----------|
| `permissions.test.ts` | RBAC matrix — all role/permission combinations |
| `task-status.test.ts` | Status color utilities, status transition business rules |
| `validation.test.ts` | Zod schema validation for projects and tasks, custom error classes, EventBus pub/sub |

### Running tests

```bash
npm test                    # run all tests
npm run test:coverage       # with coverage report
npm run test:watch          # watch mode
```

### Coverage target

70% line coverage on `src/lib/`, `src/services/`, `src/repositories/`.

---

## 14. Environment Variables

See [`.env.example`](.env.example) for the full annotated list.

### Minimum required for the app to start

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Neon / local PostgreSQL |
| `MONGODB_URI` | Atlas / local MongoDB |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard |
| `CLERK_SECRET_KEY` | Clerk dashboard |

### Optional (graceful degradation if missing)

| Variable | Effect if missing |
|----------|------------------|
| `GEMINI_API_KEY` | AI endpoints return mock/fallback responses |
| `REDIS_URL` / `UPSTASH_REDIS_REST_URL` | Rate limiting uses in-memory store |
| `CLERK_WEBHOOK_SECRET` | Webhook endpoint returns 400 |

---

## 15. Deployment Guide

### Deploy to Vercel (recommended)

1. Push repository to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Set all environment variables in Vercel dashboard
4. Click **Deploy**

Vercel auto-detects Next.js and configures edge functions, CDN, and preview deployments.

### After deploy

```bash
# Run database migrations against Neon
npx prisma migrate deploy

# Seed roles and default organization
node scripts/seed.js   # (create this if needed)
```

### Custom server (Docker)

See [Section 16](#16-docker-setup) for the 6-service Docker Compose setup.

---

## 16. Docker Setup

The `docker-compose.yml` defines 6 services:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | postgres:15-alpine | 5432 | PostgreSQL for RBAC |
| `mongodb` | mongo:7-jammy | 27017 | MongoDB for tasks/projects |
| `redis` | redis:7-alpine | 6379 | Cache + rate limiting |
| `app` | Custom (multi-stage) | 3000 | Next.js app |
| `adminer` | adminer:latest | 8080 | PostgreSQL admin UI |
| `mongo-express` | mongo-express | 8081 | MongoDB admin UI |

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f app

# Stop everything
docker compose down

# Reset all data (destructive!)
docker compose down -v
```

### Run database migrations in Docker

```bash
docker compose exec app npx prisma migrate deploy
```

---

## 17. QA Testing Guide

Follow these steps to verify every feature after setup.

### Prerequisites

- App running at `http://localhost:3000` (or your live URL)
- At least one user signed in via Clerk
- PostgreSQL and MongoDB connected (check `/api/health`)

---

### Step 1 — Health Check

```
GET http://localhost:3000/api/health
```
Expect:
- `status: "healthy"`
- `databases.postgres.connected: true`
- `databases.mongodb.connected: true`
- `services.clerk.status: "healthy"`

---

### Step 2 — Authentication

1. Open the app in an incognito window
2. You should be redirected to `/sign-in`
3. Sign up with a new email
4. You should land on `/dashboard`

---

### Step 3 — Projects CRUD

1. Navigate to **Projects** → **New Project**
2. Fill in name, description, priority, start date → Submit
3. Verify the project appears in the list
4. Click the project → verify project detail page loads
5. Verify progress bar shows 0%

---

### Step 4 — Kanban Board

1. Open a project detail page
2. Click **Add Task** → create tasks with different statuses
3. Drag a task card from **To Do** to **In Progress**
4. Verify the card moves and the API call succeeds (no error alert)
5. Toggle to **List view** using the view switcher
6. Verify all tasks appear in list format

---

### Step 5 — Task Features

1. Create a task with a due date in the past
2. Verify a red clock/overdue indicator appears on the Kanban card
3. Add a comment via `/api/tasks/[id]/comments` (or Postman)
4. Verify the activity log via `/api/tasks/[id]/activity`

---

### Step 6 — AI Task Assistant

1. Go to any task detail
2. Click **AI Suggest**
3. Verify the panel animates open
4. Check that subtasks, priority, estimated hours, and blockers are shown
5. If `GEMINI_API_KEY` is not set: verify mock response is returned (not an error)

---

### Step 7 — AI Prediction

```
POST /api/ai/predict-completion
Body: { "taskTitle": "Implement auth flow", "priority": "high", "assigneeId": "YOUR_CLERK_USER_ID" }
```
Expect: `{ estimatedDays: N, confidence: "...", reasoning: "..." }`

---

### Step 8 — Workload Analysis

```
GET /api/ai/workload
```
Expect: `{ alerts: [], summary: "..." }` (empty alerts if no imbalance)

---

### Step 9 — Analytics Dashboard

1. Navigate to **Analytics**
2. Verify all 4 stat cards show numbers
3. Verify at least 2 charts render (pie/bar/area)
4. Click **Refresh** → data should reload

---

### Step 10 — Reports

1. Navigate to **Reports**
2. Select **Project Summary** + **CSV** → click **Generate & Download**
3. Open the downloaded CSV → verify it has headers and data rows
4. Try **JSON** format → verify valid JSON
5. Use Quick Export: **Tasks (CSV)** → download and open

---

### Step 11 — Dark Mode

1. Click the **Moon** icon in the sidebar
2. Verify the entire UI switches to dark theme
3. Refresh the page → dark mode should persist
4. Click **Sun** icon to switch back

---

### Step 12 — Real-Time Events

1. Open two browser windows with the same project
2. In window 1, drag a task to a new column
3. Refresh window 2 → the task should be in the new column
4. (Full real-time: check browser DevTools → Network → `events` → verify SSE stream is connected)

---

### Step 13 — Export API

```
GET /api/export?type=tasks&format=csv
GET /api/export?type=projects&format=json
```
Verify correct `Content-Disposition` header and file download.

---

### Step 14 — Rate Limiting

Send 10+ rapid requests to any API endpoint:
```bash
for i in {1..15}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/projects; done
```
After the limit, expect `429 Too Many Requests`.

---

### Step 15 — RBAC Enforcement

1. Sign in as a **viewer** role user (assign via Admin panel or database)
2. Try to `POST /api/projects` → expect `403 Forbidden`
3. `GET /api/projects` → expect `200 OK`
4. Try to `DELETE /api/tasks/[id]` → expect `403 Forbidden`

---

### Step 16 — Admin Panel

1. Navigate to **Admin** (requires admin role)
2. Verify user list loads
3. Verify audit log entries appear after mutations

---

*End of QA Guide. All 16 test scenarios passing = production-ready.*
