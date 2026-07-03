"use client";

import { useState, useRef, useEffect } from "react";
import { X, Copy, Check, Download, QrCode } from "lucide-react";

// Inline social SVGs for robust cross-version compatibility
const TwitterIcon = ({ size = 12, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ size = 12, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FacebookIcon = ({ size = 12, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicUrl: string;
  username: string;
  displayName?: string | null;
  grade?: string;
  score?: number;
  mainStack?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  publicUrl,
  username,
  displayName,
  grade = "A",
  score = 85,
  mainStack = "TypeScript / Next.js"
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  // Generate a PNG Profile Card via HTML5 Canvas
  const handleDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set Dimensions (Standard Social Share Card Ratio 1.91:1 -> 800x420)
    canvas.width = 800;
    canvas.height = 420;

    // Draw Background (Sleek Dark Theme Gradient)
    const grad = ctx.createLinearGradient(0, 0, 800, 420);
    grad.addColorStop(0, "#0D1117");
    grad.addColorStop(0.5, "#161B22");
    grad.addColorStop(1, "#0D1117");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 420);

    // Draw Ambient Glow Rings
    ctx.strokeStyle = "rgba(88, 166, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(800, 0, 200, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
    ctx.beginPath();
    ctx.arc(800, 0, 350, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Outer Card border
    ctx.strokeStyle = "#30363D";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 780, 400);

    // Draw Header Text (Brand)
    ctx.fillStyle = "#8B949E";
    ctx.font = "bold 13px Courier New";
    ctx.fillText("DEVTRACK // Public Portfolio Card", 40, 50);

    // Draw User Name
    ctx.fillStyle = "#F0F6FC";
    ctx.font = "bold 32px Inter, system-ui, sans-serif";
    ctx.fillText(displayName || username, 40, 110);

    // Draw GitHub Username handle
    ctx.fillStyle = "#58A6FF";
    ctx.font = "bold 16px Courier New";
    ctx.fillText(`@${username}`, 40, 140);

    // Draw main stack
    ctx.fillStyle = "#8B949E";
    ctx.font = "14px Inter, system-ui, sans-serif";
    ctx.fillText("PRIMARY ECOSYSTEM:", 40, 200);
    ctx.fillStyle = "#F0F6FC";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.fillText(mainStack, 40, 225);

    // Draw overall rating score
    ctx.fillStyle = "#8B949E";
    ctx.font = "14px Inter, system-ui, sans-serif";
    ctx.fillText("DEVELOPER INDEX SCORE:", 40, 280);
    ctx.fillStyle = "#3FB950";
    ctx.font = "bold 18px Inter, sans-serif";
    ctx.fillText(`${score} / 100`, 40, 305);

    // Draw Huge circular Grade Badge on the right
    const badgeX = 620;
    const badgeY = 210;
    const badgeRadius = 75;

    // Outer Circle
    ctx.strokeStyle = "#30363D";
    ctx.lineWidth = 6;
    ctx.fillStyle = "#161B22";
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner Ring
    ctx.strokeStyle = "#58A6FF";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeRadius - 10, 0, Math.PI * 2);
    ctx.stroke();

    // Grade Text
    ctx.fillStyle = "#58A6FF";
    ctx.font = "black 52px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(grade, badgeX, badgeY - 5);

    // Subtext Grade Badge
    ctx.fillStyle = "#8B949E";
    ctx.font = "bold 10px Courier New";
    ctx.fillText("DEV GRADE", badgeX, badgeY + 40);

    // Draw Footer watermark
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#8B949E";
    ctx.font = "11px Courier New";
    ctx.fillText("Verify telemetry at: devtrack.dev", 40, 370);

    // Trigger PNG Download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `devtrack-profile-${username}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Hidden Canvas for Card Generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-[#161B22] p-6 shadow-2xl z-10 font-mono text-xs">
        
        {/* Close trigger */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-secondary hover:text-text-primary p-1 cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-2">
              <QrCode size={16} className="text-accent" />
              <span>Share Developer Profile</span>
            </h3>
            <p className="text-[10px] text-text-secondary mt-0.5">Generate profile links and recruiter sharing options.</p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-[#0D1117]">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}&color=58a6ff&bgcolor=0d1117`}
              alt="Profile QR Code"
              className="h-36 w-36 object-contain"
            />
            <span className="text-[9px] text-text-secondary mt-2.5 font-bold uppercase tracking-wider">Scan to visit profile</span>
          </div>

          {/* Copy Link Input */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-text-secondary uppercase block">Profile URL</span>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-3 py-2 rounded-lg border border-border bg-[#0D1117] text-[#F0F6FC] select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex items-center justify-center p-2 rounded-lg border border-border bg-[#161B22]/50 hover:bg-[#161B22] text-[#F0F6FC] transition-colors cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check size={14} className="text-[#3FB950]" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Sharing Shortcuts */}
          <div className="space-y-1.5 border-t border-border/40 pt-3.5">
            <span className="text-[9px] font-bold text-text-secondary uppercase block">Social Platforms</span>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my DevTrack developer profile & analytics report: ${publicUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#30363D] hover:bg-[#0D1117] text-text-primary transition-all font-bold"
              >
                <TwitterIcon size={12} className="text-sky-400" />
                <span>X</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#30363D] hover:bg-[#0D1117] text-text-primary transition-all font-bold"
              >
                <LinkedinIcon size={12} className="text-blue-500" />
                <span>LinkedIn</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#30363D] hover:bg-[#0D1117] text-text-primary transition-all font-bold"
              >
                <FacebookIcon size={12} className="text-blue-600" />
                <span>Meta</span>
              </a>
            </div>
          </div>

          {/* Download Profile Card */}
          <div className="border-t border-border/40 pt-3.5">
            <button
              onClick={handleDownloadCard}
              className="w-full py-2.5 px-4 rounded-lg bg-accent hover:bg-accent/90 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Download PNG Profile Card</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
