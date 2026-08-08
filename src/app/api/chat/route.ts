import { NextRequest, NextResponse } from "next/server";
import { bm25Search } from "@/lib/bm25";
import { knowledgeIndex } from "@/lib/knowledge-base";

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

    // BM25-powered fallback when no API key is configured
    if (!apiKey || apiKey.includes("XXXX")) {
      const results = bm25Search(knowledgeIndex, message, 2);

      let reply: string;
      if (results.length > 0) {
        // Return the best matching document's response
        reply = results[0].response;
        // If a second result is significantly relevant, append it
        if (results.length > 1) {
          reply += "\n\n---\n\n**Also relevant:** " + results[1].response;
        }
      } else {
        reply =
          "I'm the **KS Assistant** — your guide for Kaj Shohayok! I can help with projects, tasks, the Kanban board, roles, AI features, analytics, reports, and more. What would you like to know?";
      }

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
