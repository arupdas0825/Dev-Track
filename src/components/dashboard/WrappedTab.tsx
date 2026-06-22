"use client";

import { UserDashboardData } from "@/types";

interface WrappedTabProps {
  data: UserDashboardData;
}

export default function WrappedTab({ data }: WrappedTabProps) {
  const { wrapped, profile } = data;

  const handleShareText = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const shareText = `🚀 My Dev-Track Wrapped for ${wrapped.year}!\n\n💻 Top Language: ${wrapped.mostUsedLanguage}\n🔥 Active Streak: ${wrapped.longestStreak} Days\n🏆 Achievement: ${wrapped.biggestAchievement} - ${wrapped.achievementDescription}\n\nCheck yours at DevTrack!`;
      navigator.clipboard.writeText(shareText);
      alert("Wrapped summary copied to clipboard! Share it on Twitter/LinkedIn.");
    }
  };

  const handleDownloadCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw solid dark background
    ctx.fillStyle = "#0D1117";
    ctx.fillRect(0, 0, 800, 800);

    // Diagonal glow effect (top-right blue, bottom-left green/teal)
    const grad1 = ctx.createRadialGradient(800, 0, 50, 800, 0, 450);
    grad1.addColorStop(0, "rgba(31, 111, 235, 0.28)");
    grad1.addColorStop(1, "rgba(31, 111, 235, 0)");
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, 800, 800);

    const grad2 = ctx.createRadialGradient(0, 800, 50, 0, 800, 450);
    grad2.addColorStop(0, "rgba(63, 185, 80, 0.22)");
    grad2.addColorStop(1, "rgba(63, 185, 80, 0)");
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, 800, 800);

    // Thin premium border
    ctx.strokeStyle = "#30363D";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 740, 740);

    // 2. Draw Header
    ctx.font = "bold 26px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillStyle = "#58A6FF";
    ctx.fillText("DEVTRACK", 60, 85);

    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#8B949E";
    const yearText = `WRAPPED ${wrapped.year || new Date().getFullYear()}`;
    const yearWidth = ctx.measureText(yearText).width;
    ctx.fillText(yearText, 740 - yearWidth, 85);

    // Divider
    ctx.strokeStyle = "rgba(48, 54, 61, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 115);
    ctx.lineTo(740, 115);
    ctx.stroke();

    const drawDetails = (hasAvatar: boolean, avatarImg?: HTMLImageElement) => {
      let textStartX = 60;
      
      // Draw Avatar
      if (hasAvatar && avatarImg) {
        ctx.beginPath();
        ctx.arc(105, 180, 42, 0, Math.PI * 2);
        ctx.fillStyle = "#30363D";
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(105, 180, 40, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, 65, 140, 80, 80);
        ctx.restore();
        
        textStartX = 165;
      } else {
        // Fallback initials circle
        ctx.beginPath();
        ctx.arc(105, 180, 40, 0, Math.PI * 2);
        ctx.fillStyle = "#1F6FEB";
        ctx.fill();

        ctx.font = "bold 32px 'Space Grotesk', system-ui, sans-serif";
        ctx.fillStyle = "#F0F6FC";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const initials = (profile.name || profile.login || "U").substring(0, 2).toUpperCase();
        ctx.fillText(initials, 105, 180);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        textStartX = 165;
      }

      // Name & Handle
      ctx.font = "bold 28px 'Space Grotesk', system-ui, sans-serif";
      ctx.fillStyle = "#F0F6FC";
      ctx.fillText(profile.name || profile.login, textStartX, 175);

      ctx.font = "16px monospace";
      ctx.fillStyle = "#8B949E";
      ctx.fillText(`@${profile.login}`, textStartX, 202);

      // Draw Stats Grid
      const drawStat = (x: number, y: number, w: number, h: number, title: string, value: string, valColor: string, isCode = false) => {
        ctx.fillStyle = "rgba(22, 27, 34, 0.6)";
        ctx.strokeStyle = "#30363D";
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, w, h, 8, true, true);

        ctx.font = "bold 11px monospace";
        ctx.fillStyle = "#8B949E";
        ctx.fillText(title, x + 20, y + 32);

        ctx.font = isCode 
          ? "bold 18px monospace"
          : "bold 24px 'Space Grotesk', system-ui, sans-serif";
        ctx.fillStyle = valColor;

        let finalVal = value;
        if (isCode && ctx.measureText(value).width > w - 40) {
          while (ctx.measureText(finalVal + "...").width > w - 40 && finalVal.length > 0) {
            finalVal = finalVal.slice(0, -1);
          }
          finalVal += "...";
        }
        ctx.fillText(finalVal, x + 20, y + 78);
      };

      // Stats row 1
      drawStat(60, 255, 325, 120, "TOP LANGUAGE", wrapped.mostUsedLanguage, "#58A6FF");
      drawStat(415, 255, 325, 120, "LONGEST STREAK", `${wrapped.longestStreak} Days`, "#3FB950");

      // Stats row 2
      drawStat(60, 395, 325, 120, "TOTAL COMMITS", `${wrapped.totalCommits} Pushes`, "#F0F6FC");
      drawStat(415, 395, 325, 120, "TOP REPOSITORY", wrapped.mostActiveRepo, "#58A6FF", true);

      // Core Achievement Segment
      ctx.fillStyle = "rgba(22, 27, 34, 0.6)";
      ctx.strokeStyle = "#30363D";
      ctx.lineWidth = 1;
      roundRect(ctx, 60, 535, 680, 135, 8, true, true);

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#8B949E";
      ctx.fillText("CORE ACHIEVEMENT", 80, 565);

      ctx.font = "bold 20px 'Space Grotesk', system-ui, sans-serif";
      ctx.fillStyle = "#3FB950";
      ctx.fillText(`🏆 ${wrapped.biggestAchievement}`, 80, 598);

      ctx.font = "14px system-ui, sans-serif";
      ctx.fillStyle = "#8B949E";
      wrapText(ctx, wrapped.achievementDescription, 80, 628, 640, 20);

      // Global Contributor Standing
      ctx.fillStyle = "rgba(31, 111, 235, 0.08)";
      ctx.strokeStyle = "rgba(88, 166, 255, 0.2)";
      roundRect(ctx, 60, 690, 680, 48, 6, true, true);

      ctx.font = "bold 14px monospace";
      ctx.fillStyle = "#58A6FF";
      ctx.textAlign = "center";
      ctx.fillText(wrapped.percentileText.toUpperCase(), 400, 720);
      ctx.textAlign = "left";

      // Footer brand details
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#8B949E";
      ctx.fillText("DEVTRACK.IO/WRAPPED", 60, 762);

      ctx.fillStyle = "#3FB950";
      const verifiedText = "VERIFIED DEVELOPER SCORE";
      const verifiedWidth = ctx.measureText(verifiedText).width;
      ctx.fillText(verifiedText, 740 - verifiedWidth, 762);

      // Trigger download
      try {
        const link = document.createElement("a");
        link.download = `${profile.login}-devtrack-wrapped.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        console.error("Canvas export blocked: ", err);
        alert("Due to browser security/CORS cache rules on external avatars, we generated a card using fallback styles instead.");
      }
    };

    // Helper functions for drawing
    const roundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: boolean, stroke: boolean) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
      if (fill) c.fill();
      if (stroke) c.stroke();
    };

    const wrapText = (c: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) => {
      const words = text.split(" ");
      let line = "";
      let currY = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const testW = c.measureText(testLine).width;
        if (testW > maxW && n > 0) {
          c.fillText(line, x, currY);
          line = words[n] + " ";
          currY += lineH;
        } else {
          line = testLine;
        }
      }
      c.fillText(line, x, currY);
    };

    // Load profile avatar using anonymous crossOrigin
    if (profile.avatar_url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        drawDetails(true, img);
      };
      img.onerror = () => {
        console.warn("Avatar image could not be loaded via CORS. Rendering placeholder instead.");
        drawDetails(false);
      };
      // Append query parameter to bust browser cache that might lack CORS response headers
      img.src = profile.avatar_url + (profile.avatar_url.includes("?") ? "&" : "?") + "c_bust=" + Date.now();
    } else {
      drawDetails(false);
    }
  };

  return (
    <div className="space-y-8 flex flex-col items-center">
      {/* Wrapped Core Card Container */}
      <div className="relative w-full max-w-lg rounded-xl border border-[#30363D] bg-[#161B22]/70 p-6 md:p-8 shadow-2xl overflow-hidden font-mono">
        {/* Glow Accent Circles */}
        <div className="absolute -top-16 -right-16 h-36 w-36 bg-[#1F6FEB]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-36 w-36 bg-[#3FB950]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Wrapped Header */}
        <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-[#58A6FF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="text-xs font-bold text-[#F0F6FC] tracking-tight font-space-grotesk">
              DEVTRACK WRAPPED
            </span>
          </div>
          <span className="text-xs text-[#8B949E] font-bold">{wrapped.year}</span>
        </div>

        {/* User Card Info */}
        <div className="flex items-center gap-3.5 mt-6">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              className="h-11 w-11 rounded-full border border-[#30363D] object-cover bg-[#0D1117]"
            />
          ) : (
            <div className="h-11 w-11 rounded-full border border-[#30363D] bg-[#1F6FEB] flex items-center justify-center text-xs font-bold text-white">
              {(profile.name || profile.login || "U").substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-sm font-bold text-[#F0F6FC] font-space-grotesk">{profile.name || profile.login}</div>
            <div className="text-[10px] text-[#8B949E] mt-0.5">@{profile.login}</div>
          </div>
        </div>

        {/* Grid Statistics */}
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#30363D]/50 bg-[#0D1117]/50 p-4">
              <div className="text-[9px] text-[#8B949E] uppercase tracking-wider font-mono">Top Language</div>
              <div className="text-sm font-bold text-[#58A6FF] mt-1.5 font-space-grotesk">
                {wrapped.mostUsedLanguage}
              </div>
            </div>
            <div className="rounded-lg border border-[#30363D]/50 bg-[#0D1117]/50 p-4">
              <div className="text-[9px] text-[#8B949E] uppercase tracking-wider font-mono">Longest Streak</div>
              <div className="text-sm font-bold text-[#3FB950] mt-1.5 font-space-grotesk">
                {wrapped.longestStreak} Days
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#30363D]/50 bg-[#0D1117]/50 p-4">
              <div className="text-[9px] text-[#8B949E] uppercase tracking-wider font-mono">Total Commits</div>
              <div className="text-sm font-bold text-[#F0F6FC] mt-1.5 font-space-grotesk">
                {wrapped.totalCommits} Pushes
              </div>
            </div>
            <div className="rounded-lg border border-[#30363D]/50 bg-[#0D1117]/50 p-4 overflow-hidden">
              <div className="text-[9px] text-[#8B949E] uppercase tracking-wider font-mono">Top Repository</div>
              <div className="text-xs font-bold text-[#58A6FF] mt-2 truncate hover:underline" title={wrapped.mostActiveRepo}>
                {wrapped.mostActiveRepo}
              </div>
            </div>
          </div>

          {/* Achievement Segment */}
          <div className="rounded-lg border border-[#30363D]/50 bg-[#0D1117]/50 p-4 space-y-1">
            <div className="text-[9px] text-[#8B949E] uppercase tracking-wider font-mono">Core Achievement</div>
            <div className="text-xs font-bold text-[#3FB950] mt-1 flex items-center gap-1.5">
              <span>🏆</span>
              <span>{wrapped.biggestAchievement}</span>
            </div>
            <p className="text-[10px] text-[#8B949E] mt-1 leading-relaxed">
              {wrapped.achievementDescription}
            </p>
          </div>

          {/* Standing Banner */}
          <div className="text-center rounded-lg border border-[#58A6FF]/20 bg-[#1F6FEB]/5 p-3.5">
            <div className="text-[9px] text-[#8B949E] uppercase tracking-wider font-mono">Contributor Standing</div>
            <div className="text-xs font-extrabold text-[#58A6FF] mt-1 font-space-grotesk">
              {wrapped.percentileText}
            </div>
          </div>
        </div>

        {/* Footer Brand Logo */}
        <div className="flex items-center justify-between text-[9px] text-[#8B949E] border-t border-[#30363D]/40 mt-8 pt-4">
          <span className="font-bold tracking-wider text-[#58A6FF]/70">DEVTRACK.IO/WRAPPED</span>
          <span className="text-[#3FB950] font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3FB950] animate-pulse" />
            VERIFIED
          </span>
        </div>
      </div>

      {/* Share Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleShareText}
          className="flex items-center gap-2 rounded-lg bg-[#30363D] hover:bg-[#161B22] border border-[#30363D] px-4.5 py-2.5 text-xs font-bold text-[#F0F6FC] transition-colors focus:outline-none cursor-pointer"
        >
          <svg className="h-4 w-4 text-[#8B949E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Share Summary
        </button>

        <button
          onClick={handleDownloadCard}
          className="flex items-center gap-2 rounded-lg bg-[#1F6FEB] hover:bg-[#58A6FF] px-4.5 py-2.5 text-xs font-bold text-white transition-colors focus:outline-none cursor-pointer shadow-md shadow-[#1F6FEB]/10"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Share Card (PNG)
        </button>
      </div>
    </div>
  );
}
