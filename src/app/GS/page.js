"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./gs.css";

export default function ChatbotPage({ profileId }) {
  const chatRef = useRef(null);

  const userProfileId = profileId || "demoUser123";

  // Chat state
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm Alpha, your AI assistant. How can I help?" },
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

  const GIF_FADE_MS = 1;

  // --- Firestore: load/create chats and listen to chat list (history) ---
  useEffect(() => {
    let unsubHistory = null;
    let isMounted = true;

    async function setupChats() {
      try {
        const chatsRef = collection(db, "profileData", userProfileId, "chats");
        // Fetch chats to find last active chat
        const chatsSnap = await getDocs(query(chatsRef, orderBy("createdAt", "desc")));
        let currentChatId = null;
        let chatWasEnded = false;

        if (!chatsSnap.empty) {
          const lastActiveChatDoc = chatsSnap.docs.find((d) => !d.data().ended);
          if (lastActiveChatDoc) {
            currentChatId = lastActiveChatDoc.id;
            chatWasEnded = false;
          } else {
            chatWasEnded = true;
          }
        } else {
          chatWasEnded = true;
        }

        if (chatWasEnded) {
          // create a new chat doc
          const newChatRef = await addDoc(chatsRef, {
            createdAt: serverTimestamp(),
            ended: false,
            title: `Chat on ${new Date().toLocaleString()}`,
          });
          currentChatId = newChatRef.id;
        }

        if (isMounted) setChatId(currentChatId);

        // Listen to all chats
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

  // --- When chatId changes, listen to messages for that chat ---
  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, "profileData", userProfileId, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const firestoreMessages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (firestoreMessages.length > 0) {
        setMessages(firestoreMessages);
      } else {
        setMessages([{ sender: "bot", text: "Hello! I'm Alpha, your AI assistant. How can I help?" }]);
      }
    }, (err) => {
      console.error("messages onSnapshot error:", err);
    });

    return () => unsub();
  }, [userProfileId, chatId]);

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
    try {
      synthRef.current.cancel();
    } catch (e) {}
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

  // --- End chat logic ---
  const handleEndChat = async () => {
    if (!chatId) return;
    try {
      const chatDocRef = doc(db, "profileData", userProfileId, "chats", chatId);
      await updateDoc(chatDocRef, { ended: true });
    } catch (err) {
      console.error("handleEndChat error:", err);
    }
  };

  // --- Start new chat ---
  const handleNewChat = async () => {
    try {
      const chatsRef = collection(db, "profileData", userProfileId, "chats");
      const newChatRef = await addDoc(chatsRef, {
        createdAt: serverTimestamp(),
        ended: false,
        title: `Chat on ${new Date().toLocaleString()}`,
      });
      setChatId(newChatRef.id);
      setMessages([{ sender: "bot", text: "Hello! I'm Alpha, your AI assistant. How can I help?" }]);
    } catch (err) {
      console.error("handleNewChat error:", err);
    }
  };

  const goToTopic = (id) => {
    setChatId(id);
  };

  // --- Send message: Firestore saving + API call + TTS ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    const history = (messages.concat({ sender: "user", text: userMsg }))
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    let processingDocRef = null;

    try {
      let activeChatId = chatId;
      if (!activeChatId) {
        const chatsRef = collection(db, "profileData", userProfileId, "chats");
        const newChatRef = await addDoc(chatsRef, {
          createdAt: serverTimestamp(),
          ended: false,
          title: `Chat on ${new Date().toLocaleString()}`,
        });
        activeChatId = newChatRef.id;
        setChatId(activeChatId);
      }

      const messagesRef = collection(db, "profileData", userProfileId, "chats", activeChatId, "messages");
      await addDoc(messagesRef, {
        sender: "user",
        text: userMsg,
        createdAt: serverTimestamp(),
      });

      processingDocRef = await addDoc(messagesRef, {
        sender: "bot",
        text: "⏳ Processing...",
        createdAt: serverTimestamp(),
      });

      // ---- CHANGE THIS URL TO YOUR AI API IF NEEDED ----
      const response = await fetch("https://1e1f-34-170-161-156.ngrok-free.app/alpha_bot80", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: userMsg, history }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      const answer = data.answer ?? "Sorry, I couldn't generate an answer.";

      await addDoc(messagesRef, {
        sender: "bot",
        text: answer,
        createdAt: serverTimestamp(),
      });

      if (processingDocRef) {
        try {
          await deleteDoc(processingDocRef);
        } catch (delErr) {
          console.error("Failed to delete processing placeholder:", delErr);
        }
      }

      speakText(answer);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("handleSend error:", error);
      if (processingDocRef) {
        try {
          await deleteDoc(processingDocRef);
        } catch (delErr) {
          console.error("Failed to delete processing placeholder on error:", delErr);
        }
      }
      try {
        if (chatId) {
          const messagesRefErr = collection(db, "profileData", userProfileId, "chats", chatId, "messages");
          await addDoc(messagesRefErr, {
            sender: "bot",
            text: "⚠️ An error occurred. Try again!",
            createdAt: serverTimestamp(),
          });
        } else {
          setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ An error occurred. Try again!" }]);
        }
      } catch (saveErr) {
        console.error("error saving error message:", saveErr);
      }
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
          <ul className="sidebar-menu">
            <li>
              <Link href="/dashboard" aria-label="Go to Dashboard">
                <span className="menu-icon">
                  <img src="/dashboard-2-48.png" width="20" height="20" alt="" />
                </span>{" "}
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/settings" aria-label="Go to Settings">
                <span className="menu-icon">
                  <img src="/gear-48.png" width="20" height="20" alt="" />
                </span>{" "}
                Settings
              </Link>
            </li>
            <li>
              <Link href="/ai-doctor" aria-label="Go to AI Doctor">
                <span className="menu-icon">
                  <img src="/appointment-reminders-48.png" width="20" height="20" alt="" />
                </span>{" "}
                Appointments
              </Link>
            </li>
            <li>
              <Link href="/myhealth-tracker" aria-label="Go to MyHealth Tracker">
                <span className="menu-icon">
                  <img src="/report-2-48.png" width="20" height="20" alt="" />
                </span>{" "}
                MyHealth Tracker
              </Link>
            </li>
            <li>
              <Link href="/special-care" aria-label="Go to Special Care Hub">
                <span className="menu-icon">
                  <img src="/baby-48.png" width="20" height="20" alt="" />
                </span>{" "}
                Special Care Hub
              </Link>
            </li>
            <li>
              <Link href="/Sidebarpages/xray" aria-label="Go to AI X-Ray Analyzer">
                <span className="menu-icon">
                  <img src="/xray-48.png" width="20" height="20" alt="" />
                </span>{" "}
                AI X-Ray Analyzer
              </Link>
            </li>
            <li>
              <Link href="/Sidebarpages/article" aria-label="Go to Disease Prevention">
                <span className="menu-icon">
                  <img src="/virus.png" width="20" height="20" alt="" />
                </span>{" "}
                Disease Prevention
              </Link>
            </li>
            <li>
              <Link href="/Sidebarpages/profile" aria-label="Go to Profile">
                <span className="menu-icon">
                  <img src="/user-48.png" width="20" height="20" alt="" />
                </span>{" "}
                Profile
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
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
        <div className="chat-box">
          <div
            className="messages"
            ref={chatRef}
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((msg, index) => (
              <div key={msg.id || index} className={`message ${msg.sender}`} role="article" aria-label={`${msg.sender} message`}>
                {msg.text}
              </div>
            ))}
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

      {/* Chat History Sidebar */}
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