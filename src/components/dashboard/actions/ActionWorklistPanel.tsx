"use client";

import { CheckCheck, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/controls";
import { Badge, PanelHeader } from "@/components/foundations";
import { Cell } from "@/components/monitoring";
import { Panel, Spacer } from "@/components/ui/Panel";
import { Pager } from "../Pager";
import { type ActionItem, whenText } from "./data";

// 표 한 줄 높이(px)와 화면 높이를 못 잴 때 쓸 한 쪽 줄 수 지정
const ROW_H = 38;
const MIN_ROWS = 10;
// 마지막 조치·검수·처리 열 폭 지정
const STATE_W = 90;

const HEADERS: { text: string; width: number | "grow" }[] = [
  { text: "발생시각", width: 120 },
  { text: "장치 / 센서", width: "grow" },
  { text: "진단", width: 230 },
  { text: "편성 / 호차", width: 130 },
  { text: "조치", width: STATE_W },
  { text: "검수", width: STATE_W },
  { text: "처리", width: STATE_W },
];

type RowProps = { a: ActionItem; selected: boolean; onToggle: () => void; onProcess: () => void };

// 행을 누르면 선택을 바꾸고, 미조치는 이상 칸·완료는 강조 칸으로 표시
function Row({ a, selected, onToggle, onProcess }: RowProps) {
  return (
    <div
      role="row"
      aria-selected={selected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`flex w-full cursor-pointer transition-colors duration-300 outline-none focus-visible:bg-(--white)/5 ${selected ? "bg-(--accent-cyan)/8" : "hover:bg-(--white)/3"}`}
    >
      <Cell text={whenText(a)} width={120} />
      <Cell text={`${a.device} · ${a.sensor}`} width="grow" />
      <Cell text={`실제≈${a.actual.toFixed(2)} / 기대≈${a.expected.toFixed(2)}`} width={230} />
      <Cell text={`${a.formation} · ${a.car}호차`} width={130} />
      <Cell text={a.action} type={a.action === "미조치" ? "alert" : "highlight"} width={STATE_W} align="center" />
      <Cell text={a.inspect} type={a.inspect === "완료" ? "highlight" : "body"} width={STATE_W} align="center" />
      {/* 처리 칸은 행 선택과 따로 그 행의 조치 상세 시트를 열도록 처리 */}
      <button
        type="button"
        aria-label={`${whenText(a)} ${a.device} · ${a.sensor} 처리`}
        onClick={(e) => {
          e.stopPropagation();
          onProcess();
        }}
        className="shrink-0 cursor-pointer transition-colors hover:bg-(--white)/6"
      >
        <Cell text="처리" width={STATE_W} align="center" />
      </button>
    </div>
  );
}

type ActionWorklistPanelProps = {
  items: ActionItem[];
  page: number;
  onPage: (page: number) => void;
  selected: Set<number>;
  onToggle: (id: number) => void;
  onProcess: (id: number) => void;
  onBulkDone: () => void;
};

export function ActionWorklistPanel({ items, page, onPage, selected, onToggle, onProcess, onBulkDone }: ActionWorklistPanelProps) {
  // 표가 들어갈 자리 높이를 재서 빈칸 없이 채우는 줄 수로 한 쪽 크기 계산
  const area = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(MIN_ROWS);
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const measure = () => setPageSize(Math.max(MIN_ROWS, Math.floor(el.clientHeight / ROW_H) - 1));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages - 1);
  const rows = items.slice(current * pageSize, (current + 1) * pageSize);
  return (
    <Panel
      className="h-full min-w-px flex-[1_0_0]"
      headerClassName="gap-2.5"
      header={
        <>
          <PanelHeader eyebrow="ACTION WORKLIST" title="이상 센서 조치 워크리스트" />
          <Spacer />
          {selected.size > 0 && <Badge tone="accent" label={`선택 ${selected.size}건`} />}
          <Button kind="secondary" icon={CheckCheck} label="일괄 조치완료" disabled={selected.size === 0} onClick={onBulkDone} />
          <Button kind="secondary" icon={UserRound} label="담당자 지정" disabled />
        </>
      }
    >
      <div className="flex size-full flex-col gap-3">
        {/* 남는 높이를 모두 표 자리로 잡고 그 안에 줄을 채움 */}
        <div ref={area} className="min-h-px w-full flex-1">
          <div role="table" aria-label="이상 센서 조치 목록" className="flex w-full flex-col overflow-clip rounded-[16px] border border-(--border-default) bg-(--white)/2">
            <div role="row" className="flex w-full">
              {HEADERS.map((h) => (
                <Cell key={h.text} text={h.text} type="header" width={h.width} />
              ))}
            </div>
            {rows.map((a) => (
              <Row key={a.id} a={a} selected={selected.has(a.id)} onToggle={() => onToggle(a.id)} onProcess={() => onProcess(a.id)} />
            ))}
          </div>
        </div>
        <div className="flex w-full justify-center">
          <Pager page={current} pages={pages} onChange={onPage} />
        </div>
      </div>
    </Panel>
  );
}
