"use client";

import { SessionBar } from "@/components/navigation";
import { Spacer } from "@/components/ui/Panel";
import { replayArrival } from "./consist/arrival";
import { Tabs } from "./Tabs";

const PAGES = ["플릿 개요", "이상 타임라인", "알람/이벤트", "조치 관리"];

export function PageNav() {
  return (
    <div className="relative flex w-full shrink-0 items-center gap-4">
      <Tabs items={PAGES} />
      <Spacer />
      <SessionBar onRefresh={replayArrival} />
    </div>
  );
}
