"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h4 className="px-3 py-3">Menu</h4>
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
        </ul>
      </div>

      {/* Main Layout */}
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 fixed-top d-flex align-items-center">
          <button
            className="btn bg-black text-white"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>

          {/* Logo & Title */}
          <div className="d-flex align-items-center">
            <img src="/nlogo.png" className="Logo" alt="LiveChatAI Logo" />
            <h2 className="Top">AlphaWell</h2>
          </div>

          {/* Sign Up & Login */}
          <div className="ms-auto">
            <Link href="/Authpages/SignIn">
              <button className="btn btn-dark me-2">Sign Up</button>
            </Link>
            <Link href="/Authpages/LogIn">
              <button className="btn btn-dark">Login</button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container text-center py-5">
          <div className="row align-items-center">
            {/* Left Side - Text */}
            <div className="col-md-6 text-md-start text-center">
              <h1 className="fw-bold display-3 text-dark">
                Stay Calm, Stay Safe. We’ve Got You Covered.
              </h1>
              <p className="text-muted fs-4">
                First Aid in a Flash. Experience the future of care—where AI
                understands, responds, and supports you with the warmth and
                intelligence of human touch.
              </p>
              <Link href="/your-target-page" className="get-started-btn">
                Get Started
                <span className="text-lg">→</span>
              </Link>
            </div>

            {/* Right Side - Image */}
            <div className="col-md-6">
              <img
                src="/chat-image.png"
                alt="LiveChatAI Preview"
                width={1200}
                height={900}
                className="img-fluid rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
