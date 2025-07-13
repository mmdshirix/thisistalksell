import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = "https://thisistalksel.vercel.app"

  const script = `
(function() {
'use strict';

// Prevent duplicate loading
if (window.TalkSellChatbotLoaded) {
  console.log("⚠️ [TalkSell Widget] Widget script already loaded. Aborting.");
  return;
}
window.TalkSellChatbotLoaded = true;

const BASE_URL = "${baseUrl}";
let widget = {
  container: null,
  button: null,
  iframe: null,
  welcomeNotification: null,
  isOpen: false,
  isLoading: false,
  config: {
    id: null,
    position: 'bottom-right',
    primaryColor: '#0D9488',
    chatIcon: '💬',
    welcomeMessage: 'سلام! اگه میخواید با قابلیت‌های تاکسل بیشتر آشنا بشید من میتونم کمکتون کنم!',
    hasImageIcon: false,
    showWelcomeDelay: 3000,
    autoOpen: false
  }
};

// Utility functions
function log(msg, data) {
  console.log(\`🤖 [TalkSell Widget] \${msg}\`, data || '');
}

function isImageIcon(icon) {
  return icon && (icon.startsWith('http') || icon.startsWith('/uploads/') || icon.includes('://'));
}

// Create and inject comprehensive styles
function createStyles() {
  if (document.getElementById('talksell-widget-styles')) return;

  const style = document.createElement('style');
  style.id = 'talksell-widget-styles';
  style.textContent = \`
    @import url("https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap");
    
    .talksell-widget-container {
      position: fixed !important;
      z-index: 2147483647 !important;
      font-family: "Vazirmatn", "Vazir", "Tahoma", "Arial", sans-serif !important;
      direction: ltr !important;
      pointer-events: none !important;
      user-select: none !important;
    }
    
    .talksell-widget-container * {
      font-family: "Vazirmatn", "Vazir", "Tahoma", "Arial", sans-serif !important;
      box-sizing: border-box !important;
    }
    
    /* Enhanced Launcher Button Styles */
    .talksell-widget-button {
      width: 64px !important;
      height: 64px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, \${widget.config.primaryColor}, \${widget.config.primaryColor}dd) !important;
      border: none !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      outline: none !important;
      pointer-events: auto !important;
      position: relative !important;
      overflow: visible !important;
      backdrop-filter: blur(10px) !important;
    }

    .talksell-widget-button:hover {
      transform: scale(1.1) translateY(-2px) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.15) !important;
    }

    .talksell-widget-button:active {
      transform: scale(1.05) translateY(-1px) !important;
    }
    
    .talksell-chat-icon {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      font-size: 28px !important;
      line-height: 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .talksell-chat-icon img {
      width: 36px !important;
      height: 36px !important;
      border-radius: 50% !important;
      object-fit: cover !important;
    }

    .talksell-widget-button.is-open .talksell-chat-icon {
      transform: rotate(180deg) scale(1.1) !important;
    }

    .talksell-widget-button.is-open .talksell-chat-icon:not(img) {
      font-size: 32px !important;
    }

    /* Enhanced Welcome Notification Styles */
    .talksell-widget-notification {
      position: absolute !important;
      bottom: 80px !important;
      right: 0 !important;
      width: 320px !important;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
      border-radius: 20px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1) !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transform: translateY(20px) scale(0.9) !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      pointer-events: auto !important;
      direction: rtl !important;
      overflow: hidden !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }

    .talksell-widget-notification.show {
      opacity: 1 !important;
      visibility: visible !important;
      transform: translateY(0) scale(1) !important;
    }

    .talksell-widget-notification::before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 4px !important;
      background: linear-gradient(90deg, \${widget.config.primaryColor}, \${widget.config.primaryColor}aa) !important;
      border-radius: 20px 20px 0 0 !important;
    }
    
    .talksell-notification-content {
      padding: 16px 20px !important;
      cursor: pointer !important;
      transition: background-color 0.2s ease !important;
    }

    .talksell-notification-content:hover {
      background-color: rgba(0, 0, 0, 0.02) !important;
    }

    .talksell-notification-header {
      display: flex !important;
      justify-content: flex-start !important;
      align-items: center !important;
      gap: 8px !important;
      font-size: 13px !important;
      color: #64748b !important;
      margin-bottom: 10px !important;
      font-weight: 500 !important;
    }
    
    .talksell-notification-header .header-title {
      font-weight: 600 !important;
      color: \${widget.config.primaryColor} !important;
    }

    .talksell-notification-body {
      font-size: 15px !important;
      color: #1e293b !important;
      line-height: 1.6 !important;
      font-weight: 400 !important;
    }
    
    .talksell-notification-close-btn {
      position: absolute !important;
      top: 12px !important;
      left: 12px !important;
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      border: none !important;
      background-color: rgba(0, 0, 0, 0.05) !important;
      color: #64748b !important;
      font-size: 18px !important;
      line-height: 32px !important;
      text-align: center !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    .talksell-notification-close-btn:hover {
      background-color: rgba(0, 0, 0, 0.1) !important;
      color: #1e293b !important;
      transform: scale(1.1) !important;
    }

    /* Enhanced Iframe Styles */
    .talksell-widget-container .talksell-widget-iframe {
      position: absolute !important;
      width: 380px !important;
      height: 640px !important;
      min-width: 380px !important;
      min-height: 640px !important;
      bottom: 80px !important;
      right: 0 !important;
      border: none !important;
      border-radius: 24px !important;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.1) !important;
      background: white !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transform-origin: bottom right !important;
      transform: scale(0.85) translateY(20px) !important;
      transition: all 0.4s cubic-bezier(0.33, 1, 0.68, 1) !important;
      pointer-events: none !important;
      overflow: hidden !important;
      backdrop-filter: blur(20px) !important;
    }
    
    .talksell-widget-container .talksell-widget-iframe.open {
      opacity: 1 !important;
      visibility: visible !important;
      transform: scale(1) translateY(0) !important;
      pointer-events: auto !important;
    }
    
    /* Positioning */
    .position-bottom-right {
      bottom: 24px !important;
      right: 24px !important;
    }

    .position-bottom-left {
      bottom: 24px !important;
      left: 24px !important;
    }

    .position-top-right {
      top: 24px !important;
      right: 24px !important;
    }

    .position-top-left {
      top: 24px !important;
      left: 24px !important;
    }
    
    /* Enhanced Mobile Responsive */
    @media (max-width: 480px) {
      .talksell-widget-container {
        width: 100vw !important;
        height: 100vh !important;
        top: 0 !important;
        left: 0 !important;
        bottom: auto !important;
        right: auto !important;
      }
      
      .talksell-widget-container .talksell-widget-iframe {
        width: 100vw !important;
        height: 100vh !important;
        min-width: 100vw !important;
        min-height: 100vh !important;
        border-radius: 0 !important;
        top: 0 !important;
        left: 0 !important;
        bottom: auto !important;
        right: auto !important;
        transform: translateY(100%) !important;
        transition: transform 0.4s cubic-bezier(0.33, 1, 0.68, 1) !important;
      }
      
      .talksell-widget-container .talksell-widget-iframe.open {
        transform: translateY(0) !important;
      }
      
      .talksell-widget-button {
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1) !important;
        z-index: 2147483647 !important;
      }
      
      .talksell-widget-button.is-open {
        opacity: 0 !important;
        pointer-events: none !important;
        transform: scale(0.8) !important;
      }
      
      .talksell-widget-notification {
        position: fixed !important;
        bottom: 100px !important;
        right: 24px !important;
        left: 24px !important;
        width: auto !important;
        max-width: calc(100vw - 48px) !important;
      }
    }

    /* Pulse animation for new notifications */
    @keyframes talksell-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .talksell-widget-button.has-notification {
      animation: talksell-pulse 2s infinite !important;
    }

    /* Loading state */
    .talksell-widget-button.loading {
      pointer-events: none !important;
      opacity: 0.7 !important;
    }

    .talksell-widget-button.loading .talksell-chat-icon {
      animation: spin 1s linear infinite !important;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  \`;

  document.head.appendChild(style);
  log("✅ Enhanced styles injected with TalkSell branding");
}

// Create widget elements with enhanced functionality
function createWidget() {
  log("🏗️ Creating TalkSell widget elements...");

  const existing = document.querySelector('.talksell-widget-container');
  if (existing) existing.remove();

  widget.container = document.createElement('div');
  widget.container.className = \`talksell-widget-container position-\${widget.config.position}\`;

  // Create Enhanced Welcome Notification
  widget.welcomeNotification = document.createElement('div');
  widget.welcomeNotification.className = 'talksell-widget-notification';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'talksell-notification-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideWelcomeNotification();
    localStorage.setItem('talksell-notification-dismissed', 'true');
    log("🖱️ Welcome notification dismissed by user");
  });

  const content = document.createElement('div');
  content.className = 'talksell-notification-content';
  content.innerHTML = \`
    <div class="talksell-notification-header">
      <span class="header-title">تاکسل</span>
      <span>•</span>
      <span class="header-time">همین الان</span>
    </div>
    <div class="talksell-notification-body">\${widget.config.welcomeMessage}</div>
  \`;
  content.addEventListener('click', handleNotificationClick);
  
  widget.welcomeNotification.appendChild(closeBtn);
  widget.welcomeNotification.appendChild(content);
  log("✅ Enhanced welcome notification created");

  // Create Enhanced Button
  widget.button = document.createElement('button');
  widget.button.className = 'talksell-widget-button';
  widget.button.setAttribute('aria-label', 'باز کردن چت تاکسل');
  widget.button.setAttribute('title', 'چت با تاکسل');
  
  const iconSpan = document.createElement('span');
  iconSpan.className = 'talksell-chat-icon';
  widget.button.appendChild(iconSpan);
  widget.button.addEventListener('click', toggleWidget);

  // Create Enhanced Iframe
  widget.iframe = document.createElement('iframe');
  widget.iframe.className = 'talksell-widget-iframe';
  widget.iframe.src = \`\${BASE_URL}/widget/\${widget.config.id}?v=\${Date.now()}\`;
  widget.iframe.allow = 'microphone';
  widget.iframe.title = 'تاکسل چت‌بات';
  widget.iframe.setAttribute('loading', 'lazy');

  // Assemble widget
  widget.container.appendChild(widget.iframe);
  widget.container.appendChild(widget.welcomeNotification);
  widget.container.appendChild(widget.button);
  document.body.appendChild(widget.container);

  // Setup message listener
  window.addEventListener('message', handleMessage);

  // Show welcome notification with delay
  const notificationDismissed = localStorage.getItem('talksell-notification-dismissed');
  if (!notificationDismissed) {
    setTimeout(() => {
      if (!widget.isOpen) {
        showWelcomeNotification();
      }
    }, widget.config.showWelcomeDelay);
  }

  log("✅ TalkSell widget elements created and assembled");
}

function showWelcomeNotification() {
  if (widget.welcomeNotification) {
    widget.welcomeNotification.classList.add('show');
    widget.button.classList.add('has-notification');
    log("📢 Welcome notification shown");
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      hideWelcomeNotification();
    }, 10000);
  }
}

function hideWelcomeNotification() {
  if (widget.welcomeNotification) {
    widget.welcomeNotification.classList.remove('show');
    widget.button.classList.remove('has-notification');
    log("📢 Welcome notification hidden");
  }
}

function handleNotificationClick() {
  log("🖱️ Welcome notification clicked");
  hideWelcomeNotification();
  openWidget();
}

function handleMessage(event) {
  if (event.data && (event.data.type === 'orion-chatbot-close' || event.data === 'close-widget')) {
    log("🔒 Received close command from iframe");
    closeWidget();
  }
}

function toggleWidget(e) {
  if (e) e.stopPropagation();
  if (widget.isLoading) return;
  widget.isOpen ? closeWidget() : openWidget();
}

function openWidget() {
  if (widget.isOpen) return;
  log("🔓 Opening TalkSell widget");
  widget.isLoading = true;
  widget.button.classList.add('loading');

  hideWelcomeNotification();
  widget.iframe.classList.add('open');
  
  // Enhanced button animation
  widget.button.classList.add('is-open');
  const iconSpan = widget.button.querySelector('.talksell-chat-icon');
  iconSpan.innerHTML = '&times;';
  
  setTimeout(() => {
    widget.isOpen = true;
    widget.isLoading = false;
    widget.button.classList.remove('loading');
    log("✅ TalkSell widget opened");
  }, 200);
}

function closeWidget() {
  if (!widget.isOpen) return;
  log("🔒 Closing TalkSell widget");
  widget.isLoading = true;
  widget.button.classList.add('loading');

  widget.iframe.classList.remove('open');
  
  // Reset button to original state
  widget.button.classList.remove('is-open');
  const iconSpan = widget.button.querySelector('.talksell-chat-icon');
  if (widget.config.hasImageIcon) {
    iconSpan.innerHTML = \`<img src="\${widget.config.chatIcon}" alt="تاکسل" />\`;
  } else {
    iconSpan.innerHTML = widget.config.chatIcon;
  }
  
  setTimeout(() => {
    widget.isOpen = false;
    widget.isLoading = false;
    widget.button.classList.remove('loading');
    log("✅ TalkSell widget closed");
  }, 300);
}

async function fetchChatbotData() {
  try {
    log("📡 Fetching chatbot configuration...");
    const response = await fetch(\`\${BASE_URL}/api/chatbots/\${widget.config.id}\`);
    
    if (response.ok) {
      const data = await response.json();
      log("📊 Chatbot data received:", data.name);
      
      // Apply chatbot configuration
      widget.config.primaryColor = data.primary_color || '#0D9488';
      widget.config.chatIcon = data.chat_icon || '💬';
      widget.config.hasImageIcon = isImageIcon(data.chat_icon);
      widget.config.welcomeMessage = data.welcome_message || widget.config.welcomeMessage;
      
      log(\`🎨 Applied theme color: \${widget.config.primaryColor}\`);
      log(\`🎭 Applied chat icon: \${widget.config.chatIcon}\`);
      
      // Update UI with fetched data
      updateWidgetAppearance();
      
    } else {
      log("⚠️ Failed to fetch chatbot data, using defaults");
      updateWidgetAppearance();
    }
  } catch (err) {
    log("❌ Error fetching chatbot data:", err);
    updateWidgetAppearance();
  }
}

function updateWidgetAppearance() {
  // Update button appearance
  const iconSpan = widget.button.querySelector('.talksell-chat-icon');
  if (widget.config.hasImageIcon) {
    iconSpan.innerHTML = \`<img src="\${widget.config.chatIcon}" alt="تاکسل" />\`;
  } else {
    iconSpan.innerHTML = widget.config.chatIcon;
  }
  
  // Update button color
  widget.button.style.background = \`linear-gradient(135deg, \${widget.config.primaryColor}, \${widget.config.primaryColor}dd)\`;
  
  // Update notification content
  const notificationBody = widget.welcomeNotification.querySelector('.talksell-notification-body');
  if (notificationBody) {
    notificationBody.innerHTML = widget.config.welcomeMessage;
  }
  
  // Update CSS custom properties
  document.documentElement.style.setProperty('--talksell-primary-color', widget.config.primaryColor);
  
  log("✅ Widget appearance updated");
}

function init(options = {}) {
  log("🚀 Initializing TalkSell widget with options:", options);

  if (!options.id) {
    console.error("❌ [TalkSell Widget] No chatbot ID provided. Aborting initialization.");
    return;
  }
  
  widget.config.id = options.id;
  widget.config.position = options.position || widget.config.position;
  widget.config.primaryColor = options.primaryColor || widget.config.primaryColor;
  widget.config.autoOpen = options.autoOpen || false;
  widget.config.showWelcomeDelay = options.welcomeDelay || 3000;

  createStyles();
  createWidget();
  fetchChatbotData();

  log("✅ TalkSell widget initialized successfully");
}

function autoInit() {
  log("🔍 Auto-detecting TalkSell widget configuration...");
  const scriptTag = document.querySelector('script[data-chatbot-id]');
  
  if (scriptTag && scriptTag.dataset.chatbotId) {
    const config = {
      id: scriptTag.dataset.chatbotId,
      position: scriptTag.dataset.position || 'bottom-right',
      primaryColor: scriptTag.dataset.primaryColor || '#0D9488',
      autoOpen: scriptTag.dataset.autoOpen === 'true',
      welcomeDelay: parseInt(scriptTag.dataset.welcomeDelay) || 3000
    };
    
    log(\`🎯 TalkSell widget configuration detected for chatbot ID: \${config.id}\`);
    init(config);
  } else {
    log("ℹ️ No auto-configuration found. Use window.TalkSellWidget.init() for manual initialization");
  }
}

// Global API
window.TalkSellWidget = { 
  init,
  open: openWidget,
  close: closeWidget,
  toggle: toggleWidget
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  autoInit();
}

log("🎉 TalkSell Widget script loaded successfully");

})();
`

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
