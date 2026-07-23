'use client';

import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface LiquidMetalWrapperProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string;
  active?: boolean;
  onClick?: () => void;
  speed?: number;
  hoverSpeed?: number;
  padding?: string;
}

export function LiquidMetalWrapper({
  children,
  className = "",
  borderRadius = "100px",
  active = false,
  onClick,
  speed = 0.5,
  hoverSpeed = 1.2,
  padding = "2px",
}: LiquidMetalWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const shaderRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shaderMount = useRef<any>(null);

  useEffect(() => {
    const styleId = "shader-canvas-style-wrapper";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .lm-wrapper-canvas canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }

    const loadShader = async () => {
      try {
        if (shaderRef.current) {
          if (shaderMount.current?.destroy) {
            shaderMount.current.destroy();
          }

          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 4,
              u_softness: 0.5,
              u_shiftRed: 0.3,
              u_shiftBlue: 0.3,
              u_distortion: 0,
              u_contour: 0,
              u_angle: 45,
              u_scale: 8,
              u_shape: 1,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            active ? 1.0 : speed,
          );
        }
      } catch (error) {
        console.error("[LiquidMetalWrapper] Failed to load shader:", error);
      }
    };

    loadShader();

    return () => {
      if (shaderMount.current?.destroy) {
        shaderMount.current.destroy();
        shaderMount.current = null;
      }
    };
  }, [active, speed]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    shaderMount.current?.setSpeed?.(hoverSpeed);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    shaderMount.current?.setSpeed?.(active ? 1.0 : speed);
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      className={`relative group inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ borderRadius }}
    >
      {/* Liquid Metal Shader Outer Border Shell */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none transition-all duration-300"
        style={{
          borderRadius,
          boxShadow: isPressed
            ? "0px 0px 0px 1px rgba(0, 0, 0, 0.5), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)"
            : active || isHovered
            ? "0 0 16px rgba(34, 211, 238, 0.35), 0px 0px 0px 1px rgba(34, 211, 238, 0.5)"
            : "0px 0px 0px 1px rgba(255, 255, 255, 0.12), 0px 4px 12px rgba(0,0,0,0.2)",
          opacity: active || isHovered ? 1 : 0.85,
        }}
      >
        <div
          ref={shaderRef}
          className="lm-wrapper-canvas w-full h-full relative"
          style={{ borderRadius }}
        />
      </div>

      {/* Dark Inner Container for Content */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-200"
        style={{
          borderRadius,
          margin: padding,
          background: "linear-gradient(180deg, rgba(24, 24, 27, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)",
          transform: isPressed ? "scale(0.98)" : "scale(1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
