// app/api/chat/route.ts

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage } from "@/types/Chat";

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🧠 Prepare the contextual prompt
    const contextText =
      Array.isArray(context) && context.length > 0
        ? context
            .map((msg: ChatMessage) =>
              msg.user ? `User: ${msg.user}` : `AI: ${msg.ai}`
            )
            .join("\n")
        : "";

    const finalPrompt = contextText
      ? `${contextText}\nUser: ${message}\nAI:`
      : message;

    // 🚀 Generate response
    const result = await model.generateContent(finalPrompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text || "I didn’t quite catch that." });
  } catch (error) {
    console.error("❌ Gemini chat route error:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
