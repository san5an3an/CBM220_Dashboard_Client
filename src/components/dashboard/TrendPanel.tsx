"use client";

import { useState } from "react";
import { Area, AreaChart, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Panel, PanelTitle, Spacer } from "@/components/ui/Panel";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { formatDay, initialTrend, nextTrend, TREND_RANGES } from "./charts/mockFeed";
import { useInterval } from "./charts/useInterval";

// 계열 이름과 색 토큰 지정
const CHART_CONFIG = {
  avg: { label: "평균 이상비율", color: "var(--chart-series-1)" },
  max: { label: "최대 이상비율", color: "var(--chart-series-3)" },
} satisfies ChartConfig;

const SERIES = (Object.keys(CHART_CONFIG) as (keyof typeof CHART_CONFIG)[]).map((key) => ({
  key,
  label: CHART_CONFIG[key].label,
  color: `var(--color-${key})`,
}));

const GRID = [
  "inset-[0_0_99.62%_0] bg-(--chart-grid)",
  "inset-[22.73%_0_76.89%_0] bg-(--chart-grid)",
  "inset-[45.45%_0_54.17%_0] bg-(--chart-grid)",
  "inset-[68.18%_0_31.44%_0] bg-(--chart-grid)",
  "inset-[90.91%_0_8.71%_0] bg-(--chart-axis)",
];

const LIVE_MS = 2500;

export function TrendPanel() {
  const [range, setRange] = useState(0);
  const [data, setData] = useState(() => initialTrend(TREND_RANGES[0].days));

  useInterval(() => setData(nextTrend), LIVE_MS);

  const changeRange = (i: number) => {
    setRange(i);
    setData(initialTrend(TREND_RANGES[i].days));
  };

  // 기간을 4등분해 날짜 눈금 생성
  const first = data[0].t;
  const span = data[data.length - 1].t - first;
  const ticks = [0, 1, 2, 3].map((i) => formatDay(first + (span * i) / 4));

  return (
    <Panel
      className="h-full min-w-px flex-[1_0_0]"
      header={
        <>
          <PanelTitle eyebrow="ANOMALY TREND" title="일별 이상비율 추이" />
          <SegmentTabs items={TREND_RANGES.map((r) => r.label)} gradientAngle={153.07} onChange={changeRange} />
          <Spacer />
          <div className="relative flex shrink-0 items-center gap-4">
            {SERIES.map((s) => (
              <div key={s.key} className="relative flex shrink-0 items-center gap-2">
                <div
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: CHART_CONFIG[s.key].color, boxShadow: `0 0 6px 1px ${CHART_CONFIG[s.key].color}` }}
                />
                <p className="whitespace-nowrap text-[12px] font-medium leading-4 tracking-[0.5px] text-(--text-secondary)">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </>
      }
    >
      <div className="relative min-h-px w-full flex-[1_0_0]">
        {GRID.map((cls) => (
          <div key={cls} className={`absolute ${cls}`} />
        ))}
        <div className="absolute inset-[0_0_24px_0]">
          <ChartContainer config={CHART_CONFIG} className="aspect-auto size-full">
            <AreaChart key={range} data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                {SERIES.map((s) => (
                  <linearGradient key={s.key} id={`trend-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: s.color, stopOpacity: 0.32 }} />
                    <stop offset="100%" style={{ stopColor: s.color, stopOpacity: 0 }} />
                  </linearGradient>
                ))}
              </defs>
              <YAxis hide domain={[4, 18]} />
              <ChartTooltip
                cursor={{ stroke: "var(--chart-axis)" }}
                content={<ChartTooltipContent labelFormatter={(_, payload) => formatDay(payload[0]?.payload.t)} />}
              />
              {SERIES.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2.5}
                  fill={`url(#trend-${s.key})`}
                  dot={false}
                  activeDot={false}
                  animationDuration={600}
                  style={{ filter: `drop-shadow(0 2px 0 color-mix(in srgb, ${s.color} 60%, black))` }}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-4 items-start justify-between overflow-clip whitespace-nowrap text-[11px] font-medium leading-4 tracking-[0.5px]">
          {ticks.map((d) => (
            <p key={d} className="text-(--chart-axis-label)">
              {d}
            </p>
          ))}
          <p className="text-(--accent-cyan)">오늘</p>
        </div>
      </div>
    </Panel>
  );
}
