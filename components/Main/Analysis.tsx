"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Send,
  MessageSquare,
  Loader2,
  RotateCcw,
} from "lucide-react";
import type { ChatData } from "@/types/Chat";

import SummaryCard from "@/components/Analysis/Summery";
import EmotionBreakdown from "@/components/Analysis/Emotion";
import InsightPanel from "@/components/Analysis/Insights";
import Bubble from "@/components/Main/Bubble";

interface EmotionData {
  emotion: string;
  intensity: number;
}

interface AnalysisJSON {
  summary: string;
  emotions: EmotionData[];
  personality: string[];
  commonTopics: string[];
  creativeInsights: string[];
  recommendations: string[];
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

export default function Analysis() {
  const [analysis, setAnalysis] = useState<AnalysisJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAsking, setIsAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // 🧠 Load all chats
  const getAllChats = (): ChatData[] => {
    const chats: ChatData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("chat_")) {
        const stored = localStorage.getItem(key);
        if (stored) chats.push(JSON.parse(stored));
      }
    }
    return chats;
  };

  // ⚙️ Auto-load or generate analysis on mount
  useEffect(() => {
    const stored = localStorage.getItem("chat_analysis");
    if (stored) {
      try {
        setAnalysis(JSON.parse(stored));
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem("chat_analysis");
      }
    }
    runAnalysis();
  }, []);

  // 🧩 Run AI-powered analysis (uses /api/analysis)
  const runAnalysis = async () => {
    const chats = getAllChats();
    if (!chats.length) {
      alert("No chat history found!");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chats }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAnalysis(data.analysis);
      localStorage.setItem("chat_analysis", JSON.stringify(data.analysis));
    } catch (err) {
      console.error("❌ Analysis failed:", err);
      alert("Failed to generate AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleReAnalyze = () => {
    localStorage.removeItem("chat_analysis");
    setAnalysis(null);
    runAnalysis();
  };

  // 💬 Handle user question — uses /api/askAnalysis
  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: question.trim(),
      timestamp: new Date().toISOString(),
    };
    setChatHistory((prev) => [...prev, userMsg]);
    setQuestion("");
    setIsAsking(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chats: getAllChats(), question }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: ChatMessage = {
        role: "ai",
        content: data.answer || "No insights found.",
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("❌ Ask API error:", err);
      const errorMsg: ChatMessage = {
        role: "ai",
        content: "⚠️ Something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  // 🌀 Loading
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[85vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin mb-2" />
        <p className="text-foreground-sec text-sm">
          Analyzing your chat history...
        </p>
      </div>
    );

  if (!analysis)
    return (
      <div className="text-center text-foreground-sec italic mt-20">
        No analysis data available.
      </div>
    );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 overflow-auto px-4 py-4">
      {/* 🧠 Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-accent" />
          <h1 className="text-xl font-semibold text-foreground">
            AI Chat Analysis
          </h1>
        </div>
        <button
          onClick={handleReAnalyze}
          disabled={loading}
          aria-label="Re-analyze chats"
          title="Re-analyze chats"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-accent/10 hover:bg-accent/20 text-accent transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Re-Analyze
        </button>
      </div>

      {/* 🧩 Modular Sections */}
      <SummaryCard summary={analysis.summary} />
      <EmotionBreakdown emotions={analysis.emotions} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT — Insights */}
        <InsightPanel
          personality={analysis.personality}
          commonTopics={analysis.commonTopics}
          creativeInsights={analysis.creativeInsights}
          recommendations={analysis.recommendations}
        />

        {/* RIGHT — Chat Section */}
        <div className="flex flex-col h-full bg-background-sec rounded-2xl shadow-md p-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-accent" />
            Ask About Your Past Conversations
          </h3>

          <div className="flex-1 overflow-auto mb-2 space-y-3 pr-1">
            {chatHistory.length === 0 ? (
              <p className="text-foreground-sec text-sm italic text-center mt-6">
                Start by asking something like:
                <br />
                <span className="text-accent">
                  “What emotion do I express most often?”
                </span>
              </p>
            ) : (
              chatHistory.map((msg, i) => (
                <Bubble
                  key={i}
                  type={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))
            )}
          </div>

          {/* Thinking Indicator */}
          {isAsking && (
            <p className="text-xs text-foreground-sec italic text-center mb-2">
              Thinking...
            </p>
          )}

          {/* Input Bar */}
          <form
            onSubmit={handleAsk}
            className="flex items-center gap-2 mt-auto bg-background/40 rounded-lg p-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about your previous chats..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground-sec text-sm px-2"
            />
            <button
              type="submit"
              disabled={isAsking}
              aria-label="Send message"
              title="Send message"
              className="p-2 rounded-lg bg-accent/80 hover:bg-accent-sec text-background transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
