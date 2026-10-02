"use client";

import { useId } from "react";
import { useAnimatedNumber } from "@/lib/motion";
import { shade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { arcPath, polar } from "./live";

// Figma 게이지 중심·반지름·굵기와 아래가 트인 270도 호 범위 지정
const C = 150;
const R = 105;
const WIDTH = 18;
const START = 135;
const SWEEP = 270;
const ARC_LEN = (2 * Math.PI * R * SWEEP) / 360;

type HealthGaugeProps = {
  label: string;
  // 현재 비율(0~100) 지정
  value: number;
  // 목표 비율(0~100) 지정
  target?: number;
  sub?: string;
};

// 가동률 같은 비율을 입체 받침 위 270도 링과 목표 눈금으로 표시
export function HealthGauge({ label, value, target = 90, sub }: HealthGaugeProps) {
  const id = useId();
  const shown = useAnimatedNumber(Math.max(0, Math.min(100, value)), 1600);
  const end = START + (SWEEP * shown) / 100;
  const [dotX, dotY] = polar(C, C, R, end);
  const tickDeg = START + (SWEEP * target) / 100;
  const [t1x, t1y] = polar(C, C, R - 12, tickDeg);
  const [t2x, t2y] = polar(C, C, R + 13, tickDeg);
  return (
    <div className="relative size-[300px]">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(closest-side, ${tint("--accent-cyan", 22)}, ${tint("--accent-violet", 8)} 55%, transparent)` }}
      />
      <svg className="absolute inset-0 overflow-visible" viewBox="0 0 300 300" width={300} height={300}>
        <defs>
          <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--navy-650)" }} />
            <stop offset="1" style={{ stopColor: "var(--navy-850)" }} />
          </linearGradient>
          <linearGradient id={`${id}-dome`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: shade("--navy-650", "white", 8) }} />
            <stop offset="0.7" style={{ stopColor: "var(--navy-800)" }} />
            <stop offset="1" style={{ stopColor: "var(--navy-850)" }} />
          </linearGradient>
          <linearGradient id={`${id}-arc`} gradientUnits="userSpaceOnUse" x1="264" y1="36" x2="36" y2="264">
            <stop offset="0" style={{ stopColor: "var(--accent-violet)" }} />
            <stop offset="1" style={{ stopColor: "var(--accent-cyan)" }} />
          </linearGradient>
        </defs>
        <circle cx={C} cy={C} r={126} fill={`url(#${id}-plate)`} style={{ filter: "drop-shadow(0 20px 20px rgba(0,0,0,0.7))" }} />
        <circle cx={C} cy={C} r={125.5} fill="none" strokeWidth={1} style={{ stroke: tint("--white", 14) }} />
        <path d={arcPath(C, C, R, START, START + SWEEP)} fill="none" strokeWidth={WIDTH} strokeLinecap="round" style={{ stroke: tint("--white", 7) }} />
        <path
          d={arcPath(C, C, R, START, START + SWEEP)}
          fill="none"
          strokeWidth={WIDTH}
          strokeLinecap="round"
          stroke={`url(#${id}-arc)`}
          strokeDasharray={ARC_LEN}
          strokeDashoffset={ARC_LEN * (1 - shown / 100)}
          style={{ filter: `drop-shadow(0 0 8px ${tint("--accent-cyan", 55)})` }}
        />
        {/* 호 끝에서 빛 점이 숨 쉬듯 커졌다 작아지게 처리 */}
        <circle cx={dotX} cy={dotY} r={5} className="animate-[glow-breathe_2s_ease-in-out_infinite]" style={{ fill: "var(--white)", transformOrigin: `${dotX}px ${dotY}px`, filter: `drop-shadow(0 0 6px var(--accent-cyan))` }} />
        <line x1={t1x} y1={t1y} x2={t2x} y2={t2y} strokeWidth={3} strokeLinecap="round" style={{ stroke: "var(--status-warning)", filter: `drop-shadow(0 0 3px ${tint("--status-warning", 80)})` }} />
        <circle cx={C} cy={C} r={84} fill={`url(#${id}-dome)`} style={{ filter: "drop-shadow(0 8px 9px rgba(0,0,0,0.55))" }} />
        <circle cx={C} cy={C} r={83.5} fill="none" strokeWidth={1} style={{ stroke: tint("--white", 18) }} />
      </svg>
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center whitespace-nowrap">
        <p className={`font-semibold text-(--accent-cyan) ${TEXT.labelMedium}`}>{label}</p>
        <div className="flex items-baseline gap-0.5">
          <p className={`font-extrabold text-(--text-primary) tabular-nums ${TEXT.displayMedium}`}>{shown.toFixed(1)}</p>
          <p className={`font-bold text-(--text-secondary) ${TEXT.titleLarge}`}>%</p>
        </div>
        {sub && <p className={`font-medium text-(--status-success) ${TEXT.labelSmall}`}>{sub}</p>}
      </div>
    </div>
  );
}
