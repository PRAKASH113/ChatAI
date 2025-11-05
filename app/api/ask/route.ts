import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatData } from "@/types/Chat";

export const maxDuration = 45; // shorter runtime since it's for Q&A

export async function POST(req: Request) {
  try {
    const { chats, question } = (await req.json()) as {
      chats: ChatData[];
      question: string;
    };

    if (!Array.isArray(chats) || chats.length === 0) {
      return NextResponse.json({ error: "No chat data provided" }, { status: 400 });
    }
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🧠 Safely combine all chat messages
    const allMessages = chats
      .map((chat: ChatData) => {
        if (!chat?.messages || !Array.isArray(chat.messages)) return "";
        return chat.messages
          .map((m) => {
            if (m.user) return `User: ${m.user}`;
            if (m.ai) return `AI: ${m.ai}`;
            return "";
          })
          .join("\n");
      })
      .filter(Boolean)
      .join("\n---\n");

    const prompt = `
You are an analytical assistant.
Given the following conversation history, answer the user's question briefly (under 100 words).

Conversation history:
${allMessages}

Question:
"${question}"

Respond clearly in plain text (no JSON, no markdown, no extra symbols).
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error("❌ askAnalysis API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response." },
      { status: 500 }
    );
  }
}
