"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const duration = 500; // animation duration (ms)

  // Initialize theme safely
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const preferred = saved || "dark";
    document.documentElement.dataset.theme = preferred;

    requestAnimationFrame(() => {
      setTheme((prev) => (prev !== preferred ? preferred : prev));
    });
  }, []);

  // Toggle theme with fancy animation
  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;
    const next = theme === "dark" ? "light" : "dark";

    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          document.documentElement.dataset.theme = next;
          localStorage.setItem("theme", next);
          setTheme(next);
        });
      });

      await transition.ready;

      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } else {
      document.documentElement.dataset.theme = next;
      localStorage.setItem("theme", next);
      setTheme(next);
    }
  }, [theme]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`
        relative flex items-center justify-center
        w-9 h-9 rounded-full
        bg-toggle-bg text-forground
        hover:bg-toggle-hover
        transition-all duration-500 ease-out
        hover:scale-105 active:scale-95
        overflow-hidden
      `}
    >

      {/* Sun Icon */}
      <div
        className={`absolute transform transition-all duration-500 ease-in-out ${
          theme === "dark"
            ? "translate-y-0 rotate-0 opacity-100"
            : "translate-y-8 -rotate-90 opacity-0"
        }`}
      >
        <Sun size={20} strokeWidth={1.8} />
      </div>

      {/* Moon Icon */}
      <div
        className={`absolute transform transition-all duration-500 ease-in-out ${
          theme === "dark"
            ? "-translate-y-8 rotate-90 opacity-0"
            : "translate-y-0 rotate-0 opacity-100"
        }`}
      >
        <Moon size={18} strokeWidth={1.8} />
      </div>
    </button>
  );
}
