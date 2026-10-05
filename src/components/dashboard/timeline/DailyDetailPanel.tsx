"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/controls";
import { Badge, PanelHeader } from "@/components/foundations";
import { Cell, type CellType } from "@/components/monitoring";
import { Panel, Spacer } from "@/components/ui/Panel";
import { Pager } from "../Pager";
import { type DailyRecord, formatDate } from "./data";

const PAGE_SIZE = 4;
const COL_W = 220;
const STATUS_W = 160;

const HEADERS: { text: string; width: number | "grow" }[] = [
  { text: "일자", width: "grow" },
  { text: "추론 건수", width: COL_W },
  { text: "이상 window", width: COL_W },
  { text: "평균 이상비율", width: COL_W },
  { text: "최대 이상비율", width: COL_W },
  { text: "상태", width: STATUS_W },
];

// 위험한 날은 평균 이상비율과 상태 칸을 이상 행 색으로 표시
function Row({ r }: { r: DailyRecord }) {
  const danger = r.status === "위험";
  const avgType: CellType = danger ? "alert" : "highlight";
  return (
    <div className="flex w-full">
      <Cell text={formatDate(r.t)} width="grow" />
      <Cell text={String(r.inferences)} type="numeric" width={COL_W} />
      <Cell text={String(r.windows)} type="numeric" width={COL_W} />
      <Cell text={`${r.avg.toFixed(2)}%`} type={avgType} width={COL_W} align={danger ? "end" : undefined} />
      <Cell text={`${r.max.toFixed(2)}%`} type="numeric" width={COL_W} />
      <Cell text={r.status} type={danger ? "alert" : "body"} width={STATUS_W} align="center" />
    </div>
  );
}

type DailyDetailPanelProps = {
  // 최근 날짜가 먼저 오도록 정렬된 기록 지정
  records: DailyRecord[];
  rangeLabel: string;
};

export function DailyDetailPanel({ records, rangeLabel }: DailyDetailPanelProps) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = records.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  return (
    <Panel
      className="h-[322px] w-full shrink-0"
      headerClassName="gap-2.5"
      header={
        <>
          <PanelHeader eyebrow="DAILY DETAIL" title="일자별 상세" />
          <Spacer />
          <Badge label={`${rangeLabel} · ${records.length}건`} />
          <Button label="CSV 내보내기" kind="success" icon={Download} />
        </>
      }
    >
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full flex-col overflow-clip rounded-[16px] border border-(--border-default) bg-(--white)/2">
          <div className="flex w-full">
            {HEADERS.map((h) => (
              <Cell key={h.text} text={h.text} type="header" width={h.width} />
            ))}
          </div>
          {rows.map((r) => (
            <Row key={r.t} r={r} />
          ))}
        </div>
        <div className="flex w-full justify-center">
          <Pager page={current} pages={pages} onChange={setPage} />
        </div>
      </div>
    </Panel>
  );
}
