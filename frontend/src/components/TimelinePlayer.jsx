import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

const MILESTONES = [
  { month: "Jan 2023", title: "Syndicate inception in Mumbai dockyards" },
  { month: "Apr 2023", title: "FIR-0142 registered at MRA Marg PS (Mohd. Aslam)" },
  { month: "Jul 2023", title: "Hawala accounts activated in Bangalore (Aslam Bhai)" },
  { month: "Aug 2023", title: "Belgaum transit vehicle MH-12-DE-1001 linked" },
  { month: "Nov 2023", title: "Identity forgery conduit identified (Iqbal Painter)" },
  { month: "Feb 2024", title: "Interstate hawala cash loop intercepted by FIU" }
];

export default function TimelinePlayer({ onTimeChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const next = prev + 2;
          if (onTimeChange) onTimeChange(next);
          return next;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying, onTimeChange]);

  const handleSlider = (e) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (onTimeChange) onTimeChange(val);
  };

  const milestoneIndex = Math.min(
    MILESTONES.length - 1,
    Math.floor((progress / 100) * MILESTONES.length)
  );
  const currentMilestone = MILESTONES[milestoneIndex];

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-800 shadow-2xl z-20 flex items-center gap-3.5 w-[480px] max-w-[90vw] text-slate-200">
      {/* Play / Pause Toggle */}
      <button
        onClick={() => {
          if (progress >= 100) setProgress(0);
          setIsPlaying(!isPlaying);
        }}
        className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center hover:bg-slate-700 transition shrink-0 shadow-sm cursor-pointer"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      {/* Slider & Milestone */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Clock size={12} className="text-purple-400" />
            <span>{currentMilestone.month}</span>
          </div>
          <span className="text-slate-400 text-[11px] truncate max-w-[240px]">
            {currentMilestone.title}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSlider}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          setProgress(100);
          setIsPlaying(false);
          if (onTimeChange) onTimeChange(100);
        }}
        title="Reset to Present Day"
        className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
