import { Heart, Smile } from "lucide-react";

interface EmotionData {
  emotion: string;
  intensity: number;
}

interface EmotionBreakdownProps {
  emotions: EmotionData[];
}

export default function EmotionBreakdown({ emotions }: EmotionBreakdownProps) {
  if (!emotions || emotions.length === 0) return null;

  return (
    <div className="bg-background-sec rounded-2xl p-5 shadow-md">
      <h3 className="flex items-center gap-2 text-foreground font-semibold mb-4">
        <Heart className="w-4 h-4 text-accent" /> Emotional Breakdown
      </h3>
      <div className="space-y-3">
        {emotions.map((e, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-sm text-foreground-sec"
          >
            <span className="flex items-center gap-2 capitalize">
              <Smile className="w-3 h-3 text-accent" />
              {e.emotion}
            </span>
            <div className="w-48 bg-background/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-accent h-2 rounded-full transition-all w-full"
                style={{ width: `${Math.min(e.intensity * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
