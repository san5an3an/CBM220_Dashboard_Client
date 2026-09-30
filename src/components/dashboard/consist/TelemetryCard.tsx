import type { Telemetry } from "./data";

// 카드 색 토큰에 투명도 적용
const tint = (v: string, pct: number) => `color-mix(in srgb, var(${v}) ${pct}%, transparent)`;

export function TelemetryCard({ label, value, unit, tag, range, color, left }: Telemetry) {
  const c = `var(${color})`;
  return (
    <div
      className={`absolute top-0 flex w-[236px] flex-col items-start gap-1.5 overflow-clip rounded-[16px] border px-4 py-3.5 ${left}`}
      style={{ borderColor: tint(color, 50), boxShadow: `0px 8px 24px 0px ${tint(color, 30)}` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[16px] bg-(image:--gradient-dialog) opacity-92 backdrop-blur-[6px]"
      />
      <div className="relative flex w-full shrink-0 items-center gap-2 overflow-clip">
        <div className="size-2 shrink-0 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 6px 1px ${tint(color, 80)}` }} />
        <p className="min-w-px flex-[1_0_0] text-[14px] font-semibold leading-5 tracking-[0.1px] text-(--text-secondary)">{label}</p>
        {tag && (
          <div
            className="relative flex shrink-0 items-start overflow-clip rounded-full border px-2 py-0.5"
            style={{ backgroundColor: tint(color, 14), borderColor: tint(color, 40) }}
          >
            <p className="whitespace-nowrap text-[11px] font-semibold leading-4 tracking-[0.5px]" style={{ color: c }}>
              {tag}
            </p>
          </div>
        )}
      </div>
      <div className="relative flex shrink-0 items-baseline gap-1 overflow-clip whitespace-nowrap">
        <p className="text-[36px] font-extrabold leading-[44px] text-(--text-primary)">{value}</p>
        {unit && <p className="text-[14px] font-medium leading-5 tracking-[0.1px] text-(--text-secondary)">{unit}</p>}
      </div>
      <div className="pointer-events-none relative h-2 w-full shrink-0 overflow-clip rounded-[4px]">
        <div aria-hidden className="absolute inset-0 rounded-[4px] bg-(--neutral-track)" />
        <div className="absolute left-0 top-0 h-2 w-[120px] rounded-[4px]" style={{ boxShadow: `0px 0px 8px 0px ${tint(color, 80)}` }}>
          <div
            aria-hidden
            className="absolute inset-0 rounded-[4px]"
            style={{ backgroundImage: `linear-gradient(to right, color-mix(in srgb, ${c} 70%, var(--white)), ${c})` }}
          />
          <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_var(--chart-3d-top-highlight)]" />
        </div>
        <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_3px_0px_var(--effect-shadow-popover)]" />
      </div>
      <div className="relative flex w-full shrink-0 items-start justify-between overflow-clip whitespace-nowrap text-[11px] font-medium leading-4 tracking-[0.5px] text-(--text-tertiary)">
        <p>{range[0]}</p>
        <p>{range[1]}</p>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_var(--effect-inner-highlight)]" />
    </div>
  );
}
