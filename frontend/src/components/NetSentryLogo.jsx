import React, { useState } from "react";

export default function NetSentryLogo({
  size = 36,
  className = "",
  showText = false,
  subtitle = "Crime Intelligence Grid",
  variant = "image" // "image" | "vector" | "falcon"
}) {
  const [imgError, setImgError] = useState(false);

  const imgSrc = variant === "falcon" ? "/logo-falcon.png" : "/logo.png";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Emblem Mark */}
      <div
        className="relative shrink-0 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-slate-950 border border-slate-800"
        style={{ width: size, height: size }}
      >
        {!imgError && variant !== "vector" ? (
          <img
            src={imgSrc}
            alt="NetSentry Emblem"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          /* High-Fidelity Inline Vector Fallback */
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full p-1"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="logoAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="logoCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <path
              d="M32 4 L54 12 C54 36 44 52 32 60 C20 52 10 36 10 12 Z"
              fill="#020617"
              stroke="url(#logoBorder)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M22 44 L22 20 L42 44 L42 20"
              stroke="url(#logoAmber)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 44 L22 20 L32 32"
              stroke="url(#logoCyan)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="22" cy="20" r="2.5" fill="#38bdf8" />
            <circle cx="22" cy="44" r="2.5" fill="#38bdf8" />
            <circle cx="32" cy="32" r="2" fill="#ffffff" />
            <circle cx="42" cy="20" r="2.5" fill="#fbbf24" />
            <circle cx="42" cy="44" r="2.5" fill="#fbbf24" />
          </svg>
        )}
      </div>

      {/* Optional Brand Text */}
      {showText && (
        <div className="overflow-hidden leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-sm tracking-wider text-white">
              NETSENTRY
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              LIVE
            </span>
          </div>
          {subtitle && (
            <p className="text-[10px] text-slate-400 truncate mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
