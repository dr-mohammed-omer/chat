import { Analytics } from "@vercel/analytics/react";
import "../styles/globals.css";

export const metadata = {
  title: "OmerGPT – Your Personal AI Chatbot",
  openGraph: {
    title: "OmerGPT – Your Personal AI Chatbot",
    description: "          Ask me anything, and I’ll do my best to help!",
  },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <title>OmerGPT</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🦙</text></svg>"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
