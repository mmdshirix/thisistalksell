import { getChatbotById } from "@/lib/db"
import { notFound } from "next/navigation"
import ChatbotLauncher from "@/components/chatbot-launcher"

interface LauncherPageProps {
  params: { id: string }
}

export const dynamic = "force-dynamic"

export default async function LauncherPage({ params }: LauncherPageProps) {
  const chatbotId = Number(params.id)
  if (isNaN(chatbotId)) {
    return notFound()
  }

  const chatbot = await getChatbotById(chatbotId)
  if (!chatbot) {
    return notFound()
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              background: transparent !important;
              overflow: hidden;
              width: 100%;
              height: 100%;
            }
          `,
          }}
        />
      </head>
      <body style={{ background: "transparent" }}>
        <ChatbotLauncher chatbot={chatbot} />
      </body>
    </html>
  )
}
