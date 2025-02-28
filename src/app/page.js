import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className={`bg-dark text-white p-3 sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h4>Menu</h4>
        <ul className="list-unstyled">
          <li className="py-2"><a href="#" className="text-white">Dashboard</a></li>
          <li className="py-2"><a href="#" className="text-white">Chatbot</a></li>
          <li className="py-2"><a href="#" className="text-white">Settings</a></li>
        </ul>
      </div>

      <div className="container-fluid">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
          <button className="btn btn-dark me-3" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            ☰
          </button>
          <h2 className="fw-bold mb-0">LiveChatAI</h2>
          <button className="btn btn-dark ms-auto">Get Started</button>
        </nav>

        {/* Main Content */}
        <div className="container text-center py-5">
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

      {/* Sidebar Styles */}
      <style jsx>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: -250px;
          transition: left 0.3s ease;
        }
        .sidebar.open {
          left: 0;
        }
      `}</style>
    </div>
  );
}
