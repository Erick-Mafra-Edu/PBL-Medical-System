'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Callback: 'There was a problem with the authentication callback.',
    OAuthSignin: 'There was a problem connecting to the OAuth provider.',
    OAuthCallback: 'There was a problem with the OAuth callback.',
    EmailCreateAccount: 'There was a problem creating your account.',
    EmailSignin: 'There was a problem signing in with email.',
    SessionCallback: 'There was a problem with your session.',
    default: 'An authentication error occurred. Please try again.',
  }

  const message = error ? errorMessages[error as string] || errorMessages.default : errorMessages.default

  return (
    <div className="min-h-screen bg-gradient-to-br from-danger-50 to-danger-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-danger-100 dark:bg-danger-900">
            <svg
              className="h-8 w-8 text-danger-600 dark:text-danger-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Header */}
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Authentication Error
          </h1>

          {/* Message */}
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            {message}
          </p>

          {/* Error Code */}
          {error && (
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-6 font-mono bg-neutral-100 dark:bg-neutral-700 p-2 rounded">
              Error code: {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
