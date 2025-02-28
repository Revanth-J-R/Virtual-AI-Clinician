"use client";

import { useState } from "react";
import "./signin.css"; // Reusing the same CSS file

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="screen-1">
      {/* Logo */}
      <img src="/Slogo.png" alt="Logo" className="logo" width="156" height="100" />

      {/* Full Name Input */}
      <div className="full-name">
        <label htmlFor="fullName">Full Name</label>
        <div className="sec-2">
          <input
            type="text"
            name="fullName"
            placeholder="John Doe"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Email Input */}
      <div className="email">
        <label htmlFor="email">Email</label>
        <div className="sec-2">
          <input
            type="email"
            name="email"
            placeholder="Username@gmail.com"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="password">
        <label htmlFor="password">Password</label>
        <div className="sec-2">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="***********"
            onChange={handleChange}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div className="password">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="sec-2">
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="***********"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Sign Up Button */}
      <button className="login">Sign Up</button>

      {/* Footer */}
      <div className="footer">
        <span style={{ color: "black" }}>Already have an account? <a href="/Authpages/LogIn">Login</a></span>
      </div>
    </div>
  );
}
