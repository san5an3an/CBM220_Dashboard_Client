/* eslint-disable @next/next/no-img-element */
"use client";

import { Layers, LayoutGrid, Scan, type LucideIcon } from "lucide-react";
import { IconButton } from "@/components/foundations";
import { RailItem } from "@/components/navigation";
import { replayArrival } from "./consist/arrival";

type RailEntry = { label: string; icon: LucideIcon; active?: boolean; onSelect?: () => void };

const RAIL_ITEMS: RailEntry[] = [
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
        {RAIL_ITEMS.map(({ label, icon, active, onSelect }) => (
          <RailItem key={label} icon={icon} label={label} active={active} onClick={onSelect} />
        ))}
      </nav>
      <div className="min-h-px w-px flex-[1_0_0]" />
      <IconButton kind="theme" />
      <IconButton kind="exit" />
    </aside>
  );
}
