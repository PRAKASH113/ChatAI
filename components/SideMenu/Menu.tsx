"use client";

import { useState } from "react";
import ThemeToggle from "../ui/ThemeToggle";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  BarChart3,
  Search,
  Info,
} from "lucide-react";
import { handleNewChat } from "@/utils/NewChat";
import ChatHistory from "./ChatHistory";
import InfoOverlay from "./Info";

interface SideMenuProps {
  onModeChange: (mode: "chat" | "search" | "analysis") => void;
}

export default function SideMenu({ onModeChange }: SideMenuProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const onNewChatClick = () => {
    const chatId = Date.now().toString();
    handleNewChat(chatId);
    onModeChange("chat");
    window.dispatchEvent(new CustomEvent("new-chat", { detail: { id: chatId } }));
  };

  return (
    <>
      <div
        className={`h-screen bg-background border-r border-foreground/5 transition-all duration-300 ease-in-out flex flex-col relative ${
          isExpanded ? "w-64" : "w-16"
        }`}
      >
        {/* Header */}
        <div className="p-3 flex items-center justify-between shrink-0">
          {isExpanded && (
            <h1 className="text-xl font-bold bg-linear-to-r from-accent to-accent-sec bg-clip-text text-transparent">
              ChatAI
            </h1>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`${
              isExpanded ? "ml-auto" : "mx-auto"
            } bg-background-sec hover:bg-foreground/10 rounded-lg p-1.5 transition-all duration-200 group`}
            aria-label="Toggle menu"
            title="Toggle menu"
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4 text-foreground-sec group-hover:text-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-foreground-sec group-hover:text-foreground" />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 px-3 pb-2 space-y-2">
          {/* 📊 Analysis */}
          <button
            onClick={() => onModeChange("analysis")}
            className={`w-full bg-background-sec hover:bg-foreground/5 rounded-lg transition-all duration-200 flex items-center group ${
              isExpanded ? "justify-start px-3 py-2 gap-2" : "justify-center p-2"
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0 text-foreground-sec group-hover:text-accent transition-colors" />
            {isExpanded && (
              <span className="font-medium text-sm text-foreground-sec group-hover:text-foreground">
                Analysis
              </span>
            )}
          </button>

          {/* 🔍 Search */}
          <button
            onClick={() => onModeChange("search")}
            className={`w-full bg-background-sec hover:bg-foreground/5 rounded-lg transition-all duration-200 flex items-center group ${
              isExpanded ? "justify-start px-3 py-2 gap-2" : "justify-center p-2"
            }`}
          >
            <Search className="w-4 h-4 shrink-0 text-foreground-sec group-hover:text-accent transition-colors" />
            {isExpanded && (
              <span className="font-medium text-sm text-foreground-sec group-hover:text-foreground">
                Search
              </span>
            )}
          </button>

          {/* 🆕 New Chat */}
          <button
            onClick={onNewChatClick}
            className={`w-full bg-linear-to-r from-accent to-accent-sec hover:shadow-lg hover:shadow-accent/30 text-white rounded-lg transition-all duration-300 flex items-center group ${
              isExpanded ? "justify-center px-4 py-2.5 gap-2" : "justify-center p-2.5"
            }`}
          >
            <Plus className="w-4 h-4 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
            {isExpanded && <span className="font-medium text-sm">New Chat</span>}
          </button>
        </div>

        {/* Divider */}
        <div className="shrink-0 px-3 pb-2">
          <div className="h-px bg-linear-to-r from-transparent via-foreground/10 to-transparent" />
        </div>

        {/* Recent Chats */}
        <div className="flex-1 min-h-0 flex flex-col px-3 pb-2">
          {isExpanded && (
            <>
              <p className="text-xs font-semibold text-foreground-sec uppercase tracking-wider px-3 mb-2">
                Recent Chats
              </p>
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border/50 rounded-md">
                <ChatHistory
                  isExpanded={isExpanded}
                  onSelectChat={(id) => {
                    onModeChange("chat");
                    window.dispatchEvent(new CustomEvent("select-chat", { detail: { id } }));
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-2 bg-background-sec/50">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              isExpanded ? "flex-row px-2 py-2" : "flex-col gap-2 py-2"
            }`}
          >
            {/* Info button */}
            <button
              onClick={() => setShowInfo(true)}
              aria-label="Show app info"
              title="About Developer"
              className={`rounded-xl transition-all duration-200 flex items-center text-foreground-sec hover:text-foreground hover:bg-background-sec group ${
                isExpanded
                  ? "justify-start px-3 py-2 gap-2"
                  : "justify-center p-3 w-full"
              }`}
            >
              <Info className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
              {isExpanded && <span className="text-sm font-medium">Info</span>}
            </button>

            {/* Theme Toggle */}
            <div
              className={`transition-all duration-200 ${
                isExpanded ? "ml-auto" : "mx-auto"
              }`}
            >
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {showInfo && <InfoOverlay onClose={() => setShowInfo(false)} />}
    </>
  );
}
