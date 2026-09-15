import React, { useState } from "react";

export default function NetSentryLogo({
  size = 36,
  className = "",
  showText = false,
  subtitle = "Crime Intelligence Grid",
  variant = "minimal" // "minimal" | "vector"
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Minimal Emblem Mark */}
      <div
        className="relative shrink-0 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition"
        style={{ width: size, height: size }}
      >
        {!imgError && variant !== "vector" ? (
          <img
            src="/logo-minimal.png"
            alt="NetSentry Logo"
            className="w-full h-full object-cover scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Razor-Sharp Pure Vector Fallback */
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full p-1"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="nsAmberVec" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="nsCyanVec" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="nsShieldVec" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <path
              d="M16 20 L26 14 L32 18 L38 14 L48 20 C48 38 38 48 32 52 C26 48 16 38 16 20 Z"
              stroke="url(#nsShieldVec)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#020617"
            />
            <path
              d="M24 40 L24 24 L38 38 L38 22"
              stroke="url(#nsAmberVec)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M38 34 L38 40 L28 46 L24 40"
              stroke="url(#nsCyanVec)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="31" cy="31" r="2.2" fill="#ffffff" />
          </svg>
        )}
      </div>

      {/* Optional Clean Typography */}
      {showText && (
        <div className="overflow-hidden leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-sm tracking-wider text-white">
              NETSENTRY
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              LIVE
            </span>
          </div>
          {subtitle && (
            <p className="text-[10px] text-slate-400 truncate mt-1 font-sans">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
