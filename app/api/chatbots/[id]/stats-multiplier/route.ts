import { getSql } from "@/lib/db"
const sql = getSql()

// Define the route handler here
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const chatbotId = params.id
  // Logic to fetch stats multiplier for the chatbot with id chatbotId
  // /** rest of code here **/
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const chatbotId = params.id
  const body = await request.json()
  // Logic to update stats multiplier for the chatbot with id chatbotId
  // /** rest of code here **/
}
