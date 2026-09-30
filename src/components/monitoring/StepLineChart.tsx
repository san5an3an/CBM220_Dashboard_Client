"use client";

import { useId, useState } from "react";
import { Area, AreaChart, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { shade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { clamp, seeded, useInterval } from "./live";

const CONFIG = { v: { label: "전류", color: "var(--status-success)" } } satisfies ChartConfig;

// Figma 축 눈금·표본 수·갱신 간격 지정
const Y_TICKS = [300, 250, 200, 150, 100, 50, 0];
const POINTS = 96;
const START = Date.UTC(2026, 8, 30, 6, 40, 0);
const STEP_MS = 4000;
const LIVE_MS = 1000;

type Point = { t: number; v: number };

// 계단처럼 일정 구간 유지되다 바뀌는 첫 측정값 생성
function initial(): Point[] {
  const rand = seeded(1040);
  let v = 140;
  return Array.from({ length: POINTS }, (_, i) => {
    if (i % 6 === 0) v = clamp(v + (rand() - 0.45) * 90, 40, 260);
    return { t: START + i * STEP_MS, v: Math.round(v) };
  });
}

// 가장 오래된 표본을 빼고 새 표본 추가
function next(prev: Point[]): Point[] {
  const last = prev[prev.length - 1];
  const v = Math.random() < 0.2 ? clamp(last.v + (Math.random() - 0.45) * 90, 40, 260) : last.v;
  return [...prev.slice(1), { t: last.t + STEP_MS, v: Math.round(v) }];
}

// 측정 시각을 시:분:초.밀리초 문구로 변환
const clock = (t: number, ms = true) => {
  const d = new Date(t + 9 * 3600 * 1000);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return ms ? `${hh}:${mm}:${ss}.${String(d.getUTCMilliseconds()).padStart(3, "0")}` : `${hh}:${mm}`;
};

// 커서 위치 측정 시각과 값을 민트 테두리 말풍선으로 표시
function Tip({ active, payload, unit }: { active?: boolean; payload?: readonly { payload?: unknown }[]; unit: string }) {
  const p = payload?.[0]?.payload as Point | undefined;
  if (!active || !p) return null;
  return (
    <div
      className="flex flex-col items-start gap-0.5 rounded-[12px] border border-(--status-success)/70 bg-linear-to-b from-(--navy-650) to-(--navy-850) px-3 py-2 whitespace-nowrap"
      style={{ boxShadow: `0 6px 16px 0 ${tint("--status-success", 35)}` }}
    >
      <p className={`font-medium text-(--text-secondary) tabular-nums ${TEXT.labelSmall}`}>{clock(p.t)}</p>
      <p className={`font-bold text-(--status-success) tabular-nums ${TEXT.titleSmall}`}>
        {p.v.toFixed(3)} {unit}
      </p>
    </div>
  );
}

// 커서 자리에 코랄 세로 빛줄기 표시
function Cursor({ points, height }: { points?: { x: number; y: number }[]; height?: number }) {
  const x = points?.[0]?.x;
  if (x == null) return null;
  return <rect x={x - 1} y={0} width={2} height={(height ?? 0) + 4} fill="url(#step-cursor)" style={{ filter: `drop-shadow(0 0 4px ${tint("--status-danger", 80)})` }} />;
}

type StepLineChartProps = {
  unit?: string;
};

// 정비 근거 측정값을 계단 선·영역·커서 말풍선으로 실시간 표시
export function StepLineChart({ unit = "A" }: StepLineChartProps) {
  const id = useId().replace(/:/g, "");
  const [data, setData] = useState(initial);
  useInterval(() => setData(next), LIVE_MS);
  const span = data[POINTS - 1].t - data[0].t;
  const ticks = Array.from({ length: 7 }, (_, i) => clock(data[0].t + (span * i) / 6, false));

  return (
    <div className="relative h-[324px] w-[1040px]">
      {Y_TICKS.map((v, i) => {
        const top = (i / (Y_TICKS.length - 1)) * 300;
        return (
          <div key={v}>
            <div className={`absolute right-0 left-14 h-px ${v === 0 ? "bg-(--chart-axis)" : "bg-(--chart-grid)"}`} style={{ top }} />
            <p className={`absolute left-0 w-11 -translate-y-1/2 text-right font-medium text-(--text-tertiary) ${TEXT.labelSmall}`} style={{ top }}>
              {v}
            </p>
          </div>
        );
      })}
      <div className="absolute inset-[0_0_24px_56px]">
        <ChartContainer config={CONFIG} className="aspect-auto size-full">
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: "var(--status-success)", stopOpacity: 0.3 }} />
                <stop offset="1" style={{ stopColor: "var(--status-success)", stopOpacity: 0 }} />
              </linearGradient>
              <linearGradient id="step-cursor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: tint("--status-danger", 10) }} />
                <stop offset="0.5" style={{ stopColor: tint("--status-danger", 90) }} />
                <stop offset="1" style={{ stopColor: tint("--status-danger", 10) }} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[0, 300]} />
            <ChartTooltip
              defaultIndex={Math.round(POINTS * 0.52)}
              cursor={<Cursor />}
              offset={16}
              isAnimationActive={false}
              content={({ active, payload }) => <Tip active={active} payload={payload} unit={unit} />}
            />
            <Area
              type="stepAfter"
              dataKey="v"
              stroke="var(--status-success)"
              strokeWidth={2.5}
              fill={`url(#${id}-fill)`}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 3, style: { fill: "var(--white)", stroke: "var(--status-danger)" } }}
              isAnimationActive={false}
              style={{ filter: `drop-shadow(0 3px 0 ${shade("--status-success", "black", 60)})` }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
      <div className={`absolute right-0 bottom-0 left-14 flex h-4 items-start justify-between overflow-clip font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelSmall}`}>
        {ticks.map((t, i) => (
          <p key={`${t}-${i}`}>{t}</p>
        ))}
      </div>
    </div>
  );
}
