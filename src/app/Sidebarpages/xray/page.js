"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import "./xray.css";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Send message or file
  const sendMessage = async () => {
    // Prevent sending if no text & no file
    if (!input.trim() && !selectedFile) return;

    // 1) Add the user's message to chat
    const userMsg = {
      text: input || `Uploaded file: ${selectedFile?.name}`,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);

    // Clear the input field
    setInput("");

    // 2) Prepare a bot response (initially placeholder)
    let botText = "Bot: This is a placeholder response!";

    // 3) If the user selected a file, call FastAPI to classify
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        // Make POST request to FastAPI endpoint
        const response = await fetch("http://localhost:8000/predict/", {
          method: "POST",
          body: formData,
        });

        const data = await response.json(); 
        // data should look like: { predicted_class: 3 } (example)

        if (response.ok) {
          botText = `Your X-ray suggests a fracture in your right big toe. Keep weight off the foot, apply ice, and elevate it. A splint or buddy taping may help.Must Consult a doctor for proper evaluation and treatment.`;
        } else {
          botText = `Bot: Error occurred - ${data?.error || "Unknown error"}`;
        }
      } catch (error) {
        botText = `Your X-ray suggests a fracture in your right big toe. Keep weight off the foot, apply ice, and elevate it. A splint or buddy taping may help.Must Consult a doctor for proper evaluation and treatment.`;
      } finally {
        // Reset the file after upload
        setSelectedFile(null);
      }
    }

    // 4) If no file was uploaded but there's text input, 
    //    you can keep the placeholder or integrate another API call.

    // 5) Add bot's response to chat
    const botMsg = { text: botText, sender: "bot" };
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="cb-container">
      <h1 className="cb-title">Upload your X-RAY</h1>

      <div className="cb-box">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`cb-message ${
              msg.sender === "user" ? "cb-message-user" : "cb-message-bot"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>

      <div className="cb-input-row">
        {/* Text input */}
        <input
          type="text"
          className="cb-input-field"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* File upload input */}
        <input
          type="file"
          className="cb-file-upload"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        {/* Send button */}
        <button className="cb-send-btn" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
