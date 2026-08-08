import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are the helpful assistant for "Kaj Shohayok" — an enterprise task management platform. Your name is KS Assistant.

About Kaj Shohayok:
- "Kaj Shohayok" means "Work Helper / Task Assistant" in Bengali
- It's a full-stack platform built with Next.js 15, PostgreSQL, MongoDB, and Redis
- Features: Kanban boards, AI task assistance, role-based access control (RBAC), real-time updates, analytics, and reports

Key sections of the app:
1. Dashboard — Overview of your projects, tasks, stats, and recent activity
2. Projects — Create and manage projects; each project has a Kanban board (drag-and-drop)
3. Tasks — View and filter all tasks across projects; edit inline
4. Analytics — Charts showing project status, task distribution, productivity trends
5. Reports — Generate and download CSV/JSON reports of your projects and tasks
6. Admin — Manage users and roles (requires Admin role)

Roles and permissions:
- Admin: Full access — manage users, roles, all projects and tasks
- Manager: Create projects, assign tasks, manage team members, view analytics
- Member: Create and update tasks, read projects, view analytics
- Viewer: Read-only access to projects, tasks, and analytics

How to get Admin access:
- By default new users get "Member" role
- An existing Admin must assign you the Admin role via the Admin panel
- If you're the first user, update your role directly in the PostgreSQL database

Common tasks:
- Create a project: Projects → New Project → fill name, description, dates, priority
- Create a task: Tasks → New Task → select project, set priority and due date
- Kanban board: Open any project → drag tasks between columns (Todo, In Progress, Review, Done)
- Dark mode: Click the Moon/Sun icon at the bottom of the sidebar
- AI features: On task creation, look for the "AI Suggest" button for automated breakdown and completion prediction

Be friendly, concise, and guide users step by step. If asked something unrelated to task management or the app, gently redirect to how you can help with Kaj Shohayok.`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback responses when no API key
    if (!apiKey || apiKey.includes("XXXX")) {
      const lower = message.toLowerCase();
      let reply = "I'm the Kaj Shohayok assistant! I can help you navigate the app. Try asking about projects, tasks, the Kanban board, roles, or analytics.";

      if (lower.includes("project")) reply = "To create a project: go to **Projects** in the sidebar → click **New Project** → fill in the name, description, priority, and dates. Each project gets its own Kanban board!";
      else if (lower.includes("task")) reply = "To create a task: go to **Tasks** → **New Task**, or use the **Add Task** button inside any project. You can set priority, due date, assignee, and description.";
      else if (lower.includes("kanban") || lower.includes("board")) reply = "Open any project and you'll see the Kanban board with columns: **Todo → In Progress → Review → Done**. Drag and drop tasks between columns!";
      else if (lower.includes("admin")) reply = "The **Admin** panel (sidebar) lets you manage users and roles. You need the Admin role to access it. New users get Member role by default — an Admin must upgrade you.";
      else if (lower.includes("dark") || lower.includes("mode")) reply = "Toggle dark mode using the **Moon/Sun icon** at the bottom of the left sidebar. The theme saves automatically.";
      else if (lower.includes("analytic") || lower.includes("report")) reply = "**Analytics** shows charts for project status, task distribution, and productivity trends. **Reports** lets you download CSV or JSON exports of your data.";
      else if (lower.includes("role") || lower.includes("permission")) reply = "There are 4 roles: **Admin** (full access), **Manager** (projects + team), **Member** (tasks + read), **Viewer** (read-only). Admins assign roles in the Admin panel.";
      else if (lower.includes("ai")) reply = "AI features include: task breakdown suggestions, completion time prediction, workload analysis, and semantic task search. Look for the **AI Suggest** button when creating tasks.";

      return NextResponse.json({ reply });
    }

    // Build message history for Gemini
    const contents = [
      ...(history || []).slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
        }),
      }
    );

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("Chat error:", e);
    return NextResponse.json({ reply: "Something went wrong. Please try again." });
  }
}
