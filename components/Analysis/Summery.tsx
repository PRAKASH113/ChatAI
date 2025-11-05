import { Brain } from "lucide-react";

interface SummaryCardProps {
  summary: string;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="bg-linear-to-r from-accent/10 via-accent-sec/10 to-accent/10 p-6 rounded-2xl shadow-md">
      <h2 className="flex items-center gap-2 text-foreground text-lg font-semibold mb-2">
        <Brain className="w-5 h-5 text-accent" /> Overall Conversation Summary
      </h2>
      <p className="text-foreground-sec text-sm leading-relaxed whitespace-pre-wrap">
        {summary}
      </p>
    </div>
  );
}
