"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Exoid-colored vector folds, softened behind the dashboard's glass surfaces. */
export function WorkspaceBackdrop({ className }: { className?: string }) {
  const id = useId();
  const ribbonId = `${id}-ribbon`;
  const foldId = `${id}-fold`;
  const lightId = `${id}-light`;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-white [--workspace-brand:236_97%_65%] [--workspace-violet:267_72%_54%] [--workspace-pink:326_62%_36%] [--workspace-ink:263_50%_24%]",
        className,
      )}
    >
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full blur-[56px] motion-safe:animate-workspace-drift motion-reduce:animate-none"
      >
        <defs>
          <linearGradient id={ribbonId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop stopColor="hsl(var(--workspace-brand))" stopOpacity="0.9" />
            <stop
              offset="0.35"
              stopColor="hsl(var(--workspace-violet))"
              stopOpacity="0.8"
            />
            <stop
              offset="0.65"
              stopColor="hsl(var(--workspace-pink))"
              stopOpacity="0.65"
            />
            <stop
              offset="1"
              stopColor="hsl(var(--workspace-ink))"
              stopOpacity="0.75"
            />
          </linearGradient>
          <linearGradient id={foldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#d8dbff" />
            <stop
              offset="0.45"
              stopColor="hsl(var(--workspace-brand))"
              stopOpacity="0.75"
            />
            <stop
              offset="0.75"
              stopColor="hsl(var(--workspace-pink))"
              stopOpacity="0.5"
            />
            <stop offset="1" stopColor="#edf0ff" />
          </linearGradient>
          <linearGradient id={lightId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="0.45" stopColor="white" stopOpacity="0.85" />
            <stop offset="1" stopColor="white" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          d="M-200 1040C160 1200 240 650 570 700S1060 1140 1300 820s-80-510 470-780"
          fill="none"
          stroke={`url(#${ribbonId})`}
          strokeWidth="240"
        />
        <path
          d="M-240 260C140-40 310 460 660 280S1050-60 1370 140s250 300 420 200"
          fill="none"
          stroke={`url(#${foldId})`}
          strokeWidth="170"
        />
        <path
          d="M-200 950C160 1110 240 560 570 610S1060 1050 1300 730s-80-510 470-780"
          fill="none"
          stroke={`url(#${lightId})`}
          strokeWidth="24"
        />
        <path
          d="M-240 205C140-95 310 405 660 225S1050-115 1370 85s250 300 420 200"
          fill="none"
          stroke={`url(#${lightId})`}
          strokeWidth="14"
        />
      </svg>
      <div className="absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-white/15" />
    </div>
  );
}
