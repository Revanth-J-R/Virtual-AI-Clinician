"use client";

import { useState } from "react";
import "./login.css"; // Ensure this file is in the same folder or adjust the path

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="screen-1">
      {/* Logo */}
      <img src="/Slogo.png" alt="Logo" className="logo" width="156" height="100" />

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

      {/* Login Button */}
      <button className="login">Login</button>

      {/* Footer */}
      <div className="footer">
        <span className="signup-link">Sign up</span>
        <span className="forgot-link">Forgot Password?</span>
      </div>
    </div>
  );
}
