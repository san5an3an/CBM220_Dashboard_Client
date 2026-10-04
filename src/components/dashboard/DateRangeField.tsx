"use client";

import { Calendar } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type DateRange, DatePicker, InputField } from "@/components/controls";

const pad = (n: number) => String(n).padStart(2, "0");
// 날짜를 연-월-일 문구로 변환
export const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// 기간을 시작·끝 날짜와 시간까지 붙인 문구로 변환
export const formatRange = (r: DateRange) => `${formatDate(r.start)} ${r.startTime} ~ ${formatDate(r.end)} ${r.endTime}`;

const dayKey = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const minuteOf = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));

// 날짜가 기간 안이고 시각이 매일의 시간대 안인지 판정 (시작 시간이 더 늦으면 자정을 넘는 시간대)
export function inDateTimeRange(r: DateRange, at: Date) {
  const day = dayKey(at);
  if (day < dayKey(r.start) || day > dayKey(r.end)) return false;
  const m = at.getHours() * 60 + at.getMinutes();
  const from = minuteOf(r.startTime);
  const to = minuteOf(r.endTime);
  return from <= to ? m >= from && m <= to : m >= from || m <= to;
}

type DateRangeFieldProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  // 달력에서 오늘로 볼 날짜 지정 (이후 날짜는 고를 수 없음)
  today: Date;
  missing?: string[];
  width?: number | string;
};

// 달력 대략 높이(px) 지정 — 입력칸 아래 공간이 모자라면 위로 열기 판단에 사용
const POPOVER_H = 520;

// 입력칸을 누르면 달력을 열고 적용한 기간을 칸에 표시
export function DateRangeField({ value, onChange, today, missing, width = 340 }: DateRangeFieldProps) {
  const [place, setPlace] = useState<CSSProperties | null>(null);
  const open = place !== null;
  const root = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);

  // 스크롤 영역(모달 본문 등)에 갇혀 잘리지 않도록 화면 위층에 띄울 위치를 입력칸 기준으로 계산
  const toggle = () => {
    if (open || !root.current) return setPlace(null);
    const r = root.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const up = below < POPOVER_H && r.top > below;
    setPlace({ right: window.innerWidth - r.right, ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }) });
  };

  // 달력 밖을 누르거나 창 크기가 바뀌면 닫고, Esc 는 달력만 닫히도록 먼저 가로채기
  useEffect(() => {
    if (!open) return;
    const close = () => setPlace(null);
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!root.current?.contains(t) && !pop.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <div ref={root} className="relative shrink-0">
      <InputField
        width={width}
        icon={Calendar}
        iconSide="trailing"
        value={formatRange(value)}
        readOnly
        aria-label="조회 기간"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="cursor-pointer [&_input]:cursor-pointer"
        onClick={toggle}
      />
      {place &&
        createPortal(
          <div ref={pop} className="fixed z-90" style={place}>
            <DatePicker
              today={today}
              initial={value}
              missing={missing}
              onApply={(r) => {
                onChange(r);
                setPlace(null);
              }}
              onCancel={() => setPlace(null)}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
