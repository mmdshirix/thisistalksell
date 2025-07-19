import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chatbotId = searchParams.get("chatbot-id")

  if (!chatbotId) {
    return new NextResponse('console.error("❌ [TalkSell Widget] Chatbot ID is required");', {
      headers: { "Content-Type": "application/javascript" },
      status: 400,
    })
  }

  // اصلاح URL برای جلوگیری از دابل اسلش
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://talksellapi.vercel.app"
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1)
  }
  baseUrl = baseUrl.replace("http://", "https://")

  const script = `
(function() {
  'use strict';
  
  console.log('🚀 [TalkSell Widget] Starting widget loader for chatbot: ${chatbotId}');
  
  // جلوگیری از لود مجدد
  if (window.TalkSellWidget_${chatbotId}) {
    console.log('⚠️ [TalkSell Widget] Widget already loaded for chatbot ${chatbotId}');
    return;
  }
  window.TalkSellWidget_${chatbotId} = true;

  // متغیرهای اصلی
  let widget = {
    chatbotId: '${chatbotId}',
    baseUrl: '${baseUrl}',
    launcher: null,
    iframe: null,
    isOpen: false,
    settings: null
  };

  // تابع لاگ
  function log(message, data) {
    console.log('🤖 [TalkSell Widget] ' + message, data || '');
  }

  // دریافت تنظیمات چت‌بات
  async function loadChatbotSettings() {
    try {
      log('📡 Fetching chatbot settings...');
      const apiUrl = widget.baseUrl + '/api/chatbots/${chatbotId}';
      log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chatbot settings: ' + response.status + ' ' + response.statusText);
      }
      
      const data = await response.json();
      widget.settings = data.chatbot || data;
      
      log('✅ Chatbot settings loaded:', widget.settings.name || widget.settings.id);
      return widget.settings;
    } catch (error) {
      log('❌ Error loading chatbot settings:', error);
      // استفاده از تنظیمات پیش‌فرض
      widget.settings = {
        id: ${chatbotId},
        name: 'چت‌بات',
        primary_color: '#0D9488',
        chat_icon: '💬',
        position: 'bottom-right',
        margin_x: 20,
        margin_y: 20
      };
      return widget.settings;
    }
  }

  // ایجاد استایل‌ها
  function createStyles() {
    if (document.getElementById('talksell-widget-styles-${chatbotId}')) return;
    
    const style = document.createElement('style');
    style.id = 'talksell-widget-styles-${chatbotId}';
    style.textContent = \`
      .talksell-widget-launcher-${chatbotId} {
        position: fixed !important;
        width: 60px !important;
        height: 60px !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 24px !important;
        color: white !important;
        border: none !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
        transition: all 0.3s ease !important;
        font-family: system-ui, -apple-system, sans-serif !important;
      }
      
      .talksell-widget-launcher-${chatbotId}:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
      }
      
      .talksell-widget-iframe-${chatbotId} {
        position: fixed !important;
        width: 380px !important;
        height: 600px !important;
        max-width: calc(100vw - 40px) !important;
        max-height: calc(100vh - 120px) !important;
        border: none !important;
        border-radius: 16px !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
        z-index: 2147483646 !important;
        display: none !important;
        background: white !important;
        overflow: hidden !important;
      }
      
      .talksell-widget-iframe-${chatbotId}.open {
        display: block !important;
      }
      
      /* موبایل */
      @media (max-width: 480px) {
        .talksell-widget-iframe-${chatbotId} {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          border-radius: 0 !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }
      }
    \`;
    
    document.head.appendChild(style);
    log('✅ Styles injected');
  }

  // ایجاد دکمه لانچر
  function createLauncher() {
    const settings = widget.settings;
    
    widget.launcher = document.createElement('button');
    widget.launcher.className = 'talksell-widget-launcher-${chatbotId}';
    widget.launcher.innerHTML = settings.chat_icon || '💬';
    widget.launcher.title = 'باز کردن چت ' + (settings.name || 'چت‌بات');
    widget.launcher.style.backgroundColor = settings.primary_color || '#0D9488';
    
    // تنظیم موقعیت
    const position = settings.position || 'bottom-right';
    const marginX = settings.margin_x || 20;
    const marginY = settings.margin_y || 20;
    
    switch(position) {
      case 'bottom-right':
        widget.launcher.style.bottom = marginY + 'px';
        widget.launcher.style.right = marginX + 'px';
        break;
      case 'bottom-left':
        widget.launcher.style.bottom = marginY + 'px';
        widget.launcher.style.left = marginX + 'px';
        break;
      case 'top-right':
        widget.launcher.style.top = marginY + 'px';
        widget.launcher.style.right = marginX + 'px';
        break;
      case 'top-left':
        widget.launcher.style.top = marginY + 'px';
        widget.launcher.style.left = marginX + 'px';
        break;
      default:
        widget.launcher.style.bottom = marginY + 'px';
        widget.launcher.style.right = marginX + 'px';
    }
    
    // رویداد کلیک
    widget.launcher.addEventListener('click', toggleWidget);
    
    document.body.appendChild(widget.launcher);
    log('✅ Launcher created');
  }

  // ایجاد iframe
  function createIframe() {
    const settings = widget.settings;
    
    widget.iframe = document.createElement('iframe');
    widget.iframe.className = 'talksell-widget-iframe-${chatbotId}';
    // اطمینان از عدم وجود دابل اسلش
    widget.iframe.src = widget.baseUrl + '/widget/${chatbotId}?v=' + Date.now();
    widget.iframe.title = 'چت‌بات ' + (settings.name || 'چت‌بات');
    widget.iframe.allow = 'microphone';
    
    // تنظیم موقعیت iframe
    const position = settings.position || 'bottom-right';
    const marginX = settings.margin_x || 20;
    const marginY = settings.margin_y || 20;
    
    switch(position) {
      case 'bottom-right':
        widget.iframe.style.bottom = (marginY + 80) + 'px';
        widget.iframe.style.right = marginX + 'px';
        break;
      case 'bottom-left':
        widget.iframe.style.bottom = (marginY + 80) + 'px';
        widget.iframe.style.left = marginX + 'px';
        break;
      case 'top-right':
        widget.iframe.style.top = (marginY + 80) + 'px';
        widget.iframe.style.right = marginX + 'px';
        break;
      case 'top-left':
        widget.iframe.style.top = (marginY + 80) + 'px';
        widget.iframe.style.left = marginX + 'px';
        break;
      default:
        widget.iframe.style.bottom = (marginY + 80) + 'px';
        widget.iframe.style.right = marginX + 'px';
    }
    
    document.body.appendChild(widget.iframe);
    log('✅ Iframe created');
  }

  // تغییر وضعیت ویجت
  function toggleWidget() {
    widget.isOpen = !widget.isOpen;
    
    if (widget.isOpen) {
      widget.iframe.classList.add('open');
      widget.launcher.innerHTML = '✕';
      widget.launcher.title = 'بستن چت';
      log('🔓 Widget opened');
    } else {
      widget.iframe.classList.remove('open');
      widget.launcher.innerHTML = widget.settings.chat_icon || '💬';
      widget.launcher.title = 'باز کردن چت ' + (widget.settings.name || 'چت‌بات');
      log('🔒 Widget closed');
    }
  }

  // گوش دادن به پیام‌های iframe
  function setupMessageListener() {
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'orion-chatbot-close') {
        if (widget.isOpen) {
          toggleWidget();
        }
      }
    });
    log('✅ Message listener setup');
  }

  // راه‌اندازی اصلی
  async function initialize() {
    try {
      log('🏗️ Initializing TalkSell Widget...');
      
      // دریافت تنظیمات
      await loadChatbotSettings();
      
      // ایجاد المان‌ها
      createStyles();
      createLauncher();
      createIframe();
      setupMessageListener();
      
      log('🎉 TalkSell Widget initialized successfully!');
      
    } catch (error) {
      log('❌ Failed to initialize widget:', error);
    }
  }

  // شروع بعد از لود صفحه
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // API عمومی
  window.TalkSellWidget = window.TalkSellWidget || {};
  window.TalkSellWidget['chatbot_' + widget.chatbotId] = {
    open: function() {
      if (!widget.isOpen) toggleWidget();
    },
    close: function() {
      if (widget.isOpen) toggleWidget();
    },
    toggle: toggleWidget
  };

})();
`

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
