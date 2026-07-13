"use client";

import React from "react";

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

interface DockIcon {
  src: string;
  alt: string;
  onClick?: () => void;
}

// Glass Effect Wrapper Component
export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  onClick
}) => {
  const glassStyle = {
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    ...style,
  };

  return (
    <div
      onClick={onClick}
      className={`relative flex overflow-hidden cursor-pointer transition-all duration-500 ${className}`}
      style={glassStyle}
    >
      {/* Glossy Overlay layers */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[50%] z-0 opacity-10"
        style={{
          background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

// Dock Component
export const GlassDock: React.FC<{ icons: DockIcon[]; className?: string }> = ({
  icons,
  className = ""
}) => (
  <GlassEffect className={`rounded-3xl p-3 ${className}`}>
    <div className="flex items-center justify-between gap-3 w-full">
      {icons.map((icon, index) => (
        <button
          key={index}
          onClick={icon.onClick}
          className="flex flex-col items-center justify-center p-2 rounded-xl active:scale-90 hover:scale-105 transition-all duration-300"
        >
          <img
            src={icon.src}
            alt={icon.alt}
            className="w-10 h-10 object-contain rounded-xl"
          />
        </button>
      ))}
    </div>
  </GlassEffect>
);

// Button Component
export const GlassButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({
  children,
  onClick,
  className = ""
}) => (
  <GlassEffect
    onClick={onClick}
    className={`rounded-2xl px-6 py-3.5 hover:rounded-3xl overflow-hidden active:scale-95 transition-all duration-300 ${className}`}
  >
    <div className="flex items-center justify-center font-bold text-sm tracking-wide text-white">
      {children}
    </div>
  </GlassEffect>
);

// SVG Filter Component for Liquid Glass Gloss
export const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }}>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.002 0.008"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="10"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);
