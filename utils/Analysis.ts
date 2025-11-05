// utils/analysis.ts
import type { ChatData } from "@/types/Chat";

/**
 * Load all chats from localStorage (keys start with `chat_`)
 */
export function getAllChatsFromStorage(): ChatData[] {
  const chats: ChatData[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("chat_")) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as ChatData;
        chats.push(parsed);
      } catch (e) {
        // ignore corrupt entries
        continue;
      }
    }
  }
  // sort by lastSession desc
  chats.sort((a, b) => (new Date(b.lastSession).getTime() - new Date(a.lastSession).getTime()));
  return chats;
}

/* ----------------------
   Basic helpers & heuristics
   ---------------------- */

const STOP_WORDS = new Set([
  "the","is","in","at","and","a","to","of","it","for","on","you","i","that","this","are","was","with","as","be","have","not","but","or","we"
]);

const POSITIVE = ["good","great","love","awesome","nice","happy","thanks","thank","yes","correct","well","fantastic","excellent"];
const NEGATIVE = ["bad","sad","hate","terrible","angry","wrong","no","problem","issue","fail","failed","frustrat","annoy","disappoint"];

/** compute a tiny sentiment score per text (-1..1) */
export function sentimentScore(text: string): number {
  if (!text) return 0;
  const t = text.toLowerCase();
  let score = 0;
  const words = t.split(/\W+/).filter(Boolean);
  for (const w of words) {
    if (POSITIVE.some(p => w.includes(p))) score += 1;
    if (NEGATIVE.some(n => w.includes(n))) score -= 1;
  }
  if (words.length === 0) return 0;
  return Math.max(-1, Math.min(1, score / Math.sqrt(words.length))); // normalized-ish
}

/** extract words freq */
export function topKeywords(chats: ChatData[], limit = 30) {
  const freq = new Map<string, number>();
  for (const c of chats) {
    for (const m of c.messages) {
      const txt = (m.user || m.ai || "").toLowerCase();
      const words = txt.split(/\W+/).filter(Boolean);
      for (const w of words) {
        if (w.length <= 2) continue;
        if (STOP_WORDS.has(w)) continue;
        freq.set(w, (freq.get(w) || 0) + 1);
      }
    }
  }
  const arr = Array.from(freq.entries()).map(([word, count]) => ({ word, count }));
  arr.sort((a, b) => b.count - a.count);
  return arr.slice(0, limit);
}

/** overall aggregation */
export function aggregateStats(chats: ChatData[]) {
  const totalConversations = chats.length;
  let totalMessages = 0;
  let longestChatLength = 0;
  let sentimentSum = 0;
  const dayCounts: Record<string, number> = {};

  for (const c of chats) {
    totalMessages += c.messages.length;
    longestChatLength = Math.max(longestChatLength, c.messages.length);
    for (const m of c.messages) {
      sentimentSum += sentimentScore(m.user || m.ai || "");
      const d = new Date(m.timestamp || c.lastSession);
      const day = d.toISOString().slice(0, 10);
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
  }

  const avgMessagesPerChat = totalConversations ? totalMessages / totalConversations : 0;
  const overallSentiment = totalMessages ? sentimentSum / totalMessages : 0;
  const overallSentimentLabel = overallSentiment > 0.15 ? "Positive" : overallSentiment < -0.15 ? "Negative" : "Neutral";

  // most active day
  const dayEntries = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
  const mostActiveDay = dayEntries[0]?.[0] || null;
  const mostActiveDayLabel = mostActiveDay ? new Date(mostActiveDay).toLocaleDateString() : "—";

  // tone summary
  const toneSummary = overallSentiment > 0.3 ? "Optimistic / positive" : overallSentiment < -0.3 ? "Frustrated / negative" : "Balanced / neutral";

  const quickAdvice = overallSentiment < -0.2 ? "User may prefer concise, empathetic responses." : "User engages well — keep friendly, helpful tone.";

  return { totalConversations, totalMessages, avgMessagesPerChat, longestChatLength, overallSentiment, overallSentimentLabel, toneSummary, mostActiveDayLabel, quickAdvice };
}

/** sentiment by day for sparkline */
export function sentimentOverTime(chats: ChatData[]) {
  const map: Record<string, { sum: number; count: number }> = {};
  for (const c of chats) {
    for (const m of c.messages) {
      const d = new Date(m.timestamp || c.lastSession);
      const day = d.toISOString().slice(0, 10);
      map[day] = map[day] || { sum: 0, count: 0 };
      map[day].sum += sentimentScore(m.user || m.ai || "");
      map[day].count += 1;
    }
  }
  const days = Object.keys(map).sort();
  return days.map((day) => {
    const item = map[day];
    const score = item.count ? item.sum / item.count : 0;
    return { day, score, dayLabel: day.slice(5) }; // mm-dd
  }).slice(-14); // last 14 days
}

/** top conversations by message count */
export function topConversationsByMessages(chats: ChatData[], limit = 5) {
  const arr = [...chats].sort((a, b) => b.messages.length - a.messages.length);
  return arr.slice(0, limit);
}

/** quick highlights: top questions and likely decisions */
export function conversationHighlights(chats: ChatData[]) {
  const questions: { text: string; when: string }[] = [];
  const decisions: { text: string; when: string }[] = [];

  for (const c of chats) {
    for (const m of c.messages) {
      const text = (m.user || m.ai || "").trim();
      if (!text) continue;
      const when = m.timestamp || c.lastSession;
      if (text.endsWith("?") && text.length > 10) {
        questions.push({ text: text.slice(0, 200), when });
      }
      // naive decision/action detection
      if (/\b(decide|should|we will|let's|let us|action|todo|task|assign|deadline|deliver)\b/i.test(text)) {
        decisions.push({ text: text.slice(0, 200), when });
      }
    }
  }

  // frequency + uniq
  const topQuestions = questions.slice(0, 10);
  const topDecisions = decisions.slice(0, 10);

  return { topQuestions, topDecisions };
}

/** hourly activity distribution */
export function hourlyActivity(chats: ChatData[]) {
  const hours = Array.from({ length: 24 }).map((_, i) => ({ hour: i, count: 0 }));
  for (const c of chats) {
    for (const m of c.messages) {
      const d = new Date(m.timestamp || c.lastSession);
      const h = d.getHours();
      hours[h].count++;
    }
  }
  return hours;
}

/** tiny formatter */
export function formatShortDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}
