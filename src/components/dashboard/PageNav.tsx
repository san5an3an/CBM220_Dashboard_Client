"use client";

import { useRouter } from "next/navigation";
import { SessionBar } from "@/components/navigation";
import { Spacer } from "@/components/ui/Panel";
import { replayArrival } from "./consist/arrival";
import { Tabs } from "./Tabs";

// 페이지 탭 이름과 주소 지정, 화면이 없는 탭은 주소를 비워 둠
const PAGES: { label: string; href?: string }[] = [
  { label: "플릿 개요", href: "/" },
  { label: "이상 타임라인", href: "/timeline" },
  { label: "알람/이벤트" },
  { label: "조치 관리" },
];

export function PageNav({ page }: { page: number }) {
  const router = useRouter();
  return (
    <div className="relative flex w-full shrink-0 items-center gap-4">
      <Tabs
        items={PAGES.map((p) => p.label)}
        initial={page}
        onChange={(i) => {
          const href = PAGES[i].href;
          if (!href) return false;
          if (i !== page) router.push(href);
        }}
      />
      <Spacer />
      <SessionBar onRefresh={replayArrival} />
    </div>
  );
}
