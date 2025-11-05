import * as React from "react";
import { createMap } from "svg-dotted-map";

interface MapPoint {
  x: number;
  y: number;
  opacity: number;
}

interface DottedMapBGProps {
  dotCount?: number;
  dotRadius?: number;
  className?: string;
}

export default function DottedMapBG({
  dotCount = 8000,
  dotRadius = 0.25,
  className = "",
}: DottedMapBGProps) {
  const width = 200;
  const height = 100;

  const [points, setPoints] = React.useState<MapPoint[]>([]);
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const animationFrameRef = React.useRef<number>(0);

  // Create dotted map once on mount with random opacity values
  React.useEffect(() => {
    const { points: rawPoints } = createMap({ width, height, mapSamples: dotCount });
    const pointsWithOpacity = rawPoints.map((p: { x: number; y: number }) => ({
      x: p.x,
      y: p.y,
      opacity: Math.random() * 0.5 + 0.5,
    }));
    setPoints(pointsWithOpacity);
  }, [dotCount]);

  // Optimized random glowing animation using requestAnimationFrame
  React.useEffect(() => {
    if (!svgRef.current || points.length === 0) return;

    const dots = svgRef.current.querySelectorAll(".dot");
    if (!dots.length) return;

    let lastTime = 0;
    const glowInterval = 600; // Time between glow cycles in ms

    const animateGlow = (currentTime: number) => {
      if (currentTime - lastTime >= glowInterval) {
        lastTime = currentTime;

        // Random number of dots to glow this cycle (1-4 dots)
        const glowCount = Math.floor(Math.random() * 4) + 1;
        
        for (let i = 0; i < glowCount; i++) {
          const randomIndex = Math.floor(Math.random() * dots.length);
          const randomDot = dots[randomIndex] as SVGCircleElement;
          
          // Add glow class
          randomDot.classList.add("flash-green");
          
          // Remove after animation completes (1500ms)
          setTimeout(() => {
            randomDot.classList.remove("flash-green");
          }, 1500);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animateGlow);
    };

    animationFrameRef.current = requestAnimationFrame(animateGlow);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [points]);

  // Memoize the dot elements to prevent unnecessary re-renders
  const dotElements = React.useMemo(() => {
    return points.map((p, i) => (
      <circle
        key={i}
        className="dot"
        cx={p.x}
        cy={p.y}
        r={dotRadius}
        fill="currentColor"
        opacity={p.opacity}
      />
    ));
  }, [points, dotRadius]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={`absolute inset-0 w-full h-full text-gray-400/40 dark:text-gray-600/40 ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {dotElements}
    </svg>
  );
}