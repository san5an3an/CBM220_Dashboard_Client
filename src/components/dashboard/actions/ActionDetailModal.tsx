"use client";

import { Save } from "lucide-react";
import { type ReactNode, useState } from "react";
import { StatusBanner } from "@/components/cards";
import { Button, FormField, InputField, Select } from "@/components/controls";
import { DetailField } from "@/components/diagnostics";
import { Badge, MiniStat, SectionTitle } from "@/components/foundations";
import { SensorGauge } from "@/components/monitoring";
import { ModalSheet } from "@/components/navigation";
import { TEXT } from "@/lib/typography";
import { Tabs } from "../Tabs";
import { CarXray, type XrayDevice } from "./CarXray";
import { type ActionItem, type ActionState, chronicOf, devicePart, type InspectState, OWNERS, sensorPart, sensorShort, sensorUnit } from "./data";

// Figma 투시도 칸(626×315)에 맞춘 원래 틀(1272×640) 대비 배율 지정
const XRAY_SCALE = 626 / 1272;
const ACTION_TABS: ActionState[] = ["미조치", "완료"];
const INSPECT_TABS: InspectState[] = ["미검수", "완료"];

export type ActionDraft = { action: ActionState; inspect: InspectState; owner: string; note: string };

const options = (values: string[]) => values.map((v) => ({ value: v, label: v }));
const fixed = (n: number) => n.toFixed(2);

// 모달 안 구역을 같은 테두리·배경 상자로 묶어 표시
function Section({ eyebrow, title, className = "", children }: { eyebrow: string; title: string; className?: string; children: ReactNode }) {
  return (
    <section className={`flex flex-col items-start gap-3 rounded-[18px] border border-(--white)/7 bg-(--white)/3 p-4 ${className}`}>
      <SectionTitle eyebrow={eyebrow} title={title} />
      {children}
    </section>
  );
}

type ActionDetailModalProps = {
  open: boolean;
  item: ActionItem;
  onClose: () => void;
  onSubmit: (d: ActionDraft) => void;
};

// 이상 센서 한 건의 위치·센서 값·최근 이력을 보여주고 조치·검수·담당·내용을 입력해 저장하는 시트 표시
export function ActionDetailModal({ open, item, onClose, onSubmit }: ActionDetailModalProps) {
  const [draft, setDraft] = useState<ActionDraft>(() => ({ action: item.action, inspect: item.inspect, owner: item.owner, note: item.note ?? "" }));
  const [touched, setTouched] = useState({ owner: false, note: false });
  const set = <K extends keyof ActionDraft>(key: K, value: ActionDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  // 담당자와 조치 내용은 필수로 확인
  const ownerError = draft.owner === "미지정" ? "담당자를 지정하세요." : undefined;
  const noteError = draft.note.trim() ? undefined : "조치 내용을 입력하세요.";
  // 손댄 칸의 오류만 화면에 보이기
  const shownOwner = touched.owner ? ownerError : undefined;
  const shownNote = touched.note ? noteError : undefined;
  const valid = !ownerError && !noteError;

  const pending = item.action === "미조치";
  const chronic = chronicOf(item);
  const diff = item.actual - item.expected;
  // 기대값의 0.75 ~ 1.5배를 허용 범위로 계산
  const allowed = `${fixed(item.expected * 0.75)} – ${fixed(item.expected * 1.5)}`;
  const part = sensorPart(item);
  const device = devicePart(item);
  // 이상 센서 쪽은 미조치면 교체 색, 장치 쪽은 점검 색으로 두고 같은 장치면 하나만 표시
  const xray = ([
    { name: part, status: pending ? "replace" : "normal" },
    { name: device, status: "inspect" },
  ] satisfies XrayDevice[]).filter((d, i, all) => all.findIndex((x) => x.name === d.name) === i);

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title={`이상 센서 조치 · ${item.device}`}
      actions={
        <>
          <Button kind="ghost" label="취소" onClick={onClose} />
          <Button label="조치 저장" icon={Save} disabled={!valid} onClick={() => onSubmit(draft)} />
        </>
      }
    >
      <div className="flex w-full flex-col gap-4">
        <StatusBanner
          width="100%"
          tone={pending ? "danger" : "accent"}
          showVisual={false}
          content={
            <div className="flex w-full items-center gap-4">
              <div className="flex min-w-px flex-1 flex-col items-start gap-1.5">
                <div className="flex h-8 items-center gap-2">
                  <p className={`font-bold text-(--text-primary) ${TEXT.titleLarge}`}>
                    {item.device} · {item.sensor}
                  </p>
                  <Badge tone={pending ? "danger" : "accent"} label={item.action} />
                  <Badge tone={item.inspect === "완료" ? "accent" : "neutral"} label={item.inspect} />
                </div>
                <p className={`text-(--text-secondary) ${TEXT.bodyMedium}`}>
                  {item.formation} 편성 · {item.car}호차 · 발생 {item.ymd} {item.time}
                  {chronic && ` · 빈발 랭킹 ${chronic.rank}위 (${chronic.count}회)`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-6">
                <MiniStat label="실제" value={fixed(item.actual)} tone="coral" />
                <MiniStat label="기대" value={fixed(item.expected)} tone="mint" />
                <MiniStat label="편차" value={`${diff >= 0 ? "+" : ""}${fixed(diff)}`} tone="coral" />
              </div>
            </div>
          }
        />

        <div className="flex w-full items-stretch gap-4">
          <Section eyebrow="CAR X-RAY" title={`센서 위치 · ${item.car}호차`} className="w-[660px] shrink-0">
            <CarXray
              scale={XRAY_SCALE}
              selected={part}
              devices={xray}
            />
          </Section>
          <div className="flex min-w-px flex-1 flex-col gap-3">
            <SensorGauge
              width="100%"
              label={sensorShort(item)}
              tag={pending ? "이상" : "정상화"}
              tone={pending ? "coral" : "mint"}
              value={item.actual}
              min={0}
              max={1}
              digits={2}
              unit={sensorUnit(item)}
              sub={`기대 ${fixed(item.expected)} · 허용 ${allowed}`}
            />
            <Section eyebrow="HISTORY" title="최근 조치 이력" className="min-h-px flex-1">
              <div className="flex w-full flex-col">
                {item.history.map((h) => (
                  <DetailField key={`${h.date}-${h.what}`} width="100%" label={`${h.date} · ${h.owner}`} value={`${h.what} · 완료`} />
                ))}
              </div>
            </Section>
          </div>
        </div>

        <Section eyebrow="ACTION" title="조치 입력" className="w-full">
          <div className="flex w-full flex-col gap-3.5">
            <div className="flex w-full items-start gap-4">
              <FormField label="조치 여부" required width="100%">
                <Tabs grow items={["미조치", "조치완료"]} initial={ACTION_TABS.indexOf(draft.action)} onChange={(i) => set("action", ACTION_TABS[i])} />
              </FormField>
              <FormField label="검수 여부" width="100%">
                <Tabs grow items={["미검수", "검수완료"]} initial={INSPECT_TABS.indexOf(draft.inspect)} onChange={(i) => set("inspect", INSPECT_TABS[i])} />
              </FormField>
              <FormField label="담당자" required width="100%" error={shownOwner}>
                <Select
                  width="100%"
                  options={options(OWNERS)}
                  value={draft.owner}
                  onChange={(v) => {
                    set("owner", v);
                    setTouched((t) => ({ ...t, owner: true }));
                  }}
                />
              </FormField>
            </div>
            <FormField label="조치 내용" required width="100%" error={shownNote}>
              <InputField
                icon={null}
                width="100%"
                multiline={178}
                maxLength={500}
                invalid={Boolean(shownNote)}
                placeholder="조치한 내용을 입력하세요"
                value={draft.note}
                onChange={(e) => set("note", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, note: true }))}
              />
            </FormField>
          </div>
        </Section>
      </div>
    </ModalSheet>
  );
}
