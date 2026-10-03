"use client";

import { useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Panel, PanelTitle, Spacer } from "@/components/ui/Panel";
import { initialRisk, nextRisk, type RiskItem } from "./charts/mockFeed";
import { useInterval } from "./charts/useInterval";

const LIVE_MS = 3000;

// 막대 계열 이름과 색 토큰 지정
const CHART_CONFIG = {
  ratio: { label: "이상비율", color: "var(--chart-series-1)" },
} satisfies ChartConfig;
// 34% 막대가 트랙의 약 85%가 되도록 축 최대값 지정
const AXIS_MAX = 40;
// 순위 배지와 장치명 영역 너비 지정
const LABEL_W = 168;
// 비율 글자 영역 너비 지정
const VALUE_W = 46;
const FONT = "var(--font-sans)";

type TickProps = { x?: number; y?: number; index?: number; payload?: { value: string } };

function DeviceTick({ x = 0, y = 0, index = 0, payload }: TickProps) {
  const left = x - LABEL_W;
  return (
    <g transform={`translate(${left},${y})`} fontFamily={FONT}>
      <rect x={0.5} y={-9.5} width={19} height={19} rx={6} style={{ fill: "var(--neutral-control)", stroke: "var(--border-default)" }} />
      <text x={10} y={4} textAnchor="middle" fontSize={11} fontWeight={600} letterSpacing={0.5} style={{ fill: "var(--accent-cyan)" }}>
        {index + 1}
      </text>
      <text x={30} y={5} fontSize={14} letterSpacing={0.25} style={{ fill: "var(--text-primary)" }}>
        {payload?.value}
      </text>
    </g>
  );
}

function RatioTick({ data, x = 0, y = 0, payload }: TickProps & { data: RiskItem[] }) {
  const item = data.find((d) => d.device === payload?.value);
  return (
    <text x={x + VALUE_W} y={y + 5} textAnchor="end" fontFamily={FONT} fontSize={14} fontWeight={600} letterSpacing={0.1} style={{ fill: "var(--text-primary)" }}>
      {item?.ratio}%
    </text>
  );
}

type ShapeProps = { x?: number; y?: number; width?: number; height?: number };

function Bar3D({ x = 0, y = 0, width = 0, height = 0 }: ShapeProps) {
  if (width <= 0) return null;
  return (
    <g filter="url(#risk-glow)">
      <rect x={x} y={y} width={width} height={height} rx={7} fill="url(#risk-fill)" />
      <rect x={x + 3} y={y + 1.5} width={Math.max(0, width - 6)} height={2} rx={1} style={{ fill: "var(--chart-3d-top-highlight)" }} />
    </g>
  );
}

function Track({ x = 0, y = 0, width = 0, height = 0 }: ShapeProps) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={7} style={{ fill: "var(--neutral-track)" }} />
      <rect x={x} y={y} width={width} height={height} rx={7} fill="url(#risk-inset)" />
    </g>
  );
}

// 말풍선에 장치명과 이상비율 표시
function TooltipRow({ value, device }: { value: unknown; device: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span className="text-(--text-secondary)">{device}</span>
      <span className="font-semibold text-(--text-primary) tabular-nums">{String(value)}%</span>
    </div>
  );
}

export function RiskRankingPanel() {
  const [data, setData] = useState<RiskItem[]>(initialRisk);

  useInterval(() => setData(nextRisk()), LIVE_MS);

  return (
    <Panel
      className="h-full w-[620px] shrink-0"
      header={
        <>
          <PanelTitle eyebrow="RISK RANKING" title="위험 장치 TOP 5" />
          <Spacer />
          <div className="relative flex shrink-0 items-center rounded-full border border-(--status-danger-border) bg-(--status-danger-subtle) px-2.5 py-1">
            <p className="whitespace-nowrap text-[12px] font-semibold leading-4 tracking-[0.5px] text-(--status-danger)">위험 ≥ 20%</p>
          </div>
        </>
      }
    >
      <div className="relative h-[124px] w-full shrink-0">
        <ChartContainer config={CHART_CONFIG} className="aspect-auto size-full">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap={6}>
            <defs>
              <linearGradient id="risk-fill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" style={{ stopColor: "var(--blue-500)" }} />
                <stop offset="100%" style={{ stopColor: "var(--color-ratio)" }} />
              </linearGradient>
              <linearGradient id="risk-inset" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: "var(--effect-shadow-panel)" }} />
                <stop offset="35%" style={{ stopColor: "transparent" }} />
              </linearGradient>
              <filter id="risk-glow" x="-10%" y="-100%" width="120%" height="300%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" style={{ floodColor: "var(--accent-cyan)", floodOpacity: 0.5 }} />
              </filter>
            </defs>
            <XAxis type="number" hide domain={[0, AXIS_MAX]} />
            <YAxis yAxisId="device" type="category" dataKey="device" width={LABEL_W} interval={0} axisLine={false} tickLine={false} tick={<DeviceTick />} />
            <YAxis
              yAxisId="ratio"
              orientation="right"
              type="category"
              dataKey="device"
              width={VALUE_W}
              interval={0}
              axisLine={false}
              tickLine={false}
              tick={<RatioTick data={data} />}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelKey="device" formatter={(value, _name, item) => <TooltipRow value={value} device={item.payload.device} />} />}
            />
            <Bar yAxisId="device" dataKey="ratio" barSize={14} shape={<Bar3D />} background={<Track />} animationDuration={800} />
          </BarChart>
        </ChartContainer>
      </div>
    </Panel>
  );
}
