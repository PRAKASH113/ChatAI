"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChatData, ChatMessage } from "@/types/Chat";
import { Search, X } from "lucide-react";

/**
 * 🪄 Highlights matched text portions using <mark>
 */
function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;

  // Allow multiple search words
  const escaped = query
    .split(/\s+/)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(
    regex,
    `<mark class="bg-accent/20 text-accent font-semibold">$1</mark>`
  );
}

/**
 * 🧠 Ranks search relevance — newer + query frequency
 */
function rankMatch(message: ChatMessage, query: string): number {
  const text = (message.user || message.ai || "").toLowerCase();
  const words = query.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach((w) => {
    if (text.includes(w)) score += 1;
  });

  // Boost recent messages
  const timestamp = new Date(message.timestamp).getTime();
  const ageBoost = Date.now() - timestamp < 1000 * 60 * 60 * 24 ? 0.5 : 0;

  return score + ageBoost;
}

interface SearchProps {
  onExit: () => void;
}

export default function SearchComponent({ onExit }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { chatId: string; title: string; message: ChatMessage; score: number }[]
  >([]);

  // 🧠 Load all chats
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

  // 🔍 Perform advanced search
  const performSearch = useCallback(() => {
    const q = query.trim().toLowerCase();
    if (!q) return setResults([]);

    const chats = getAllChats();
    const matches: {
      chatId: string;
      title: string;
      message: ChatMessage;
      score: number;
    }[] = [];

    for (const chat of chats) {
      for (const msg of chat.messages) {
        const score = rankMatch(msg, q);
        if (score > 0) {
          matches.push({
            chatId: chat.id,
            title: chat.title || "Untitled Chat",
            message: msg,
            score,
          });
        }
      }
    }

    // Sort by score (relevance) and timestamp (newer first)
    matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.message.timestamp).getTime() -
        new Date(a.message.timestamp).getTime()
      );
    });

    setResults(matches);
  }, [query, getAllChats]);

  // ⏳ Debounced search
  useEffect(() => {
    const debounce = setTimeout(performSearch, 250);
    return () => clearTimeout(debounce);
  }, [query, performSearch]);

  // 📤 Open chat event
  const handleOpenChat = (chatId: string) => {
    window.dispatchEvent(new CustomEvent("open-chat", { detail: { id: chatId } }));
  };

  return (
    <div className="w-full max-w-3xl h-[80vh] flex flex-col items-center gap-6 animate-fadeIn">
      {/* 🔎 Search Bar */}
      <div className="flex w-full items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-foreground-sec" />
          <input
            type="text"
            placeholder="Search across all chats and messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-background-sec text-foreground placeholder:text-foreground-sec focus:ring-2 focus:ring-accent outline-none shadow-sm transition-all"
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
      <div className="flex-1 w-full overflow-auto rounded-xl bg-background-sec p-5 shadow-inner scrollbar-thin scrollbar-thumb-border/50">
        {results.length === 0 ? (
          <p className="text-foreground-sec italic text-center mt-10">
            {query
              ? "No matching messages found..."
              : "Start typing to search your AI and user messages."}
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
                  className="cursor-pointer rounded-xl bg-background p-4 hover:bg-background-sec/80 transition-all shadow-sm border border-transparent hover:border-accent/30"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-accent mb-1">
                      {res.title}
                    </h3>
                    <span className="text-[10px] text-foreground-sec">
                      {new Date(res.message.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p
                    className="text-sm text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />

                  <div className="mt-2 text-[11px] text-foreground-sec italic">
                    Matched in{" "}
                    {res.message.user ? "User Message" : "AI Response"} —{" "}
                    <span className="text-accent font-medium">
                      Relevance: {res.score.toFixed(1)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
