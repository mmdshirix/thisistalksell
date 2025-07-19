import { NextResponse } from "next/server"

export async function GET() {
  const scriptContent = `
(function() {
    // جلوگیری از اجرای مجدد
    if (window.TalkSellWidgetLoaded) {
        console.log('🤖 [TalkSell Widget] ⚠️ Widget already loaded, skipping...');
        return;
    }
    window.TalkSellWidgetLoaded = true;

    console.log('🤖 [TalkSell Widget] 🎉 TalkSell Widget script loaded successfully');

    // پیدا کردن اسکریپت تگ فعلی
    const currentScript = document.currentScript || document.querySelector('script[src*="widget-loader.js"]');
    if (!currentScript) {
        console.error('🤖 [TalkSell Widget] ❌ Could not find script tag');
        return;
    }

    console.log('🤖 [TalkSell Widget] 🔍 Reading configuration from script attributes...');

    // خواندن تنظیمات از data attributes
    const chatbotId = currentScript.getAttribute('data-chatbot-id');
    const position = currentScript.getAttribute('data-position') || 'bottom-right';
    const primaryColor = currentScript.getAttribute('data-primary-color') || '#0D9488';
    const marginX = parseInt(currentScript.getAttribute('data-margin-x') || '20');
    const marginY = parseInt(currentScript.getAttribute('data-margin-y') || '20');
    const autoOpen = currentScript.getAttribute('data-auto-open') === 'true';
    const welcomeDelay = parseInt(currentScript.getAttribute('data-welcome-delay') || '3000');

    if (!chatbotId) {
        console.error('🤖 [TalkSell Widget] ❌ data-chatbot-id is required');
        return;
    }

    console.log(\`🤖 [TalkSell Widget] 📋 Configuration loaded:\`, {
        chatbotId,
        position,
        primaryColor,
        marginX: marginX + 'px',
        marginY: marginY + 'px',
        autoOpen,
        welcomeDelay: welcomeDelay + 'ms'
    });

    const BASE_URL = new URL(currentScript.src).origin;

    // ایجاد کانتینر اصلی
    const container = document.createElement('div');
    container.id = 'talksell-widget-container';
    container.style.cssText = \`
        position: fixed;
        z-index: 999999;
        width: auto;
        height: auto;
        pointer-events: none;
    \`;

    // دکمه لانچر
    const launcherButton = document.createElement('div');
    launcherButton.id = 'talksell-launcher-button';
    launcherButton.style.cssText = \`
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: \${primaryColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        pointer-events: auto;
        position: relative;
        z-index: 2;
        user-select: none;
    \`;
    launcherButton.innerHTML = '💬';

    // iframe ویجت
    const widgetFrame = document.createElement('iframe');
    widgetFrame.id = 'talksell-widget-iframe';
    widgetFrame.src = \`\${BASE_URL}/widget/\${chatbotId}\`;
    widgetFrame.style.cssText = \`
        border: none;
        width: 400px;
        max-width: calc(100vw - 40px);
        height: 600px;
        max-height: calc(100vh - 40px);
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        position: absolute;
        opacity: 0;
        transform: scale(0.95) translateY(10px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
        display: none;
        z-index: 1;
        background: white;
    \`;

    console.log(\`🤖 [TalkSell Widget] 📐 Applying position: \${position} with margins X:\${marginX}px, Y:\${marginY}px\`);

    // اعمال موقعیت با فاصله‌های سفارشی
    function applyPosition() {
        // پاک کردن موقعیت‌های قبلی
        container.style.bottom = 'auto';
        container.style.top = 'auto';
        container.style.left = 'auto';
        container.style.right = 'auto';

        // تنظیم موقعیت کانتینر بر اساس position و margin ها
        if (position.includes('bottom')) {
            container.style.bottom = marginY + 'px';
            widgetFrame.style.bottom = '70px'; // فاصله از دکمه
        }
        if (position.includes('top')) {
            container.style.top = marginY + 'px';
            widgetFrame.style.top = '70px';
        }
        if (position.includes('right')) {
            container.style.right = marginX + 'px';
            widgetFrame.style.right = '0';
        }
        if (position.includes('left')) {
            container.style.left = marginX + 'px';
            widgetFrame.style.left = '0';
        }

        console.log(\`🤖 [TalkSell Widget] ✅ Position applied successfully\`);
    }

    applyPosition();

    // اضافه کردن عناصر به DOM
    container.appendChild(widgetFrame);
    container.appendChild(launcherButton);
    document.body.appendChild(container);

    console.log('🤖 [TalkSell Widget] 🏗️ Widget elements created and added to DOM');

    let isOpen = false;

    // تابع تغییر وضعیت
    function toggleWidget() {
        isOpen = !isOpen;
        console.log(\`🤖 [TalkSell Widget] 🔄 Toggle widget to: \${isOpen ? 'OPEN' : 'CLOSED'}\`);
        
        if (isOpen) {
            widgetFrame.style.display = 'block';
            setTimeout(() => {
                widgetFrame.style.opacity = '1';
                widgetFrame.style.transform = 'scale(1) translateY(0)';
                widgetFrame.style.pointerEvents = 'auto';
                launcherButton.innerHTML = '✕';
                launcherButton.style.transform = 'rotate(180deg)';
            }, 10);
        } else {
            widgetFrame.style.opacity = '0';
            widgetFrame.style.transform = 'scale(0.95) translateY(10px)';
            widgetFrame.style.pointerEvents = 'none';
            launcherButton.innerHTML = '💬';
            launcherButton.style.transform = 'rotate(0deg)';
            setTimeout(() => {
                if (!isOpen) widgetFrame.style.display = 'none';
            }, 300);
        }
    }

    // رویدادها
    launcherButton.addEventListener('click', toggleWidget);
    
    launcherButton.addEventListener('mouseenter', () => {
        launcherButton.style.transform = (isOpen ? 'rotate(180deg) ' : '') + 'scale(1.1)';
    });
    
    launcherButton.addEventListener('mouseleave', () => {
        launcherButton.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // پیام‌های iframe
    window.addEventListener('message', (event) => {
        if (event.source !== widgetFrame.contentWindow) return;
        
        if (event.data.type === 'orion-chatbot-close') {
            if (isOpen) toggleWidget();
        } else if (event.data.type === 'orion-chatbot-toggle') {
            toggleWidget();
        }
    });

    // باز کردن خودکار
    if (autoOpen) {
        console.log(\`🤖 [TalkSell Widget] ⏰ Auto-open scheduled for \${welcomeDelay}ms\`);
        setTimeout(() => {
            if (!isOpen) {
                console.log('🤖 [TalkSell Widget] 🚀 Auto-opening widget');
                toggleWidget();
            }
        }, welcomeDelay);
    }

    console.log('🤖 [TalkSell Widget] ✅ Widget initialization completed successfully');

})();
  `

  return new NextResponse(scriptContent, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
