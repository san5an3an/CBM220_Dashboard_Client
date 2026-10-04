"use client";

import { Download, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button, type DateRange, FilterChip, InputField, Select, SquareButton } from "@/components/controls";
import { PanelHeader } from "@/components/foundations";
import type { Grade } from "@/lib/tone";
import { Panel, Spacer } from "@/components/ui/Panel";
import { DateRangeField } from "../DateRangeField";
import { AlarmRiver } from "./AlarmRiver";
import { DEVICES, GRADE_LABEL, GRADES, INITIAL_RANGE, pad4, STATUS_OPTIONS, TODAY } from "./data";

export type AlarmQuery = { status: number; device: number; keyword: string; range: DateRange };

// 툴바 검색 조건의 처음 값 지정
export const INITIAL_QUERY: AlarmQuery = { status: 0, device: 0, keyword: "", range: INITIAL_RANGE };

const options = (labels: readonly string[]) => labels.map((label, i) => ({ value: String(i), label }));

type ToolbarProps = { query: AlarmQuery; onSearch: (q: AlarmQuery) => void };

// 상태·장치·검색어를 고른 뒤 검색을 누르면 적용하는 툴바 표시
function Toolbar({ query, onSearch }: ToolbarProps) {
  const [pending, setPending] = useState(query);
  return (
    <div className="relative flex shrink-0 items-center gap-2 rounded-[16px] border border-(--border-default) bg-(--neutral-card) p-1.5">
      <Select width={150} options={options(STATUS_OPTIONS)} value={String(pending.status)} onChange={(v) => setPending((p) => ({ ...p, status: Number(v) }))} />
      <Select width={150} options={options(DEVICES)} value={String(pending.device)} onChange={(v) => setPending((p) => ({ ...p, device: Number(v) }))} />
      <InputField
        width={190}
        placeholder="장치 · 모델 검색"
        value={pending.keyword}
        onChange={(e) => setPending((p) => ({ ...p, keyword: e.target.value }))}
        onKeyDown={(e) => e.key === "Enter" && onSearch(pending)}
      />
      <DateRangeField value={pending.range} today={TODAY} onChange={(range) => setPending((p) => ({ ...p, range }))} />
      <SquareButton
        label="검색 조건 초기화"
        // 상태·장치·검색어·기간을 처음 값으로 되돌리고 바로 전체 결과로 검색
        onClick={() => {
          setPending(INITIAL_QUERY);
          onSearch(INITIAL_QUERY);
        }}
      />
      <Button label="검색" icon={Search} onClick={() => onSearch(pending)} />
    </div>
  );
}

type AlarmFlowPanelProps = {
  query: AlarmQuery;
  onSearch: (q: AlarmQuery) => void;
  // 등급 필터 (null 이면 전체)
  grade: Grade | null;
  onGrade: (g: Grade | null) => void;
  counts: Record<Grade, number>;
  total: number;
  bubble: number | null;
  onHoverBubble: (i: number) => void;
  onSelectBubble: (i: number) => void;
};

export function AlarmFlowPanel({ query, onSearch, grade, onGrade, counts, total, bubble, onHoverBubble, onSelectBubble }: AlarmFlowPanelProps) {
  return (
    <Panel
      className="h-[464px] w-full shrink-0"
      headerClassName="gap-2.5"
      header={
        <>
          <PanelHeader eyebrow="ALARM FLOW" title="알람 발생 흐름 · 최근 7일" />
          <Spacer />
          <Toolbar query={query} onSearch={onSearch} />
        </>
      }
    >
      <div className="flex w-full flex-col gap-3">
        <div className="flex h-10 w-full items-center gap-2">
          <FilterChip label="전체" count={pad4(total)} active={grade === null} onClick={() => onGrade(null)} />
          {GRADES.map((g) => (
            <FilterChip key={g} label={GRADE_LABEL[g]} count={pad4(counts[g])} grade={g} active={grade === g} onClick={() => onGrade(grade === g ? null : g)} />
          ))}
          <Spacer />
          <Button label="CSV 내보내기" kind="success" icon={Download} />
          <Button label="알람 등록" icon={Plus} />
        </div>
        <AlarmRiver active={bubble} onHover={onHoverBubble} onSelect={onSelectBubble} range={query.range} />
      </div>
    </Panel>
  );
}
