"use client";

import { useEffect, useState } from "react";
import SideMenu from "@/components/SideMenu/Menu";
import Chat from "@/components/Main/Chat";
import Search from "@/components/Main/Search";
import Analysis from "@/components/Main/Analysis";

export default function Home() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [mode, setMode] = useState<"chat" | "search" | "analysis">("chat");

  useEffect(() => {
    const handleChatSelect = (e: CustomEvent) => {
      setActiveChatId(e.detail.id);
      setMode("chat");
    };

    const handleNewChat = (e: CustomEvent) => {
      setActiveChatId(e.detail.id);
      setMode("chat");
    };

    // 🆕 Listen for “open-chat” event from Search results
    const handleOpenChat = (e: CustomEvent) => {
      setActiveChatId(e.detail.id);
      setMode("chat");
    };

    window.addEventListener("select-chat", handleChatSelect as EventListener);
    window.addEventListener("new-chat", handleNewChat as EventListener);
    window.addEventListener("open-chat", handleOpenChat as EventListener);

    return () => {
      window.removeEventListener("select-chat", handleChatSelect as EventListener);
      window.removeEventListener("new-chat", handleNewChat as EventListener);
      window.removeEventListener("open-chat", handleOpenChat as EventListener);
    };
  }, []);

  return (
    <div className="flex max-h-screen">
      <SideMenu onModeChange={setMode} />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {mode === "chat" && <Chat chatId={activeChatId} />}
        {mode === "search" && <Search onExit={() => setMode("chat")} />}
        {mode === "analysis" && <Analysis />}
      </main>
    </div>
  );
}
