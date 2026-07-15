"use client";

import { Suspense, lazy, useEffect, useRef } from "react";
const Spline = lazy(() => import("@splinetool/react-spline"));

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

function SplineContainer({ scene, className }: InteractiveRobotSplineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanWatermarks = () => {
      // 1. Remove from main document
      document.querySelectorAll('#spline-watermark, a[href*="spline.design"], [class*="watermark"]').forEach(el => {
        (el as HTMLElement).style.setProperty("display", "none", "important");
        (el as HTMLElement).style.setProperty("opacity", "0", "important");
        (el as HTMLElement).style.setProperty("pointer-events", "none", "important");
      });

      // 2. Remove inside container or shadow roots
      if (containerRef.current) {
        const allElements = containerRef.current.querySelectorAll("*");
        allElements.forEach(el => {
          if (el.shadowRoot) {
            el.shadowRoot.querySelectorAll('#spline-watermark, a[href*="spline.design"], [class*="watermark"]').forEach(w => {
              (w as HTMLElement).style.setProperty("display", "none", "important");
              (w as HTMLElement).style.setProperty("opacity", "0", "important");
            });
          }
        });
      }
    };

    cleanWatermarks();
    const timer1 = setTimeout(cleanWatermarks, 300);
    const timer2 = setTimeout(cleanWatermarks, 1000);
    const timer3 = setTimeout(cleanWatermarks, 2500);
    const timer4 = setTimeout(cleanWatermarks, 5000);

    const observer = new MutationObserver(() => {
      cleanWatermarks();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className || ""}`}
      style={{
        maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 45%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 45%, transparent 100%)"
      }}
    >
      <Spline
        scene={scene}
        className="w-full h-full"
        onLoad={() => {
          setTimeout(() => {
            document.querySelectorAll('#spline-watermark, a[href*="spline.design"]').forEach(el => {
              (el as HTMLElement).style.setProperty("display", "none", "important");
            });
          }, 50);
        }}
      />
    </div>
  );
}

export function InteractiveRobotSpline({ scene, className }: InteractiveRobotSplineProps) {
  return (
    <Suspense
      fallback={
        <div className={`w-full h-full flex flex-col items-center justify-center bg-transparent text-white gap-3 p-8 ${className || ""}`}>
          <svg className="animate-spin h-6 w-6 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
          </svg>
          <span className="text-xs font-mono text-text-secondary">Loading 3D Interactive Robot...</span>
        </div>
      }
    >
      <SplineContainer scene={scene} className={className} />
    </Suspense>
  );
}

