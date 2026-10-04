"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/controls";
import { FaultListRow } from "@/components/diagnostics";
import { PanelHeader } from "@/components/foundations";
import { Panel, Spacer } from "@/components/ui/Panel";
import { TEXT } from "@/lib/typography";
import { CheckBox } from "../CheckBox";
import { Pager } from "../Pager";
import { type Alarm, alarmTitle, GRADE_CODE, pad4, statusText } from "./data";

export const PAGE_SIZE = 8;

type AlarmWorklistPanelProps = {
  alarms: Alarm[];
  page: number;
  onPage: (page: number) => void;
  selected: number | null;
  onSelect: (no: number) => void;
  // 수정·삭제하려고 체크한 알람 번호 지정
  checked: Set<number>;
  onCheck: (no: number, on: boolean) => void;
  onCheckAll: (nos: number[], on: boolean) => void;
  onDelete: () => void;
  onEdit: () => void;
};

export function AlarmWorklistPanel({ alarms, page, onPage, selected, onSelect, checked, onCheck, onCheckAll, onDelete, onEdit }: AlarmWorklistPanelProps) {
  const pages = Math.max(1, Math.ceil(alarms.length / PAGE_SIZE));
  const rows = alarms.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  // 이 쪽 줄이 모두 체크됐는지, 일부만 체크됐는지 계산
  const pageChecked = rows.filter((a) => checked.has(a.no)).length;
  const allChecked = rows.length > 0 && pageChecked === rows.length;
  return (
    <Panel
      className="h-full min-w-px flex-[1_0_0]"
      headerClassName="gap-2.5"
      header={
        <>
          <PanelHeader eyebrow="ALARM WORKLIST" title={`알람 / 이벤트 워크리스트 · ${pad4(alarms.length)}건`} />
          <Spacer />
          {/* 수정은 하나만 체크했을 때, 삭제는 하나 이상 체크했을 때만 표시 */}
          {checked.size === 1 && <Button kind="secondary" icon={Pencil} label="선택 수정" onClick={onEdit} />}
          {checked.size > 0 && <Button kind="danger" icon={Trash2} label={`선택 삭제 (${checked.size})`} onClick={onDelete} />}
          <Pager page={page} pages={pages} onChange={onPage} />
        </>
      }
    >
      {/* 한 쪽 8줄이 패널 높이를 넘으면 패널 안에서 스크롤 */}
      <div className="flex min-h-px w-full flex-1 flex-col gap-2.5 overflow-y-auto">
        {rows.length > 0 && (
          <div className="flex w-full shrink-0 items-center gap-3">
            <span className="flex w-5 shrink-0 justify-center">
              <CheckBox
                label="이 쪽 전체 선택"
                checked={allChecked}
                mixed={pageChecked > 0}
                onChange={() => onCheckAll(rows.map((a) => a.no), !allChecked)}
              />
            </span>
            <span className={`font-medium text-(--text-secondary) ${TEXT.labelMedium}`}>
              이 쪽 전체 선택 · {pageChecked}/{rows.length}
            </span>
          </div>
        )}
        {rows.map((a) => (
          <div key={a.no} className="flex w-full shrink-0 items-center gap-3">
            <span className="flex w-5 shrink-0 justify-center">
              <CheckBox label={`${alarmTitle(a)} 선택`} checked={checked.has(a.no)} onChange={(on) => onCheck(a.no, on)} />
            </span>
            <FaultListRow
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
          </div>
        ))}
      </div>
    </Panel>
  );
}
