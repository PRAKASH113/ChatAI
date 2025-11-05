"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Bubble from "./Bubble";
import type { ChatData, ChatMessage } from "@/types/Chat";
import ShareButton from "./Share";

interface MessagesProps {
  chatId: string;
}

export default function Messages({ chatId }: MessagesProps) {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCount = useRef<number>(0);

  // ✅ always scroll to bottom after DOM updates
  const scrollToBottom = useCallback((smooth = true) => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  }, []);

  const loadChatData = useCallback(() => {
    try {
      const stored = localStorage.getItem(`chat_${chatId}`);
      const parsed = stored ? (JSON.parse(stored) as ChatData) : null;
      setChatData(parsed);
      return parsed;
    } catch (error) {
      console.error("❌ Failed to load chat data:", error);
      setChatData(null);
      return null;
    }
  }, [chatId]);

  useEffect(() => {
    // 🔄 Initial load (deferred to avoid sync setState warning)
    setTimeout(() => {
      const data = loadChatData();
      lastMessageCount.current = data?.messages?.length || 0;
      scrollToBottom(false);
    }, 0);

    const handleChatUpdate = (event: CustomEvent) => {
      if (event.detail.chatId === chatId) {
        const data = loadChatData();
        const currentCount = data?.messages?.length || 0;

        // 🕒 Wait for DOM update before scrolling
        requestAnimationFrame(() => {
          if (currentCount > lastMessageCount.current) {
            scrollToBottom();
          }
          lastMessageCount.current = currentCount;
        });
      }
    };

    const handleTyping = (e: CustomEvent) => {
      setIsUserTyping(e.detail.active);
      scrollToBottom();
    };

    const handleAIThinking = (e: CustomEvent) => {
      setIsAIThinking(e.detail.active);
      scrollToBottom();
    };

    window.addEventListener("chat-updated", handleChatUpdate as EventListener);
    window.addEventListener("user-typing", handleTyping as EventListener);
    window.addEventListener("ai-thinking", handleAIThinking as EventListener);

    return () => {
      window.removeEventListener("chat-updated", handleChatUpdate as EventListener);
      window.removeEventListener("user-typing", handleTyping as EventListener);
      window.removeEventListener("ai-thinking", handleAIThinking as EventListener);
    };
  }, [chatId, loadChatData, scrollToBottom]);

  // 🔁 scroll when message count changes (extra safety)
  useEffect(() => {
    if (chatData?.messages?.length) {
      requestAnimationFrame(() => scrollToBottom());
    }
  }, [chatData?.messages?.length, scrollToBottom]);

  if (!chatData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-foreground-sec italic">
        <p>Chat not found.</p>
      </div>
    );
  }

  const hasMessages = chatData.messages && chatData.messages.length > 0;

  return (
    <div
      ref={scrollRef}
      className="relative flex-1 w-full overflow-auto p-4 flex flex-col gap-3"
    >
      {/* 💬 Chat bubbles */}
      {hasMessages ? (
        chatData.messages.map((msg: ChatMessage, index: number) => {
          const senderType = msg.user ? "user" : "ai";
          const content = msg.user || msg.ai || "";
          return (
            <Bubble
              key={index}
              type={senderType}
              content={content}
              timestamp={msg.timestamp}
            />
          );
        })
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h3 className="text-2xl font-semibold text-foreground mb-2">👋 Hey there!</h3>
          <p className="text-foreground-sec text-sm max-w-md">
            You haven’t started chatting yet. Type your first message below and it’ll appear here.
          </p>
        </div>
      )}

      {/* 🟢 Typing / Thinking indicators */}
      {(isUserTyping || isAIThinking) && (
        <div className="text-sm text-foreground-sec italic text-center mt-2 animate-pulse">
          {isUserTyping && "User is typing..."}
          {isAIThinking && "🤖 AI is thinking..."}
        </div>
      )}

      {/* Invisible element for scrolling to bottom */}
      <div ref={endRef} />

      {/* 🚀 Floating Share button */}
      {hasMessages && (
        <div
          className="fixed top-5 right-5 z-50"
        >
          <ShareButton chatId={chatId} />
        </div>
      )}
    </div>
  );
}
