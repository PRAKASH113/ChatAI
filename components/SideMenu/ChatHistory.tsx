"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Pin, Trash2, Pencil } from "lucide-react";
import type { ChatData } from "@/types/Chat";
import {
  getAllChats,
  togglePinChat,
  deleteChat,
  renameChat,
} from "@/utils/ChatUtils";
import { formatTimeAgo } from "@/utils/Time";

interface ChatHistoryProps {
  isExpanded: boolean;
  onSelectChat: (id: string) => void;
}

export default function ChatHistory({ isExpanded, onSelectChat }: ChatHistoryProps) {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  useEffect(() => {
    // ✅ Defer setState to avoid "set-state-in-effect" warning
    queueMicrotask(() => setChats(getAllChats()));

    const handleChatUpdate = () => setChats(getAllChats());
    window.addEventListener("chat-updated", handleChatUpdate as EventListener);

    return () => {
      window.removeEventListener("chat-updated", handleChatUpdate as EventListener);
    };
  }, []);

  const handleRenameSubmit = (id: string) => {
    renameChat(id, newTitle.trim() || "Untitled Chat");
    setEditingId(null);
  };

  if (chats.length === 0) {
    return (
      <div className="text-center text-sm text-foreground-sec italic py-8">
        No chats yet.
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-y-auto max-h-full custom-scrollbar">
      {chats.map((chat) => {
        const isEditing = editingId === chat.id;

        return (
          <div
            key={chat.id}
            className="group flex items-center justify-between w-full rounded-lg transition-all duration-200 border border-transparent hover:border-accent/30 hover:bg-foreground/5 overflow-hidden"
          >
            {/* ✅ Non-interactive container, manual onClick */}
            <div
              onClick={() => onSelectChat(chat.id)}
              className={`flex flex-1 items-center cursor-pointer ${
                isExpanded ? "px-3 py-2 gap-2 text-left" : "justify-center p-2"
              } overflow-hidden`}
            >
              {chat.pinned ? (
                <Pin className="w-4 h-4 text-accent shrink-0" />
              ) : (
                <MessageSquare className="w-4 h-4 text-foreground-sec shrink-0" />
              )}

              {isExpanded && (
                <div className="flex flex-col flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={() => handleRenameSubmit(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit(chat.id);
                      }}
                      placeholder="Enter new name"
                      aria-label="Rename chat"
                      title="Rename chat"
                      autoFocus
                      className="bg-transparent border-b border-accent outline-none text-foreground w-full text-sm truncate"
                    />
                  ) : (
                    <span
                      className="font-medium text-foreground truncate w-full block"
                      title={chat.title}
                    >
                      {chat.title || "Untitled Chat"}
                    </span>
                  )}
                  <span className="text-xs text-foreground-sec truncate">
                    {formatTimeAgo(chat.lastSession)}
                  </span>
                </div>
              )}
            </div>

            {/* ✅ Independent buttons — not nested */}
            {isExpanded && (
              <div className="flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(chat.id);
                    setNewTitle(chat.title);
                  }}
                  className="p-1 rounded hover:bg-foreground/10"
                  title="Rename"
                >
                  <Pencil className="w-3.5 h-3.5 text-foreground-sec" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinChat(chat.id);
                  }}
                  className="p-1 rounded hover:bg-foreground/10"
                  title={chat.pinned ? "Unpin" : "Pin"}
                >
                  <Pin
                    className={`w-3.5 h-3.5 ${
                      chat.pinned ? "text-accent" : "text-foreground-sec"
                    }`}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="p-1 rounded hover:bg-red-500/10"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
