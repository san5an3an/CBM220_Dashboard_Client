"use client";

import { useId, useState } from "react";
import { Area, AreaChart, YAxis } from "recharts";
import { Badge } from "@/components/foundations";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { clamp, seeded, useInterval } from "./live";

const CONFIG = { count: { label: "고장 건수", color: "var(--accent-violet)" } } satisfies ChartConfig;

// Figma 차트 크기와 값 범위, 점 개수, 갱신 간격 지정
const W = 317;
const PLOT_H = 112;
const DOMAIN: [number, number] = [-2.3, 16.3];
const POINTS = 25;
const LIVE_MS = 2500;

type Point = { i: number; v: number };

// 하루 동안 오르내리는 고장 건수 첫 데이터 생성
function initial(): Point[] {
  const rand = seeded(24);
  return Array.from({ length: POINTS }, (_, i) => ({ i, v: Math.round(clamp(6 + Math.sin(i / 3.2) * 4 + (i > 14 && i < 19 ? 5 : 0) + (rand() - 0.5) * 3, 1, 14)) }));
}

// 가장 오래된 점을 빼고 새 점 추가
function next(prev: Point[]): Point[] {
  const last = prev[prev.length - 1];
  const v = Math.round(clamp(last.v + (Math.random() - 0.5) * 5 + (6 - last.v) * 0.15, 1, 14));
  return [...prev.slice(1), { i: last.i + 1, v }];
}

type TrendAreaChartProps = {
  labels?: string[];
};

// 24시간 고장 건수 추이를 그라데이션 영역과 최고점·현재 표시로 실시간 표시
export function TrendAreaChart({ labels = ["00시", "06시", "12시", "18시", "현재"] }: TrendAreaChartProps) {
  const id = useId().replace(/:/g, "");
  const [data, setData] = useState(initial);
  useInterval(() => setData(next), LIVE_MS);

  const y = (v: number) => PLOT_H * (1 - (v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0]));
  const x = (idx: number) => (W * idx) / (POINTS - 1);
  const peakIdx = data.reduce((best, p, idx) => (p.v >= data[best].v ? idx : best), 0);
  const peak = data[peakIdx];
  const now = data[POINTS - 1];

  return (
    <div className="relative h-[138px] w-[317px]">
      {["top-0 bg-(--chart-grid)", "top-[27.05%] bg-(--chart-grid)", "top-[54.11%] bg-(--chart-grid)", "top-[81.16%] bg-(--chart-axis)"].map((cls) => (
        <div key={cls} className={`absolute inset-x-0 h-px ${cls}`} />
      ))}
      <div className="absolute inset-[0_0_26px_0]">
        <ChartContainer config={CONFIG} className="aspect-auto size-full">
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" style={{ stopColor: "var(--accent-cyan)" }} />
                <stop offset="1" style={{ stopColor: "var(--accent-violet)" }} />
              </linearGradient>
              <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: "var(--accent-violet)", stopOpacity: 0.38 }} />
                <stop offset="1" style={{ stopColor: "var(--accent-violet)", stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <YAxis hide domain={DOMAIN} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={`url(#${id}-stroke)`}
              strokeWidth={2.5}
              fill={`url(#${id}-fill)`}
              dot={false}
              activeDot={false}
              isAnimationActive
              animationDuration={600}
              style={{ filter: "drop-shadow(0 3px 0 color-mix(in srgb, var(--accent-violet) 55%, transparent))" }}
            />
          </AreaChart>
        </ChartContainer>
        {/* 최고점 위치에 세로 줄기·점·건수 배지를 따라 옮기도록 처리 */}
        <div
          className="pointer-events-none absolute bottom-0 w-0.5 -translate-x-1/2 transition-[left,top] duration-500"
          style={{ left: x(peakIdx), top: y(peak.v), backgroundImage: `linear-gradient(to bottom, ${tint("--status-danger", 70)}, transparent)` }}
        />
        <span
          className="pointer-events-none absolute size-2.5 -translate-1/2 rounded-full border-2 border-(--white) bg-(--status-danger) transition-[left,top] duration-500"
          style={{ left: x(peakIdx), top: y(peak.v), boxShadow: `0 0 8px 0 ${tint("--status-danger", 80)}` }}
        />
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full pb-2 transition-[left,top] duration-500"
          style={{ left: clamp(x(peakIdx), 44, W - 44), top: y(peak.v) - 4 }}
        >
          <Badge tone="danger" label={`PEAK ${peak.v}건`} />
        </div>
        <span className="pointer-events-none absolute size-2 -translate-1/2 rounded-full bg-(--accent-violet) transition-[top] duration-500" style={{ left: W, top: y(now.v), boxShadow: `0 0 8px 2px ${tint("--accent-violet", 70)}` }}>
          <span className="absolute inset-0 animate-ping rounded-full bg-(--accent-violet)/60" />
        </span>
      </div>
      <div className={`absolute inset-x-0 bottom-0 flex h-4 items-start justify-between overflow-clip font-medium whitespace-nowrap ${TEXT.labelSmall}`}>
        {labels.map((l, i) => (
          <p key={l} className={i === labels.length - 1 ? "text-(--accent-violet)" : "text-(--text-tertiary)"}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}
