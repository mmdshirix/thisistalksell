export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chatbotId = searchParams.get("chatbot-id")

  if (!chatbotId) {
    return new Response('console.error("Chatbot ID is required");', {
      headers: { "Content-Type": "application/javascript" },
      status: 400,
    })
  }

  // CORS headers برای دسترسی از دامنه‌های مختلف
  const headers = {
    "Content-Type": "application/javascript",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=300", // کش 5 دقیقه‌ای
  }

  const widgetScript = `
(function() {
  // جلوگیری از لود مجدد
  if (window.TalkSellWidget_${chatbotId}) return;
  window.TalkSellWidget_${chatbotId} = true;

  console.log('🤖 [TalkSell Widget] Loading widget for chatbot ${chatbotId}');

  // تابع لود ویجت
  async function loadWidget() {
    try {
      // دریافت تنظیمات چت‌بات از API
      const response = await fetch('https://talksellapi.vercel.app/api/chatbots/${chatbotId}');
      if (!response.ok) throw new Error('Failed to load chatbot settings');
      
      const data = await response.json();
      const chatbot = data.chatbot || data;
      
      console.log('🤖 [TalkSell Widget] Chatbot settings loaded:', chatbot);
      
      // ایجاد iframe
      const iframe = document.createElement('iframe');
      iframe.src = 'https://talksellapi.vercel.app/launcher/${chatbotId}';
      iframe.style.cssText = \`
        position: fixed !important;
        width: 400px !important;
        height: 600px !important;
        border: none !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        z-index: 999999 !important;
        background: white !important;
        display: none !important;
        transition: all 0.3s ease !important;
      \`;

      // تنظیم موقعیت بر اساس تنظیمات چت‌بات
      const position = chatbot.position || 'bottom-right';
      const marginX = chatbot.margin_x || 20;
      const marginY = chatbot.margin_y || 20;

      switch(position) {
        case 'bottom-right':
          iframe.style.bottom = marginY + 'px';
          iframe.style.right = marginX + 'px';
          break;
        case 'bottom-left':
          iframe.style.bottom = marginY + 'px';
          iframe.style.left = marginX + 'px';
          break;
        case 'top-right':
          iframe.style.top = marginY + 'px';
          iframe.style.right = marginX + 'px';
          break;
        case 'top-left':
          iframe.style.top = marginY + 'px';
          iframe.style.left = marginX + 'px';
          break;
        default:
          iframe.style.bottom = marginY + 'px';
          iframe.style.right = marginX + 'px';
      }

      // ایجاد دکمه لانچر
      const launcher = document.createElement('div');
      launcher.style.cssText = \`
        position: fixed !important;
        width: 60px !important;
        height: 60px !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        z-index: 1000000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 24px !important;
        color: \${chatbot.text_color || '#ffffff'} !important;
        background: \${chatbot.primary_color || '#14b8a6'} !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
        transition: all 0.3s ease !important;
        border: none !important;
        font-family: system-ui, -apple-system, sans-serif !important;
      \`;

      // تنظیم موقعیت لانچر
      switch(position) {
        case 'bottom-right':
          launcher.style.bottom = marginY + 'px';
          launcher.style.right = marginX + 'px';
          break;
        case 'bottom-left':
          launcher.style.bottom = marginY + 'px';
          launcher.style.left = marginX + 'px';
          break;
        case 'top-right':
          launcher.style.top = marginY + 'px';
          launcher.style.right = marginX + 'px';
          break;
        case 'top-left':
          launcher.style.top = marginY + 'px';
          launcher.style.left = marginX + 'px';
          break;
        default:
          launcher.style.bottom = marginY + 'px';
          launcher.style.right = marginX + 'px';
      }

      launcher.innerHTML = chatbot.chat_icon || '💬';
      launcher.title = 'باز کردن چت';

      // رویدادهای لانچر
      launcher.addEventListener('mouseenter', () => {
        launcher.style.transform = 'scale(1.1)';
      });
      
      launcher.addEventListener('mouseleave', () => {
        launcher.style.transform = 'scale(1)';
      });

      let isOpen = false;
      launcher.addEventListener('click', () => {
        isOpen = !isOpen;
        iframe.style.display = isOpen ? 'block' : 'none';
        launcher.innerHTML = isOpen ? '✕' : (chatbot.chat_icon || '💬');
        launcher.title = isOpen ? 'بستن چت' : 'باز کردن چت';
        
        console.log('🤖 [TalkSell Widget] Widget toggled:', isOpen ? 'OPEN' : 'CLOSED');
      });

      // اضافه کردن به صفحه
      document.body.appendChild(iframe);
      document.body.appendChild(launcher);

      console.log('🤖 [TalkSell Widget] Widget loaded successfully');

      // بستن با کلیک خارج از iframe
      document.addEventListener('click', (e) => {
        if (isOpen && !iframe.contains(e.target) && !launcher.contains(e.target)) {
          isOpen = false;
          iframe.style.display = 'none';
          launcher.innerHTML = chatbot.chat_icon || '💬';
          launcher.title = 'باز کردن چت';
        }
      });

    } catch (error) {
      console.error('🤖 [TalkSell Widget] Error loading widget:', error);
    }
  }

  // لود ویجت پس از لود کامل صفحه
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();
`

  return new Response(widgetScript, { headers })
}
