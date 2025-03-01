"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "./firebaseConfig"; // Adjust the path as needed

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  // Example additional entities; you can replace these with real data
  const [entities] = useState([
    { id: 1, name: "Entity One", description: "This is entity one." },
    { id: 2, name: "Entity Two", description: "This is entity two." },
    { id: 3, name: "Entity Three", description: "This is entity three." }
  ]);

  useEffect(() => {
    // Listen for auth state changes and update user
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>You are not logged in.</h2>
        <p>
          Please <Link href="/Authpages/LogIn">Log In</Link> to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Profile</h1>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <Image
          src={user.photoURL || "/default-profile.png"}
          alt="Profile Picture"
          width={100}
          height={100}
          className="rounded-circle"
        />
        <div style={{ marginLeft: "20px" }}>
          <h2>{user.displayName || "No Name Provided"}</h2>
          <p>Email: {user.email}</p>
          <p>User ID: {user.uid}</p>
        </div>
      </div>
      <hr />
      <h3>Other Entities</h3>
      <ul>
        {entities.map((entity) => (
          <li key={entity.id}>
            <h4>{entity.name}</h4>
            <p>{entity.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
