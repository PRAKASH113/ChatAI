"use client";

import { Sparkles, MessageSquare, Lightbulb, Brain } from "lucide-react";

interface InsightPanelProps {
  personality: string[];
  commonTopics: string[];
  creativeInsights: string[];
  recommendations: string[];
}

export default function InsightPanel({
  personality,
  commonTopics,
  creativeInsights,
  recommendations,
}: InsightPanelProps) {
  // 🧹 Utility: clean up empty or blank strings
  const cleanList = (list: string[]) =>
    (list || []).filter((item) => item && item.trim().length > 0);

  const renderCard = (
    title: string,
    content: string[],
    icon: React.ReactNode
  ) => {
    const filtered = cleanList(content);
    if (filtered.length === 0) return null;

    return (
      <div className="bg-linear-to-b from-background-sec to-background rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="text-sm text-foreground-sec leading-relaxed space-y-1">
          {filtered.map((p, i) => (
            <p key={i}>• {p}</p>
          ))}
        </div>
      </div>
    );
  };

  const cleanPersonality = cleanList(personality);
  const cleanTopics = cleanList(commonTopics);
  const cleanInsights = cleanList(creativeInsights);
  const cleanRecommendations = cleanList(recommendations);

  return (
    <div className="flex flex-col gap-5">
      {/* 💫 Personality Traits */}
      {renderCard(
        "Personality Traits",
        cleanPersonality,
        <Sparkles className="w-4 h-4 text-accent" />
      )}

      {/* 💬 Common Topics */}
      {cleanTopics.length > 0 && (
        <div className="bg-background-sec rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">
              Common Topics
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {cleanTopics.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 💡 Creative Insights */}
      {renderCard(
        "Creative Insights",
        cleanInsights,
        <Lightbulb className="w-4 h-4 text-accent" />
      )}

      {/* 🧠 Recommendations */}
      {renderCard(
        "AI Recommendations",
        cleanRecommendations,
        <Brain className="w-4 h-4 text-accent" />
      )}
    </div>
  );
}
