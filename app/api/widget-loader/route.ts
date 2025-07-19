import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/javascript; charset=utf-8",
  }

  try {
    const url = new URL(request.url)
    const chatbotId = url.searchParams.get("chatbot-id")

    if (!chatbotId) {
      return new NextResponse("console.error('Chatbot ID is required');", {
        status: 400,
        headers: corsHeaders,
      })
    }

    const widgetScript = `
(function() {
  'use strict';
  
  console.log('🤖 [TalkSell Widget] 🎉 TalkSell Widget script loaded successfully');
  
  const CHATBOT_ID = '${chatbotId}';
  const API_BASE_URL = 'https://thisistalksel.vercel.app';
  
  let chatbotData = null;
  let isWidgetOpen = false;
  let widgetContainer = null;
  
  // Fetch chatbot data
  async function fetchChatbotData() {
    try {
      console.log('🤖 [TalkSell Widget] 📡 Fetching chatbot data for ID:', CHATBOT_ID);
      
      const response = await fetch(\`\${API_BASE_URL}/api/chatbots/\${CHATBOT_ID}\`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      const data = await response.json();
      console.log('🤖 [TalkSell Widget] ✅ Chatbot data fetched successfully:', data);
      
      return data;
    } catch (error) {
      console.error('🤖 [TalkSell Widget] ❌ Error fetching chatbot data:', error);
      throw error;
    }
  }
  
  // Create launcher button
  function createLauncher(chatbot) {
    const launcher = document.createElement('div');
    launcher.id = 'talksell-launcher';
    launcher.innerHTML = \`
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: \${chatbot.primary_color || '#0D9488'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        transition: all 0.3s ease;
        font-size: 24px;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        \${chatbot.chat_icon || '💬'}
      </div>
    \`;
    
    launcher.addEventListener('click', toggleWidget);
    document.body.appendChild(launcher);
    
    console.log('🤖 [TalkSell Widget] ✅ Launcher created');
  }
  
  // Create widget iframe
  function createWidget() {
    if (widgetContainer) return;
    
    widgetContainer = document.createElement('div');
    widgetContainer.id = 'talksell-widget-container';
    widgetContainer.style.cssText = \`
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      height: 600px;
      z-index: 999998;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      transform: translateY(100%) scale(0.8);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    \`;
    
    const iframe = document.createElement('iframe');
    iframe.src = \`\${API_BASE_URL}/launcher/\${CHATBOT_ID}\`;
    iframe.style.cssText = \`
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 16px;
      background: white;
    \`;
    iframe.allow = 'microphone';
    
    widgetContainer.appendChild(iframe);
    document.body.appendChild(widgetContainer);
    
    // Handle iframe messages
    window.addEventListener('message', function(event) {
      if (event.origin !== API_BASE_URL) return;
      
      if (event.data.type === 'orion-chatbot-close') {
        closeWidget();
      }
    });
    
    console.log('🤖 [TalkSell Widget] ✅ Widget iframe created');
  }
  
  // Toggle widget
  function toggleWidget() {
    if (!widgetContainer) {
      createWidget();
    }
    
    if (isWidgetOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }
  
  // Open widget
  function openWidget() {
    if (!widgetContainer) return;
    
    isWidgetOpen = true;
    widgetContainer.style.pointerEvents = 'auto';
    widgetContainer.style.transform = 'translateY(0) scale(1)';
    widgetContainer.style.opacity = '1';
    
    console.log('🤖 [TalkSell Widget] ✅ Widget opened');
  }
  
  // Close widget
  function closeWidget() {
    if (!widgetContainer) return;
    
    isWidgetOpen = false;
    widgetContainer.style.pointerEvents = 'none';
    widgetContainer.style.transform = 'translateY(100%) scale(0.8)';
    widgetContainer.style.opacity = '0';
    
    console.log('🤖 [TalkSell Widget] ✅ Widget closed');
  }
  
  // Initialize widget
  async function init() {
    try {
      console.log('🤖 [TalkSell Widget] 🚀 Initializing widget...');
      
      chatbotData = await fetchChatbotData();
      
      if (chatbotData && chatbotData.chatbot) {
        createLauncher(chatbotData.chatbot);
        console.log('🤖 [TalkSell Widget] ✅ Widget initialized successfully');
      } else {
        throw new Error('Invalid chatbot data received');
      }
    } catch (error) {
      console.error('🤖 [TalkSell Widget] ❌ Failed to initialize widget:', error);
    }
  }
  
  // Auto-initialize when DOM is ready
  function autoInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
  
  // Start initialization
  autoInit();
  
  // Expose global functions
  window.TalkSellWidget = {
    open: openWidget,
    close: closeWidget,
    toggle: toggleWidget
  };
  
})();
`

    return new NextResponse(widgetScript, {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error("Widget loader error:", error)
    return new NextResponse(`console.error('Widget loader error: ${error.message}');`, {
      status: 500,
      headers: corsHeaders,
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
