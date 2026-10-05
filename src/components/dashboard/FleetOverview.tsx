/* eslint-disable @next/next/no-img-element */
import { StatusStrip } from "@/components/navigation";
import { ConsistPanel } from "./ConsistPanel";
import { PageNav } from "./PageNav";
import { RiskRankingPanel } from "./RiskRankingPanel";
import { SideRail } from "./SideRail";
import { TrendPanel } from "./TrendPanel";

export function FleetOverview() {
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
          <StatusStrip system="LINE 04 · CBM 220 MONITORING SYSTEM" title="플릿 개요" alerts={4} />
        </header>
        <PageNav />
        <ConsistPanel />
        <div className="relative flex h-[210px] w-full shrink-0 items-start gap-4">
          <TrendPanel />
          <RiskRankingPanel />
        </div>
      </main>
    </div>
  );
}
