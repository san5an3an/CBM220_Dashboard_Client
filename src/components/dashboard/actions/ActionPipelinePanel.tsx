"use client";

import { Download, Search } from "lucide-react";
import { useState } from "react";
import { Button, type DateRange, Select, SquareButton } from "@/components/controls";
import { PipelineStep } from "@/components/diagnostics";
import { PanelHeader } from "@/components/foundations";
import { Panel, Spacer } from "@/components/ui/Panel";
import { DateRangeField } from "../DateRangeField";
import { ACTION_OPTIONS, DEVICES, INITIAL_RANGE, INSPECT_OPTIONS, TODAY } from "./data";

export type ActionQuery = { device: number; action: number; inspect: number; range: DateRange };

// 툴바 검색 조건의 처음 값 지정
export const INITIAL_QUERY: ActionQuery = { device: 0, action: 0, inspect: 0, range: INITIAL_RANGE };

const options = (labels: readonly string[]) => labels.map((label, i) => ({ value: String(i), label }));

type ToolbarProps = { query: ActionQuery; onSearch: (q: ActionQuery) => void };

// 장치·조치·검수·기간을 고른 뒤 검색을 누르면 적용하는 툴바 표시
function Toolbar({ query, onSearch }: ToolbarProps) {
  const [pending, setPending] = useState(query);
  const pick = (key: "device" | "action" | "inspect") => (v: string) => setPending((p) => ({ ...p, [key]: Number(v) }));
  return (
    <div className="relative flex shrink-0 items-center gap-2 rounded-[16px] border border-(--border-default) bg-(--neutral-card) p-1.5">
      <Select options={options(DEVICES)} value={String(pending.device)} onChange={pick("device")} />
      <Select options={options(ACTION_OPTIONS)} value={String(pending.action)} onChange={pick("action")} />
      <Select options={options(INSPECT_OPTIONS)} value={String(pending.inspect)} onChange={pick("inspect")} />
      <DateRangeField value={pending.range} today={TODAY} onChange={(range) => setPending((p) => ({ ...p, range }))} />
      <SquareButton
        label="검색 조건 초기화"
        // 장치·조치·검수·기간을 처음 값으로 되돌리고 바로 전체 결과로 검색
        onClick={() => {
          setPending(INITIAL_QUERY);
          onSearch(INITIAL_QUERY);
        }}
      />
      <Button label="검색" icon={Search} onClick={() => onSearch(pending)} />
      <Button label="CSV 내보내기" kind="success" icon={Download} />
    </div>
  );
}

type ActionPipelinePanelProps = {
  query: ActionQuery;
  onSearch: (q: ActionQuery) => void;
  counts: { total: number; open: number; done: number; uninspected: number };
};

// 검색 툴바와 총 조치대상·미조치·조치완료·미검수 단계를 한 줄로 표시
export function ActionPipelinePanel({ query, onSearch, counts }: ActionPipelinePanelProps) {
  const steps = [
    { label: "총 조치대상", value: counts.total, sub: "이상 센서로 적재된 전체", tone: "slate" },
    { label: "미조치", value: counts.open, sub: "조치 여부 N · 담당 배정 필요", tone: "amber" },
    { label: "조치완료", value: counts.done, sub: "조치 여부 Y", tone: "mint" },
    { label: "미검수", value: counts.uninspected, sub: "검수 여부 N · 검수 대기", tone: "cyan" },
  ] as const;
  return (
    <Panel
      className="h-[208px] w-full shrink-0"
      headerClassName="gap-2.5"
      header={
        <>
          <PanelHeader eyebrow="ACTION PIPELINE" title="이상 센서 조치 흐름" />
          <Spacer />
          {/* 밖에서 조건이 바뀌면 툴바 칸도 다시 맞추기 */}
          <Toolbar key={JSON.stringify(query)} query={query} onSearch={onSearch} />
        </>
      }
    >
      <div className="flex w-full items-start gap-3">
        {steps.map((s, i) => (
          <PipelineStep
            key={s.label}
            width="100%"
            step={String(i + 1).padStart(2, "0")}
            label={s.label}
            value={String(s.value)}
            unit="건"
            sub={s.sub}
            tone={s.tone}
            showArrow={i < steps.length - 1}
          />
        ))}
      </div>
    </Panel>
  );
}
