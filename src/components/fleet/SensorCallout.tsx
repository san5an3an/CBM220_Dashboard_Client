"use client";

import type { CSSProperties } from "react";
import { useAnimatedNumber, useCountText } from "@/lib/motion";
import { shade, type Tone, TONE, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type SensorCalloutProps = {
  label?: string;
  value?: string;
  unit?: string;
  min?: string;
  max?: string;
  // 값 막대 채움 비율(0~1) 지정
  ratio?: number;
  tag?: string;
  showTag?: boolean;
  tone?: Tone;
  className?: string;
  style?: CSSProperties;
};

// 3D 무대 위에 떠 있는 센서 값을 차오르는 숫자와 비율 막대로 표시
export function SensorCallout({
  label = "속도",
  value = "62",
  unit = "km/h",
  min = "0",
  max = "110 km/h",
  ratio = 120 / 204,
  tag = "제한 80",
  showTag = true,
  tone = "cyan",
  className = "",
  style,
}: SensorCalloutProps) {
  const token = TONE[tone];
  const shown = useCountText(value);
  const fill = useAnimatedNumber(Math.max(0, Math.min(1, ratio)), 1200);
  return (
    <div
      className={`relative flex w-[236px] flex-col items-start gap-1.5 overflow-clip rounded-[16px] border px-4 py-3.5 ${className}`}
      style={{ ...style, borderColor: tint(token, 50), boxShadow: `0 8px 24px 0 ${tint(token, 30)}` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[16px] backdrop-blur-[6px]"
        style={{ backgroundImage: `linear-gradient(149.7deg, ${tint("--navy-700", 92)}, ${tint("--navy-800", 92)})` }}
      />
      <div className="relative flex w-full items-center gap-2">
        <span
          className="size-2 shrink-0 animate-[legend-pulse_2s_ease-in-out_infinite] rounded-full"
          style={{ background: `var(${token})`, "--pulse": tint(token, 90) } as CSSProperties}
        />
        <p className={`min-w-px flex-1 font-semibold text-(--text-secondary) ${TEXT.labelLarge}`}>{label}</p>
        {showTag && (
          <span className="shrink-0 rounded-full border px-2 py-0.5" style={{ background: tint(token, 14), borderColor: tint(token, 40) }}>
            <p className={`font-semibold whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: `var(${token})` }}>
              {tag}
            </p>
          </span>
        )}
      </div>
      <div className="relative flex items-baseline gap-1 whitespace-nowrap">
        <p className={`font-extrabold text-(--text-primary) tabular-nums ${TEXT.displaySmall}`}>{shown}</p>
        <p className={`font-medium text-(--text-secondary) ${TEXT.labelLarge}`}>{unit}</p>
      </div>
      <div className="relative h-2 w-full shrink-0 overflow-clip rounded-[4px] bg-(--white)/6 shadow-[inset_0px_1px_3px_0px_rgba(0,0,0,0.6)]">
        <div
          className="absolute top-0 left-0 h-full rounded-[4px] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.5)]"
          style={{
            width: `${fill * 100}%`,
            backgroundImage: `linear-gradient(to right, ${shade(token, "white", 30)}, var(${token}))`,
            filter: `drop-shadow(0 0 4px ${tint(token, 80)})`,
          }}
        />
      </div>
      <div className={`relative flex w-full justify-between font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelSmall}`}>
        <p>{min}</p>
        <p>{max}</p>
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.1)]" />
    </div>
  );
}
