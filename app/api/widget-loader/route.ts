import { NextResponse, type NextRequest } from "next/server"

export function GET(request: NextRequest) {
  const script = `
(function() {
  // Prevent running multiple times
  if (window.talksellChatbot) {
    console.warn("TalkSell Chatbot already loaded.");
    return;
  }
  window.talksellChatbot = true;

  // Find the script tag to get the chatbotId from its data attribute
  const scriptTag = document.currentScript || document.querySelector('script[src*="/api/widget-loader"]');
  if (!scriptTag) {
    console.error("TalkSell Chatbot: Could not find script tag.");
    return;
  }

  const chatbotId = scriptTag.getAttribute('data-chatbot-id');
  if (!chatbotId) {
    console.error("TalkSell Chatbot: 'data-chatbot-id' attribute is missing.");
    return;
  }

  console.log("TalkSell Chatbot: Initializing for chatbot ID:", chatbotId);

  // Create the iframe that will contain the launcher
  const iframe = document.createElement('iframe');
  const iframeId = 'talksell-launcher-iframe';
  
  // Set iframe styles to be completely transparent and non-intrusive
  iframe.id = iframeId;
  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style.right = '20px';
  iframe.style.width = '450px';
  iframe.style.height = '700px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '2147483647'; // Maximum z-index
  iframe.style.backgroundColor = 'transparent';
  iframe.style.pointerEvents = 'none';
  iframe.setAttribute('allowtransparency', 'true');

  // Set the source to our launcher page
  const appUrl = 'https://talksellapi.vercel.app';
  iframe.src = \`\${appUrl}/launcher/\${chatbotId}?v=\${new Date().getTime()}\`;

  // Append the iframe to the body of the host page
  document.body.appendChild(iframe);

  // Communication from iframe to host page
  window.addEventListener("message", (event) => {
    if (event.source !== iframe.contentWindow) {
      return;
    }
    
    const data = event.data;
    if (data.type === 'TALKSELL_WIDGET_OPEN') {
        iframe.style.pointerEvents = 'auto';
    } else if (data.type === 'TALKSELL_WIDGET_CLOSE') {
        iframe.style.pointerEvents = 'none';
    } else if (data.type === 'TALKSELL_ENABLE_POINTER') {
        iframe.style.pointerEvents = 'auto';
    } else if (data.type === 'TALKSELL_DISABLE_POINTER') {
        iframe.style.pointerEvents = 'none';
    }
  });

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
