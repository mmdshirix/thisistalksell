"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Plus, Settings, Eye, Calendar } from 'lucide-react'

interface Chatbot {
  id: number
  name: string
  created_at: string
  updated_at: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  margin_x: number
  margin_y: number
  welcome_message: string
  navigation_message: string
  stats_multiplier: number
}

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchChatbots()
  }, [])

  const fetchChatbots = async () => {
    try {
      const response = await fetch('/api/chatbots')
      const data = await response.json()
      
      if (response.ok) {
        setChatbots(data.chatbots || [])
      } else {
        setError(data.message || 'Failed to fetch chatbots')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chatbots</h1>
              <p className="text-gray-600">Manage your chatbot instances</p>
            </div>
            <Button asChild>
              <Link href="/chatbots/new">
                <Plus className="h-4 w-4 mr-2" />
                Create New Chatbot
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {chatbots.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl text-gray-600 mb-2">No Chatbots Found</CardTitle>
              <CardDescription className="mb-4">
                Get started by creating your first chatbot
              </CardDescription>
              <Button asChild>
                <Link href="/chatbots/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Chatbot
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((chatbot) => (
              <Card key={chatbot.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg text-white"
                        style={{ backgroundColor: chatbot.primary_color }}
                      >
                        <span className="text-lg">{chatbot.chat_icon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                        <CardDescription>ID: {chatbot.id}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {formatDate(chatbot.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-gray-600 line-clamp-2">
                        {chatbot.welcome_message}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/admin-panel/${chatbot.id}/login`}>
                          <Settings className="h-4 w-4 mr-1" />
                          Admin
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/chatbots/${chatbot.id}/preview`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
