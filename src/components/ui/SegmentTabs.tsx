"use client";

import { useState } from "react";

type SegmentTabsProps = {
  items: string[];
  defaultIndex?: number;
  gradientAngle?: number;
  onChange?: (index: number) => void;
};

export function SegmentTabs({ items, defaultIndex = 0, gradientAngle = 155.74, onChange }: SegmentTabsProps) {
  const [active, setActive] = useState(defaultIndex);
  const select = (i: number) => {
    setActive(i);
    onChange?.(i);
  };

  return (
    <div
      role="tablist"
      className="relative flex shrink-0 items-center rounded-[12px] border border-(--border-default) bg-(--neutral-control) p-1"
    >
      {items.map((label, i) => {
        const isActive = i === active;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => select(i)}
            className={`group relative flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-[9px] px-4 ${
              isActive ? "drop-shadow-[0px_3px_6px_var(--accent-cyan-glow)]" : ""
            }`}
          >
            {isActive && (
              <div
                aria-hidden
                className="flip-hover pointer-events-none absolute inset-0 rounded-[9px]"
                style={{
                  backgroundImage: `linear-gradient(${gradientAngle}deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)`,
                }}
              />
            )}
            <span
              className={`relative whitespace-nowrap text-[14px] leading-5 tracking-[0.1px] ${
                isActive ? "font-semibold text-(--text-on-accent)" : "font-medium text-(--text-secondary)"
              }`}
            >
              {label}
            </span>
            {isActive && (
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_var(--chart-3d-top-highlight)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
