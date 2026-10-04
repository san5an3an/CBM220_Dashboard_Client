"use client";

import { useMemo, useState } from "react";
import type { Grade } from "@/lib/tone";
import { DashboardShell } from "../DashboardShell";
import { inDateTimeRange } from "../DateRangeField";
import { AlarmDetailPanel } from "./AlarmDetailPanel";
import { type AlarmQuery, AlarmFlowPanel, INITIAL_QUERY } from "./AlarmFlowPanel";
import { AlarmWorklistPanel, PAGE_SIZE } from "./AlarmWorklistPanel";
import { type Alarm, ALARMS, DEVICES, GRADES, OPEN_STATUS, STATUS_OPTIONS } from "./data";

// 알람 발생 연-월-일과 시:분:초를 시각으로 변환
const alarmAt = (a: Alarm) =>
  new Date(Number(a.ymd.slice(0, 4)), Number(a.ymd.slice(5, 7)) - 1, Number(a.ymd.slice(8, 10)), Number(a.time.slice(0, 2)), Number(a.time.slice(3, 5)), Number(a.time.slice(6, 8)));

// 상태·장치·검색어와 날짜 기간·매일 시간대 조건에 맞는 알람만 남겨 최신 발생 순으로 정렬
function filterAlarms(alarms: Alarm[], q: AlarmQuery) {
  const keyword = q.keyword.trim().toLowerCase();
  return alarms.filter(
    (a) =>
      (q.status === 0 || a.status === STATUS_OPTIONS[q.status]) &&
      (q.device === 0 || a.device === DEVICES[q.device]) &&
      (!keyword || `${a.device} ${a.model}`.toLowerCase().includes(keyword)) &&
      inDateTimeRange(q.range, alarmAt(a)),
  ).sort((a, b) => alarmAt(b).getTime() - alarmAt(a).getTime());
}

export function AlarmEvents() {
  const [alarms, setAlarms] = useState(ALARMS);
  const [query, setQuery] = useState<AlarmQuery>(INITIAL_QUERY);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [page, setPage] = useState(0);
  // 처음에는 아무 알람도 고르지 않은 상태로 시작
  const [selected, setSelected] = useState<number | null>(null);
  const [bubble, setBubble] = useState<number | null>(null);

  const searched = useMemo(() => filterAlarms(alarms, query), [alarms, query]);
  const list = useMemo(() => (grade === null ? searched : searched.filter((a) => a.grade === grade)), [searched, grade]);
  const counts = useMemo(
    () => Object.fromEntries(GRADES.map((g) => [g, searched.filter((a) => a.grade === g).length])) as Record<Grade, number>,
    [searched],
  );
  const current = alarms.find((a) => a.no === selected) ?? null;
  const unresolved = alarms.filter((a) => OPEN_STATUS.includes(a.status)).length;

  // 알람을 고르면 그 알람이 속한 버블로 커서를 옮기고 목록 쪽수도 맞춤
  const selectAlarm = (no: number) => {
    const idx = list.findIndex((a) => a.no === no);
    setSelected(no);
    setBubble(list[idx]?.bubble ?? null);
    if (idx >= 0) setPage(Math.floor(idx / PAGE_SIZE));
  };

  // 버블을 누르면 그 버블에 속한 첫 알람을 고르고 없으면 선택 해제
  const selectBubble = (i: number) => {
    const alarm = list.find((a) => a.bubble === i);
    setSelected(alarm?.no ?? null);
    setBubble(i);
    if (alarm) setPage(Math.floor(list.indexOf(alarm) / PAGE_SIZE));
  };

  const resetView = () => {
    setPage(0);
    setSelected(null);
    setBubble(null);
  };

  return (
    <DashboardShell title="알람/이벤트" page={2} alert={{ label: "미처리 알람", count: unresolved }}>
      <AlarmFlowPanel
        query={query}
        onSearch={(q) => {
          setQuery(q);
          resetView();
        }}
        grade={grade}
        onGrade={(g) => {
          setGrade(g);
          resetView();
        }}
        counts={counts}
        total={searched.length}
        bubble={bubble}
        onHoverBubble={setBubble}
        onSelectBubble={selectBubble}
      />
      <div className="relative flex min-h-px w-full flex-[1_0_0] items-start gap-4">
        <AlarmWorklistPanel alarms={list} page={page} onPage={setPage} selected={selected} onSelect={selectAlarm} />
        <AlarmDetailPanel
          alarm={current}
          onResolve={(no) => setAlarms((prev) => prev.map((a) => (a.no === no ? { ...a, status: "완료" } : a)))}
        />
      </div>
    </DashboardShell>
  );
}
