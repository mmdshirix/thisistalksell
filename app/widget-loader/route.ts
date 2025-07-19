import { NextResponse } from "next/server"

export async function GET() {
  const script = `
    (function() {
      // Ensure this runs only once
      if (window.isTalkSellWidgetLoaded) {
        return;
      }
      window.isTalkSellWidgetLoaded = true;

      // Find the script tag to get its data attributes
      const scriptTag = document.currentScript || document.querySelector('script[src*="/widget-loader.js"]');
      if (!scriptTag) {
        console.error("TalkSell Widget: Could not find the script tag.");
        return;
      }

      // Extract settings from data attributes
      const chatbotId = scriptTag.getAttribute('data-chatbot-id');
      if (!chatbotId) {
        console.error("TalkSell Widget: data-chatbot-id is required.");
        return;
      }

      const position = scriptTag.getAttribute('data-position') || 'bottom-right';
      const marginX = scriptTag.getAttribute('data-margin-x') || '20';
      const marginY = scriptTag.getAttribute('data-margin-y') || '20';
      
      // Construct the launcher URL with query parameters
      const launcherSrc = new URL(scriptTag.src).origin + '/launcher/' + chatbotId;
      const params = new URLSearchParams({
        position: position,
        marginX: marginX,
        marginY: marginY
      });
      launcherSrc.search = params.toString();

      // Create the iframe container
      const iframeContainer = document.createElement('div');
      iframeContainer.id = 'talksell-widget-container';
      iframeContainer.style.position = 'fixed';
      iframeContainer.style.zIndex = '999999';
      iframeContainer.style.width = '400px';
      iframeContainer.style.height = '600px';
      iframeContainer.style.maxWidth = '100vw';
      iframeContainer.style.maxHeight = '100vh';
      iframeContainer.style.display = 'none'; // Initially hidden
      iframeContainer.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      iframeContainer.style.transform = 'scale(0.9)';
      iframeContainer.style.opacity = '0';
      iframeContainer.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      iframeContainer.style.borderRadius = '1rem';
      iframeContainer.style.overflow = 'hidden';

      // Create the iframe
      const iframe = document.createElement('iframe');
      iframe.src = launcherSrc;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      iframeContainer.appendChild(iframe);
      document.body.appendChild(iframeContainer);

      // Create the launcher button
      const launcherButton = document.createElement('button');
      launcherButton.id = 'talksell-launcher-button';
      launcherButton.style.position = 'fixed';
      launcherButton.style.zIndex = '999998';
      launcherButton.style.width = '60px';
      launcherButton.style.height = '60px';
      launcherButton.style.borderRadius = '50%';
      launcherButton.style.border = 'none';
      launcherButton.style.cursor = 'pointer';
      launcherButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      launcherButton.style.transition = 'transform 0.2s ease-in-out';
      launcherButton.style.display = 'flex';
      launcherButton.style.alignItems = 'center';
      launcherButton.style.justifyContent = 'center';
      launcherButton.style.fontSize = '28px';
      
      document.body.appendChild(launcherButton);

      // --- Positioning Logic ---
      function applyPosition(element, pos, mx, my) {
          element.style.bottom = 'auto';
          element.style.top = 'auto';
          element.style.left = 'auto';
          element.style.right = 'auto';
          if (pos.includes('bottom')) {
              element.style.bottom = my + 'px';
          }
          if (pos.includes('top')) {
              element.style.top = my + 'px';
          }
          if (pos.includes('left')) {
              element.style.left = mx + 'px';
          }
          if (pos.includes('right')) {
              element.style.right = mx + 'px';
          }
      }
      
      applyPosition(launcherButton, position, marginX, marginY);
      // Position the iframe container relative to the button
      if (position.includes('bottom')) {
        iframeContainer.style.bottom = (parseInt(marginY) + 70) + 'px';
      }
      if (position.includes('top')) {
        iframeContainer.style.top = (parseInt(marginY) + 70) + 'px';
      }
      if (position.includes('left')) {
        iframeContainer.style.left = marginX + 'px';
      }
      if (position.includes('right')) {
        iframeContainer.style.right = marginX + 'px';
      }


      // --- Functionality ---
      let isOpen = false;
      function toggleWidget() {
        isOpen = !isOpen;
        if (isOpen) {
          iframeContainer.style.display = 'block';
          setTimeout(() => {
            iframeContainer.style.transform = 'scale(1)';
            iframeContainer.style.opacity = '1';
            launcherButton.innerHTML = '✕'; // Close icon
          }, 10);
        } else {
          iframeContainer.style.transform = 'scale(0.9)';
          iframeContainer.style.opacity = '0';
          launcherButton.innerHTML = window.talksellWidgetIcon || '💬'; // Chat icon
          setTimeout(() => {
            iframeContainer.style.display = 'none';
          }, 300);
        }
      }

      launcherButton.addEventListener('click', toggleWidget);
      
      // Listen for close messages from the iframe
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'orion-chatbot-close') {
          if(isOpen) toggleWidget();
        }
      });

      // Fetch initial settings to style the button
      fetch(new URL(scriptTag.src).origin + '/api/widget-settings/' + chatbotId)
        .then(res => res.json())
        .then(settings => {
          window.talksellWidgetIcon = settings.chat_icon || '💬';
          launcherButton.innerHTML = window.talksellWidgetIcon;
          launcherButton.style.backgroundColor = settings.primary_color || '#0D9488';
          launcherButton.style.color = settings.text_color || '#FFFFFF';
        })
        .catch(err => {
          console.error("TalkSell Widget: Failed to load initial settings.", err);
          launcherButton.innerHTML = '💬';
          launcherButton.style.backgroundColor = '#0D9488';
          launcherButton.style.color = '#FFFFFF';
        });

    })();
  `

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
    },
  })
}
