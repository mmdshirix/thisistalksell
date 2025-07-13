"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare } from "lucide-react"

interface TopQuestion {
  question: string
  count: number
  lastAsked: string
}

interface TopQuestionsListProps {
  questions: TopQuestion[]
}

export default function TopQuestionsList({ questions }: TopQuestionsListProps) {
  const [showAll, setShowAll] = useState(false)
  const displayQuestions = showAll ? questions : questions.slice(0, 5)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top User Questions</CardTitle>
        <CardDescription>Most frequently asked questions by your users</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {displayQuestions.map((q, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{q.question}</p>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Asked {q.count} times</span>
                  <span>Last: {new Date(q.lastAsked).toLocaleDateString()}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      {questions.length > 5 && (
        <CardFooter>
          <Button variant="ghost" className="w-full text-blue-600" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show Less" : "Show All"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
