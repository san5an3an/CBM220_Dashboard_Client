"use client";

import { useId } from "react";
import { useAnimatedNumber } from "@/lib/motion";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

const RING_TONE = {
  cyan: { from: "--accent-cyan", to: "--accent-violet", glow: "--accent-cyan" },
  coral: { from: "--status-danger", to: "--status-warning", glow: "--status-danger" },
} as const;

const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;

type ProgressRingProps = {
  label: string;
  value: number;
  sub?: string;
  tone?: keyof typeof RING_TONE;
};

// 진행률을 차오르는 호와 숫자로 보여주는 원형 링 표시
export function ProgressRing({ label, value, sub, tone = "cyan" }: ProgressRingProps) {
  const t = RING_TONE[tone];
  const gradientId = useId();
  const shown = useAnimatedNumber(Math.min(100, Math.max(0, value)));
  return (
    <div className="relative size-[150px]">
      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${tint(t.glow, 22)}, transparent 70%)` }} />
      <div
        className="absolute top-[11px] left-[11px] size-32 rounded-full shadow-[0px_10px_18px_0px_rgba(0,0,0,0.55),inset_0px_1px_0px_0px_rgba(255,255,255,0.12)]"
        style={{ backgroundImage: "linear-gradient(to bottom, var(--navy-650), var(--navy-900))" }}
      />
      <svg className="absolute top-[17px] left-[17px] size-[116px] -rotate-90" viewBox="0 0 116 116">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={`var(${t.from})`} />
            <stop offset="1" stopColor={`var(${t.to})`} />
          </linearGradient>
        </defs>
        <circle cx="58" cy="58" r={R} fill="none" strokeWidth={8} style={{ stroke: "color-mix(in srgb, var(--white) 8%, transparent)" }} />
        <circle
          cx="58"
          cy="58"
          r={R}
          fill="none"
          strokeWidth={8}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - shown / 100)}
          style={{ filter: `drop-shadow(0 0 6px ${tint(t.glow, 60)})` }}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center whitespace-nowrap">
        <p className={`font-medium text-(--text-secondary) ${TEXT.labelLarge}`}>{label}</p>
        <div className="flex items-baseline gap-0.5">
          <p className={`font-extrabold text-(--text-primary) tabular-nums ${TEXT.displaySmall}`}>{Math.round(shown)}</p>
          <p className={`font-medium text-(--text-secondary) ${TEXT.labelMedium}`}>%</p>
        </div>
        {sub && (
          <p className={`font-medium ${TEXT.labelSmall}`} style={{ color: `var(${t.from})` }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
