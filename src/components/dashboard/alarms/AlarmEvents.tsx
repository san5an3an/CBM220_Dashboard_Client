"use client";

import { useMemo, useState } from "react";
import type { Grade } from "@/lib/tone";
import { TriangleAlert } from "lucide-react";
import { ListItem } from "@/components/cards";
import { Button } from "@/components/controls";
import { Dialog, DialogEmblem } from "@/components/navigation";
import { DashboardShell } from "../DashboardShell";
import { inDateTimeRange } from "../DateRangeField";
import { AlarmDetailPanel } from "./AlarmDetailPanel";
import { type AlarmProcess, AlarmProcessModal } from "./AlarmProcessModal";
import { type AlarmQuery, AlarmFlowPanel, INITIAL_QUERY } from "./AlarmFlowPanel";
import { type AlarmDraft, AlarmRegisterModal, nowText } from "./AlarmRegisterModal";
import { AlarmWorklistPanel, PAGE_SIZE } from "./AlarmWorklistPanel";
import { type Alarm, ALARMS, alarmTitle, DEVICES, GRADES, OPEN_STATUS, STATUS_OPTIONS } from "./data";

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

// 탭을 오가도 등록·처리한 알람이 남도록 화면 밖에 목록 보관
let savedAlarms = ALARMS;

export function AlarmEvents() {
  const [alarms, setAlarmsState] = useState(() => savedAlarms);
  const setAlarms = (next: Alarm[] | ((prev: Alarm[]) => Alarm[])) =>
    setAlarmsState((prev) => {
      savedAlarms = typeof next === "function" ? next(prev) : next;
      return savedAlarms;
    });
  const [query, setQuery] = useState<AlarmQuery>(INITIAL_QUERY);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [page, setPage] = useState(0);
  // 처음에는 아무 알람도 고르지 않은 상태로 시작
  const [selected, setSelected] = useState<number | null>(null);
  const [bubble, setBubble] = useState<number | null>(null);
  // 수정·삭제하려고 체크한 알람과 삭제 확인 창 열림 지정
  const [checked, setChecked] = useState<Set<number>>(() => new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  // 처리 시트를 열 때마다 양식을 새로 채우도록 순번 증가
  const [processing, setProcessing] = useState<{ open: boolean; session: number; no: number | null }>({ open: false, session: 0, no: null });
  // 등록 시트를 열 때마다 양식을 새로 채우도록 순번 증가
  const [register, setRegister] = useState<{ open: boolean; session: number; editNo: number | null }>({ open: false, session: 0, editNo: null });

  const searched = useMemo(() => filterAlarms(alarms, query), [alarms, query]);
  const list = useMemo(() => (grade === null ? searched : searched.filter((a) => a.grade === grade)), [searched, grade]);
  const counts = useMemo(
    () => Object.fromEntries(GRADES.map((g) => [g, searched.filter((a) => a.grade === g).length])) as Record<Grade, number>,
    [searched],
  );
  const current = alarms.find((a) => a.no === selected) ?? null;
  const processAlarm = alarms.find((a) => a.no === processing.no);
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

  // 입력한 알람을 새 번호로 추가하거나 수정 중인 알람을 바꾸고 바로 선택
  const saveAlarm = (d: AlarmDraft) => {
    const before = alarms.find((a) => a.no === register.editNo);
    const no = before?.no ?? Math.max(...alarms.map((a) => a.no)) + 1;
    const [date, time] = d.at.split(" ");
    const alarm: Alarm = {
      no,
      grade: d.grade,
      device: d.device,
      model: before?.model ?? "수동",
      ratio: Number(d.ratio),
      window: before && before.ratio === Number(d.ratio) ? before.window : Math.round(Number(d.ratio)),
      title: d.title.trim(),
      memo: d.memo,
      status: before?.status ?? "신규",
      owner: d.owner,
      formation: d.formation,
      car: d.car,
      // 날짜·등급이 그대로면 강 차트 버블 연결 유지
      bubble: before && before.ymd === date && before.grade === d.grade ? before.bubble : undefined,
      ymd: date ?? "",
      date: (date ?? "").slice(5),
      time: `${time ?? "00:00"}:${before && before.time.slice(0, 5) === time ? before.time.slice(6) : "00"}`,
    };
    const nextAlarms = before ? alarms.map((a) => (a.no === no ? alarm : a)) : [alarm, ...alarms];
    // 검색 조건을 처음 값으로 되돌리고 새 알람 날짜가 기간 밖이면 그 날까지 기간 넓히기
    const day = alarmAt(alarm);
    const base = INITIAL_QUERY.range;
    const nextQuery: AlarmQuery = {
      ...INITIAL_QUERY,
      range: { ...base, start: day < base.start ? new Date(day.getFullYear(), day.getMonth(), day.getDate()) : base.start, end: day > base.end ? new Date(day.getFullYear(), day.getMonth(), day.getDate()) : base.end },
    };
    // 최신 순 목록에서 새 알람이 들어간 쪽으로 이동
    const idx = filterAlarms(nextAlarms, nextQuery).findIndex((a) => a.no === no);
    setAlarms(nextAlarms);
    setChecked(new Set());
    setRegister((r) => ({ ...r, open: false }));
    setGrade(null);
    setQuery(nextQuery);
    setPage(Math.max(0, Math.floor(idx / PAGE_SIZE)));
    setSelected(no);
    setBubble(null);
  };

  const toggleCheck = (no: number, on: boolean) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (on) next.add(no);
      else next.delete(no);
      return next;
    });

  // 처리 입력을 알람에 반영하고 이번 단계에 바뀐 때와 담당 기록
  const saveProcess = (p: AlarmProcess) => {
    const now = nowText().slice(5);
    setAlarms((prev) =>
      prev.map((a) =>
        a.no === processing.no
          ? { ...a, status: p.status, owner: p.owner, note: p.note, doneAt: p.doneAt, steps: { ...a.steps, [p.status]: `${p.status === "완료" ? p.doneAt.slice(5) : now} · ${p.owner}` } }
          : a,
      ),
    );
    setProcessing((s) => ({ ...s, open: false }));
  };

  // 처리 시트에서 지우기를 누르면 그 알람만 체크해 삭제 확인 창 열기
  const deleteFromProcess = () => {
    if (processing.no === null) return;
    setChecked(new Set([processing.no]));
    setProcessing((s) => ({ ...s, open: false }));
    setConfirmDelete(true);
  };

  // 이 쪽 줄을 한꺼번에 체크하거나 해제
  const checkAll = (nos: number[], on: boolean) =>
    setChecked((prev) => {
      const next = new Set(prev);
      for (const no of nos) {
        if (on) next.add(no);
        else next.delete(no);
      }
      return next;
    });

  // 체크한 알람을 목록에서 지우고 선택·쪽수 정리
  const deleteChecked = () => {
    const rest = alarms.filter((a) => !checked.has(a.no));
    setAlarms(rest);
    if (selected !== null && checked.has(selected)) setSelected(null);
    const remaining = filterAlarms(rest, query).filter((a) => grade === null || a.grade === grade).length;
    setPage((p) => Math.min(p, Math.max(0, Math.ceil(remaining / PAGE_SIZE) - 1)));
    setChecked(new Set());
    setConfirmDelete(false);
  };

  // 조건이 바뀌면 안 보이게 된 체크가 남지 않도록 체크도 해제
  const resetView = () => {
    setChecked(new Set());
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
        onRegister={() => setRegister((r) => ({ open: true, session: r.session + 1, editNo: null }))}
      />
      <div className="relative flex min-h-px w-full flex-[1_0_0] items-start gap-4">
        <AlarmWorklistPanel
          alarms={list}
          page={page}
          onPage={setPage}
          selected={selected}
          onSelect={selectAlarm}
          checked={checked}
          onCheck={toggleCheck}
          onCheckAll={checkAll}
          onDelete={() => setConfirmDelete(true)}
          onEdit={() => setRegister((r) => ({ open: true, session: r.session + 1, editNo: [...checked][0] }))}
        />
        <AlarmDetailPanel
          alarm={current}
          onProcess={(no) => setProcessing((s) => ({ open: true, session: s.session + 1, no }))}
        />
      </div>
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        visual={<DialogEmblem tone="error" icon={TriangleAlert} />}
        title={`알람 ${checked.size}건을 삭제할까요?`}
        description={"삭제한 알람은 복구할 수 없으며,\n연결된 처리 이력도 함께 삭제됩니다."}
        actions={
          <>
            <span className="h-px min-w-px flex-1" />
            <Button kind="ghost" label="취소" onClick={() => setConfirmDelete(false)} />
            <Button kind="danger" label={`${checked.size}건 삭제`} onClick={deleteChecked} />
          </>
        }
      >
        {/* 지울 알람을 등급·제목·편성 호차 목록으로 묶고 많으면 안에서 스크롤 */}
        <div className="flex max-h-[15.5rem] w-full flex-col items-start overflow-y-auto rounded-[14px] border border-(--white)/7 bg-(--white)/3 p-4">
          {alarms
            .filter((a) => checked.has(a.no))
            .map((a, i) => (
              <ListItem key={a.no} divider={i > 0} grade={a.grade} title={alarmTitle(a)} meta={`${a.formation} · ${a.car}호차`} />
            ))}
        </div>
      </Dialog>
      {processAlarm && (
        <AlarmProcessModal
          key={processing.session}
          open={processing.open}
          alarm={processAlarm}
          onClose={() => setProcessing((s) => ({ ...s, open: false }))}
          onSubmit={saveProcess}
          onDelete={deleteFromProcess}
        />
      )}
      <AlarmRegisterModal
        key={register.session}
        open={register.open}
        base={current ?? alarms[0]}
        editing={alarms.find((a) => a.no === register.editNo)}
        onClose={() => setRegister((r) => ({ ...r, open: false }))}
        onSubmit={saveAlarm}
      />
    </DashboardShell>
  );
}
