"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import "./gs.css"; // Your existing CSS + sidebar styles here
// Import your firebaseChat helpers if you add Firestore saving
// import { createChatSession, saveMessage } from "../lib/firebaseChat";

export default function ChatbotPage() {
  const chatRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);

  // Chat messages & input
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm Alpha, your AI assistant. How can I help?" },
  ]);
  const [input, setInput] = useState("");

  // Sidebar, FAQ toggles
  const [faqOpen, setFaqOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Slot filling states
  const requiredSlots = ["name", "age", "weight", "problem", "duration", "allergies"];
  const [userInfo, setUserInfo] = useState({});

  // Example chat topics for history sidebar
  const [chatTopics, setChatTopics] = useState([
    { id: 1, title: "Consultation about Flu Symptoms" },
    { id: 2, title: "Allergy Advice" },
    { id: 3, title: "Medication Follow-up" },
  ]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Example: create a new chat session on mount (you can hook your firebase logic here)
  // useEffect(() => {
  //   async function initSession() {
  //     const newSessionId = await createChatSession("Chat started");
  //     setSessionId(newSessionId);
  //   }
  //   initSession();
  // }, []);

  // Handle navigation on chat topic click
  const goToTopic = (id) => {
    alert(`Navigate to chat topic ID: ${id}`);
    // Use router or Link to navigate to detailed chat page if implemented
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message locally
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    // TODO: Save user message to Firebase here, if desired

    // Clear input
    setInput("");

    // Slot Filling Logic
    let updatedUserInfo = { ...userInfo };
    let nextSlot = requiredSlots.find((slot) => !updatedUserInfo[slot]);

    if (nextSlot) {
      updatedUserInfo[nextSlot] = input;
      setUserInfo(updatedUserInfo);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `✅ Got it! Now, please provide your ${nextSlot}.` },
      ]);
      return;
    }

    // All slots filled, construct patient info
    const patientInfo = `The patient ${updatedUserInfo.name}, age ${updatedUserInfo.age}, weight ${updatedUserInfo.weight}, 
      has reported ${updatedUserInfo.problem} for ${updatedUserInfo.duration}. Known allergies: ${updatedUserInfo.allergies}.`;

    const history =
      messages.map((m) => `${m.sender}: ${m.text}`).join("\n") + `\nBot: ${patientInfo}`;

    const followUpKeywords = ["precautions", "treatment", "medicine", "advice"];
    const isFollowUp = followUpKeywords.some((keyword) =>
      input.toLowerCase().includes(keyword)
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds

    try {
      setMessages((prev) => [...prev, { sender: "bot", text: "⏳ Processing..." }]);

      const response = await fetch("https://1e1f-34-170-161-156.ngrok-free.app/alpha_bot80", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: input, history }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error();

      const data = await response.json();

      // Replace "Processing..." with bot response
      setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: data.answer }]);

      // TODO: Save bot response to Firebase here, if desired

      // Optional: reset slots if not a follow up
      // if (!isFollowUp) setUserInfo({});
    } catch (error) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "bot", text: "⚠️ An error occurred. Try again!" },
      ]);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-light bg-light fixed-top d-flex justify-content-between align-items-center px-3">
        <div className="d-flex align-items-center">
          <button
            className="btn bg-black text-white me-2"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar menu"
          >
            ☰
          </button>
          <div className="navbar-brand">AlphaWell</div>
        </div>
        <div className="profile-icon">
          <Link href="/profile" aria-label="Go to profile">
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

      {/* Sidebar Menu */}
      {isSidebarOpen && (
        <div className="sidebar open" aria-label="Main menu sidebar">
          <h4 className="sidebar-title">Menu</h4>
          <ul className="sidebar-menu">
            <li>
              <Link href="/dashboard" aria-label="Go to Dashboard">
                <span className="menu-icon" style={{ margin: "5px" }}>
                  <img src="/dashboard-2-48.png" width="20" height="20" alt="" />
                </span>{" "}
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/settings" aria-label="Go to Settings">
                <span className="menu-icon" style={{ margin: "5px" }}>
                  <img src="/gear-48.png" width="20" height="20" alt="" />
                </span>{" "}
                Settings
              </Link>
            </li>
            <li>
              <Link href="/ai-doctor" aria-label="Go to AI Doctor">
                <span className="menu-icon" style={{ margin: "5px" }}>
                  <img
                    src="/appointment-reminders-48.png"
                    width="20"
                    height="20"
                    alt=""
                  />
                </span>{" "}
                Appointments
              </Link>
            </li>
            <li>
              <Link href="/myhealth-tracker" aria-label="Go to MyHealth Tracker">
                <span className="menu-icon" style={{ margin: "5px" }}>
                  <img src="/report-2-48.png" width="20" height="20" alt="" />
                </span>{" "}
                MyHealth Tracker
              </Link>
            </li>
            <li>
              <Link href="/special-care" aria-label="Go to Special Care Hub">
                <span className="menu-icon" style={{ margin: "5px" }}>
                  <img src="/baby-48.png" width="20" height="20" alt="" />
                </span>{" "}
                Special Care Hub
              </Link>
            </li>
            <li>
              <Link href="/Sidebarpages/xray" aria-label="Go to AI X-Ray Analyzer">
                <span className="menu-icon" style={{ margin: "5px" }}>
                  <img src="/xray-48.png" width="20" height="20" alt="" />
                </span>{" "}
                AI X-Ray Analyzer
              </Link>
            </li>
            <li>
              <Link
                href="/Sidebarpages/article"
                aria-label="Go to Disease Prevention"
              >
                <span className="menu-icon" style={{ margin: "5px" }}>
                  <img src="/virus.png" width="20" height="20" alt="" />
                </span>{" "}
                Disease Prevention
              </Link>
            </li>
            <li>
              <Link href="/profile" aria-label="Go to Profile">
                <span className="menu-icon" style={{ margin: "5px" }}>
                  <img src="/user-48.png" width="20" height="20" alt="" />
                </span>{" "}
                Profile
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          marginTop: "80px",
          paddingRight: "280px", // space for chat history sidebar
          minHeight: "calc(100vh - 80px)",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        {/* AI Avatar */}
        <div className="ai-avatar">
          <Image
            src="/doc.jpg"
            alt="AI Avatar"
            width={200}
            height={200}
            className="avatar-image"
          />
        </div>

        {/* Chat Box */}
        <div
          className="chat-box"
          style={{ width: "100%", maxWidth: 600, flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <div
            className="messages"
            ref={chatRef}
            style={{ flexGrow: 1, overflowY: "auto", padding: 15, display: "flex", flexDirection: "column", gap: 10 }}
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`} role="article" aria-label={`${msg.sender} message`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="input-area" style={{ display: "flex", padding: 10, borderTop: "1px solid #ccc", background: "#fff" }}>
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              aria-label="Type your message"
            />
            <button className="send-btn" onClick={handleSend} aria-label="Send message">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Chat History Sidebar */}
      <aside
        className="chat-history-sidebar"
        aria-label="Chat history topics"
        style={{
          position: "fixed",
          top: "80px",
          right: 0,
          width: 260,
          height: "calc(100vh - 80px)",
          borderLeft: "1px solid #ddd",
          backgroundColor: "#f9f9f9",
          padding: 15,
          overflowY: "auto",
          boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
          zIndex: 10,
        }}
      >
        <h5>Chat History</h5>
        <ul className="chat-history-list" style={{ listStyle: "none", padding: 0 }}>
          {chatTopics.map((topic) => (
            <li key={topic.id} style={{ marginBottom: 10 }}>
              <button
                className="chat-history-btn"
                onClick={() => goToTopic(topic.id)}
                aria-label={`Open chat topic: ${topic.title}`}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderRadius: 5,
                  fontWeight: "500",
                  color: "#333",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {topic.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* FAQ Section */}
      <div
        className={`faq-section ${faqOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: faqOpen ? 240 : 80,
          background: "#fff",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          borderRadius: 10,
          padding: 10,
          transition: "all 0.3s ease",
          zIndex: 20,
        }}
      >
        <button
          className="faq-toggle"
          onClick={() => setFaqOpen(!faqOpen)}
          aria-expanded={faqOpen}
          aria-controls="faq-content"
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            width: "100%",
            fontSize: "0.9rem",
            cursor: "pointer",
            borderRadius: 5,
          }}
        >
          {faqOpen ? "❌ Close FAQ" : "❓ FAQ"}
        </button>
        {faqOpen && (
          <div
            id="faq-content"
            className="faq-content"
            style={{ marginTop: 10, fontSize: "0.8rem", color: "#000" }}
          >
            <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Frequently Asked Questions</h3>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              <li style={{ marginBottom: 6 }}>
                <strong>How does this chatbot work?</strong>
                <br />
                It uses AI to provide real-time responses.
              </li>
              <li style={{ marginBottom: 6 }}>
                <strong>Can I talk about medical issues?</strong>
                <br />
                Yes, but always consult a doctor for serious concerns.
              </li>
              <li style={{ marginBottom: 6 }}>
                <strong>Is my data safe?</strong>
                <br />
                Yes, we do not store personal data.
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
