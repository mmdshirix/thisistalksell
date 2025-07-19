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

 // Fetch chatbot settings to apply positioning
 fetch(\`\${appUrl}/api/chatbots/\${chatbotId}\`)
   .then(response => response.json())
   .then(chatbot => {
     console.log("TalkSell Chatbot: Settings loaded:", chatbot);
     
     // Apply positioning based on chatbot settings
     const position = chatbot.position || 'bottom-right';
     const marginX = chatbot.margin_x || 20;
     const marginY = chatbot.margin_y || 20;
     
     console.log(\`TalkSell Chatbot: Applying position \${position} with margins X:\${marginX}px, Y:\${marginY}px\`);
     
     // Reset all positions
     iframe.style.bottom = 'auto';
     iframe.style.top = 'auto';
     iframe.style.left = 'auto';
     iframe.style.right = 'auto';
     
     // Apply position based on settings
     if (position.includes('bottom')) {
       iframe.style.bottom = marginY + 'px';
     }
     if (position.includes('top')) {
       iframe.style.top = marginY + 'px';
     }
     if (position.includes('right')) {
       iframe.style.right = marginX + 'px';
     }
     if (position.includes('left')) {
       iframe.style.left = marginX + 'px';
     }
     
     console.log("TalkSell Chatbot: Position applied successfully");
   })
   .catch(error => {
     console.error("TalkSell Chatbot: Error loading settings, using defaults:", error);
     // Default positioning
     iframe.style.bottom = '20px';
     iframe.style.right = '20px';
   });

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
