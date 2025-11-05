import type { ChatData } from "@/types/Chat";

export async function handleNewChat(chatId: string) {
  console.log("New chat initialized");
  console.log("Chat ID:", chatId);

  // ================================================
  //   CURRENT IMPLEMENTATION — LOCAL STORAGE MODE
  // ================================================

  // 1. Create new chat object
  const newChat: ChatData = {
    id: chatId,
    lastSession: new Date().toISOString(),
    title: "",
    pinned: 0,
    messages: [],
  };

  console.log("New chat object:", newChat);

  // 2️. Save to localStorage
  try {
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(newChat));
    console.log(`Chat ${chatId} saved to localStorage`);
  } catch (error) {
    console.error("Failed to save chat:", error);
  }

  // 3️. Clean up old empty chat files except the new one
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("chat_")) {
        const chatData = localStorage.getItem(key);
        if (chatData) {
          const chat: ChatData = JSON.parse(chatData);
          const isEmpty =
            Array.isArray(chat.messages) &&
            chat.messages.length === 0 &&
            chat.id !== chatId;
          if (isEmpty) keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      console.log(`Removed empty chat: ${key}`);
    });

    console.log("Cleanup complete. Remaining keys:", Object.keys(localStorage));
  } catch (error) {
    console.error("Error during cleanup:", error);
  }

  // ==========================================================
  //   POSTGRESQL IMPLEMENTATION (COMMENTED OUT FOR NOW)
  // ==========================================================
  //
  //   To use PostgreSQL + Django backend instead of localStorage:
  // 1️. Comment out all code above this section.
  // 2️. Uncomment the section below.
  // 3️. Ensure your `.env.local` includes:
  //       NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api
  // 4️. Make sure your Django backend is running and
  //     `/api/create-chat/` is correctly configured in:
  //       - `views.py` → function: create_chat
  //       - `urls.py`  → path("create-chat/", views.create_chat)
  //
  /*
  try {
    console.log("Creating new chat in PostgreSQL via Django backend...");
    const BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";

    const res = await fetch(`${BASE_URL}/create-chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.success) {
      console.log(`Chat created in PostgreSQL with ID: ${data.chat_id}`);

      // Optional: sync the new chat locally as well
      const backendChat: ChatData = {
        id: data.chat_id,
        lastSession: new Date().toISOString(),
        title: "",
        pinned: 0,
        messages: [],
      };

      localStorage.setItem(`chat_${backendChat.id}`, JSON.stringify(backendChat));
      return backendChat.id;
    } else {
      console.error("Failed to create chat in backend:", data.error || data);
      return null;
    }
  } catch (error) {
    console.error("Error connecting to backend:", error);
    return null;
  }
  */
}
