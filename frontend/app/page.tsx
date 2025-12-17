'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    const result = await signOut({ redirect: false })
    if (result?.ok) {
      router.push('/auth/login')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-900 dark:to-neutral-800">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            PBL Medical System
          </h1>
          <div className="flex items-center gap-4">
            {status === 'authenticated' && session?.user && (
              <>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white font-medium rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
            {status === 'unauthenticated' && (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4">
            Master Medical Knowledge
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
            Integrated study management with AI-powered learning and spaced repetition
          </p>
          {status === 'unauthenticated' && (
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 font-semibold rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard"
            className="group card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Dashboard
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  View your study progress, statistics, and track your learning goals
                </p>
              </div>
              <span className="ml-4 text-3xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <div className="flex gap-2">
              <span className="badge-info text-xs">Analytics</span>
              <span className="badge-primary text-xs">Progress</span>
            </div>
          </Link>

          <Link
            href="/flashcards"
            className="group card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Flashcards
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Review flashcards with intelligent spaced repetition algorithms
                </p>
              </div>
              <span className="ml-4 text-3xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <div className="flex gap-2">
              <span className="badge-success text-xs">Spaced Repetition</span>
              <span className="badge-primary text-xs">SM2/FSRS</span>
            </div>
          </Link>

          <Link
            href="/courses"
            className="group card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Courses
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Organize your learning into courses and manage related flashcards
                </p>
              </div>
              <span className="ml-4 text-3xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <div className="flex gap-2">
              <span className="badge-warning text-xs">Organization</span>
              <span className="badge-primary text-xs">Management</span>
            </div>
          </Link>

          <Link
            href="/library"
            className="group card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Library
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Access your digital library of notes, files, and learning resources
                </p>
              </div>
              <span className="ml-4 text-3xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <div className="flex gap-2">
              <span className="badge-info text-xs">Resources</span>
              <span className="badge-primary text-xs">Storage</span>
            </div>
          </Link>
        </div>

        {/* Features List */}
        <div className="mt-16 card p-8 bg-white dark:bg-neutral-800">
          <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
            Powerful Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-600 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                  AI-Powered Learning
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Generate flashcards and study materials using advanced AI models
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-success-600 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                  Spaced Repetition
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Optimize retention with SM2, FSRS, and other proven algorithms
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-warning-600 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                  Obsidian Integration
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Sync your Obsidian vault with your study system
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-info-600 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                  Dark Mode Support
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Study comfortably with full dark mode support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
