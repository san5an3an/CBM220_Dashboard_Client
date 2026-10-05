"use client";

import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { Callout, StatusBanner } from "@/components/cards";
import { Button, FormField, InputField, Select } from "@/components/controls";
import { DetailField, PipelineStep } from "@/components/diagnostics";
import { TrainCar3D } from "@/components/fleet";
import { Badge, GradeChip, SectionTitle } from "@/components/foundations";
import { ModalSheet } from "@/components/navigation";
import type { Grade } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { DateRangeField } from "../DateRangeField";
import { Tabs } from "../Tabs";
import { nowText, OWNERS } from "./AlarmRegisterModal";
import { type Alarm, alarmNo, type AlarmStatus, alarmTitle, GRADE_CODE, TODAY, ymdOf } from "./data";

// 처리 상태로 고를 수 있는 값 지정 (신규는 처리 전 상태라 제외)
const PROCESS_STATUS: AlarmStatus[] = ["확인", "조치중", "완료", "오탐"];
// 처리 단계 네 칸의 상태와 이름 지정
const STEP_STATUS: AlarmStatus[] = ["신규", "확인", "조치중", "완료"];
const GRADE_NAME: Record<Grade, string> = { A: "위험", B: "경고", C: "주의", D: "참고", W: "오탐" };
// 알람 등급을 차량 상태 색으로 연결
const CAR_STATE = { A: "fault", B: "fault", C: "inspect", D: "inspect", W: "normal" } as const;
// TrainCar3D 기본 틀(140×90)을 Figma 차량 칸(224×144)에 맞추는 배율 지정
const CAR_SCALE = 1.6;

export type AlarmProcess = { status: AlarmStatus; owner: string; doneAt: string; note: string };

// 지금 상태까지 지난 단계는 완료, 지금 단계는 진행, 남은 단계는 대기로 표시할 값 계산
function stepsOf(a: Alarm) {
  const current = a.status === "오탐" ? 3 : STEP_STATUS.indexOf(a.status);
  const closed = a.status === "완료" || a.status === "오탐";
  return STEP_STATUS.map((s, i) => {
    const label = i === 3 && a.status === "오탐" ? "오탐" : s;
    const sub = i === 0 ? `${a.date} ${a.time.slice(0, 5)}` : (a.steps?.[label as AlarmStatus] ?? (i <= current ? a.owner : "–"));
    if (i < current || (i === current && closed)) return { label, value: i === 0 ? "등록" : "완료", sub, tone: "mint" as const };
    if (i === current) return { label, value: i === 0 ? "등록" : "진행", sub, tone: "cyan" as const };
    return { label, value: "대기", sub: "–", tone: "slate" as const };
  });
}

// "연-월-일 시:분" 문구를 달력에 넘길 하루짜리 기간으로 변환
const atRange = (at: string) => {
  const [ymd, hm = "00:00"] = at.split(" ");
  const day = new Date(Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7)) - 1, Number(ymd.slice(8, 10)));
  return { start: day, end: day, startTime: hm, endTime: hm };
};

const options = (values: string[]) => values.map((v) => ({ value: v, label: v }));

type AlarmProcessModalProps = {
  open: boolean;
  alarm: Alarm;
  onClose: () => void;
  onSubmit: (p: AlarmProcess) => void;
  onDelete: () => void;
};

// 고른 알람의 처리 단계와 정보를 보여주고 처리 상태·담당·내용을 입력해 저장하는 시트 표시
export function AlarmProcessModal({ open, alarm, onClose, onSubmit, onDelete }: AlarmProcessModalProps) {
  const [draft, setDraft] = useState<AlarmProcess>(() => ({
    status: alarm.status === "신규" ? "확인" : alarm.status,
    owner: alarm.owner,
    doneAt: alarm.doneAt ?? nowText(),
    note: alarm.note ?? "",
  }));
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof AlarmProcess>(key: K, value: AlarmProcess[K]) => setDraft((d) => ({ ...d, [key]: value }));

  // 담당자와 처리 내용은 필수로 확인
  const ownerError = draft.owner === "미지정" ? "담당자를 지정하세요." : undefined;
  const noteError = draft.note.trim() ? undefined : "처리 내용을 입력하세요.";
  const shownNote = touched ? noteError : undefined;
  const valid = !ownerError && !noteError;
  const danger = alarm.grade === "A" || alarm.grade === "B";

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title={`알람 처리 · ${alarmNo(alarm)}`}
      actions={
        <>
          <Button kind="ghost" label="알람 삭제" onClick={onDelete} />
          <Button kind="ghost" label="취소" onClick={onClose} />
          <Button label="처리 저장" icon={CheckCheck} disabled={!valid} onClick={() => onSubmit(draft)} />
        </>
      }
    >
      <div className="flex w-full flex-col gap-4">
        <StatusBanner
          width="100%"
          tone={danger ? "danger" : "accent"}
          showVisual={false}
          content={
            <div className="flex w-full items-center gap-4">
              <div className="flex min-w-px flex-1 flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <GradeChip grade={alarm.grade} />
                  <p className={`font-bold text-(--text-primary) ${TEXT.titleLarge}`}>{alarmTitle(alarm)}</p>
                  <Badge tone="accent" label={alarm.status} />
                </div>
                <p className={`text-(--text-secondary) ${TEXT.bodyMedium}`}>
                  {alarm.model} 모델 · 이상비율 {alarm.ratio.toFixed(1)}% · window {alarm.window} / 100
                </p>
                <p className={`text-(--text-tertiary) ${TEXT.labelMedium}`}>
                  {alarm.formation} 편성 · {alarm.car}호차 · 발생 {alarm.ymd} {alarm.time}
                </p>
              </div>
              {/* Figma 처럼 차량 칸 높이를 120px 로 두고 아래 바퀴 쪽은 배너 밖으로 잘리게 배치 */}
              <div className="h-[120px] w-[250px] shrink-0 pl-2.5">
                <TrainCar3D number={alarm.car} state={CAR_STATE[alarm.grade]} scale={CAR_SCALE} />
              </div>
            </div>
          }
        />

        <div className="flex w-full items-stretch gap-2.5">
          {stepsOf(alarm).map((s, i) => (
            <PipelineStep
              key={s.label}
              type="status"
              width="100%"
              step={String(i + 1).padStart(2, "0")}
              label={s.label}
              value={s.value}
              unit=""
              sub={s.sub}
              tone={s.tone}
              showArrow={i < 3}
              loading={s.tone === "cyan"}
            />
          ))}
        </div>

        <div className="flex w-full items-stretch gap-4">
          <section className="flex w-[400px] shrink-0 flex-col items-start gap-3 rounded-[18px] border border-(--white)/7 bg-(--white)/3 p-4">
            <SectionTitle eyebrow="ALARM" title="알람 정보" />
            <div className="flex w-full flex-col">
              <DetailField width="100%" label="알람 번호" value={alarmNo(alarm)} />
              <DetailField width="100%" label="등급" value={`${alarm.grade} · ${GRADE_NAME[alarm.grade]} (${GRADE_CODE[alarm.grade]})`} />
              <DetailField width="100%" label="모델" value={alarm.model} />
              <DetailField width="100%" label="이상 비율" value={`${alarm.ratio.toFixed(1)}% · window ${alarm.window} / 100`} />
              <DetailField width="100%" label="등록" value={`${alarm.model === "수동" ? "직접 등록" : "시스템 자동"} · ${alarm.date} ${alarm.time.slice(0, 5)}`} />
            </div>
          </section>
          <section className="flex min-w-px flex-1 flex-col items-start gap-3 rounded-[18px] border border-(--white)/7 bg-(--white)/3 p-4">
            <SectionTitle eyebrow="PROCESS" title="처리 입력" />
            <div className="flex w-full flex-col gap-4">
              <FormField label="처리 상태" required width="100%">
                <Tabs grow items={PROCESS_STATUS} initial={PROCESS_STATUS.indexOf(draft.status)} onChange={(i) => set("status", PROCESS_STATUS[i])} />
              </FormField>
              <div className="flex w-full items-start gap-4">
                <FormField label="담당자" required width="100%" error={ownerError}>
                  <Select options={options(OWNERS)} value={draft.owner} onChange={(v) => set("owner", v)} />
                </FormField>
                <FormField label="완료 일시" width="100%">
                  <DateRangeField
                    single
                    label="완료 일시"
                    width="100%"
                    today={TODAY}
                    value={atRange(draft.doneAt)}
                    onChange={(r) => set("doneAt", `${ymdOf(r.start)} ${r.startTime}`)}
                  />
                </FormField>
              </div>
              <FormField label="처리 내용" required width="100%" error={shownNote} helper={shownNote ? undefined : "완료 처리 시 조치 관리에 이력이 남습니다."}>
                <InputField
                  icon={null}
                  multiline={72}
                  maxLength={500}
                  invalid={Boolean(shownNote)}
                  placeholder="처리한 내용을 입력하세요"
                  value={draft.note}
                  onChange={(e) => set("note", e.target.value)}
                  onBlur={() => setTouched(true)}
                />
              </FormField>
            </div>
          </section>
        </div>

        <Callout
          width="100%"
          tone="diagnosis"
          title="처리 가이드"
          body="완료로 저장하면 미처리 알람에서 빠지고 조치 관리의 조치완료 건수에 반영됩니다. 오탐 처리 시 모델 재학습 데이터에서 제외됩니다."
        />
      </div>
    </ModalSheet>
  );
}
