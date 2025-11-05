// 🧠 Chat.ts — all chat-related types

// A message can be from either the user or the AI, and now includes a timestamp
export interface ChatMessage {
  user?: string;
  ai?: string;
  timestamp: string; // ISO string (e.g. "2025-11-03T10:45:00.000Z")
}

// The main chat structure stored in localStorage
export interface ChatData {
  id: string;
  lastSession: string;
  title: string;
  pinned: number;
  messages: ChatMessage[];
}
