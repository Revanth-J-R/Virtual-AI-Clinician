"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h4 className="px-3 py-3">Menu</h4>
        <ul className="list-unstyled px-3">
          <li className="py-2"><a href="#" className="text-white text-decoration-none">Dashboard</a></li>
          <li className="py-2"><a href="#" className="text-white text-decoration-none">Chatbot</a></li>
          <li className="py-2"><a href="#" className="text-white text-decoration-none">Settings</a></li>
        </ul>
      </div>

      {/* Main Layout */}
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        {/* Navbar (Fixed at Top) */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 fixed-top">
          <button className="btn btn-dark me-3" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            ☰
          </button>
          <h2 className="fw-bold mb-0">LiveChatAI</h2>
          <button className="btn btn-dark ms-auto">Get Started</button>
        </nav>

        {/* Main Content */}
        <div className="container text-center py-5 mt-5">
          <div className="row align-items-center">
            <div className="col-md-6 text-md-start text-center">
              <h1 className="fw-bold">AI Chatbot for Customer Support.</h1>
              <p className="text-muted">
                First Aid. Save time for your team and customers with AI-powered answers.
              </p>
              <button className="btn btn-primary px-4">Get Started</button>
            </div>
            <div className="col-md-6 d-flex justify-content-center">
              <div className="border rounded p-3 shadow" style={{ width: "300px" }}>
                <div className="d-flex align-items-center mb-3">
                  <Image src="/chatbot-icon.png" alt="Chatbot" width={40} height={40} />
                  <strong className="ms-2">LiveChatAI</strong>
                </div>
                <p className="bg-light p-3 rounded">
                  Hey there! 👋 Let’s discuss how to enhance your customer support with LiveChatAI’s AI chatbot.
                </p>
                <input type="text" className="form-control" placeholder="Send message" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
