"use client";

import { useId } from "react";
import { useAnimatedNumber } from "@/lib/motion";
import { shade, TONE, type Tone, tint } from "@/lib/tone";
import { useValueTip, ValueTip } from "@/components/ui/ValueTip";
import { TEXT } from "@/lib/typography";
import { arcPath } from "./live";

// Figma 반원 게이지 중심·반지름·굵기 지정
const C = 56;
const R = 44.5;
const WIDTH = 11;
const ARC_LEN = Math.PI * R;

type SensorGaugeProps = {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  sub?: string;
  tag?: string;
  tone?: Tone;
  // 소수 자릿수 지정
  digits?: number;
};

// 센서 값 하나를 입체 반원 게이지와 큰 숫자로 표시
export function SensorGauge({ label, value, unit, min = 0, max = 100, sub, tag, tone = "cyan", digits = 0 }: SensorGaugeProps) {
  const id = useId();
  const token = TONE[tone];
  const shown = useAnimatedNumber(value, 1200);
  const ratio = Math.max(0, Math.min(1, (shown - min) / (max - min || 1)));
  const text = shown.toFixed(digits);
  const { tip, track, show, hide } = useValueTip<true>();
  return (
    <div
      className="relative flex h-[132px] w-[360px] items-center gap-4 overflow-clip rounded-[18px] border border-(--border-default) pr-[18px] pl-4 shadow-[0px_10px_20px_0px_rgba(0,0,0,0.4)]"
      onPointerEnter={(e) => show(true, e)} onPointerMove={track} onPointerLeave={hide}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[18px] bg-linear-[159.9deg] from-(--navy-700) to-(--navy-800)" />
      <div aria-hidden className="pointer-events-none absolute top-[-11px] left-[-21px] size-[140px] rounded-full blur-[25px]" style={{ background: tint(token, 22) }} />
      <div className="relative h-[100px] w-28 shrink-0">
        <svg className="absolute inset-0 overflow-visible" viewBox="0 0 112 100" width={112} height={100}>
          <defs>
            <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--navy-650)" }} />
              <stop offset="1" style={{ stopColor: "var(--navy-850)" }} />
            </linearGradient>
            <linearGradient id={`${id}-arc`} gradientUnits="userSpaceOnUse" x1="6" y1="0" x2="106" y2="0">
              <stop offset="0" style={{ stopColor: shade(token, "white", 30) }} />
              <stop offset="1" style={{ stopColor: `var(${token})` }} />
            </linearGradient>
          </defs>
          <path d={`M 0 ${C} A ${C} ${C} 0 0 1 112 ${C} Z`} fill={`url(#${id}-plate)`} style={{ filter: "drop-shadow(0 6px 7px rgba(0,0,0,0.6))" }} />
          <path d={arcPath(C, C, R, 180, 360)} fill="none" strokeWidth={WIDTH} style={{ stroke: tint("--white", 8) }} />
          <path
            d={arcPath(C, C, R, 180, 360)}
            fill="none"
            strokeWidth={WIDTH}
            strokeLinecap="round"
            stroke={`url(#${id}-arc)`}
            strokeDasharray={ARC_LEN}
            strokeDashoffset={ARC_LEN * (1 - ratio)}
            style={{ filter: `drop-shadow(0 0 5px ${tint(token, 70)})` }}
          />
        </svg>
        <div
          className="absolute top-14 left-0 h-0.5 w-28"
          style={{ backgroundImage: `linear-gradient(to right, transparent, ${tint(token, 60)}, transparent)` }}
        />
        <p className={`absolute top-7 left-1/2 w-20 -translate-x-1/2 text-center font-bold text-(--text-primary) tabular-nums ${TEXT.titleLarge}`}>{text}</p>
        <div className={`absolute top-16 left-0 flex h-4 w-28 items-start justify-between font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelSmall}`}>
          <p>{min}</p>
          <p>{max}</p>
        </div>
      </div>
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-1 overflow-clip">
        <div className="flex w-full items-center gap-1.5">
          <p className={`min-w-px flex-1 truncate font-bold text-(--text-primary) ${TEXT.titleSmall}`}>{label}</p>
          {tag && (
            <span className="shrink-0 rounded-full border px-2 py-0.5" style={{ borderColor: tint(token, 40), background: tint(token, 14) }}>
              <span className={`font-semibold whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: `var(${token})` }}>
                {tag}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1 whitespace-nowrap">
          <p className={`font-extrabold text-(--text-primary) tabular-nums ${TEXT.displaySmall}`}>{text}</p>
          <p className={`font-medium text-(--text-secondary) ${TEXT.labelLarge}`}>{unit}</p>
        </div>
        {sub && <p className={`font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelSmall}`}>{sub}</p>}
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)]" />
      <ValueTip at={tip} label={label} rows={[{ value: value.toFixed(digits), unit, color: `var(${token})` }, { name: "범위", value: `${min} – ${max}`, unit }]} />
    </div>
  );
}
