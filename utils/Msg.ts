import type { ChatData } from "@/types/Chat";

export async function addMessageToChat(
  chatId: string,
  message: string,
  sender: "user" | "ai" = "user"
) {
  console.log("addMessageToChat called with:", { chatId, message, sender });

  if (!chatId) {
    console.error("No chatId provided. Cannot add message.");
    return;
  }

  try {
    const key = `chat_${chatId}`;
    const existingChatData = localStorage.getItem(key);

    if (!existingChatData) {
      console.warn(`No existing chat found for ID ${chatId}. Message not saved.`);
      return;
    }

    const chat: ChatData = JSON.parse(existingChatData);

    // Ensure messages array exists
    if (!Array.isArray(chat.messages)) {
      chat.messages = [];
    }

    //If title is empty, set it to the first user message
    if (!chat.title || chat.title.trim() === "") {
      chat.title = message;
      console.log(`Chat ${chatId} title set to: "${message}"`);
    }

    // Add message with timestamp
    const newMessage =
      sender === "user"
        ? { user: message, timestamp: new Date().toISOString() }
        : { ai: message, timestamp: new Date().toISOString() };

    chat.messages.push(newMessage);

    // Update last session timestamp
    chat.lastSession = new Date().toISOString();

    // Save back to localStorage
    localStorage.setItem(key, JSON.stringify(chat));

    // Dispatch a custom event to notify components
    window.dispatchEvent(new CustomEvent("chat-updated", { detail: { chatId } }));

    console.log(`Message added to chat ${chatId}:`, newMessage);
    console.log("Updated chat data:", chat);
  } catch (error) {
    console.error("Failed to add message to chat:", error);
  }

  // ==================================================================
  //  POSTGRESQL IMPLEMENTATION (commented out for Django integration)
  // ==================================================================
  //
  // To use Django + PostgreSQL backend:
  // 1️. Comment out the localStorage code above.
  // 2️. Uncomment this section below.
  // 3️. Ensure your `.env.local` includes:
  //       NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api
  // 4️. Make sure Django backend has endpoint:
  //       POST /api/add-message/<chat_id>/
  //       Body: { "role": "user" | "ai", "content": "Message text" }
  //
  /*
  try {
    const BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";

    const res = await fetch(`${BASE_URL}/add-message/${chatId}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: sender,
        content: message,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("Failed to add message in backend:", data);
      return;
    }

    console.log(`Message saved in PostgreSQL for chat ${chatId}`);
  } catch (error) {
    console.error("Error connecting to backend:", error);
  }
  */
}
