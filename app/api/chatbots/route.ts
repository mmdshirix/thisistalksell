import { NextResponse } from 'next/server'
import { getAllChatbots, createChatbot } from '@/lib/db'

export async function GET() {
  try {
    const chatbots = await getAllChatbots()
    
    return NextResponse.json({
      success: true,
      chatbots,
      count: chatbots.length,
    })
  } catch (error) {
    console.error('Error fetching chatbots:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch chatbots',
      chatbots: [],
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const chatbot = await createChatbot(data)
    
    return NextResponse.json({
      success: true,
      message: 'Chatbot created successfully',
      chatbot,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating chatbot:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create chatbot',
    }, { status: 500 })
  }
}
