export default function TestEmbedPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Test Embed Page</h1>
      <p className="mb-4">
        This page demonstrates how the chatbot embed code works on a client website. The chatbot should appear as a
        floating button in the bottom right corner.
      </p>
      <p className="mb-4">
        If you don't see the chatbot, check the browser console for any errors by pressing F12 and looking at the
        "Console" tab.
      </p>

      <div className="mt-8 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Sample Content</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc
          nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
        </p>
      </div>

      {/* The chatbot script will be added here when viewing the page */}
      <div id="embed-code-container" className="mt-8 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Embed Code Location</h2>
        <p>
          In a real website, you would add the embed code just before the closing &lt;/body&gt; tag. For this demo, the
          chatbot script is already included in this page.
        </p>
      </div>

      {/* This script tag will be rendered on the client side */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Add the chatbot script dynamically
            const script = document.createElement('script');
            script.src = '/widget-loader.js';
            script.dataset.chatbotId = '1'; // Replace with your actual chatbot ID
            script.dataset.autoInit = 'true';
            script.async = true;
            document.body.appendChild(script);
          `,
        }}
      />
    </div>
  )
}
