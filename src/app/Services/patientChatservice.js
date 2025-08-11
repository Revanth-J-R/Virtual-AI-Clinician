// src/services/patientChatService.js
import { db } from "../firebaseConfig"; // adjust path if you put firebaseConfig elsewhere
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

/** Create a chat doc under profileData/{profileId}/chats */
export async function createProfileChatSession(profileId, topic = "Chat") {
  const chatsCol = collection(db, "profileData", profileId, "chats");
  const docRef = await addDoc(chatsCol, {
    topic,
    createdAt: serverTimestamp(),
  }); 
  return docRef.id;
}

/** Save a single message in profileData/{profileId}/chats/{chatId}/messages */
export async function saveProfileChatMessage(profileId, chatId, sender, text) {
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
}

/** List chats for a profile (most recent first) */
export async function loadProfileChats(profileId, limitCount = 20) {
  const chatsCol = collection(db, "profileData", profileId, "chats");
  const q = query(chatsCol, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
