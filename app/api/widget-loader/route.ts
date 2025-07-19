import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const chatbotId = searchParams.get("chatbot-id")

  if (!chatbotId) {
    return new NextResponse("Chatbot ID is required", { status: 400 })
  }

  const widgetScript = `
(function() {
  'use strict';
  
  console.log('🤖 [TalkSell Widget] Loading...');
  
  // Configuration
  const CONFIG = {
    API_BASE: 'https://thisistalksel.vercel.app',
    CHATBOT_ID: '${chatbotId}',
    WIDGET_ID: 'talksell-widget-' + '${chatbotId}',
    LAUNCHER_ID: 'talksell-launcher-' + '${chatbotId}'
  };
  
  // Prevent multiple instances
  if (window.TalkSellWidget) {
    console.log('🤖 [TalkSell Widget] Already loaded');
    return;
  }
  
  // Widget state
  let isOpen = false;
  let chatbotData = null;
  let widgetContainer = null;
  let launcherButton = null;
  
  // Fetch chatbot data
  async function fetchChatbotData() {
    try {
      console.log('🤖 [TalkSell Widget] Fetching chatbot data...');
      const response = await fetch(\`\${CONFIG.API_BASE}/api/chatbots/\${CONFIG.CHATBOT_ID}\`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const data = await response.json();
      console.log('🤖 [TalkSell Widget] ✅ Chatbot data loaded:', data);
      return data;
    } catch (error) {
      console.error('🤖 [TalkSell Widget] ❌ Error fetching chatbot data:', error);
      throw error;
    }
  }
  
  // Create launcher button
  function createLauncher() {
    if (document.getElementById(CONFIG.LAUNCHER_ID)) {
      return;
    }
    
    launcherButton = document.createElement('div');
    launcherButton.id = CONFIG.LAUNCHER_ID;
    launcherButton.innerHTML = \`
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: \${chatbotData?.chatbot?.primary_color || '#3B82F6'};
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
        \${chatbotData?.chatbot?.chat_icon || '💬'}
      </div>
    \`;
    
    launcherButton.addEventListener('click', toggleWidget);
    document.body.appendChild(launcherButton);
    console.log('🤖 [TalkSell Widget] ✅ Launcher created');
  }
  
  // Create widget container
  function createWidget() {
    if (document.getElementById(CONFIG.WIDGET_ID)) {
      return;
    }
    
    widgetContainer = document.createElement('div');
    widgetContainer.id = CONFIG.WIDGET_ID;
    widgetContainer.innerHTML = \`
      <div style="
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 380px;
        height: 600px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 120px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        z-index: 999998;
        display: none;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <iframe 
          src="\${CONFIG.API_BASE}/launcher/\${CONFIG.CHATBOT_ID}"
          style="width: 100%; height: 100%; border: none; border-radius: 16px;"
          allow="microphone"
        ></iframe>
      </div>
    \`;
    
    document.body.appendChild(widgetContainer);
    console.log('🤖 [TalkSell Widget] ✅ Widget created');
  }
  
  // Toggle widget visibility
  function toggleWidget() {
    if (!widgetContainer) return;
    
    const widget = widgetContainer.querySelector('div');
    if (isOpen) {
      widget.style.display = 'none';
      isOpen = false;
      console.log('🤖 [TalkSell Widget] Widget closed');
    } else {
      widget.style.display = 'block';
      isOpen = true;
      console.log('🤖 [TalkSell Widget] Widget opened');
    }
  }
  
  // Listen for close messages from iframe
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'orion-chatbot-close') {
      toggleWidget();
    }
  });
  
  // Initialize widget
  async function init() {
    try {
      console.log('🤖 [TalkSell Widget] Initializing...');
      chatbotData = await fetchChatbotData();
      createLauncher();
      createWidget();
      console.log('🤖 [TalkSell Widget] ✅ Initialized successfully');
    } catch (error) {
      console.error('🤖 [TalkSell Widget] ❌ Initialization failed:', error);
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
  
  // Expose global API
  window.TalkSellWidget = {
    init,
    toggle: toggleWidget,
    open: () => !isOpen && toggleWidget(),
    close: () => isOpen && toggleWidget(),
    isOpen: () => isOpen
  };
  
  // Auto-initialize
  autoInit();
  
})();
`

  return new NextResponse(widgetScript, {
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
