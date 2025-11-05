"use client";

import { useState, useEffect } from "react";
import { handleNewChat } from "@/utils/NewChat";
import { addMessageToChat } from "@/utils/Msg";
import Messages from "./Messages";

interface ChatProps {
  chatId: string | null;
}

export default function Chat({ chatId: initialChatId }: ChatProps) {
  const [message, setMessage] = useState("");
  const [localChatId, setLocalChatId] = useState<string | null>(initialChatId);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // 🧩 Sync chat id when parent updates
  useEffect(() => {
    if (initialChatId && initialChatId !== localChatId) {
      console.log(`🔄 Reset chat signal received: ${initialChatId}`);
      setTimeout(() => setLocalChatId(initialChatId), 0);
    }
  }, [initialChatId, localChatId]);

  // ✉️ Send message to AI
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isAIThinking) return;

    let currentChatId = localChatId;

    // 🆕 Start new chat if needed
    if (!currentChatId) {
      currentChatId = Date.now().toString();
      handleNewChat(currentChatId);
      setLocalChatId(currentChatId);
    }

    const userMessage = message;
    addMessageToChat(currentChatId, userMessage, "user");
    setMessage("");

    // 🚨 Notify components about typing and thinking states
    window.dispatchEvent(new CustomEvent("user-typing", { detail: { active: false } }));
    setIsAIThinking(true);
    window.dispatchEvent(new CustomEvent("ai-thinking", { detail: { active: true } }));

    // 🧠 Load chat context (last 8 messages)
    const stored = localStorage.getItem(`chat_${currentChatId}`);
    const chatData = stored ? JSON.parse(stored) : null;
    const context = chatData?.messages?.slice(-8) || [];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatId: currentChatId,
          context,
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || "I didn’t quite catch that.";

      addMessageToChat(currentChatId, aiReply, "ai");
    } catch (err) {
      console.error("❌ Failed to fetch AI reply:", err);
      addMessageToChat(currentChatId, "⚠️ AI failed to respond.", "ai");
    } finally {
      setIsAIThinking(false);
      window.dispatchEvent(new CustomEvent("ai-thinking", { detail: { active: false } }));
    }
  };

  // 📝 Handle typing signals
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    window.dispatchEvent(
      new CustomEvent("user-typing", { detail: { active: value.trim().length > 0 } })
    );
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-6 h-[90vh]">
      {/* 🧠 Chat Messages */}
      <div className="flex-1 w-full flex flex-col justify-center items-center overflow-hidden">
        {localChatId ? (
          <Messages chatId={localChatId} />
        ) : (
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold text-foreground">💬 Welcome!</h3>
            <p className="text-foreground-sec text-sm">
              Type below to start a brand new chat.
            </p>
          </div>
        )}
      </div>

      {/* ✍️ Message Input */}
      <form
        onSubmit={handleSend}
        className="w-full flex gap-2 mt-auto border border-foreground/10 rounded-xl p-2 bg-background-sec"
      >
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground-sec px-2"
        />
        <button
          type="submit"
          disabled={isAIThinking}
          className={`px-4 py-2 rounded-lg transition-all ${
            isAIThinking
              ? "bg-accent-sec/40 text-foreground-sec cursor-not-allowed"
              : "bg-accent hover:bg-accent-sec text-white"
          }`}
        >
          {isAIThinking ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}
