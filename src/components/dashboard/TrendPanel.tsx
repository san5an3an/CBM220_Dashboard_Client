"use client";

import { useState } from "react";
import { LegendItem, PanelHeader } from "@/components/foundations";
import { type DualPoint, DualLineChart } from "@/components/monitoring";
import type { ChartConfig } from "@/components/ui/chart";
import { Panel, Spacer } from "@/components/ui/Panel";
import { formatDay, initialTrend, nextTrend, TREND_RANGES, type TrendPoint } from "./charts/mockFeed";
import { useInterval } from "./charts/useInterval";
import { Tabs } from "./Tabs";

// 계열 이름과 색 토큰 지정
const CHART_CONFIG = {
  a: { label: "평균 이상비율", color: "var(--chart-series-1)" },
  b: { label: "최대 이상비율", color: "var(--chart-series-3)" },
} satisfies ChartConfig;

const DOMAIN: [number, number] = [4, 18];
const LIVE_MS = 2500;

// 날짜별 평균·최대 값을 두 계열 점으로 변환
const toDual = (data: TrendPoint[]): DualPoint[] => data.map((p) => ({ i: p.t, a: p.avg, b: p.max }));

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
  const labels = [...[0, 1, 2, 3].map((i) => formatDay(first + (span * i) / 4)), "오늘"];

  return (
    <Panel
      className="h-full min-w-px flex-[1_0_0]"
      header={
        <>
          <PanelHeader eyebrow="ANOMALY TREND" title="일별 이상비율 추이" />
          <Tabs items={TREND_RANGES.map((r) => r.label)} onChange={changeRange} />
          <Spacer />
          <div className="relative flex shrink-0 items-center gap-4">
            <LegendItem label={CHART_CONFIG.a.label} tone="cyan" />
            <LegendItem label={CHART_CONFIG.b.label} tone="mint" />
          </div>
        </>
      }
    >
      <DualLineChart
        key={range}
        className="min-h-px w-full flex-[1_0_0]"
        config={CHART_CONFIG}
        data={toDual(data)}
        domain={DOMAIN}
        labels={labels}
        tipLabel={(p) => formatDay(p.i)}
      />
    </Panel>
  );
}
