"use client";

import { TEXT } from "@/lib/typography";

type SegmentItemProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  grow?: boolean;
};

// 세그먼트 탭 한 칸 표시
export function SegmentItem({ label, active = false, onClick, grow = false }: SegmentItemProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`group relative flex h-8 cursor-pointer items-center justify-center rounded-[9px] px-4 ${grow ? "min-w-px flex-1" : "shrink-0"} ${
        active ? "drop-shadow-[0px_3px_6px_color-mix(in_srgb,var(--accent-cyan)_30%,transparent)]" : ""
      }`}
    >
      {active && (
        <>
          <span aria-hidden className="flip-hover pointer-events-none absolute inset-0 rounded-[9px] bg-(image:--gradient-accent)" />
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.45)]" />
        </>
      )}
      <span
        className={`relative whitespace-nowrap transition-colors duration-300 ${TEXT.labelLarge} ${
          active ? "font-semibold text-(--text-on-accent)" : "font-medium text-(--text-secondary) group-hover:text-(--text-primary)"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
