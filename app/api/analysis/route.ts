import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatData } from "@/types/Chat";

export const maxDuration = 60;

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

// ✂️ Helper to trim a string to N words
function limitWords(text: string, limit = 50): string {
  return text.split(/\s+/).slice(0, limit).join(" ").trim();
}

// 🧮 Helper to cap total word count across list entries (~50 words)
function limitListWords(list: string[], totalLimit = 50): string[] {
  const result: string[] = [];
  let total = 0;
  for (const item of list) {
    const words = item.split(/\s+/);
    if (total + words.length > totalLimit) break;
    result.push(words.join(" "));
    total += words.length;
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const { chats, question } = (await req.json()) as {
      chats: ChatData[];
      question?: string;
    };

    if (!Array.isArray(chats) || chats.length === 0) {
      return NextResponse.json({ error: "No chat data provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🧠 Combine all chat text
    const allMessages = chats
      .map((chat: ChatData) =>
        chat.messages
          .map((m) => (m.user ? `User: ${m.user}` : `AI: ${m.ai}`))
          .join("\n")
      )
      .join("\n---\n");

    // ✂️ Split to prevent token overflow
    const maxChunkSize = 10000;
    const chunks: string[] = [];
    for (let i = 0; i < allMessages.length; i += maxChunkSize) {
      chunks.push(allMessages.slice(i, i + maxChunkSize));
    }

    const summaries: string[] = [];

    for (const chunk of chunks) {
      const chunkPrompt = `
Analyze this chat segment and produce JSON ONLY in the exact structure below.
Each text field must be short and concise. Keep total words per section under 50.

{
  "summary": "Brief paragraph (~50 words) summarizing the overall tone and nature of the chat segment.",
  "emotions": [
    {"emotion": "joy", "intensity": 0.7},
    {"emotion": "curiosity", "intensity": 0.2},
    {"emotion": "anger", "intensity": 0.1}
  ],
  "personality": ["up to 5 short traits"],
  "commonTopics": ["up to 5 short topics"],
  "creativeInsights": ["2-4 bullet points; total under 50 words"],
  "recommendations": ["2-4 bullet points; total under 50 words"]
}

Chat segment:
${chunk}

Return ONLY valid JSON and nothing else.
`;
      const result = await model.generateContent(chunkPrompt);
      summaries.push(result.response.text());
    }

    // 🧩 Merge summaries into final compact analysis
    const mergePrompt = `
Combine the following multiple JSON analyses into one cohesive final analysis.

Each section must remain short:
- "summary" is one paragraph under 50 words
- "creativeInsights" and "recommendations" are bullet points totaling under 50 words each
- "personality" and "commonTopics" short lists (≤5 items)
- "emotions" 3–6 items, normalized 0–1

Output ONLY valid JSON in this structure:

{
  "summary": "brief text",
  "emotions": [{"emotion":"joy","intensity":0.6}],
  "personality": ["trait1","trait2"],
  "commonTopics": ["topic1","topic2"],
  "creativeInsights": ["point1","point2"],
  "recommendations": ["point1","point2"]
}

JSON analyses:
${summaries.join("\n---\n")}
`;

    const finalResult = await model.generateContent(mergePrompt);
    const rawText = finalResult.response.text();

    // 🧼 Extract JSON safely
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON format.");

    const parsed: AnalysisJSON = JSON.parse(jsonMatch[0]);

    // 🧹 Clean + limit
    parsed.summary = limitWords(parsed.summary, 50);
    parsed.personality = parsed.personality?.slice(0, 5).map(limitWords) || [];
    parsed.commonTopics = parsed.commonTopics?.slice(0, 5).map(limitWords) || [];
    parsed.creativeInsights = limitListWords(parsed.creativeInsights || [], 50);
    parsed.recommendations = limitListWords(parsed.recommendations || [], 50);
    parsed.emotions = (parsed.emotions || [])
      .slice(0, 6)
      .map((e) => ({
        emotion: limitWords(e.emotion || "", 3),
        intensity: Math.min(Math.max(Number(e.intensity) || 0, 0), 1),
      }));

    // 💬 Optional: follow-up question
    let answer = "";
    if (question && typeof question === "string") {
      const qPrompt = `
You have the following JSON-based analysis of user conversations:
${JSON.stringify(parsed)}

Now answer this question briefly (under 50 words), using only that data:
"${question}"
`;
      const qResult = await model.generateContent(qPrompt);
      answer = limitWords(qResult.response.text(), 50);
    }

    return NextResponse.json({
      analysis: parsed,
      answer: answer || null,
    });
  } catch (error: unknown) {
    console.error("❌ AI analysis route error:", error);

    if (error instanceof Error && error.message.includes("429")) {
      return NextResponse.json({ error: "Rate limited. Try again later." }, { status: 429 });
    }
    if (
      error instanceof Error &&
      (error.message.includes("400") || error.message.includes("token"))
    ) {
      return NextResponse.json(
        { error: "Too much data to process. Try analyzing fewer chats." },
        { status: 413 }
      );
    }
    if (error instanceof Error && error.message.includes("JSON")) {
      return NextResponse.json(
        { error: "AI returned invalid JSON format." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Unexpected server error during AI analysis." },
      { status: 500 }
    );
  }
}
