import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building, CheckSquare, Users, BarChart3 } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <Link className="flex items-center justify-center" href="/">
          <Building className="h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">
            Kaj Shohayok
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:text-indigo-600 transition-colors"
            href="/sign-in"
          >
            Sign In
          </Link>
          <Link
            className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            href="/sign-up"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-4 lg:px-6 py-24 md:py-32">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Enterprise Task Management
            <span className="text-indigo-600 block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your workflow, boost productivity, and achieve your goals
            with our comprehensive task management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 lg:px-6 py-16 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to manage projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                <CheckSquare className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Task Management
              </h3>
              <p className="text-gray-600">
                Create, assign, and track tasks with priorities, deadlines, and
                dependencies.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Team Collaboration
              </h3>
              <p className="text-gray-600">
                Work together seamlessly with role-based permissions and
                real-time updates.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-gray-600">
                Track progress, monitor performance, and generate insightful
                reports.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Project Organization
              </h3>
              <p className="text-gray-600">
                Organize projects by status, priority, and team to stay focused.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 lg:px-6 py-16 bg-indigo-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of teams already using Kaj Shohayok to manage their
            projects.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 lg:px-6 py-8 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Building className="h-6 w-6 text-indigo-400" />
            <span className="ml-2 text-lg font-semibold">Kaj Shohayok</span>
          </div>
          <p className="text-gray-400">
            © 2024 Kaj Shohayok. Enterprise Task Management Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
