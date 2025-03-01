"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import Image from "next/image"; // Import Next.js Image component
import { useRouter } from "next/navigation"; // Import Next.js router
import { useState } from "react";
import { auth } from "./firebaseConfig";
import "./signin.css";

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize Next.js Router

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async () => {
    const { fullName, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });

      alert("Signup successful!");

      // Redirect to GS page after signup
      router.push("/GS");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign-In Success:", result.user);
      
      // Redirect to GS page after Google Sign-In
      router.push("/GS");
    } catch (err) {
      setError("Google Sign-In Failed: " + err.message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const provider = new OAuthProvider("apple.com");
      const result = await signInWithPopup(auth, provider);
      console.log("Apple Sign-In Success:", result.user);
      
      // Redirect to GS page after Apple Sign-In
      router.push("/GS");
    } catch (err) {
      setError("Apple Sign-In Failed: " + err.message);
    }
  };

  return (
    <div className="screen-1">
      {/* Logo */}
      <Image src="/Slogo.png" alt="Logo" className="logo" width={156} height={100} />

      {/* Full Name Input */}
      <div className="full-name">
        <label htmlFor="fullName">Full Name</label>
        <div className="sec-2">
          <input type="text" name="fullName" placeholder="John Doe" onChange={handleChange} />
        </div>
      </div>

      {/* Email Input */}
      <div className="email">
        <label htmlFor="email">Email</label>
        <div className="sec-2">
          <input type="email" name="email" placeholder="Username@gmail.com" onChange={handleChange} />
        </div>
      </div>

      {/* Password Input */}
      <div className="password">
        <label htmlFor="password">Password</label>
        <div className="sec-2">
          <input type={showPassword ? "text" : "password"} name="password" placeholder="***********" onChange={handleChange} />
          <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}></button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div className="password">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="sec-2">
          <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="***********" onChange={handleChange} />
        </div>
      </div>

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Sign Up Button */}
      <button className="login" onClick={handleSignUp}>Sign Up</button>

      {/* Google Sign-In */}
      <button className="google-login" id="holo" onClick={handleGoogleSignIn} style={{ paddingLeft: "5px" }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png"
          width={20}
          height={20}
          alt="Google Sign In"
        />
      </button>

      {/* Apple Sign-In */}
      <button className="apple-login" id="holo" onClick={handleAppleSignIn} style={{ paddingLeft: "5px" }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
          width={20}
          height={20}
          alt="Apple Sign In"
        />
      </button>

      {/* Footer */}
      <div className="footer">
        <span style={{ color: "black" }}>Already have an account? <a href="/Authpages/LogIn">Login</a></span>
      </div>
    </div>
  );
}
