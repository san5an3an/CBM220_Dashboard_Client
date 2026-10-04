"use client";

import { FaultListRow } from "@/components/diagnostics";
import { PanelHeader } from "@/components/foundations";
import { Panel, Spacer } from "@/components/ui/Panel";
import { Pager } from "../Pager";
import { type Alarm, alarmTitle, GRADE_CODE, pad4, statusText } from "./data";

export const PAGE_SIZE = 8;

type AlarmWorklistPanelProps = {
  alarms: Alarm[];
  page: number;
  onPage: (page: number) => void;
  selected: number | null;
  onSelect: (no: number) => void;
};

export function AlarmWorklistPanel({ alarms, page, onPage, selected, onSelect }: AlarmWorklistPanelProps) {
  const pages = Math.max(1, Math.ceil(alarms.length / PAGE_SIZE));
  const rows = alarms.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  return (
    <Panel
      className="h-full min-w-px flex-[1_0_0]"
      headerClassName="gap-2.5"
      header={
        <>
          <PanelHeader eyebrow="ALARM WORKLIST" title={`알람 / 이벤트 워크리스트 · ${pad4(alarms.length)}건`} />
          <Spacer />
          <Pager page={page} pages={pages} onChange={onPage} />
        </>
      }
    >
      {/* 한 쪽 8줄이 패널 높이를 넘으면 패널 안에서 스크롤 */}
      <div className="flex min-h-px w-full flex-1 flex-col gap-2.5 overflow-y-auto">
        {rows.map((a) => (
          <FaultListRow
            key={a.no}
            width="100%"
            grade={a.grade}
            title={alarmTitle(a)}
            desc={`${a.model} 모델 · 이상비율 ${a.ratio.toFixed(1)}% · ${statusText(a.status)}`}
            train={`${a.formation} (${a.car})`}
            device={`${GRADE_CODE[a.grade]} · ${a.owner}`}
            station={a.status}
            dist={`담당 ${a.owner}`}
            time={a.time}
            clear={a.date}
            selected={a.no === selected}
            onSelect={() => onSelect(a.no)}
          />
        ))}
      </div>
    </Panel>
  );
}
