"use client";

import { useEffect, useRef } from "react";
import { formatTimeAgo } from "@/utils/Time";
import { formatAIResponse } from "@/utils/FormatAIResponse";
import { useMathJax } from "@/utils/useMathJax";

interface BubbleProps {
  type: "user" | "ai";
  content: string;
  timestamp: string;
}

export default function Bubble({ type, content, timestamp }: BubbleProps) {
  const isUser = type === "user";
  const formattedContent = type === "ai" ? formatAIResponse(content) : content;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { typeset } = useMathJax();

  useEffect(() => {
    if (!isUser && contentRef.current) {
      // give MathJax a small delay after render to avoid timing issues
      setTimeout(() => {
        typeset(contentRef.current);
      }, 200);
    }
  }, [formattedContent, isUser, typeset]);

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      } transition-all`}
    >
      <div
        className={`w-full sm:max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm relative group whitespace-pre-wrap wrap-break-words ${
          isUser
            ? "bg-accent text-white rounded-br-none self-end"
            : "bg-foreground/10 text-foreground rounded-bl-none self-start"
        }`}
      >
        {isUser ? (
          <div>{formattedContent}</div>
        ) : (
          <div
            ref={contentRef}
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        )}

        <span
          className={`block text-[10px] opacity-70 mt-1 ${
            isUser ? "text-background/80 text-right" : "text-foreground/60 text-left"
          }`}
        >
          {formatTimeAgo(timestamp)}
        </span>
      </div>
    </div>
  );
}
