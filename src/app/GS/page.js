'use client';

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import "./gs.css"; // Your existing CSS + sidebar styles here
// import { createChatSession, saveMessage } from "../lib/firebaseChat";

export default function ChatbotPage() {
  const chatRef = useRef(null);

  // Chat messages & input
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm Alpha, your AI assistant. How can I help?" },
  ]);
  const [input, setInput] = useState("");

  // Sidebar, FAQ toggles
  const [faqOpen, setFaqOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Example chat topics for history sidebar
  const [chatTopics, setChatTopics] = useState([
    { id: 1, title: "Consultation about Flu Symptoms" },
    { id: 2, title: "Allergy Advice" },
    { id: 3, title: "Medication Follow-up" },
  ]);

  // --- TTS state ---
  const [voices, setVoices] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gifKey, setGifKey] = useState(0); // to re-render gif when speaking
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const currentUtterRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  // Control this value to change how long the avatar GIF stays visible after speech ends (milliseconds)
  const GIF_FADE_MS = -3000000; // ← change this to 0 / 200 / 500 etc.

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Load available voices
  useEffect(() => {
    if (!synthRef.current) return;

    const loadVoices = () => {
      const v = synthRef.current.getVoices() || [];
      setVoices(v);
    };

    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;

    return () => {
      if (synthRef.current) synthRef.current.onvoiceschanged = null;
    };
  }, []);

  // speakText helper
  const speakText = (text, opts = {}) => {
    if (isMuted) return;
    if (!synthRef.current || !text) return;

    // cancel any ongoing speech
    if (synthRef.current.speaking) {
      try { synthRef.current.cancel(); } catch (e) {}
    }

    // clear any pending fade timeout so gif state is consistent
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    const utter = new SpeechSynthesisUtterance(text);
    currentUtterRef.current = utter;

    const female = voices.find((v) =>
      /female|zira|google uk english female/i.test(v.name)
    );
    if (opts.voiceName) {
      const v = voices.find((v) => v.name.includes(opts.voiceName));
      if (v) utter.voice = v;
    } else if (female) {
      utter.voice = female;
    }

    utter.lang = opts.lang || "en-US";
    utter.rate = opts.rate ?? 1;
    utter.pitch = opts.pitch ?? 1;
    utter.volume = opts.volume ?? 1;

    utter.onstart = () => {
      // When speech starts, show the GIF immediately
      // clear any previous fade timer (precaution)
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      setIsSpeaking(true);
      setGifKey((k) => k + 1);
    };

    // When speech ends, keep the GIF visible for GIF_FADE_MS milliseconds, then hide it
    utter.onend = () => {
      // clear any existing timeout first
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      fadeTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
        currentUtterRef.current = null;
        fadeTimeoutRef.current = null;
      }, GIF_FADE_MS);
    };

    utter.onerror = () => {
      // On error, also hide after the fade delay so UI is consistent
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      fadeTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
        currentUtterRef.current = null;
        fadeTimeoutRef.current = null;
      }, GIF_FADE_MS);
    };

    try {
      synthRef.current.speak(utter);
    } catch (err) {
      console.error("TTS speak error", err);
      // ensure speaking state is cleaned up
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      setIsSpeaking(false);
      currentUtterRef.current = null;
    }
  };

  const stopSpeaking = () => {
    if (!synthRef.current) return;
    try {
      synthRef.current.cancel();
    } catch (e) {}
    // clear any fade timeout and hide the gif immediately
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    setIsSpeaking(false);
    currentUtterRef.current = null;
  };

  const toggleMute = () => {
    setIsMuted((m) => {
      if (!m) stopSpeaking();
      return !m;
    });
  };

  // NOTE: Removed the "speak initial bot greeting once on mount" effect per your request.
  // If you later want to re-enable the initial speak, add a useEffect similar to:
  // useEffect(() => { speakText(messages[0]?.text); }, []); <-- but currently disabled.

  // Handle navigation on chat topic click
  const goToTopic = (id) => {
    alert(`Navigate to chat topic ID: ${id}`);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();

    // Build the new messages array immediately so history uses the latest message
    const newMessages = [...messages, { sender: "user", text: userMsg }];
    setMessages(newMessages);
    setInput("");

    const history = newMessages.map((m) => `${m.sender}: ${m.text}`).join("\n");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds

    try {
      setMessages((prev) => [...prev, { sender: "bot", text: "⏳ Processing..." }]);

      const response = await fetch("https://1e1f-34-170-161-156.ngrok-free.app/alpha_bot80", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: userMsg, history }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error();

      const data = await response.json();
      const answer = data.answer ?? "Sorry, I couldn't generate an answer.";

      // Replace "Processing..." with bot response
      setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: answer }]);

      // Speak the bot answer
      speakText(answer);

    } catch (error) {
      clearTimeout(timeoutId);
      const errMsg = " An error occurred. Try again!";
      setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: errMsg }]);
      speakText(errMsg);
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
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-primary me-2"
            onClick={toggleMute}
            aria-pressed={isMuted}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>

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
              <Link href="/Sidebarpages/profile" aria-label="Go to Profile">
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
          <div className="avatar-wrapper" aria-hidden={isSpeaking ? "false" : "true"}>
            <Image
              src="/doc.jpg"
              alt="AI Avatar"
              width={200}
              height={200}
              className="avatar-image"
            />
            {isSpeaking && (
              <Image
                key={gifKey}
                src="/doc.gif"
                alt="AI Speaking Animation"
                width={200}
                height={200}
                className="gif-overlay"
              />
            )}
          </div>
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
