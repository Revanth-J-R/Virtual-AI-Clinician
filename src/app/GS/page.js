"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { useState } from "react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm Alpha, your AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    // Append user message
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");

    // Simulate a bot response after a short delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I'm here to help!" },
      ]);
    }, 1000);
  };

  return (
    <div className="container-fluid p-0" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Top AI Avatar Section */}
      <div className="d-flex justify-content-center align-items-center py-4" style={{ background: "#343a40" }}>
        <div className="position-relative">
          <Image 
            src="/ai-avatar.png" 
            alt="AI Avatar" 
            width={120} 
            height={120} 
            className="rounded-circle border border-3 border-white" 
          />
          <div 
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
            style={{ fontSize: "0.8rem" }}
          >
            AI
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container py-4">
        <div className="card shadow-lg" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="card-body" style={{ height: "400px", overflowY: "auto" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 d-flex ${msg.sender === "bot" ? "justify-content-start" : "justify-content-end"}`}
              >
                <span className={`badge ${msg.sender === "bot" ? "bg-primary" : "bg-secondary"}`} style={{ fontSize: "1rem", padding: "10px", borderRadius: "15px" }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="card-footer">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === "Enter") handleSend(); }}
              />
              <button className="btn btn-dark" onClick={handleSend}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
