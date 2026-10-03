"use client";

import { useAnimatedNumber } from "@/lib/motion";
import { TEXT } from "@/lib/typography";

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  // 현재 적용 중인 값 위치에 호박색 표시선을 그리도록 지정
  current?: number;
  label?: string;
  width?: number | string;
};

// 끌어서 임계치를 고르는 슬라이더를 채움 막대·손잡이·현재값 표시선과 함께 표시
export function Slider({ value, onChange, min = 0, max = 1, step = 0.001, current, label = "임계치", width = 489 }: SliderProps) {
  const ratio = (v: number) => ((v - min) / (max - min)) * 100;
  // 바깥에서 값이 바뀌면 손잡이가 부드럽게 따라가도록 지정
  const shown = useAnimatedNumber(ratio(value), 250);
  return (
    <div className="relative h-10" style={{ width }}>
      <span className={`absolute top-0 left-0 font-medium text-(--text-tertiary) ${TEXT.labelLarge}`}>{min}</span>
      <span className={`absolute top-0 right-2 font-medium text-(--text-tertiary) ${TEXT.labelLarge}`}>{max}</span>
      <div className="absolute top-6 right-2 left-0 h-1.5 rounded-[3px] bg-(--neutral-track)">
        <div className="h-full rounded-[3px] bg-(image:--gradient-accent)" style={{ width: `${shown}%` }} />
        {current !== undefined && (
          <div className="absolute -top-1.5 h-[18px] w-0.5 -translate-x-1/2 rounded-[1px] bg-(--status-warning)" style={{ left: `${ratio(current)}%` }} />
        )}
        <div
          className="pointer-events-none absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-(--accent-cyan) bg-(--white) shadow-[0px_0px_12px_0px_color-mix(in_srgb,var(--accent-cyan)_70%,transparent)]"
          style={{ left: `${shown}%` }}
        />
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute top-4 right-2 left-0 h-6 cursor-pointer opacity-0"
      />
    </div>
  );
}
