import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin, generateAdminToken } from '@/lib/admin-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { username, password } = await request.json()
    const chatbotId = parseInt(params.id)

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (isNaN(chatbotId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid chatbot ID' },
        { status: 400 }
      )
    }

    // Authenticate the admin user
    const user = await authenticateAdmin(chatbotId, username, password)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateAdminToken(user)

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        chatbot_id: user.chatbot_id,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
