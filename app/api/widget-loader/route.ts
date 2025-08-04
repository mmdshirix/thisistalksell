import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: Request) {
  const sql = getSql()
  const { searchParams } = new URL(request.url)
  const chatbotId = searchParams.get("id")

  if (!chatbotId) {
    return new NextResponse('console.error("Chatbot ID is missing.");', {
      headers: { "Content-Type": "application/javascript" },
      status: 400,
    })
  }

  try {
    const chatbot = await sql`
      SELECT id, welcome_message, primary_color, secondary_color, text_color,
             bot_name, bot_avatar, user_avatar, show_product_suggestions,
             show_faq_suggestions, show_quick_options, show_ticket_form
      FROM chatbots
      WHERE id = ${chatbotId};
    `

    if (chatbot.length === 0) {
      return new NextResponse(`console.error("Chatbot with ID ${chatbotId} not found.");`, {
        headers: { "Content-Type": "application/javascript" },
        status: 404,
      })
    }

    const settings = chatbot[0]

    const scriptContent = `
      (function() {
        const settings = ${JSON.stringify(settings)};
        const script = document.createElement('script');
        script.src = "${process.env.NEXT_PUBLIC_APP_URL}/_next/static/chunks/chatbot-widget.js"; // Adjust path as needed
        script.onload = () => {
          if (window.initChatbotWidget) {
            window.initChatbotWidget(settings);
          } else {
            console.error("Chatbot widget initialization function not found.");
          }
        };
        document.body.appendChild(script);

        // Optional: Inject CSS if needed
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = "${process.env.NEXT_PUBLIC_APP_URL}/_next/static/css/chatbot-widget.css"; // Adjust path as needed
        document.head.appendChild(style);
      })();
    `

    return new NextResponse(scriptContent, {
      headers: { "Content-Type": "application/javascript" },
    })
  } catch (error) {
    console.error("Error generating widget loader:", error)
    return new NextResponse('console.error("Failed to load chatbot widget.");', {
      headers: { "Content-Type": "application/javascript" },
      status: 500,
    })
  }
}
