import { type KnowledgeDoc, buildIndex } from "./bm25";

const DOCS: KnowledgeDoc[] = [
  {
    id: "create-project",
    keywords:
      "create new project add project start project how project make project setup project",
    response:
      'To create a project: go to **Projects** in the sidebar → click **New Project** → fill in the name, description, priority (Low / Medium / High / Critical), start date, and end date. Each project automatically gets its own Kanban board.',
  },
  {
    id: "create-task",
    keywords:
      "create task add task new task make task how task assign task due date priority",
    response:
      'To create a task: click **Tasks** in the sidebar → **New Task** (or use **Add Task** inside any project). You can set the title, description, status, priority, assignee, and due date. After saving, the task appears on the Kanban board under the status column you chose.',
  },
  {
    id: "kanban",
    keywords:
      "kanban board drag drop move task column todo in progress review done status board",
    response:
      'Open any project to see the **Kanban board** with four columns: **Todo → In Progress → Review → Done**. Drag any task card to a different column to update its status instantly — changes save automatically in real time.',
  },
  {
    id: "dark-mode",
    keywords:
      "dark mode light mode theme toggle switch night mode color theme appearance",
    response:
      'Toggle dark mode with the **Moon / Sun icon** at the bottom of the left sidebar. The preference is saved automatically in your browser — it also respects your OS system theme on first load.',
  },
  {
    id: "roles-permissions",
    keywords:
      "role permission access admin manager member viewer rbac who can what privilege",
    response:
      "There are **4 roles**:\n• **Admin** — full access: manage users, roles, all projects and tasks\n• **Manager** — create projects, assign tasks, manage team members, view analytics\n• **Member** — create and update tasks, read projects, view analytics\n• **Viewer** — read-only access to everything\n\nAdmins assign roles from the **Admin panel** in the sidebar.",
  },
  {
    id: "admin-access",
    keywords:
      "admin access how get admin role first user upgrade privilege admin panel",
    response:
      "New users get the **Member** role by default. To become Admin:\n1. An existing Admin can change your role in the **Admin panel → Users**\n2. If you're the first user, run this SQL in pgAdmin:\n```sql\nUPDATE \"User\" SET \"roleId\" = (SELECT id FROM \"Role\" WHERE name = 'admin') WHERE \"clerkId\" = 'YOUR_CLERK_ID';\n```\nFind your Clerk ID at dashboard.clerk.com → Users.",
  },
  {
    id: "analytics",
    keywords:
      "analytics chart graph stats statistics productivity completion trend overview data",
    response:
      'The **Analytics** page (sidebar) shows six chart types: project status pie chart, tasks-per-project bar chart, 7-day completion area chart, productivity line chart, per-project progress bars, and a team workload heatmap. All charts update in real time as tasks move.',
  },
  {
    id: "reports",
    keywords:
      "report export download csv json data export report generate report file",
    response:
      'Go to **Reports** in the sidebar to generate a formatted summary or team report. Choose the type, select CSV or JSON format, then click **Generate & Download**. For raw data, use **Export** buttons which download tasks or projects as CSV/JSON directly.',
  },
  {
    id: "ai-features",
    keywords:
      "ai artificial intelligence gemini suggest task breakdown predict completion workload search smart",
    response:
      '**AI features** in Kaj Shohayok:\n• **AI Suggest** (task creation) — Gemini breaks the task into sub-tasks, estimates hours, and flags potential blockers\n• **Predict Completion** — estimates when a task will be done based on complexity\n• **Workload Analysis** — flags team members who are overloaded\n• **Semantic Search** — find tasks by meaning, not just exact keywords\n• **KS Assistant (this chatbot)** — guides you through any feature\n\nAI features need a GEMINI_API_KEY in your .env file. Without it, smart fallback responses are used.',
  },
  {
    id: "notifications",
    keywords:
      "notification bell alert unread notification assigned task update live real time",
    response:
      'Click **Notifications** (bell icon) in the sidebar to see all your alerts — task assignments, status changes, comments. The app uses **Server-Sent Events** so notifications arrive live without refreshing the page. You can mark all as read with one click.',
  },
  {
    id: "sign-in-sign-up",
    keywords:
      "sign in sign up login register account create account password forgot login auth",
    response:
      'Use the **Sign In** or **Get Started** buttons on the landing page. Authentication is handled by **Clerk** — supports email/password and social login (Google, GitHub). After signing in, you\'re redirected to the Dashboard automatically.',
  },
  {
    id: "voice-input",
    keywords:
      "voice microphone speech speak talk dictate voice input voice to text speech recognition",
    response:
      'Kaj Shohayok supports **voice input** for task creation and this chatbot. Click the **microphone icon** next to the task title or description field, speak your task naturally, and the text appears automatically. Voice recognition uses your browser\'s built-in Web Speech API — no external service or internet connection needed. Works best in Chrome and Edge.',
  },
  {
    id: "docker",
    keywords:
      "docker compose local setup run locally container database local development",
    response:
      'Run the full stack locally with **Docker**:\n```bash\ndocker compose up -d\n```\nThis starts: Next.js app (port 3000), PostgreSQL, MongoDB, Redis, Adminer (port 8080), and Mongo Express (port 8081). No extra setup needed — databases are pre-configured.',
  },
  {
    id: "vercel-deploy",
    keywords:
      "deploy vercel production live deployment host cloud environment variables",
    response:
      'To deploy to Vercel:\n1. Push to GitHub → import at vercel.com/new\n2. Add environment variables (DATABASE_URL, MONGODB_URI, Clerk keys, GEMINI_API_KEY)\n3. Click Deploy\n4. After first deploy, run: `npx prisma migrate deploy` once\n\nEvery subsequent push to `main` triggers automatic deploy via GitHub Actions.',
  },
  {
    id: "dashboard",
    keywords:
      "dashboard home overview stats recent activity quick actions summary",
    response:
      'The **Dashboard** is your home page after login. It shows:\n• **Stats row** — total projects, active tasks, completion rate, upcoming deadlines\n• **Quick Actions** — one-click shortcuts to create projects, tasks, view analytics\n• **Recent Projects** — your latest projects with progress bars\n• **Recent Tasks** — your most recently created tasks with status badges',
  },
];

export const knowledgeIndex = buildIndex(DOCS);
