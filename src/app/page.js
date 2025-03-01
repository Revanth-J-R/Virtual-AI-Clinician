"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image"; // Using Next.js Image component for optimization
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h4 className="sidebar-title">Menu</h4>
        <ul className="sidebar-menu">
          <li>
            <Link href="/dashboard" aria-label="Go to Dashboard">
              <span className="menu-icon">📊</span> Dashboard
            </Link>
          </li>
          <li>
            <Link href="/settings" aria-label="Go to Settings">
              <span className="menu-icon">⚙️</span> Settings
            </Link>
          </li>
          <li>
            <Link href="/ai-doctor" aria-label="Go to AI Doctor">
              <span className="menu-icon">🩺</span> AI Doctor
            </Link>
          </li>
          <li>
            <Link href="/myhealth-tracker" aria-label="Go to MyHealth Tracker">
              <span className="menu-icon">📊</span> MyHealth Tracker
            </Link>
          </li>
          <li>
            <Link href="/special-care" aria-label="Go to Special Care Hub">
              <span className="menu-icon">❤️</span> Special Care Hub
            </Link>
          </li>
          <li>
            <Link href="/Sidebarpages/xray" >
              <span className="menu-icon">🔍</span> AI X-Ray Analyzer
            </Link>
          </li>
          <li>
            <Link href="/Sidebarpages/article" aria-label="Go to Disease Prevention">
              <span className="menu-icon">🛡️</span> Disease Prevention
            </Link>
          </li>
          <li>
            <Link href="/disease-prevention" aria-label="Go to Disease Prevention">
              <span className="menu-icon">🙍🏻‍♂️</span> Profile
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
              <Link href="/GS" className="get-started-btn">
                Get Started
                <span className="text-lg">→</span>
              </Link>
            </div>

            {/* Right Side - New Section */}
            <div className="col-md-6">
              <div className="container d-flex justify-content-center py-5 mt-5">
                <div className="card shadow-lg p-4 d-flex flex-row align-items-center" style={{ maxWidth: "800px", borderRadius: "15px" }}>
                  {/* Left Side - Text */}
                  <div className="flex-grow-1 text-start px-4">
                    <h1 className="fw-bold">Welcome to AlphaWell</h1>
                    <p className="text-muted">
                      Just ask—LiveChatAI is here to guide, assist, and support your health anytime.
                    </p>
                    <button className="btn btn-dark rounded-pill px-4 py-2 mt-2">Read the Docs  →</button>
                  </div>

                  {/* Right Side - Image */}
                  <div>
                    <Image 
                      src="/chat-image.png" 
                      alt="LiveChatAI Preview" 
                      width={700} 
                      height={700} 
                      className="img-fluid rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* End of Right Side */}
          </div>
        </div>
      </div>
    </div>
  );
}
