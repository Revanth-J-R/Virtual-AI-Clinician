"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import "./gs.css"; // Import your custom CSS
import { useRef, useEffect } from "react";

export default function ChatbotPage() {
  // Chat state

  const chatRef = useRef(null);

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm Alpha, your AI assistant. How can I help?" },
  ]);
  const [input, setInput] = useState("");
  const [faqOpen, setFaqOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const requiredSlots = ["name", "age", "weight", "problem", "duration", "allergies"];
      const [userInfo, setUserInfo] = useState({}); // Stores slot values
  
      useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);
    

    const handleSend = async () => {
      if (!input.trim()) return;
  
      setMessages([...messages, { sender: "user", text: input }]);
      setInput("");
  
      // Slot Filling Logic
      let updatedUserInfo = { ...userInfo };
      let nextSlot = requiredSlots.find(slot => !updatedUserInfo[slot]);
  
      if (nextSlot) {
          updatedUserInfo[nextSlot] = input;
          setUserInfo(updatedUserInfo);
          setMessages(prev => [...prev, { sender: "bot", text: `✅ Got it! Now, please provide your ${nextSlot}.` }]);
          return;
      }
  
      // All slots filled, construct patient info
      const patientInfo = `The patient ${updatedUserInfo.name}, age ${updatedUserInfo.age}, weight ${updatedUserInfo.weight}, 
      has reported ${updatedUserInfo.problem} for ${updatedUserInfo.duration}. Known allergies: ${updatedUserInfo.allergies}.`;
  
      // Add patient info to history
      const history = messages.map(m => `${m.sender}: ${m.text}`).join("\n") + `\nBot: ${patientInfo}`;
  
      // Follow-up question detection
      const followUpKeywords = ["precautions", "treatment", "medicine", "advice"];
      const isFollowUp = followUpKeywords.some(keyword => input.toLowerCase().includes(keyword));
  
      // API Call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
  
      try {
          setMessages(prev => [...prev, { sender: "bot", text: "⏳ Processing..." }]);
  
          const response = await fetch("https://1e1f-34-170-161-156.ngrok-free.app/alpha_bot80", { 
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ request: input, history }), 
              signal: controller.signal,
          });
  
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error();
  
          const data = await response.json();
          setMessages(prev => [...prev.slice(0, -1), { sender: "bot", text: data.answer }]);
  
          // Reset slots after successful query, but only if it's NOT a follow-up question
          // if (!isFollowUp) {
          //     setUserInfo({});
          // }
      } catch (error) {
          setMessages(prev => [...prev.slice(0, -1), { sender: "bot", text: "⚠️ An error occurred. Try again!" }]);
      }
  };
  
  

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     setMessages([...messages, { sender: "user", text: input }]);
//     setInput("");

//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout

//     try {
//         setMessages((prev) => [...prev, { sender: "bot", text: "⏳ Processing..." }]);

//         const response = await fetch("https://5853-35-187-154-206.ngrok-free.app/alpha_bot7", { 
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({query: input}), 
//             signal: controller.signal,
//         });

//         clearTimeout(timeoutId);

//         if (!response.ok) throw new Error();

//         const data = await response.json();
//         setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: data.answer }]);
//     } catch (error) {
//         setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: "⚠️ An error occurred. Try again!" }]);
//     }
// };


  

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h4 className="sidebar-title">Menu</h4>
<ul className="sidebar-menu">
          <li >
            <Link href="/dashboard" aria-label="Go to Dashboard">
              <span className="menu-icon" style={{ margin: "5px" }}><img src="/dashboard-2-48.png" width="20" height="20"/></span>    Dashboard
            </Link>
          </li>
          <li>
            <Link href="/settings" aria-label="Go to Settings">
              <span className="menu-icon" style={{ margin: "5px" }}><img src="/gear-48.png" width="20" height="20"/></span> Settings
            </Link>
          </li>
          <li>
            <Link href="/ai-doctor" aria-label="Go to AI Doctor">
              <span className="menu-icon" style={{ margin: "5px" }}><img src="/appointment-reminders-48.png" width="20" height="20"/></span> Appointments
            </Link>
          </li>
          <li>
            <Link href="/myhealth-tracker" aria-label="Go to MyHealth Tracker">
              <span className="menu-icon" style={{ margin: "5px" }}><img src="/report-2-48.png" width="20" height="20"/></span> MyHealth Tracker
            </Link>
          </li>
          <li>
            <Link href="/special-care" aria-label="Go to Special Care Hub">
              <span className="menu-icon" style={{ margin: "5px" }}><img src="/baby-48.png" width="20" height="20"/></span> Special Care Hub
            </Link>
          </li>
          <li>
            <Link href="/Sidebarpages/xray">
              <span className="menu-icon" style={{ margin: "5px" }}><img src="/xray-48.png" width="20" height="20"/></span> AI X-Ray Analyzer
            </Link>
          </li>
          <li>
            <Link href="/Sidebarpages/article" aria-label="Go to Disease Prevention">
              <span className="menu-icon" style={{ margin: "5px" }}><img src="/virus.png" width="20" height="20"/></span> Disease Prevention
            </Link>
          </li>
          <li>
            <Link href="/profile" aria-label="Go to Profile">
             <span className="menu-icon" style={{ margin: "5px" }}><img src="/user-48.png" width="20" height="20"/></span> Profile
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
            <img
              src="https://cdn-icons-png.flaticon.com/512/6522/6522516.png"
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
            // src="/ai-avatar.png"
            src="/doc.jpg"
            alt="AI Avatar"
            width={200}
            height={200}
            className="avatar-image"
          />
        </div>

        {/* Chat Box */}
        <div className="chat-box">
          <div className="messages" ref={chatRef}>
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
