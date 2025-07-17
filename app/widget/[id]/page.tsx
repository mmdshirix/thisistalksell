import { getChatbot, getChatbotFAQs, getChatbotProducts } from "@/lib/db"
import { notFound } from "next/navigation"

interface Props {
  params: { id: string }
}

export default async function WidgetPage({ params }: Props) {
  const chatbotId = Number.parseInt(params.id)

  if (isNaN(chatbotId)) {
    notFound()
  }

  const [chatbot, faqs, products] = await Promise.all([
    getChatbot(chatbotId),
    getChatbotFAQs(chatbotId),
    getChatbotProducts(chatbotId),
  ])

  if (!chatbot) {
    notFound()
  }

  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{chatbot.name} - پیش‌نمایش</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .preview-container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
            width: 100%;
          }
          
          .preview-title {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          
          .preview-subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1rem;
          }
          
          .chatbot-info {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .chatbot-name {
            font-size: 1.5rem;
            font-weight: bold;
            color: ${chatbot.primary_color};
            margin-bottom: 10px;
          }
          
          .chatbot-icon {
            font-size: 3rem;
            margin-bottom: 15px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
          }
          
          .stat-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            border: 2px solid #e9ecef;
          }
          
          .stat-number {
            font-size: 1.5rem;
            font-weight: bold;
            color: ${chatbot.primary_color};
          }
          
          .stat-label {
            font-size: 0.9rem;
            color: #666;
            margin-top: 5px;
          }
          
          .widget-demo {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
          }
          
          .widget-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${chatbot.primary_color};
            color: ${chatbot.text_color};
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .widget-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          }
          
          .widget-chat {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
          }
          
          .widget-chat.open {
            display: flex;
          }
          
          .chat-header {
            background: ${chatbot.primary_color};
            color: ${chatbot.text_color};
            padding: 15px;
            font-weight: bold;
            text-align: center;
          }
          
          .chat-body {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
          }
          
          .welcome-message {
            background: #f1f3f4;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            font-size: 0.9rem;
          }
          
          .faq-item, .product-item {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.85rem;
          }
          
          .faq-item:hover, .product-item:hover {
            background: #e9ecef;
            transform: translateY(-1px);
          }
          
          .chat-input {
            padding: 15px;
            border-top: 1px solid #e9ecef;
          }
          
          .input-group {
            display: flex;
            gap: 10px;
          }
          
          .chat-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
            font-size: 0.9rem;
          }
          
          .send-button {
            background: ${chatbot.primary_color};
            color: ${chatbot.text_color};
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          @media (max-width: 768px) {
            .widget-chat {
              width: 300px;
              height: 400px;
            }
            
            .preview-container {
              padding: 20px;
            }
            
            .preview-title {
              font-size: 1.5rem;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="preview-container">
          <div className="chatbot-icon">{chatbot.chat_icon}</div>
          <h1 className="preview-title">پیش‌نمایش چت‌بات</h1>
          <p className="preview-subtitle">این نمایش زنده چت‌بات شما است</p>

          <div className="chatbot-info">
            <div className="chatbot-name">{chatbot.name}</div>
            <p>{chatbot.welcome_message}</p>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{faqs.length}</div>
                <div className="stat-label">سوال متداول</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{products.length}</div>
                <div className="stat-label">محصول</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">فعال</div>
                <div className="stat-label">وضعیت</div>
              </div>
            </div>
          </div>

          <p style={{ color: "#666", fontSize: "0.9rem" }}>برای تست چت‌بات، روی دکمه پایین سمت راست کلیک کنید</p>
        </div>

        <div className="widget-demo">
          <button className="widget-button" onclick="toggleChat()">
            {chatbot.chat_icon}
          </button>

          <div className="widget-chat" id="chatWidget">
            <div className="chat-header">{chatbot.name}</div>

            <div className="chat-body">
              <div className="welcome-message">{chatbot.welcome_message}</div>

              <div style={{ marginBottom: "15px", fontSize: "0.85rem", fontWeight: "bold" }}>
                {chatbot.navigation_message}
              </div>

              {faqs.length > 0 && (
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: "bold", marginBottom: "8px", color: "#666" }}>
                    سوالات متداول:
                  </div>
                  {faqs.slice(0, 3).map((faq, index) => (
                    <div key={index} className="faq-item">
                      {faq.emoji} {faq.question}
                    </div>
                  ))}
                </div>
              )}

              {products.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: "bold", marginBottom: "8px", color: "#666" }}>
                    محصولات پیشنهادی:
                  </div>
                  {products.slice(0, 2).map((product, index) => (
                    <div key={index} className="product-item">
                      <div style={{ fontWeight: "bold" }}>{product.name}</div>
                      {product.price && (
                        <div style={{ fontSize: "0.75rem", color: "#666" }}>{product.price.toLocaleString()} تومان</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="chat-input">
              <div className="input-group">
                <input type="text" placeholder="پیام خود را بنویسید..." />
                <button className="send-button">➤</button>
              </div>
            </div>
          </div>
        </div>

        <script>{`
          function toggleChat() {
            const widget = document.getElementById('chatWidget');
            widget.classList.toggle('open');
          }
          
          // Close chat when clicking outside
          document.addEventListener('click', function(event) {
            const widget = document.getElementById('chatWidget');
            const button = document.querySelector('.widget-button');
            
            if (!widget.contains(event.target) && !button.contains(event.target)) {
              widget.classList.remove('open');
            }
          });
        `}</script>
      </body>
    </html>
  )
}
