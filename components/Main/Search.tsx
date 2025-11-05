"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChatData, ChatMessage } from "@/types/Chat";
import { Search, X } from "lucide-react";

/**
 * Highlights matched text portions using <mark>
 */
function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, `<mark class="bg-accent/20 text-accent font-semibold">$1</mark>`);
}

interface SearchProps {
  onExit: () => void;
}

export default function SearchComponent({ onExit }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { chatId: string; title: string; message: ChatMessage }[]
  >([]);

  // 🧠 Load all chats from localStorage
  const getAllChats = useCallback((): ChatData[] => {
    const chats: ChatData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("chat_")) {
        const stored = localStorage.getItem(key);
        if (stored) chats.push(JSON.parse(stored));
      }
    }
    return chats;
  }, []);

  // 🔍 Perform keyword search (case-insensitive)
  const performSearch = useCallback(() => {
    if (!query.trim()) return setResults([]);

    const lowerQuery = query.toLowerCase();
    const allChats = getAllChats();
    const matches: { chatId: string; title: string; message: ChatMessage }[] = [];

    for (const chat of allChats) {
      for (const msg of chat.messages) {
        const content = msg.user || msg.ai || "";
        if (content.toLowerCase().includes(lowerQuery)) {
          matches.push({
            chatId: chat.id,
            title: chat.title || "Untitled Chat",
            message: msg,
          });
        }
      }
    }

    setResults(matches);
  }, [query, getAllChats]);

  // ⏳ Debounced search
  useEffect(() => {
    if (!query.trim()) {
      const clear = requestAnimationFrame(() => setResults([]));
      return () => cancelAnimationFrame(clear);
    }

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, performSearch]);

  // 📤 When user clicks a message → open chat
  const handleOpenChat = (chatId: string) => {
    window.dispatchEvent(new CustomEvent("open-chat", { detail: { id: chatId } }));
  };

  return (
    <div className="w-full max-w-3xl h-[80vh] flex flex-col items-center gap-6">
      {/* 🔎 Search Bar */}
      <div className="flex w-full items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-foreground-sec" />
          <input
            type="text"
            placeholder="Search through your conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-background-sec text-foreground placeholder:text-foreground-sec focus:ring-2 focus:ring-accent outline-none shadow-sm"
          />
        </div>
        <button
          onClick={onExit}
          className="px-3 py-2 rounded-xl bg-background-sec hover:bg-foreground/10 text-sm flex items-center gap-1 text-foreground-sec hover:text-foreground transition-all"
        >
          <X className="w-4 h-4" /> Exit
        </button>
      </div>

      {/* 🧾 Results Section */}
      <div className="flex-1 w-full overflow-auto rounded-xl bg-background-sec p-5 shadow-inner">
        {results.length === 0 ? (
          <p className="text-foreground-sec italic text-center mt-10">
            {query
              ? "No matches found..."
              : "Start typing to search through your conversations."}
          </p>
        ) : (
          <ul className="space-y-4">
            {results.map((res, index) => {
              const content = res.message.user || res.message.ai || "";
              const highlighted = highlightMatch(content, query);

              return (
                <li
                  key={index}
                  onClick={() => handleOpenChat(res.chatId)}
                  className="cursor-pointer rounded-xl bg-background p-4 hover:bg-background-sec/80 transition-all shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-accent mb-1">
                    {res.title}
                  </h3>

                  <p
                    className="text-sm text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />

                  <p className="text-[11px] text-foreground-sec mt-2">
                    {new Date(res.message.timestamp).toLocaleString()}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
