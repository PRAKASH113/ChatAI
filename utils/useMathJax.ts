// utils/useMathJax.ts
import { useEffect } from "react";

declare global {
  interface Window {
    MathJax?: any;
  }
}

let mathJaxLoaded = false;

export function useMathJax() {
  useEffect(() => {
    if (typeof window === "undefined" || mathJaxLoaded) return;

    mathJaxLoaded = true;

    // inject MathJax
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "mathjax-script";
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
    script.async = true;

    // configure before load
    (window as any).MathJax = {
      tex: {
        inlineMath: [["$", "$"], ["\\(", "\\)"]],
        displayMath: [["$$", "$$"], ["\\[", "\\]"]],
      },
      svg: { fontCache: "global" },
    };

    document.head.appendChild(script);
  }, []);

  async function typeset(container?: HTMLElement | null) {
    if (typeof window === "undefined") return;
    if (!window.MathJax) return;

    try {
      if (container) {
        await window.MathJax.typesetPromise([container]);
      } else {
        await window.MathJax.typesetPromise();
      }
    } catch (err) {
      console.warn("MathJax typeset error:", err);
    }
  }

  return { typeset };
}
