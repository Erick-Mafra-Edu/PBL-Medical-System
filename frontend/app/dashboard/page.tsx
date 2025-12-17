'use client'

import { Navbar } from '@/app/components/Navbar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
              Welcome back, {session?.user?.name || 'Student'}!
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Here's your study progress and today's learning goals
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 border-l-4 border-primary-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    Cards Due Today
                  </h3>
                  <p className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
                    0
                  </p>
                </div>
                <div className="text-4xl text-primary-200 dark:text-primary-700">📚</div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-4">
                Cards waiting for review
              </p>
            </div>

            <div className="card p-6 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900 dark:to-success-800 border-l-4 border-success-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    Total Cards
                  </h3>
                  <p className="text-3xl md:text-4xl font-bold text-success-600 dark:text-success-400">
                    0
                  </p>
                </div>
                <div className="text-4xl text-success-200 dark:text-success-700">✓</div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-4">
                Cards in your system
              </p>
            </div>

            <div className="card p-6 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900 dark:to-warning-800 border-l-4 border-warning-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    Study Streak
                  </h3>
                  <p className="text-3xl md:text-4xl font-bold text-warning-600 dark:text-warning-400">
                    0
                  </p>
                </div>
                <div className="text-4xl text-warning-200 dark:text-warning-700">🔥</div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-4">
                Days in a row
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      No recent activity
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Start studying to see your activity here
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card p-6 bg-gradient-to-br from-info-50 to-info-100 dark:from-info-900 dark:to-info-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Learning
                  </span>
                  <span className="text-lg font-bold text-info-600 dark:text-info-400">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Reviewing
                  </span>
                  <span className="text-lg font-bold text-info-600 dark:text-info-400">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Mastered
                  </span>
                  <span className="text-lg font-bold text-info-600 dark:text-info-400">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
