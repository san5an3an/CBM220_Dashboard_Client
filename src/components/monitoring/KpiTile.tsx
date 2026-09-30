"use client";

import { ArrowUpRight } from "lucide-react";
import { useAnimatedNumber, useCountText } from "@/lib/motion";
import { shade, TONE, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type KpiTone = "cyan" | "coral" | "amber" | "mint";

type KpiTileProps = {
  label: string;
  value: string;
  unit: string;
  sub: string;
  delta: string;
  tone?: KpiTone;
  // 아래 막대 채움 비율(0~1) 지정
  ratio?: number;
};

// 핵심 지표 하나를 차오르는 숫자·증감 배지·진행 막대로 표시
export function KpiTile({ label, value, unit, sub, delta, tone = "cyan", ratio = 100 / 140 }: KpiTileProps) {
  const token = TONE[tone];
  const shown = useCountText(value);
  const fill = useAnimatedNumber(Math.max(0, Math.min(1, ratio)), 1400);
  return (
    <div className="relative flex h-[150px] w-[172px] flex-col items-start gap-1.5 overflow-clip rounded-[16px] border border-(--border-default) px-4 pt-3.5 pb-4 shadow-[0px_10px_20px_0px_rgba(0,0,0,0.45)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[16px] bg-linear-[138.9deg] from-(--navy-700) to-(--navy-800)" />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-61px] left-[89px] size-[120px] animate-[glow-breathe_4s_ease-in-out_infinite] rounded-full blur-[24px]"
        style={{ background: tint(token, 35) }}
      />
      <div className="relative flex w-full items-center gap-1.5">
        <p className={`min-w-px flex-1 truncate font-medium text-(--text-secondary) ${TEXT.labelLarge}`}>{label}</p>
        <span className="flex shrink-0 items-center gap-0.5 rounded-full py-0.5 pr-[7px] pl-1" style={{ background: tint(token, 14) }}>
          <ArrowUpRight size={14} strokeWidth={2} absoluteStrokeWidth style={{ color: `var(${token})` }} />
          <span className={`font-semibold whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: `var(${token})` }}>
            {delta}
          </span>
        </span>
      </div>
      <div className="relative flex items-baseline gap-1 whitespace-nowrap">
        <p className={`font-extrabold text-(--text-primary) tabular-nums ${TEXT.displaySmall}`}>{shown}</p>
        <p className={`font-medium text-(--text-secondary) ${TEXT.labelLarge}`}>{unit}</p>
      </div>
      <p className={`relative font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelSmall}`}>{sub}</p>
      <div className="relative h-1.5 w-full shrink-0 overflow-clip rounded-[3px] bg-(--white)/6 shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.5)]">
        <div
          className="absolute top-0 left-0 h-full rounded-[3px]"
          style={{
            width: `${fill * 100}%`,
            backgroundImage: `linear-gradient(to right, ${shade(token, "white", 30)}, var(${token}))`,
            boxShadow: `0 0 8px 0 ${tint(token, 80)}`,
          }}
        />
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)]" />
    </div>
  );
}
