import "bootstrap/dist/css/bootstrap.min.css";
import { Geist, Geist_Mono, Roboto_Slab } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  weight: ["100", "400", "700"], 
  display: "swap",
});


export const metadata = {
  title: "LiveChatAI - AI Chatbot",
  description: "AI-powered chatbot for customer support and first aid.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="container text-center py-4">
          {/* Header */}
          <nav className="d-flex justify-content-between align-items-center pb-3">
            <h2 className="fw-bold">LiveChatAI</h2>
            <button className="btn btn-dark">Get Started</button>
          </nav>
          
          {/* Main Content */}
          <div className="row align-items-center">
            <div className="col-md-6 text-md-start text-center">
              <h1 className="fw-bold">AI Chatbot for Customer Support.</h1>
              <p className="text-muted">
                First Aid. Save time for your team and customers with AI-powered answers.
              </p>
              <button className="btn btn-primary px-4">Get Started</button>
            </div>
            <div className="col-md-6">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
