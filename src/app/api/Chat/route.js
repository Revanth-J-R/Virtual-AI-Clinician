import { NextResponse } from "next/server";
import { db } from "@/app/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

/**
 * POST → Save a message into Firestore
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { profileId, chatId, sender, text } = body;

    if (!profileId || !chatId || !sender || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const messagesCol = collection(
      db,
      "profileData",
      profileId,
      "chats",
      chatId,
      "messages"
    );

    await addDoc(messagesCol, {
      sender,
      text,
      timestamp: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}

/**
 * GET → Fetch all messages for a given chat
 * Usage: /api/chat?profileId=abc123&chatId=xyz789
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");
    const chatId = searchParams.get("chatId");

    if (!profileId || !chatId) {
      return NextResponse.json(
        { error: "Missing profileId or chatId" },
        { status: 400 }
      );
    }

    const messagesCol = collection(
      db,
      "profileData",
      profileId,
      "chats",
      chatId,
      "messages"
    );

    const q = query(messagesCol, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);

    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
