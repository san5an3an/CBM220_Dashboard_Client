"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "../DashboardShell";
import { DailyDetailPanel } from "./DailyDetailPanel";
import { DailyTrendPanel, INITIAL_FILTER, type TimelineFilter } from "./DailyTrendPanel";
import { dailyRecords, RANGES } from "./data";

export function AnomalyTimeline() {
  const [filter, setFilter] = useState<TimelineFilter>(INITIAL_FILTER);
  // 고른 기간만큼 최근 기록만 남기기
  const records = useMemo(
    () => dailyRecords(filter.device, filter.model).slice(-RANGES[filter.range].days),
    [filter],
  );
  const latestFirst = useMemo(() => [...records].reverse(), [records]);

  return (
    <DashboardShell title="이상 타임라인" page={1}>
      <div className="relative flex min-h-px w-full flex-[1_0_0] flex-col gap-4">
        <DailyTrendPanel key={JSON.stringify(filter)} records={records} filter={filter} onApply={setFilter} />
        <DailyDetailPanel key={`detail-${JSON.stringify(filter)}`} records={latestFirst} rangeLabel={RANGES[filter.range].label} />
      </div>
    </DashboardShell>
  );
}
