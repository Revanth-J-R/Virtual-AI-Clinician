"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import "./gs.css"; // Import your custom CSS

export default function ChatbotPage() {
  // Chat state
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm Alpha, your AI assistant. How can I help?" },
  ]);
  const [input, setInput] = useState("");
  const [faqOpen, setFaqOpen] = useState(false);

  // Sidebar state
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: "I'm here to help!" }]);
    }, 1000);
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h4 className="sidebar-title">Menu</h4>
        <ul className="sidebar-menu">
          <li>
            <Link href="/dashboard" aria-label="Go to Dashboard">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/settings" aria-label="Go to Settings">
              Settings
            </Link>
          </li>
          <li>
            <Link href="/ai-doctor" aria-label="Go to AI Doctor">
              AI Doctor
            </Link>
          </li>
          <li>
            <Link href="/myhealth-tracker" aria-label="Go to MyHealth Tracker">
              MyHealth Tracker
            </Link>
          </li>
          <li>
            <Link href="/special-care" aria-label="Go to Special Care Hub">
              Special Care Hub
            </Link>
          </li>
          <li>
            <Link href="/Sidebarpages/xray">
              AI X-Ray Analyzer
            </Link>
          </li>
          <li>
            <Link href="/Sidebarpages/article" aria-label="Go to Disease Prevention">
              Disease Prevention
            </Link>
          </li>
          <li>
            <Link href="C:\Users\PRASENNA\HealthcareHack\src\app\Sidebarpages\profile" aria-label="Go to Profile">
              Profile
            </Link>
          </li>
        </ul>
      </div>

      {/* Navbar */}
      <nav className="navbar navbar-light bg-light fixed-top d-flex justify-content-between align-items-center px-3">
        <div className="d-flex align-items-center">
          <button
            className="btn bg-black text-white me-2"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
          <div className="navbar-brand">AlphaWell</div>
        </div>
        <div className="profile-icon">
          <Link href="/profile">
            <Image
              src="/profile.png"
              alt="Profile"
              width={40}
              height={40}
              className="rounded-circle"
            />
          </Link>
        </div>
      </nav>

      {/* Main Content Wrapper with top margin to account for navbar */}
      <div style={{ marginTop: "80px" }}>
        {/* AI Avatar Section */}
        <div className="ai-avatar">
          <Image
            src="/ai-avatar.png"
            alt="AI Avatar"
            width={200}
            height={200}
            className="avatar-image"
          />
        </div>

        {/* Chat Box */}
        <div className="chat-box">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>

        {/* FAQ Section (Right Side) */}
        <div className={`faq-section ${faqOpen ? "open" : ""}`}>
          <button className="faq-toggle" onClick={() => setFaqOpen(!faqOpen)}>
            {faqOpen ? "❌ Close FAQ" : "❓ FAQ"}
          </button>
          {faqOpen && (
            <div className="faq-content">
              <h3>Frequently Asked Questions</h3>
              <ul>
                <li>
                  <strong>How does this chatbot work?</strong>
                  <br />
                  It uses AI to provide real-time responses.
                </li>
                <li>
                  <strong>Can I talk about medical issues?</strong>
                  <br />
                  Yes, but always consult a doctor for serious concerns.
                </li>
                <li>
                  <strong>Is my data safe?</strong>
                  <br />
                  Yes, we do not store personal data.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
