"use client";

import { useState } from "react";
import { Badge, PanelHeader } from "@/components/foundations";
import { DeviceBar3D } from "@/components/monitoring";
import { Panel, Spacer } from "@/components/ui/Panel";
import { initialRisk, nextRisk, type RiskItem } from "./charts/mockFeed";
import { useInterval } from "./charts/useInterval";

const LIVE_MS = 3000;
// 34% 막대가 트랙의 약 85%가 되도록 축 최대값 지정
const AXIS_MAX = 40;

export function RiskRankingPanel() {
  const [data, setData] = useState<RiskItem[]>(initialRisk);

  useInterval(() => setData(nextRisk()), LIVE_MS);

  return (
    <Panel
      className="h-full w-[620px] shrink-0"
      header={
        <>
          <PanelHeader eyebrow="RISK RANKING" title="위험 장치 TOP 5" />
          <Spacer />
          <Badge tone="danger" label="위험 ≥ 20%" />
        </>
      }
    >
      <div className="flex w-full flex-col gap-1.5">
        {data.map((d, i) => (
          <DeviceBar3D key={d.device} rank={i + 1} name={d.device} percent={d.ratio} max={AXIS_MAX} width="100%" />
        ))}
      </div>
    </Panel>
  );
}
