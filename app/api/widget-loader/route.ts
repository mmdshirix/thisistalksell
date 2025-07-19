import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const chatbotId = searchParams.get("chatbot-id")

  if (!chatbotId) {
    return new NextResponse("chatbot-id is required", { status: 400 })
  }

  const script = `
(function() {
  console.log('Widget loader started for chatbot:', '${chatbotId}');
  
  // بررسی اینکه آیا ویجت قبلاً لود شده یا نه
  if (window.orionChatbotLoaded) {
    console.log('Widget already loaded');
    return;
  }
  
  window.orionChatbotLoaded = true;
  
  // دریافت تنظیمات چت‌بات
  fetch('${process.env.NEXT_PUBLIC_APP_URL || "https://talksellapi.vercel.app"}/api/chatbots/${chatbotId}')
    .then(response => {
      console.log('Chatbot API response status:', response.status);
      return response.json();
    })
    .then(chatbot => {
      console.log('Chatbot data received:', chatbot);
      
      if (!chatbot || chatbot.error) {
        console.error('Chatbot not found or error:', chatbot);
        return;
      }
      
      // ایجاد دکمه لانچر
      const launcher = document.createElement('div');
      launcher.id = 'orion-chatbot-launcher';
      launcher.innerHTML = \`
        <div style="
          position: fixed;
          \${chatbot.position === 'bottom-left' ? 'left' : 'right'}: \${chatbot.margin_x || 20}px;
          bottom: \${chatbot.margin_y || 20}px;
          width: 60px;
          height: 60px;
          background: \${chatbot.primary_color || '#3B82F6'};
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          transition: all 0.3s ease;
          font-size: 24px;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          \${chatbot.chat_icon || '💬'}
        </div>
      \`;
      
      // ایجاد iframe چت‌بات
      const chatWidget = document.createElement('div');
      chatWidget.id = 'orion-chatbot-widget';
      chatWidget.style.cssText = \`
        position: fixed;
        \${chatbot.position === 'bottom-left' ? 'left' : 'right'}: \${chatbot.margin_x || 20}px;
        bottom: \${(chatbot.margin_y || 20) + 80}px;
        width: 380px;
        height: 600px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 120px);
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 999998;
        display: none;
        overflow: hidden;
      \`;
      
      chatWidget.innerHTML = \`
        <iframe 
          src="${process.env.NEXT_PUBLIC_APP_URL || "https://talksellapi.vercel.app"}/launcher/\${chatbotId}"
          style="width: 100%; height: 100%; border: none; border-radius: 16px;"
          allow="microphone"
        ></iframe>
      \`;
      
      // اضافه کردن به صفحه
      document.body.appendChild(launcher);
      document.body.appendChild(chatWidget);
      
      // رویدادها
      launcher.onclick = function() {
        const widget = document.getElementById('orion-chatbot-widget');
        if (widget.style.display === 'none') {
          widget.style.display = 'block';
          launcher.style.display = 'none';
        }
      };
      
      // گوش دادن به پیام بستن
      window.addEventListener('message', function(event) {
        if (event.data.type === 'orion-chatbot-close') {
          document.getElementById('orion-chatbot-widget').style.display = 'none';
          document.getElementById('orion-chatbot-launcher').style.display = 'block';
        }
      });
      
      console.log('Widget loaded successfully');
    })
    .catch(error => {
      console.error('Error loading chatbot:', error);
    });
})();
  `

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
