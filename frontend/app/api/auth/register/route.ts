import { NextRequest, NextResponse } from 'next/server'

// This would normally call your backend API
// For now, it's a mock endpoint that works with MSW mocking

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, email, password } = body

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Call backend API to register
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { message: error.message || 'Registration failed' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      message: 'Account created successfully',
      user: data.user,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
