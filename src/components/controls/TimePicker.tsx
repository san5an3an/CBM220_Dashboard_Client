"use client";

import { type UIEvent, useEffect, useRef, useState } from "react";
import { TEXT } from "@/lib/typography";
import { Button } from "./Button";
import { POP_IN, POPOVER } from "./popover";
import { SegmentItem } from "./Segmented";

const ITEM_H = 34;
const PRESETS = ["00:00", "09:00", "18:00", "23:59"];
const pad = (n: number) => String(n).padStart(2, "0");

type WheelProps = {
  count: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
};

// 끝에서 처음으로 이어지며 위아래로 굴려 값을 고르는 휠 한 줄 표시
function Wheel({ count, value, onChange, label }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  // 같은 목록을 세 번 이어 붙이고 가운데 묶음을 기준 위치로 지정
  const [offset, setOffset] = useState((count + value) * ITEM_H);
  const settle = useRef<number | undefined>(undefined);
  const mounted = useRef(false);

  // 처음에는 바로, 이후 바깥에서 값이 바뀌면 가장 가까운 같은 값 자리로 부드럽게 이동
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const now = Math.round(el.scrollTop / ITEM_H);
    if (mounted.current && ((now % count) + count) % count === value) return;
    const candidates = [value, count + value, 2 * count + value];
    const target = mounted.current ? candidates.reduce((a, c) => (Math.abs(c - now) < Math.abs(a - now) ? c : a)) : count + value;
    el.scrollTo({ top: target * ITEM_H, behavior: mounted.current ? "smooth" : "instant" });
    mounted.current = true;
  }, [value, count]);

  // 굴리는 동안 글자 흐림을 갱신하고 멈추면 값 확정 후 가운데 묶음으로 위치 보정
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setOffset(el.scrollTop);
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const index = Math.round(el.scrollTop / ITEM_H);
      const next = ((index % count) + count) % count;
      if (index < count || index >= 2 * count) el.scrollTo({ top: (count + next) * ITEM_H, behavior: "instant" });
      if (next !== value) onChange(next);
    }, 110);
  };

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      onScroll={onScroll}
      className="relative h-[170px] w-20 snap-y snap-mandatory overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div style={{ paddingTop: 68, paddingBottom: 68 }}>
        {Array.from({ length: count * 3 }, (_, i) => {
          const d = Math.abs(i * ITEM_H - offset) / ITEM_H;
          const selected = d < 0.5;
          const v = i % count;
          return (
            <button
              type="button"
              role="option"
              aria-selected={selected}
              key={i}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(v)}
              className={`flex h-[34px] w-full cursor-pointer snap-center items-center justify-center tabular-nums ${
                selected ? `font-bold text-(--text-primary) ${TEXT.titleSmall}` : `text-(--text-secondary) ${TEXT.bodyMedium}`
              }`}
              style={{ opacity: selected ? 1 : Math.max(0, 0.55 - (d - 1) * 0.3) }}
            >
              {pad(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type TimeBoxProps = {
  value: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
};

// 두 자리 숫자를 직접 치는 시·분 입력칸 표시
function TimeBox({ value, max, label, onChange }: TimeBoxProps) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      aria-label={label}
      inputMode="numeric"
      maxLength={2}
      value={draft ?? pad(value)}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const text = e.target.value.replace(/\D/g, "");
        setDraft(text);
        if (text.length === 2) onChange(Math.min(max, Number(text)));
      }}
      onBlur={() => {
        if (draft) onChange(Math.min(max, Number(draft)));
        setDraft(null);
      }}
      className={`h-10 min-w-px flex-1 rounded-[12px] border border-(--button-secondary-border) bg-(--neutral-input) px-3 text-center text-(--text-primary) shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.5)] outline-none transition-[border-color,box-shadow] focus:border-(--border-focus)/90 focus:shadow-[0px_0px_5px_0px_color-mix(in_srgb,var(--accent-cyan)_35%,transparent)] ${TEXT.bodyMedium}`}
    />
  );
}

type TimePickerProps = {
  title: string;
  value: string;
  onApply: (value: string) => void;
  onCancel: () => void;
};

// 시·분 휠과 직접 입력, 자주 쓰는 시간 버튼으로 시간을 고르는 팝오버 표시
export function TimePicker({ title, value, onApply, onCancel }: TimePickerProps) {
  const [h0, m0] = value.split(":").map(Number);
  const [hour, setHour] = useState(h0);
  const [minute, setMinute] = useState(m0);
  const text = `${pad(hour)}:${pad(minute)}`;
  const setText = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    setHour(h);
    setMinute(m);
  };
  return (
    <div role="dialog" aria-label={title} className={`flex w-[264px] flex-col items-start gap-3 rounded-[16px] p-4 ${POPOVER} ${POP_IN}`}>
      <div className="flex w-full items-center gap-2">
        <span className={`font-medium text-(--text-secondary) ${TEXT.labelLarge}`}>{title}</span>
        <span className="flex-1" />
        <span className={`font-bold text-(--accent-cyan) tabular-nums ${TEXT.titleSmall}`}>{text}</span>
      </div>
      <div className="flex w-full items-center gap-2">
        <span className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelLarge}`}>직접 입력</span>
        <TimeBox label="시" value={hour} max={23} onChange={setHour} />
        <span className={`font-bold text-(--accent-cyan) ${TEXT.titleSmall}`}>:</span>
        <TimeBox label="분" value={minute} max={59} onChange={setMinute} />
      </div>
      <div className="relative h-[176px] w-[232px] overflow-clip rounded-[12px] border border-(--border-subtle) bg-(--white)/2">
        <div className="pointer-events-none absolute top-[72px] left-[7px] h-[34px] w-[216px] rounded-[10px] border border-(--accent-cyan)/45 bg-linear-to-r from-(--accent-cyan)/18 to-(--accent-violet)/12" />
        <div className="absolute top-1 left-6">
          <Wheel label="시" count={24} value={hour} onChange={setHour} />
        </div>
        <div className="absolute top-1 left-[126px]">
          <Wheel label="분" count={60} value={minute} onChange={setMinute} />
        </div>
        <span className={`pointer-events-none absolute top-[79px] left-[113px] font-bold text-(--accent-cyan) ${TEXT.titleSmall}`}>:</span>
        <span className={`pointer-events-none absolute top-[83px] left-[86px] font-medium text-(--text-tertiary) ${TEXT.labelSmall}`}>시</span>
        <span className={`pointer-events-none absolute top-[83px] left-[188px] font-medium text-(--text-tertiary) ${TEXT.labelSmall}`}>분</span>
        <div className="pointer-events-none absolute top-0 left-0 h-11 w-full bg-linear-to-b from-(--neutral-popover) to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-11 w-full bg-linear-to-b from-transparent to-(--navy-850)" />
      </div>
      <div className="flex w-full items-start gap-1">
        {PRESETS.map((p) => (
          <SegmentItem key={p} label={p} grow active={p === text} onClick={() => setText(p)} />
        ))}
      </div>
      <div className="flex w-full items-center justify-end gap-2">
        <Button kind="ghost" label="취소" onClick={onCancel} />
        <Button kind="primary" label="적용" onClick={() => onApply(text)} />
      </div>
    </div>
  );
}
