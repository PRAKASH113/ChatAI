// utils/FormatAIResponse.ts
export function formatAIResponse(text: string): string {
  if (!text) return "";

  let formatted = text;

  // Replace **bold** with <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Replace *italic* with <em>
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Replace triple backtick code blocks with pre>code
  formatted = formatted.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");

  // Replace inline code with <code>
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Convert markdown lists (- item) to <ul> approximations (simple)
  formatted = formatted.replace(/(^|\n)-\s+(.*)/g, "$1• $2");

  // Replace plain newlines with <br/> (preserve paragraphs)
  formatted = formatted.replace(/\r\n|\r|\n/g, "<br/>");

  return formatted.trim();
}
