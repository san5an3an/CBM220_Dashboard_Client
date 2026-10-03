import { ConsistPanel } from "./ConsistPanel";
import { DashboardShell } from "./DashboardShell";
import { RiskRankingPanel } from "./RiskRankingPanel";
import { TrendPanel } from "./TrendPanel";

export function FleetOverview() {
  return (
    <DashboardShell title="플릿 개요" page={0}>
      <ConsistPanel />
      <div className="relative flex h-[210px] w-full shrink-0 items-start gap-4">
        <TrendPanel />
        <RiskRankingPanel />
      </div>
    </DashboardShell>
  );
}
