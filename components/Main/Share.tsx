"use client";

import { useState, useEffect, useRef } from "react";
import { Share2, Download } from "lucide-react";
import type { ChatData } from "@/types/Chat";
import jsPDF from "jspdf";

interface ShareButtonProps {
  chatId: string;
}

export default function ShareButton({ chatId }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState(`chat_${chatId}`);
  const [format, setFormat] = useState<"json" | "pdf" | "md">("json");
  const popupRef = useRef<HTMLDivElement | null>(null);

  // 🧠 Load chat safely
  const loadChatData = (): ChatData | null => {
    try {
      const stored = localStorage.getItem(`chat_${chatId}`);
      return stored ? (JSON.parse(stored) as ChatData) : null;
    } catch (error) {
      console.error("❌ Failed to load chat:", error);
      return null;
    }
  };

  // 🧹 Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // 📄 Generate Markdown
  const generateMarkdown = (chat: ChatData): string => {
    const title = chat.title || "Untitled Chat";
    const updatedDate = new Date(chat.lastSession).toLocaleString();

    let md = `# Chat: ${title}\n\n_Last updated: ${updatedDate}_\n\n---\n\n`;

    chat.messages.forEach((msg) => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      if (msg.user) md += `**User (${time}):** ${msg.user}\n\n`;
      if (msg.ai) md += `**AI (${time}):** ${msg.ai}\n\n`;
    });

    return md.trim();
  };

  // 🧾 Generate PDF
  const generatePDF = (chat: ChatData) => {
    const doc = new jsPDF();
    const title = chat.title || "Untitled Chat";
    const updatedDate = new Date(chat.lastSession).toLocaleString();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(34, 197, 94); // Tailwind accent green
    doc.text(`Chat: ${title}`, 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text(`Last updated: ${updatedDate}`, 14, 28);

    // Divider
    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    let y = 40;
    const pageHeight = doc.internal.pageSize.height - 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    chat.messages.forEach((msg) => {
      const sender = msg.user ? "User" : "AI";
      const text = msg.user || msg.ai || "";
      const time = new Date(msg.timestamp).toLocaleTimeString();

      // Add new page if needed
      if (y > pageHeight) {
        doc.addPage();
        y = 20;
      }

      // Sender label
      doc.setFont("helvetica", "bold");
      doc.setTextColor(msg.user ? 60 : 30, msg.user ? 60 : 30, msg.user ? 60 : 30);
      doc.text(`${sender} (${time}):`, 14, y);
      y += 6;

      // Message body
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 14, y);
      y += splitText.length * 7 + 4;
    });

    doc.save(`${fileName || chat.title || "chat"}.pdf`);
  };

  // 💾 Handle Download
  const handleDownload = () => {
    const chatData = loadChatData();
    if (!chatData) {
      alert("No chat data found to export!");
      return;
    }

    try {
      let blob: Blob;

      if (format === "json") {
        const jsonString = JSON.stringify(chatData, null, 2);
        blob = new Blob([jsonString], { type: "application/json" });
      } else if (format === "md") {
        const markdown = generateMarkdown(chatData);
        blob = new Blob([markdown], { type: "text/markdown" });
      } else if (format === "pdf") {
        generatePDF(chatData);
        setIsOpen(false);
        return;
      } else {
        return;
      }

      // Download for JSON/MD
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName || chatData.title || "chat"}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      setIsOpen(false);
    } catch (error) {
      console.error("❌ Export error:", error);
      alert("Something went wrong while exporting the chat.");
    }
  };

  return (
    <div className="fixed top-5 right-5 z-50" ref={popupRef}>
      {/* 🚀 Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="Share Chat"
        className="p-3 rounded-full bg-accent hover:bg-accent-sec text-background shadow-lg hover:shadow-accent/30 transition-all duration-300"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* 📦 Popup Card */}
      {isOpen && (
        <div
          className="absolute top-14 right-0 w-72 bg-background-sec/95 rounded-2xl shadow-2xl p-5 backdrop-blur-md border border-foreground/5 animate-fade-in"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Export Chat
          </h3>

          {/* 📝 Filename Input */}
          <div className="mb-4">
            <label
              htmlFor="fileNameInput"
              className="text-xs text-foreground-sec block mb-1"
            >
              File name
            </label>
            <input
              id="fileNameInput"
              type="text"
              title="Enter a name for your exported chat file"
              placeholder="Enter file name..."
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-background focus:ring-2 focus:ring-accent outline-none text-foreground placeholder:text-foreground-sec transition-all"
            />
          </div>

          {/* 📂 Format Selector */}
          <div className="flex justify-between text-sm mb-5">
            {(["json", "pdf", "md"] as const).map((f) => (
              <label
                key={f}
                className={`flex-1 text-center mx-1 py-1.5 rounded-lg cursor-pointer font-medium transition-all ${
                  format === f
                    ? "bg-accent text-background shadow-md"
                    : "bg-background hover:bg-foreground/10 text-foreground-sec hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={f}
                  checked={format === f}
                  onChange={() => setFormat(f)}
                  className="hidden"
                />
                {f.toUpperCase()}
              </label>
            ))}
          </div>

          {/* ⬇️ Download Button */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-linear-to-r from-accent to-accent-sec text-background font-medium text-sm hover:shadow-lg hover:shadow-accent/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      )}
    </div>
  );
}
