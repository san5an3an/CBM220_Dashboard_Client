"use client";

import { Plus, Save } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Callout } from "@/components/cards";
import { Button, FormField, InputField, Select } from "@/components/controls";
import { CarStage, type CarState } from "@/components/fleet";
import { GradeChip, SectionTitle } from "@/components/foundations";
import { ModalSheet } from "@/components/navigation";
import { GRADE, type Grade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { DateRangeField } from "../DateRangeField";
import { Tabs } from "../Tabs";
import { type Alarm, alarmTitle, DEVICES, GRADE_LABEL, GRADES, TODAY, ymdOf } from "./data";

// 등급 선택 칸 이름 지정
const GRADE_TAB: Record<Grade, string> = { A: "A · 위험", B: "B · 경고", C: "C · 주의", D: "D · 참고", W: "W · 오탐" };
// 알람 등급을 미리보기 차량 상태 색으로 연결
const STAGE_STATE: Record<Grade, CarState> = { A: "fault", B: "fault", C: "inspect", D: "inspect", W: "normal" };

const FORMATIONS = ["401", "402", "403", "404", "405", "415"];
const CARS = Array.from({ length: 10 }, (_, i) => String(i).padStart(2, "0"));
export const OWNERS = ["미지정", "박기술", "이현장", "김정비"];

const options = (values: string[]) => values.map((v) => ({ value: v, label: v }));

export type AlarmDraft = {
  grade: Grade;
  device: string;
  formation: string;
  car: string;
  title: string;
  at: string;
  ratio: string;
  owner: string;
  memo: string;
};

// 지금 시각을 "연-월-일 시:분" 문구로 변환
export const nowText = () => {
  const d = new Date();
  return `${ymdOf(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// 고른 알람 값으로 등록 양식 첫 값을 채우고 제목은 비우며 발생 일시는 지금으로
const draftFrom = (a: Alarm): AlarmDraft => ({
  grade: a.grade,
  device: a.device,
  formation: a.formation,
  car: a.car,
  title: "",
  at: nowText(),
  ratio: String(a.ratio),
  owner: a.owner,
  memo: `${a.model} 모델 이상비율 ${a.ratio}% · window ${a.window} / 100`,
});

// 수정할 알람의 저장된 값을 그대로 양식 첫 값으로 채우기
const draftOf = (a: Alarm): AlarmDraft => ({
  grade: a.grade,
  device: a.device,
  formation: a.formation,
  car: a.car,
  title: alarmTitle(a),
  at: `${a.ymd} ${a.time.slice(0, 5)}`,
  ratio: String(a.ratio),
  owner: a.owner,
  memo: a.memo ?? "",
});

// "연-월-일 시:분" 문구를 달력에 넘길 하루짜리 기간으로 변환
const atRange = (at: string) => {
  const d = new Date(Number(at.slice(0, 4)), Number(at.slice(5, 7)) - 1, Number(at.slice(8, 10)));
  return { start: d, end: d, startTime: at.slice(11, 16), endTime: at.slice(11, 16) };
};

// 제목·이상 비율 입력 오류 문구 계산
function validate(d: AlarmDraft) {
  const ratio = Number(d.ratio);
  return {
    title: d.title.trim() ? undefined : "제목을 입력하세요.",
    ratio: d.ratio.trim() !== "" && Number.isFinite(ratio) && ratio >= 0 && ratio <= 100 ? undefined : "0 ~ 100 사이 값을 입력하세요.",
  };
}

// 남은 오류 종류에 맞춰 안내 상자 본문 생성
function calloutBody(title: boolean, ratio: boolean, count: number) {
  const rule = title && ratio ? "제목은 필수이며, 이상 비율은 0 ~ 100% 범위여야 합니다." : title ? "제목은 필수입니다." : "이상 비율은 0 ~ 100% 범위여야 합니다.";
  return `${count}개 항목을 수정해야 등록할 수 있습니다. ${rule}`;
}

// 한 줄에 같은 폭으로 나눠 놓은 입력 칸 묶음 표시
function Row({ children }: { children: ReactNode }) {
  return <div className="flex w-full items-start gap-4 [&>*]:min-w-px [&>*]:flex-1">{children}</div>;
}

type AlarmRegisterModalProps = {
  open: boolean;
  // 양식 첫 값을 가져올 알람 지정
  base: Alarm;
  // 수정할 알람 지정 (없으면 새로 등록)
  editing?: Alarm;
  onClose: () => void;
  onSubmit: (d: AlarmDraft) => void;
};

// 알람 정보를 입력·검증하고 위치를 미리 보며 등록하는 시트 표시
export function AlarmRegisterModal({ open, base, editing, onClose, onSubmit }: AlarmRegisterModalProps) {
  const [draft, setDraft] = useState(() => (editing ? draftOf(editing) : draftFrom(base)));
  const [touched, setTouched] = useState({ title: false, ratio: false });
  const set = <K extends keyof AlarmDraft>(key: K, value: AlarmDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const touch = (key: keyof typeof touched) => setTouched((t) => ({ ...t, [key]: true }));

  const errors = validate(draft);
  // 손댄 칸의 오류만 화면에 보이기
  const shown = { title: touched.title ? errors.title : undefined, ratio: touched.ratio ? errors.ratio : undefined };
  const shownCount = Number(Boolean(shown.title)) + Number(Boolean(shown.ratio));
  const valid = !errors.title && !errors.ratio;
  const token = GRADE[draft.grade];

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title={editing ? "알람 수정" : "알람 등록"}
      note={shownCount > 0 ? `* 필수 입력 · 오류 ${shownCount}건` : "* 필수 입력"}
      noteError={shownCount > 0}
      actions={
        <>
          <Button kind="ghost" label="취소" onClick={onClose} />
          <Button label={editing ? "수정 저장" : "알람 등록"} icon={editing ? Save : Plus} disabled={!valid} onClick={() => onSubmit(draft)} />
        </>
      }
    >
      <div className="flex h-full w-full flex-col gap-4">
        <div className="flex min-h-px w-full flex-1 items-start gap-4">
          <section className="flex h-full min-w-px flex-1 flex-col items-start gap-3 rounded-[18px] border border-(--white)/7 bg-(--white)/3 p-4">
            <SectionTitle eyebrow="NEW ALARM" title="알람 정보" />
            <div className="flex w-full flex-col gap-4">
              <FormField label="등급" required width="100%">
                <Tabs grow items={GRADES.map((g) => GRADE_TAB[g])} initial={GRADES.indexOf(draft.grade)} onChange={(i) => set("grade", GRADES[i])} />
              </FormField>
              <Row>
                <FormField label="장치" required width="100%">
                  <Select options={options(DEVICES.slice(1))} value={draft.device} onChange={(v) => set("device", v)} />
                </FormField>
                <FormField label="편성" required width="100%">
                  <Select options={options(FORMATIONS)} value={draft.formation} onChange={(v) => set("formation", v)} />
                </FormField>
                <FormField label="호차" required width="100%">
                  <Select options={options(CARS)} value={draft.car} onChange={(v) => set("car", v)} />
                </FormField>
              </Row>
              <FormField label="제목" required width="100%" error={shown.title}>
                <InputField
                  icon={null}
                  invalid={Boolean(shown.title)}
                  placeholder="알람 제목을 입력하세요"
                  value={draft.title}
                  onChange={(e) => set("title", e.target.value)}
                  onBlur={() => touch("title")}
                />
              </FormField>
              <Row>
                <FormField label="발생 일시" required width="100%">
                  <DateRangeField
                    single
                    label="발생 일시"
                    width="100%"
                    today={TODAY}
                    value={atRange(draft.at)}
                    onChange={(r) => set("at", `${ymdOf(r.start)} ${r.startTime}`)}
                  />
                </FormField>
                <FormField label="이상 비율 (%)" required width="100%" error={shown.ratio}>
                  <InputField
                    icon={null}
                    inputMode="decimal"
                    invalid={Boolean(shown.ratio)}
                    value={draft.ratio}
                    onChange={(e) => {
                      set("ratio", e.target.value);
                      touch("ratio");
                    }}
                    onBlur={() => touch("ratio")}
                  />
                </FormField>
                <FormField label="담당자" width="100%">
                  <Select options={options(OWNERS)} value={draft.owner} onChange={(v) => set("owner", v)} />
                </FormField>
              </Row>
              <FormField label="메모" width="100%" helper="최대 500자">
                <InputField icon={null} multiline={72} maxLength={500} value={draft.memo} onChange={(e) => set("memo", e.target.value)} />
              </FormField>
            </div>
          </section>
          <section
            className="flex h-full w-[380px] shrink-0 flex-col items-start gap-3 rounded-[18px] border border-(--white)/7 p-4"
            style={{ backgroundImage: `linear-gradient(to bottom, ${tint(token, 10)}, transparent)` }}
          >
            <SectionTitle eyebrow="PREVIEW" title="위치 미리보기" />
            <div className="flex w-full flex-col items-start gap-3">
              <CarStage key={`${draft.car}-${draft.grade}`} number={draft.car} state={STAGE_STATE[draft.grade]} />
              <div
                className="flex w-full flex-col items-start gap-1.5 rounded-[14px] border px-4 py-3.5 whitespace-nowrap"
                style={{ borderColor: tint(token, 40), backgroundImage: `linear-gradient(to right, ${tint(token, 16)}, ${tint(token, 4)})` }}
              >
                <div className="flex items-center gap-2">
                  <GradeChip grade={draft.grade} />
                  <p className={`font-semibold ${TEXT.labelMedium}`} style={{ color: `var(${token})` }}>
                    {GRADE_LABEL[draft.grade]}
                  </p>
                </div>
                <p className={`max-w-full truncate font-medium ${TEXT.bodyMedium} ${draft.title.trim() ? "text-(--text-primary)" : "text-(--text-tertiary)"}`}>
                  {draft.title.trim() || "(제목 없음)"}
                </p>
                <p className={`font-medium text-(--text-secondary) ${TEXT.labelMedium}`}>
                  {draft.device} · {draft.formation} 편성 · {draft.car}호차
                </p>
              </div>
            </div>
          </section>
        </div>
        {shownCount > 0 && <Callout width="100%" title="입력 확인 필요" body={calloutBody(Boolean(shown.title), Boolean(shown.ratio), shownCount)} />}
      </div>
    </ModalSheet>
  );
}
