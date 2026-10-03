/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { StatusStrip } from "@/components/navigation";
import { PageNav } from "./PageNav";
import { SideRail } from "./SideRail";

type DashboardShellProps = {
  title: string;
  // 페이지 탭에서 현재 페이지 순서 지정
  page: number;
  children: ReactNode;
};

export function DashboardShell({ title, page, children }: DashboardShellProps) {
  return (
    // 1920×1080 기준 고정 크기로 두고 큰 화면에서는 패널을 늘려 공간 채움
    <div
      className="relative flex size-full items-start overflow-hidden"
      style={{ backgroundImage: "var(--gradient-page)" }}
    >
      <div className="absolute left-[300px] top-[-320px] h-[620px] w-[1000px]">
        <div className="absolute inset-[-38.71%_-24%]">
          <img alt="" className="block size-full max-w-none" src="/figma/bg/ambient-cyan.svg" />
        </div>
      </div>
      <div className="absolute left-[1100px] top-[640px] h-[700px] w-[1000px]">
        <div className="absolute inset-[-37.14%_-26%]">
          <img alt="" className="block size-full max-w-none" src="/figma/bg/ambient-violet.svg" />
        </div>
      </div>
      <SideRail />
      <main className="relative flex h-full min-w-px flex-[1_0_0] flex-col items-start gap-4 px-6 pb-6 pt-5">
        <header className="relative w-full shrink-0">
          <StatusStrip system="LINE 04 · CBM 220 MONITORING SYSTEM" title={title} alerts={4} />
        </header>
        <PageNav page={page} />
        {children}
      </main>
    </div>
  );
}
