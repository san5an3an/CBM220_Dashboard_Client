/* eslint-disable @next/next/no-img-element */
"use client";

import { Layers, LayoutGrid, Moon, Power, Scan, type LucideIcon } from "lucide-react";
import { replayArrival } from "./consist/arrival";

type RailItem = { label: string; icon: LucideIcon; active?: boolean; onSelect?: () => void };

const RAIL_ITEMS: RailItem[] = [
  { label: "CBM 대시보드", icon: LayoutGrid, active: true, onSelect: replayArrival },
  { label: "CBM 정보", icon: Layers },
  { label: "CBM 모델", icon: Scan },
];

export function SideRail() {
  return (
    <aside className="relative flex h-full w-[104px] shrink-0 flex-col items-center gap-1.5 border-r border-(--border-default) bg-linear-to-b from-(--background-rail) to-(--background-page) py-5 drop-shadow-[8px_0px_15px_var(--effect-shadow-panel)]">
      <div className="flex shrink-0 flex-col items-center gap-1.5 overflow-clip pb-2.5">
        <img alt="서울교통공사" className="size-11" src="/figma/brand/logo.svg" />
        <p className="whitespace-nowrap text-[11px] font-semibold leading-4 tracking-[0.5px] text-[#00a4e3]">
          CBM 220
        </p>
      </div>
      <div className="h-px w-12 shrink-0 bg-(--border-strong)" />
      <nav className="flex h-[594px] w-[76px] shrink-0 flex-col items-center gap-1.5 pt-2">
        {RAIL_ITEMS.map((item) => (
          <RailButton key={item.label} {...item} />
        ))}
      </nav>
      <div className="min-h-px w-px flex-[1_0_0]" />
      <button
        type="button"
        aria-label="테마 전환"
        className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-(--border-default) bg-(--neutral-control) shadow-[inset_0px_1px_0px_0px_var(--effect-inner-highlight)]"
      >
        <Moon className="text-(--text-primary)" size={20} absoluteStrokeWidth />
      </button>
      <button
        type="button"
        aria-label="로그아웃"
        className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] bg-(image:--gradient-danger) shadow-[inset_0px_1px_0px_0px_var(--chart-3d-top-highlight)] drop-shadow-[0px_4px_7px_var(--status-danger-border)]"
      >
        <Power className="text-(--text-on-primary)" size={20} absoluteStrokeWidth />
      </button>
    </aside>
  );
}

function RailButton({ label, icon: Icon, active, onSelect }: RailItem) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onSelect}
      className={`relative flex h-[68px] w-[76px] shrink-0 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-[16px] ${
        active
          ? "border border-(--accent-cyan)/45 drop-shadow-[0px_4px_9px_var(--accent-cyan-glow)]"
          : "hover:bg-(--neutral-hover)"
      }`}
    >
      {active && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[16px]"
          style={{
            backgroundImage:
              "linear-gradient(138.18deg, color-mix(in srgb, var(--accent-cyan) 22%, transparent) 0%, var(--accent-violet-subtle) 100%)",
          }}
        />
      )}
      <Icon className="relative text-(--text-primary)" size={24} absoluteStrokeWidth />
      <span
        className={`relative whitespace-nowrap text-center text-[11px] leading-4 tracking-[0.5px] ${
          active ? "font-semibold text-(--text-primary)" : "font-medium text-(--text-secondary)"
        }`}
      >
        {label}
      </span>
      {active && (
        <>
          <div className="absolute left-[-11px] top-[19px] h-7 w-1 rounded-[2px] bg-linear-to-b from-(--accent-cyan) to-(--accent-violet) shadow-[0px_0px_8px_0px_var(--border-focus)]" />
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_var(--effect-inner-highlight)]" />
        </>
      )}
    </button>
  );
}
