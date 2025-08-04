import { getSql } from "@/lib/db"
const sql = getSql()

// Define the route handler for chatbot interactions
export async function GET(request: Request, { params }: { params: { chatbotId: string } }) {
  const { chatbotId } = params
  // Logic to handle GET request for chatbot with id chatbotId
  // /** rest of code here **/
}

export async function POST(request: Request, { params }: { params: { chatbotId: string } }) {
  const { chatbotId } = params
  const body = await request.json()
  // Logic to handle POST request for chatbot with id chatbotId
  // /** rest of code here **/
}
