import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { apiClient } from '@/lib/api'
import { API_CONFIG } from '@/lib/apiConfig'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call backend API to authenticate
          const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
            email: credentials.email,
            password: credentials.password,
          })

          if (response.token && response.user) {
            // Store token for API requests
            apiClient.setToken(response.token)

            return {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              token: response.token,
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
})
