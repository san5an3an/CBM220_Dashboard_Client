"use client";

/* eslint-disable @next/next/no-img-element */
import { IconButton, NavTab } from "@/components/foundations";
import { TEXT } from "@/lib/typography";
import { LiveBadge } from "./LiveBadge";
import { formatClock, useNow } from "./useClock";

type TopBarProps = {
  eyebrow: string;
  title: string;
  tabs: string[];
  active: number;
  onTab: (index: number) => void;
  onTheme?: () => void;
  onExit?: () => void;
};

// 로고·시스템 제목·페이지 탭·실시간 시계·테마·로그아웃을 한 줄로 묶은 상단 바 표시
export function TopBar({ eyebrow, title, tabs, active, onTab, onTheme, onExit }: TopBarProps) {
  const now = useNow();
  return (
    <header className="relative flex h-[68px] w-full items-center gap-4 rounded-[18px] border border-(--border-default) pr-3.5 pl-4 drop-shadow-[0px_12px_15px_rgba(0,0,0,0.5)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[18px] bg-linear-to-b from-(--navy-750) to-(--navy-850)" />
      <div className="relative flex shrink-0 items-center gap-3">
        <img alt="서울교통공사" className="size-10" src="/figma/brand/logo.svg" />
        <div className="flex flex-col items-start whitespace-nowrap">
          <p className={`font-semibold text-(--accent-cyan) ${TEXT.labelSmall}`}>{eyebrow}</p>
          <p className={`font-bold text-(--text-primary) ${TEXT.titleMedium}`}>{title}</p>
        </div>
      </div>
      <div className="relative h-8 w-px shrink-0 bg-linear-to-b from-transparent via-(--white)/18 to-transparent" />
      <nav role="tablist" className="relative flex shrink-0 items-center gap-1.5">
        {tabs.map((t, i) => (
          <NavTab key={t} label={t} active={i === active} onClick={() => onTab(i)} />
        ))}
      </nav>
      <div className="h-2.5 min-w-px flex-1" />
      <span className={`relative shrink-0 rounded-[12px] border border-(--border-default) bg-(--neutral-hover)/70 px-3.5 py-2.5 font-medium whitespace-nowrap text-(--text-primary) tabular-nums ${TEXT.titleSmall}`}>
        {now ? formatClock(now) : " "}
      </span>
      <span className="relative">
        <LiveBadge label="실시간" shape="box" />
      </span>
      <span className="relative flex gap-4">
        <IconButton kind="theme" onClick={onTheme} />
        <IconButton kind="exit" onClick={onExit} />
      </span>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.07)]" />
    </header>
  );
}
