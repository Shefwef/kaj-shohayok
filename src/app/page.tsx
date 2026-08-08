import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  Kanban,
  Users,
  AreaChart,
  ShieldCheck,
  Zap,
  ArrowRight,
  CircleCheckBig,
  BrainCircuit,
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 shadow-sm">
              <ClipboardCheck className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900">Kaj Shohayok</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 mb-8">
            <Zap className="h-3.5 w-3.5" />
            AI-powered · Real-time · Enterprise-ready
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.08]">
            Manage projects
            <span className="block text-emerald-600">with clarity.</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Kaj Shohayok is a full-stack task management platform with role-based access,
            Kanban boards, AI assistance, and real-time collaboration — built for modern teams.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition-all"
            >
              Sign in to your account
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-gray-400 flex-wrap">
            {["No credit card required", "Free tier available", "Deploy in minutes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CircleCheckBig className="h-3.5 w-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">Features</p>
            <h2 className="text-3xl font-bold text-gray-900">Everything your team needs</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              One platform for projects, tasks, collaboration, and insights.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Kanban,
                title: "Kanban Boards",
                desc: "Drag-and-drop task management with real-time optimistic updates and smooth animations.",
              },
              {
                icon: BrainCircuit,
                title: "AI Assistance",
                desc: "Gemini 2.0 Flash breaks down tasks, predicts completion times, and searches semantically.",
              },
              {
                icon: ShieldCheck,
                title: "Role-Based Access",
                desc: "4 roles × 12 permissions. Admins, Managers, Members, and Viewers — all controlled.",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                desc: "Comments, activity logs, notifications, and Server-Sent Events for live updates.",
              },
              {
                icon: AreaChart,
                title: "Analytics & Reports",
                desc: "Pie, bar, area, and line charts. Export to CSV or JSON in one click.",
              },
              {
                icon: Zap,
                title: "Production Architecture",
                desc: "Repository → Service → API layers with PostgreSQL, MongoDB, Redis, and Docker.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all duration-200"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100 group-hover:bg-emerald-600 transition-colors">
                  <f.icon className="h-5 w-5 text-emerald-600 group-hover:text-white transition-colors" strokeWidth={2} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-emerald-600 px-8 py-14 text-center shadow-2xl shadow-emerald-500/30">
            <div className="absolute inset-0 -z-10">
              <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-500 opacity-30 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-emerald-700 opacity-30 blur-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
            <p className="mt-3 text-emerald-100 max-w-md mx-auto">
              Set up in minutes. No credit card required. Free tier available.
            </p>
            <Link
              href="/sign-up"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 transition-colors"
            >
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600">
                <ClipboardCheck className="h-3 w-3 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-gray-900">Kaj Shohayok</span>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Kaj Shohayok · Enterprise Task Management
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
