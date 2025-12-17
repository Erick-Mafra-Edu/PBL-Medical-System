'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    const result = await signOut({ redirect: false })
    if (result?.ok) {
      router.push('/auth/login')
    }
  }

  return (
    <nav className="bg-white dark:bg-neutral-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
          PBL Medical
        </Link>
        
        <div className="flex items-center gap-6">
          {status === 'authenticated' && session?.user && (
            <>
              <div className="hidden md:flex gap-6">
                <Link href="/dashboard" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Dashboard
                </Link>
                <Link href="/flashcards" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Flashcards
                </Link>
                <Link href="/courses" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Courses
                </Link>
                <Link href="/library" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Library
                </Link>
              </div>
              <div className="flex items-center gap-4 border-l border-neutral-200 dark:border-neutral-700 pl-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Student
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
          {status === 'unauthenticated' && (
            <div className="flex gap-4">
              <Link href="/auth/login" className="px-4 py-2 text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
