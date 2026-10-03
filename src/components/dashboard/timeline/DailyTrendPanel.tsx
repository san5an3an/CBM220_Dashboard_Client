"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Button, Select, SquareButton } from "@/components/controls";
import { FormationColumn } from "@/components/fleet";
import { LegendDot, PanelHeader } from "@/components/foundations";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { Panel, Spacer } from "@/components/ui/Panel";
import { type DailyRecord, DEVICES, formatDay, MODELS, PILLAR_STATUS, pillarLevel, RANGES } from "./data";

export type TimelineFilter = { device: number; model: number; range: number };

// 기둥 위아래 글자 높이와 단계당 기둥 높이 지정 (FormationColumn 과 같은 값)
const TEXT_H = 74;
const LEVEL_PX = 22;
// 기둥 아래 여백과 말풍선이 기둥 꼭대기보다 올라가는 높이·말풍선 높이 지정
const CHART_PAD_B = 16;
const TIP_RISE = 10;
const TIP_H = 60;

const options = (labels: readonly string[]) => labels.map((label, i) => ({ value: String(i), label }));

type ToolbarProps = { filter: TimelineFilter; onApply: (f: TimelineFilter) => void; onRefresh: () => void };

// 장치·모델·기간을 고른 뒤 조회를 누르면 적용하는 툴바 표시
function Toolbar({ filter, onApply, onRefresh }: ToolbarProps) {
  const [pending, setPending] = useState(filter);
  const pick = (key: keyof TimelineFilter) => (v: string) => setPending((p) => ({ ...p, [key]: Number(v) }));
  return (
    <div className="relative flex shrink-0 items-center gap-2 rounded-[16px] border border-(--border-default) bg-(--neutral-card) p-1.5">
      <Select options={options(DEVICES)} value={String(pending.device)} onChange={pick("device")} />
      <Select options={options(MODELS)} value={String(pending.model)} onChange={pick("model")} />
      <Select options={options(RANGES.map((r) => r.label))} value={String(pending.range)} onChange={pick("range")} />
      <SquareButton label="새로고침" onClick={onRefresh} />
      <Button label="조회" icon={Search} onClick={() => onApply(pending)} />
    </div>
  );
}

// 마우스를 올린 날의 평균 이상비율과 추론 요약을 기둥 옆에 표시
function DayTip({ record, height, side }: { record: DailyRecord; height: number; side: "left" | "right" }) {
  return (
    <div
      className={`pointer-events-none absolute z-10 ${side === "left" ? "right-[calc(50%+28px)]" : "left-[calc(50%+28px)]"} flex flex-col items-start gap-0.5 rounded-[12px] border px-3 py-2.5 whitespace-nowrap drop-shadow-[0px_10px_12px_rgba(0,0,0,0.5)]`}
      style={{ bottom: height + TIP_RISE - TIP_H, background: tint("--navy-850", 92), borderColor: tint("--accent-cyan", 35) }}
    >
      <p className={`font-semibold text-(--text-primary) ${TEXT.labelLarge}`}>
        {formatDay(record.t)} · 평균 이상비율 {record.avg.toFixed(1)}%
      </p>
      <p className={`font-medium text-(--text-secondary) ${TEXT.labelSmall}`}>
        추론 {record.inferences}건 · 이상 window {record.windows} · {record.status}
      </p>
    </div>
  );
}

type DailyTrendPanelProps = {
  records: DailyRecord[];
  filter: TimelineFilter;
  onApply: (f: TimelineFilter) => void;
};

export function DailyTrendPanel({ records, filter, onApply }: DailyTrendPanelProps) {
  const [tick, setTick] = useState(0);
  // 처음에는 가장 최근 위험 날을 가리키도록 지정
  const latestDanger = records.findLastIndex((r) => r.status === "위험");
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? (latestDanger >= 0 ? latestDanger : records.length - 1);

  return (
    <Panel
      className="min-h-px w-full flex-[1_0_0]"
      headerClassName="gap-2.5"
      header={
        <>
          <PanelHeader eyebrow="DAILY TREND" title={`일별 평균 이상비율 · ${RANGES[filter.range].label}`} />
          <Spacer />
          <Toolbar filter={filter} onApply={onApply} onRefresh={() => setTick((t) => t + 1)} />
        </>
      }
    >
      <div className="flex size-full flex-col gap-3">
        <div className="flex w-full shrink-0 items-center gap-4">
          <LegendDot label="정상" status="run" />
          <LegendDot label="주의 · 경고" status="inspect" />
          <LegendDot label="위험 ≥ 20%" status="fault" />
          <Spacer />
          <p className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelMedium}`}>
            기둥 높이 = 그날의 평균 이상비율 · 색 = 상태 (주의·경고 / 위험 ≥ 20%)
          </p>
        </div>
        <div key={tick} className="relative flex min-h-px w-full flex-[1_0_0] items-end" style={{ paddingBottom: CHART_PAD_B }} onPointerLeave={() => setHovered(null)}>
          {records.map((r, i) => {
            const level = pillarLevel(r.avg);
            const height = TEXT_H + LEVEL_PX + LEVEL_PX * level;
            const on = i === active;
            return (
              <div key={r.t} className="relative flex h-full min-w-px flex-1 items-end justify-center" onPointerEnter={() => setHovered(i)}>
                {on && (
                  <div aria-hidden className="absolute top-1.5 bottom-0 left-1/2 w-[54px] -translate-x-1/2 rounded-[12px] border border-(--accent-cyan)/25 bg-(--accent-cyan)/6" />
                )}
                <FormationColumn
                  id={formatDay(r.t)}
                  level={level}
                  status={PILLAR_STATUS[r.status]}
                  value={r.avg.toFixed(1)}
                  label={r.status}
                  tip={false}
                />
                {on && <DayTip record={r} height={height} side={i < 4 ? "right" : "left"} />}
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
