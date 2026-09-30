"use client";

import { useCountText } from "@/lib/motion";
import { TONE, type Tone, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type StatTileProps = {
  label: string;
  value: string;
  tone?: Tone;
  unit?: string;
  sub?: string;
};

// 모달 상단 KPI 수치를 차오르는 숫자와 톤 색 강조선으로 표시
export function StatTile({ label, value, tone = "cyan", unit, sub }: StatTileProps) {
  const token = TONE[tone];
  const shown = useCountText(value);
  // 보라 톤은 단색, 나머지는 톤 색에서 보라로 이어지는 강조선 지정
  const accent = tone === "violet" ? `var(${token})` : `linear-gradient(to right, var(${token}), var(--accent-violet))`;
  return (
    <div className="relative flex w-60 flex-col items-start gap-1 rounded-[16px] border p-4" style={{ borderColor: tint(token, 28) }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[16px]"
        style={{ backgroundImage: `linear-gradient(to bottom, ${tint(token, 16)}, transparent)` }}
      />
      <p className={`relative font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelLarge}`}>{label}</p>
      <div className="relative flex items-baseline gap-1.5 whitespace-nowrap">
        <p className={`font-extrabold text-(--text-primary) tabular-nums ${TEXT.displaySmall}`}>{shown}</p>
        {unit && <p className={`font-medium text-(--text-secondary) ${TEXT.labelMedium}`}>{unit}</p>}
      </div>
      {sub && (
        <p className={`relative font-medium whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: `var(${token})` }}>
          {sub}
        </p>
      )}
      <div className="relative h-[3px] w-12 origin-left animate-[grow-x_900ms_ease-out_both] rounded-[2px]" style={{ background: accent }} />
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.07)]" />
    </div>
  );
}
