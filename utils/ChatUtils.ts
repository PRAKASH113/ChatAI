import type { ChatData } from "@/types/Chat";

// Helper: Load chat by ID
export function getChatById(chatId: string): ChatData | null {
  const data = localStorage.getItem(`chat_${chatId}`);
  return data ? (JSON.parse(data) as ChatData) : null;
}

// Helper: Save chat data back
function saveChat(chat: ChatData) {
  localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat));
  window.dispatchEvent(
    new CustomEvent("chat-updated", { detail: { chatId: chat.id } })
  );
}

// Toggle Pin
export function togglePinChat(chatId: string): void {
  const chat = getChatById(chatId);
  if (!chat) return;
  chat.pinned = chat.pinned === 1 ? 0 : 1;
  saveChat(chat);

  // PostgreSQL (optional backend sync)
  /*
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";
    fetch(`${BASE_URL}/toggle-pin/${chatId}/`, { method: "POST" });
  } catch (error) {
    console.error(" Failed to sync pin toggle:", error);
  }
  */
}

// Delete Chat
export function deleteChat(chatId: string): void {
  localStorage.removeItem(`chat_${chatId}`);
  window.dispatchEvent(new CustomEvent("chat-updated", { detail: { chatId } }));

  // PostgreSQL (optional backend sync)
  /*
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";
    fetch(`${BASE_URL}/delete-chat/${chatId}/`, { method: "DELETE" });
  } catch (error) {
    console.error(" Failed to delete chat in backend:", error);
  }
  */
}

// Rename Chat
export function renameChat(chatId: string, newTitle: string): void {
  const chat = getChatById(chatId);
  if (!chat) return;
  chat.title = newTitle.trim();
  saveChat(chat);

  // PostgreSQL (optional backend sync)
  /*
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";
    fetch(`${BASE_URL}/rename-chat/${chatId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
  } catch (error) {
    console.error(" Failed to rename chat in backend:", error);
  }
  */
}

// Get all chats
export function getAllChats(): ChatData[] {
  const chats: ChatData[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("chat_")) {
      try {
        const chat = JSON.parse(localStorage.getItem(key) || "{}") as ChatData;
        if (chat.id) chats.push(chat);
      } catch {}
    }
  }

  // Sort pinned chats first, then by last session desc
  return chats.sort((a, b) => {
    if (b.pinned !== a.pinned) return b.pinned - a.pinned;
    return (
      new Date(b.lastSession).getTime() - new Date(a.lastSession).getTime()
    );
  });

  // PostgreSQL version (commented out)
  /*
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";
    const res = await fetch(`${BASE_URL}/get-chats/`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(" Failed to load chats from backend:", error);
    return [];
  }
  */
}
