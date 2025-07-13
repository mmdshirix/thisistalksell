import { NextResponse } from "next/server"

export async function GET() {
  const scriptContent = `
    (function() {
        // Ensure this script doesn't run twice
        if (document.getElementById('orion-chatbot-container')) {
            console.warn("Orion Chatbot: Widget container already exists. Aborting initialization.");
            return;
        }

        const currentScript = document.currentScript;
        const chatbotId = currentScript.getAttribute('data-chatbot-id');
        if (!chatbotId) {
            console.error("Orion Chatbot: 'data-chatbot-id' attribute is missing from the script tag.");
            return;
        }

        const BASE_URL = new URL(currentScript.src).origin;
        console.log(\`Orion Chatbot: Initializing for chatbot ID: \${chatbotId} from base URL: \${BASE_URL}\`);

        // Fetch settings from a dedicated, uncached endpoint
        fetch(\`\${BASE_URL}/api/widget-settings/\${chatbotId}\`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error || 'Failed to load chatbot settings.') });
                }
                return response.json();
            })
            .then(settings => {
                console.log("Orion Chatbot: Successfully loaded settings.", settings);
                createWidget(settings, BASE_URL);
            })
            .catch(error => {
                console.error("Orion Chatbot: Error loading widget.", error);
            });

        function createWidget(settings, baseUrl) {
            // Main container for both launcher and widget
            const container = document.createElement('div');
            container.id = 'orion-chatbot-container';
            container.style.cssText = \`
                position: fixed;
                z-index: 999999;
                width: auto;
                height: auto;
            \`;

            // Launcher Iframe (the bubble)
            const launcherFrame = document.createElement('iframe');
            launcherFrame.id = 'orion-launcher-iframe';
            launcherFrame.src = \`\${baseUrl}/launcher/\${settings.id}\`;
            launcherFrame.style.cssText = \`
                border: none;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: opacity 0.3s ease, transform 0.3s ease;
                overflow: hidden;
                position: relative; /* Keep in flow for container size */
                z-index: 2;
                opacity: 1;
                transform: scale(1);
            \`;

            // Widget Iframe (the chat window)
            const widgetFrame = document.createElement('iframe');
            widgetFrame.id = 'orion-widget-iframe';
            widgetFrame.src = \`\${baseUrl}/widget/\${settings.id}\`;
            widgetFrame.style.cssText = \`
                border: none;
                width: 400px;
                max-width: calc(100vw - \${(settings.margin_x || 20) * 2}px);
                height: min(700px, calc(100vh - \${(settings.margin_y || 20) * 2}px));
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                position: absolute;
                opacity: 0;
                transform: scale(0.95) translateY(10px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
                display: none; /* Initially hidden */
                z-index: 1;
            \`;

            // Apply positioning based on settings
            const { position, margin_x, margin_y } = settings;
            const marginX = \`\${margin_x || 20}px\`;
            const marginY = \`\${margin_y || 20}px\`;

            if (position.includes('bottom')) {
                container.style.bottom = marginY;
                widgetFrame.style.bottom = '0';
            }
            if (position.includes('top')) {
                container.style.top = marginY;
                widgetFrame.style.top = '0';
            }
            if (position.includes('right')) {
                container.style.right = marginX;
                widgetFrame.style.right = '0';
            }
            if (position.includes('left')) {
                container.style.left = marginX;
                widgetFrame.style.left = '0';
            }

            // Append to body
            container.appendChild(widgetFrame);
            container.appendChild(launcherFrame);
            document.body.appendChild(container);

            let isOpen = false;

            // Communication handler
            window.addEventListener('message', (event) => {
                if (event.source !== launcherFrame.contentWindow && event.source !== widgetFrame.contentWindow) {
                    return;
                }

                const handleToggle = (state) => {
                    isOpen = state;
                    if (isOpen) {
                        widgetFrame.style.display = 'block';
                        setTimeout(() => {
                            widgetFrame.style.opacity = '1';
                            widgetFrame.style.transform = 'scale(1) translateY(0)';
                            widgetFrame.style.pointerEvents = 'auto';
                            launcherFrame.style.opacity = '0';
                            launcherFrame.style.transform = 'scale(0)';
                            launcherFrame.style.pointerEvents = 'none';
                        }, 10);
                    } else {
                        widgetFrame.style.opacity = '0';
                        widgetFrame.style.transform = 'scale(0.95) translateY(10px)';
                        widgetFrame.style.pointerEvents = 'none';
                        launcherFrame.style.opacity = '1';
                        launcherFrame.style.transform = 'scale(1)';
                        launcherFrame.style.pointerEvents = 'auto';
                        setTimeout(() => {
                            if (!isOpen) widgetFrame.style.display = 'none';
                        }, 300);
                    }
                };

                if (event.data.type === 'orion-chatbot-toggle') {
                    handleToggle(!isOpen);
                } else if (event.data.type === 'orion-chatbot-close') {
                    if (isOpen) handleToggle(false);
                } else if (event.data.type === 'orion-chatbot-open') {
                    if (!isOpen) handleToggle(true);
                }
            });
        }
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
