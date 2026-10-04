"use client";

import { CheckCheck } from "lucide-react";
import { StateBlock } from "@/components/cards";
import { Button } from "@/components/controls";
import { DetailField, FaultSummaryCard } from "@/components/diagnostics";
import type { CarState } from "@/components/dashboard/consist/data";
import { IsoCar } from "@/components/fleet";
import { PanelHeader } from "@/components/foundations";
import { GRADE, type Grade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { Panel } from "@/components/ui/Panel";
import { type Alarm, alarmNo, alarmTitle, GRADE_LABEL, OPEN_STATUS } from "./data";

// IsoCar 기본 틀(160×108)을 Figma 차량 칸(120×81)에 맞추는 배율 지정
const CAR_SCALE = 0.75;

// 알람 등급을 차량 상태 색으로 연결
const CAR_STATE: Record<Grade, CarState> = { A: "danger", B: "danger", C: "warning", D: "warning", W: "normal" };

type AlarmDetailPanelProps = {
  alarm: Alarm | null;
  onResolve: (no: number) => void;
};

// 고른 알람의 요약·발생 차량·상태와 처리 버튼 표시
function Detail({ alarm, onResolve }: { alarm: Alarm; onResolve: (no: number) => void }) {
  const open = OPEN_STATUS.includes(alarm.status);
  return (
    // 패널 높이에 맞춰 카드·차량·상태·버튼을 위아래로 고르게 벌려 배치
    <div className="flex size-full flex-col justify-between gap-2.5">
      <FaultSummaryCard
        width="100%"
        grade={alarm.grade}
        gradeLabel={GRADE_LABEL[alarm.grade]}
        no={alarmNo(alarm)}
        title={alarmTitle(alarm)}
        desc={`${alarm.model} 모델 · 이상비율 ${alarm.ratio.toFixed(1)}% · window ${alarm.window} / 100`}
      />
      <div className="flex w-full items-center gap-3.5 rounded-[16px] border border-(--white)/6 bg-(--white)/3 px-3 py-1">
        <div className="shrink-0 pb-1">
          <div className="relative h-[81px] w-[120px]" style={{ filter: `drop-shadow(0px 4.5px 7.5px ${tint(GRADE[alarm.grade], 40)})` }}>
            <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${CAR_SCALE})` }}>
              <IsoCar key={alarm.no} number={alarm.car} state={CAR_STATE[alarm.grade]} />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1 whitespace-nowrap">
          <p className={`font-bold text-(--text-primary) ${TEXT.titleSmall}`}>
            {alarm.formation} 편성 · {alarm.car}호차
          </p>
          <p className={`font-medium text-(--text-secondary) ${TEXT.labelMedium}`}>
            발생 {alarm.ymd} {alarm.time}
          </p>
        </div>
      </div>
      <DetailField width="100%" label="상태 · 담당" value={`${alarm.status} · ${alarm.owner}`} />
      <Button label="알람 처리" icon={CheckCheck} className="w-full" disabled={!open} onClick={() => onResolve(alarm.no)} />
    </div>
  );
}

export function AlarmDetailPanel({ alarm, onResolve }: AlarmDetailPanelProps) {
  return (
    <Panel className="h-full w-[420px] shrink-0" header={<PanelHeader eyebrow="SELECTED" title="선택 알람 상세" />}>
      {alarm ? (
        <Detail alarm={alarm} onResolve={onResolve} />
      ) : (
        <div className="flex size-full items-center justify-center">
          <StateBlock kind="empty" title="선택해주세요" body="워크리스트나 버블에서 알람을 고르세요" showAction={false} width="100%" />
        </div>
      )}
    </Panel>
  );
}
