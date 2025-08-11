'use client';

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  serverTimestamp,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./gs.css";
import { API_URL } from "./config";

// Helpers for consistent Firestore keys and session IDs
function formatDateKey(date = new Date()) {
  return date.toLocaleDateString("en-GB").replace(/\//g, "-");
}
function formatTimeKey(date = new Date()) {
  return date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' });
}
function getSessionId(date = new Date()) {
  return `${formatDateKey(date)}-${formatTimeKey(date)}`;
}

export default function ChatbotPage({ profileId }) {
  const chatRef = useRef(null);

  // Load profile id from prop or localStorage
  const [userProfileId, setUserProfileId] = useState(profileId || null);

  // State
  const [messages, setMessages] = useState([
    { ChatBy: "Bot", Message: "Hello! I'm Alpha, your AI assistant. How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [chatTopics, setChatTopics] = useState([]);
  const [chatId, setChatId] = useState(null);
  const activeChatEnded = !!chatTopics.find((c) => c.id === chatId && c.ended);

  // Sidebar/FAQ toggles
  const [faqOpen, setFaqOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // TTS states
  const [voices, setVoices] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gifKey, setGifKey] = useState(0);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const currentUtterRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  const GIF_FADE_MS = 250;

  // On mount, get profile id from localStorage if not set
  useEffect(() => {
    if (!userProfileId && typeof window !== "undefined") {
      const storedId = localStorage.getItem("selectedProfileId");
      if (!storedId) {
        alert("No profile selected! Please go to Profile Manager and select a profile.");
        return;
      }
      setUserProfileId(storedId);
    }
  }, [userProfileId]);

  // Firestore: load/create chats and listen to chat list (history)
  useEffect(() => {
    if (!userProfileId) return;
    let unsubHistory = null;
    let isMounted = true;

    async function setupChats() {
      try {
        const chatsRef = collection(db, "profileData", userProfileId, "Chats");
        const chatsSnap = await getDocs(query(chatsRef, orderBy("createdAt", "desc")));
        let currentChatId = null;
        let chatWasEnded = false;

        if (!chatsSnap.empty) {
          // Try to find a session for today (reuse session if on same day and not ended)
          const todayPrefix = formatDateKey();
          const todayChat = chatsSnap.docs.find((d) =>
            d.id.startsWith(todayPrefix) && !d.data().ended
          );
          if (todayChat) {
            currentChatId = todayChat.id;
            chatWasEnded = false;
          } else {
            chatWasEnded = true;
          }
        } else {
          chatWasEnded = true;
        }

        if (chatWasEnded) {
          const now = new Date();
          const sessionId = getSessionId(now);
          const chatRefObj = doc(db, "profileData", userProfileId, "Chats", sessionId);
          await setDoc(chatRefObj, {
            createdAt: serverTimestamp(),
            ended: false,
            title: `Chat on ${now.toLocaleString()}`,
          }, { merge: true });
          currentChatId = sessionId;
        }

        if (isMounted) setChatId(currentChatId);

        unsubHistory = onSnapshot(query(chatsRef, orderBy("createdAt", "desc")), (snapshot) => {
          if (!isMounted) return;
          setChatTopics(
            snapshot.docs.map((d) => {
              const data = d.data();
              let title = data.title;
              if (!title) {
                try {
                  title = `Chat on ${data.createdAt?.toDate?.().toLocaleString?.() || "Unknown date"}`;
                } catch {
                  title = "Chat";
                }
              }
              return {
                id: d.id,
                title,
                ended: data.ended,
              };
            })
          );
        });
      } catch (err) {
        console.error("setupChats error:", err);
      }
    }

    setupChats();

    return () => {
      isMounted = false;
      if (unsubHistory) unsubHistory();
    };
  }, [userProfileId]);

  // When chatId changes, listen to messages for that chat
  useEffect(() => {
    if (!userProfileId || !chatId) return;
    const messagesRef = collection(db, "profileData", userProfileId, "Chats", chatId, "Messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const firestoreMessages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (firestoreMessages.length > 0) {
        setMessages(firestoreMessages);
      } else {
        setMessages([{ ChatBy: "Bot", Message: "Hello! I'm Alpha, your AI assistant. How can I help you?" }]);
      }
    }, (err) => {
      console.error("messages onSnapshot error:", err);
    });

    return () => unsub();
  }, [userProfileId, chatId]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 40);
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

  // TTS helpers
  const speakText = (text, opts = {}) => {
    if (isMuted) return;
    if (!synthRef.current || !text) return;
    if (synthRef.current.speaking) {
      try { synthRef.current.cancel(); } catch (e) {}
    }
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
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      setIsSpeaking(true);
      setGifKey((k) => k + 1);
    };
    utter.onend = () => {
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
    try { synthRef.current.cancel(); } catch (e) {}
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

  // End / New chat helpers
  const handleEndChat = async () => {
    if (!chatId) return;
    try {
      const chatDocRef = doc(db, "profileData", userProfileId, "Chats", chatId);
      await updateDoc(chatDocRef, { ended: true });
    } catch (err) {
      console.error("handleEndChat error:", err);
    }
  };

  const handleNewChat = async () => {
    try {
      const now = new Date();
      const sessionId = getSessionId(now);
      const chatRefObj = doc(db, "profileData", userProfileId, "Chats", sessionId);
      await setDoc(chatRefObj, {
        createdAt: serverTimestamp(),
        ended: false,
        title: `Chat on ${now.toLocaleString()}`,
      }, { merge: true });
      setChatId(sessionId);
      setMessages([{ ChatBy: "Bot", Message: "Hello! I'm Alpha, your AI assistant. How can I help you?" }]);
    } catch (err) {
      console.error("handleNewChat error:", err);
    }
  };

  const goToTopic = (id) => setChatId(id);

  // --- Send message ---
  const handleSend = async () => {
    if (!input.trim() || !userProfileId) return;
    const userMsg = input.trim();

    setMessages((prev) => [...prev, { ChatBy: "User", Message: userMsg }]);
    setInput("");

    // Save user message in Firestore
    try {
      let activeChatId = chatId;
      if (!activeChatId) {
        const now = new Date();
        const sessionId = getSessionId(now);
        const chatRefObj = doc(db, "profileData", userProfileId, "Chats", sessionId);
        await setDoc(chatRefObj, {
          createdAt: serverTimestamp(),
          ended: false,
          title: `Chat on ${now.toLocaleString()}`,
        }, { merge: true });
        activeChatId = sessionId;
        setChatId(activeChatId);
      }

      const now = new Date();
      const msgTime = formatTimeKey(now);
      const userMsgRef = doc(
        db,
        "profileData",
        userProfileId,
        "Chats",
        activeChatId,
        "Messages",
        msgTime
      );
      await setDoc(userMsgRef, {
        ChatBy: "User",
        Message: userMsg,
        timestamp: serverTimestamp(),
      });

      // Add "Processing..." bot message (with a slightly different time to avoid collision)
      const botMsgTime = formatTimeKey(new Date(Date.now() + 1000));
      const processingRef = doc(
        db,
        "profileData",
        userProfileId,
        "Chats",
        activeChatId,
        "Messages",
        botMsgTime
      );
      await setDoc(processingRef, {
        ChatBy: "Bot",
        Message: "⏳ Processing...",
        timestamp: serverTimestamp(),
        processing: true,
      });

      // Call LLM/API (same as before)
      const history = (messages.concat({ ChatBy: "User", Message: userMsg }))
        .map((m) => `${m.ChatBy}: ${m.Message}`)
        .join("\n");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      let data, answer;
      try {
        const response = await fetch(API_URL + "/alpha_bot80", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request: userMsg, history }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("API error");
        data = await response.json();
        answer = data.answer ?? "Sorry, I couldn't generate an answer.";
      } catch (error) {
        answer = "⚠️ An error occurred. Try again!";
      }

      // Update the processing doc with the real answer
      await setDoc(processingRef, {
        ChatBy: "Bot",
        Message: answer,
        timestamp: serverTimestamp(),
        processing: false,
      });

      speakText(answer);
    } catch (error) {
      console.error("handleSend error:", error);
      setMessages((prev) => [...prev, { ChatBy: "Bot", Message: "⚠️ An error occurred. Try again!" }]);
      speakText("An error occurred. Try again!");
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-light bg-light fixed-top app-navbar">
        <div className="nav-left">
          <button
            className="btn menu-toggle"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar menu"
          >
            ☰
          </button>
          <div className="navbar-brand">AlphaWell</div>
        </div>
        <div className="nav-right">
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
              className="rounded-circle profile-icon"
            />
          </Link>
        </div>
      </nav>

      {/* Sidebar Menu */}
      {isSidebarOpen && (
        <div className="sidebar open" aria-label="Main menu sidebar">
          <h4 className="sidebar-title">Menu</h4>
          {/* ... sidebar menu ... */}
        </div>
      )}

      {/* Page Main Content */}
      <div className="main-content" />

      {/* Chatbot container */}
      <div className="chatbot-container" aria-hidden={false}>
        <div className="ai-avatar">
          <div className="avatar-wrapper" aria-hidden={isSpeaking ? "false" : "true"}>
            <Image src="/doc.jpg" alt="AI Avatar" width={160} height={160} className="avatar-image" />
            {isSpeaking && (
              <Image
                key={gifKey}
                src="/doc.gif"
                alt="AI Speaking Animation"
                width={160}
                height={160}
                className="gif-overlay"
              />
            )}
          </div>
        </div>
        <div className="chat-box">
          <div className="messages" ref={chatRef} aria-live="polite" aria-relevant="additions">
            {messages.map((msg, index) => {
              const isProcessing = !!msg.processing;
              return (
                <div
                  key={msg.id || index}
                  className={`message ${msg.ChatBy === "Bot" ? "bot" : "user"}${isProcessing ? " processing" : ""}`}
                  role="article"
                  aria-label={`${msg.ChatBy} message`}
                >
                  {msg.Message}
                </div>
              );
            })}
          </div>
          <div className="input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              aria-label="Type your message"
              disabled={activeChatEnded}
            />
            <button className="send-btn" onClick={handleSend} aria-label="Send message" disabled={activeChatEnded}>
              Send
            </button>
            <button className="btn btn-danger end-chat-btn" onClick={handleEndChat} disabled={activeChatEnded || !chatId}>
              End Chat
            </button>
            <button className="btn btn-secondary new-chat-btn" onClick={handleNewChat}>
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <aside className="chat-history-sidebar" aria-label="Chat history topics">
        <h5>Chat History</h5>
        <ul className="chat-history-list">
          {chatTopics.length === 0 ? (
            <li className="no-chats">No chats yet</li>
          ) : (
            chatTopics.map((topic) => (
              <li key={topic.id}>
                <button
                  className="chat-history-btn"
                  onClick={() => goToTopic(topic.id)}
                  aria-label={`Open chat topic: ${topic.title}`}
                  disabled={topic.id === chatId}
                >
                  <span className={`topic-title ${topic.id === chatId ? "active" : ""}`}>
                    {topic.title}
                  </span>
                  {topic.ended && <span className="ended-flag">(Ended)</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      {/* FAQ Section */}
      <div className={`faq-section ${faqOpen ? "open" : ""}`}>
        <button
          className="faq-toggle"
          onClick={() => setFaqOpen(!faqOpen)}
          aria-expanded={faqOpen}
          aria-controls="faq-content"
        >
          {faqOpen ? "✖️ Close FAQ" : "❔ FAQ"}
        </button>
        {faqOpen && (
          <div id="faq-content" className="faq-content">
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
    </>
  );
}