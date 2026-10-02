"use client";

import type { CSSProperties } from "react";
import { arcPath } from "@/components/monitoring/live";
import { useAnimatedNumber } from "@/lib/motion";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

// 바깥 링 가운데 반지름 30.6·굵기 6.8, 안쪽 링 21.84·4.32 의 Figma 링 치수 지정
const C = 34;
const OUTER = { r: 30.6, w: 6.8 };
const INNER = { r: 21.84, w: 4.32 };
const LIGHTS = ["--status-success", "--status-warning", "--status-danger"];

type DiagnosisRingProps = {
  formation?: string;
  date?: string;
  // 진단 진행률(0~1) 지정
  progress?: number;
  // 데이터 수집률(0~1) 지정
  collect?: number;
  power?: boolean;
  status?: string;
};

// 자동 진단 한 건을 진행률·수집률 이중 링과 편성·전원·상태로 표시하고 링이 차오르도록 갱신
export function DiagnosisRing({ formation = "4401", date = "2026-05-12 00:00:00", progress = 0.8, collect = 0.6, power = true, status = "자동 진단 완료" }: DiagnosisRingProps) {
  const p = useAnimatedNumber(Math.max(0, Math.min(1, progress)), 1400);
  const q = useAnimatedNumber(Math.max(0, Math.min(1, collect)), 1400);
  const powerToken = power ? "--status-success" : "--status-danger";
  const gradId = `diag-${formation}`;
  return (
    <div className="relative flex h-[92px] w-[480px] items-center gap-4 rounded-[18px] border border-(--border-default) pr-[18px] pl-3.5">
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[18px] bg-linear-to-r from-(--white)/5 to-(--white)/2" />
      <div className="relative size-[68px] shrink-0">
        <svg width={68} height={68} className="overflow-visible">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "var(--accent-cyan)" }} />
              <stop offset="1" style={{ stopColor: "var(--status-success)" }} />
            </linearGradient>
          </defs>
          <circle cx={C} cy={C} r={30.6} fill="none" strokeWidth={OUTER.w} style={{ stroke: "rgba(255,255,255,0.08)" }} />
          {p > 0.001 && (
            <path
              d={arcPath(C, C, OUTER.r, -90, -90 + 360 * Math.min(p, 0.9999))}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={OUTER.w}
              style={{ filter: `drop-shadow(0 0 4px ${tint("--accent-cyan", 60)})` }}
            />
          )}
          {q > 0.001 && (
            <path
              d={arcPath(C, C, INNER.r, -90, -90 + 360 * Math.min(q, 0.9999))}
              fill="none"
              strokeWidth={INNER.w}
              style={{ stroke: tint("--accent-violet", 90), filter: `drop-shadow(0 0 3px ${tint("--accent-violet", 60)})` }}
            />
          )}
        </svg>
        <p className={`absolute inset-0 flex items-center justify-center font-semibold text-(--text-primary) tabular-nums ${TEXT.labelSmall}`}>{Math.round(p * 100)}%</p>
      </div>
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-0.5 overflow-clip">
        <div className="flex items-center gap-2">
          <p className={`font-bold whitespace-nowrap text-(--text-primary) ${TEXT.titleLarge}`}>{formation}</p>
          <span className="rounded-[6px] border px-2 py-0.5" style={{ background: tint(powerToken, 18), borderColor: tint(powerToken, 50) }}>
            <p className={`font-semibold whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: `var(${powerToken})` }}>
              {power ? "ON" : "OFF"}
            </p>
          </span>
        </div>
        <p className={`font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelMedium}`}>{date}</p>
      </div>
      {/* 신호등 점 세 개가 차례로 밝아지도록 표시 */}
      <div className="relative flex h-2 w-8 shrink-0 justify-between">
        {LIGHTS.map((t, i) => (
          <span
            key={t}
            className="size-2 animate-[legend-pulse_1.8s_ease-in-out_infinite] rounded-full"
            style={{ background: `var(${t})`, animationDelay: `${i * 0.6}s`, "--pulse": tint(t, 90) } as CSSProperties}
          />
        ))}
      </div>
      <span className="relative shrink-0 rounded-full border border-(--status-success)/45 bg-(--status-success)/14 px-2.5 py-1">
        <p className={`font-semibold whitespace-nowrap text-(--status-success) ${TEXT.labelSmall}`}>{status}</p>
      </span>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.06)]" />
    </div>
  );
}
