"use client";

import { useId, useState } from "react";
import { Area, AreaChart, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { ValueTipBox } from "@/components/ui/ValueTip";
import { TEXT } from "@/lib/typography";
import { clamp, seeded, useInterval } from "./live";

// Figma 차트 두 계열 이름과 색 토큰 지정
const DEFAULT_CONFIG = {
  a: { label: "계열 A", color: "var(--chart-series-1)" },
  b: { label: "계열 B", color: "var(--chart-series-3)" },
} satisfies ChartConfig;

const POINTS = 40;
const LIVE_MS = 2000;

export type DualPoint = { i: number; a: number; b: number };
type Point = DualPoint;

// 두 계열이 서로 다른 박자로 오르내리는 첫 데이터 생성
function initial(): Point[] {
  const rand = seeded(700);
  return Array.from({ length: POINTS }, (_, i) => ({
    i,
    a: +(55 + Math.sin(i / 4) * 18 + (rand() - 0.5) * 8).toFixed(1),
    b: +(35 + Math.sin(i / 6 + 1.4) * 14 + (rand() - 0.5) * 8).toFixed(1),
  }));
}

// 가장 오래된 점을 빼고 두 계열의 새 점 추가
function next(prev: Point[]): Point[] {
  const last = prev[prev.length - 1];
  const a = clamp(last.a + (Math.random() - 0.5) * 10 + (55 - last.a) * 0.1, 10, 95);
  const b = clamp(last.b + (Math.random() - 0.5) * 8 + (35 - last.b) * 0.1, 5, 90);
  return [...prev.slice(1), { i: last.i + 1, a: +a.toFixed(1), b: +b.toFixed(1) }];
}

type DualLineChartProps = {
  labels?: string[];
  config?: ChartConfig;
  // 실시간 데이터를 밖에서 넘기면 자체 임시 데이터 대신 표시
  data?: DualPoint[];
  domain?: [number, number];
  // 말풍선 머리 문구를 점 값으로 만들도록 지정
  tipLabel?: (p: DualPoint) => string;
  className?: string;
};

// 두 계열 추이를 선·깊이·영역으로 겹쳐 실시간 표시
export function DualLineChart({
  labels = ["00:00", "00:00", "00:00", "00:00", "현재"],
  config = DEFAULT_CONFIG,
  data: given,
  domain = [0, 100],
  tipLabel,
  className = "h-[264px] w-[700px]",
}: DualLineChartProps) {
  const id = useId().replace(/:/g, "");
  const [own, setOwn] = useState(initial);
  useInterval(() => {
    if (!given) setOwn(next);
  }, LIVE_MS);
  const data = given ?? own;
  const keys = ["a", "b"] as const;

  return (
    <div className={`relative ${className}`}>
      {["top-0", "top-[22.73%]", "top-[45.45%]", "top-[68.18%]"].map((cls) => (
        <div key={cls} className={`absolute inset-x-0 h-px bg-(--chart-grid) ${cls}`} />
      ))}
      <div className="absolute inset-x-0 top-[90.91%] h-px bg-(--chart-axis)" />
      <div className="absolute inset-[0_0_24px_0]">
        <ChartContainer config={config} className="aspect-auto size-full">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              {keys.map((k) => (
                <linearGradient key={k} id={`${id}-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" style={{ stopColor: `var(--color-${k})`, stopOpacity: 0.32 }} />
                  <stop offset="1" style={{ stopColor: `var(--color-${k})`, stopOpacity: 0 }} />
                </linearGradient>
              ))}
            </defs>
            <YAxis hide domain={domain} />
            <ChartTooltip
              cursor={{ stroke: "var(--chart-axis)" }}
              wrapperStyle={{ zIndex: 30 }}
              content={({ active, payload }) => {
                const p = payload?.[0]?.payload as Point | undefined;
                if (!active || !p) return null;
                return <ValueTipBox label={tipLabel?.(p)} rows={keys.map((k) => ({ name: String(config[k]?.label ?? k), value: p[k], color: `var(--color-${k})` }))} />;
              }}
            />
            {keys.map((k) => (
              <Area
                key={k}
                type="monotone"
                dataKey={k}
                stroke={`var(--color-${k})`}
                strokeWidth={2.5}
                fill={`url(#${id}-${k})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, style: { stroke: "var(--white)" } }}
                animationDuration={600}
                style={{ filter: `drop-shadow(0 3px 0 color-mix(in srgb, var(--color-${k}) 55%, black))` }}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </div>
      <div className={`absolute inset-x-0 bottom-0 flex h-4 items-start justify-between overflow-clip font-medium whitespace-nowrap ${TEXT.labelSmall}`}>
        {labels.map((l, i) => (
          <p key={`${l}-${i}`} className={i === labels.length - 1 ? "text-(--accent-cyan)" : "text-(--text-tertiary)"}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}
