"use client";

import { CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { ListItem } from "@/components/cards";
import { Button, FormField, InputField } from "@/components/controls";
import { Dialog } from "@/components/navigation";
import { DashboardShell } from "../DashboardShell";
import { inDateTimeRange } from "../DateRangeField";
import { type ActionDraft, ActionDetailModal } from "./ActionDetailModal";
import { type ActionQuery, ActionPipelinePanel, INITIAL_QUERY } from "./ActionPipelinePanel";
import { ActionWorklistPanel } from "./ActionWorklistPanel";
import { ChronicSensorPanel } from "./ChronicSensorPanel";
import { ACTION_OPTIONS, ACTIONS, type ActionItem, atOf, DEVICES, INSPECT_OPTIONS } from "./data";

// 장치·조치·검수와 날짜 기간·매일 시간대 조건에 맞는 기록만 남겨 최신 발생 순으로 정렬
function filterActions(items: ActionItem[], q: ActionQuery) {
  return items
    .filter(
      (a) =>
        (q.device === 0 || a.device === DEVICES[q.device]) &&
        (q.action === 0 || a.action === ACTION_OPTIONS[q.action]) &&
        (q.inspect === 0 || a.inspect === INSPECT_OPTIONS[q.inspect]) &&
        inDateTimeRange(q.range, atOf(a)),
    )
    .sort((a, b) => atOf(b).getTime() - atOf(a).getTime());
}

// 탭을 오가도 조치완료 처리한 기록이 남도록 화면 밖에 목록 보관
let savedActions = ACTIONS;

export function ActionManagement() {
  const [items, setItemsState] = useState(() => savedActions);
  const setItems = (next: (prev: ActionItem[]) => ActionItem[]) =>
    setItemsState((prev) => {
      savedActions = next(prev);
      return savedActions;
    });
  const [query, setQuery] = useState<ActionQuery>(INITIAL_QUERY);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  // 조치완료 확인 창에 올릴 대상 지정 (없으면 닫힘)
  const [confirm, setConfirm] = useState<number[] | null>(null);
  // 일괄 조치완료 때 모든 대상에 함께 남길 조치 내용 지정
  const [bulkNote, setBulkNote] = useState("");
  // 상세 시트를 열 때마다 양식을 새로 채우도록 순번 증가
  const [detail, setDetail] = useState<{ open: boolean; session: number; id: number | null }>({ open: false, session: 0, id: null });

  const list = useMemo(() => filterActions(items, query), [items, query]);
  const counts = {
    total: list.length,
    open: list.filter((a) => a.action === "미조치").length,
    done: list.filter((a) => a.action === "완료").length,
    uninspected: list.filter((a) => a.inspect === "미검수").length,
  };
  const open = items.filter((a) => a.action === "미조치").length;

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // 확인한 기록의 조치를 완료로 바꾸고 공통 조치 내용이 있으면 함께 남긴 뒤 선택 해제
  const markDone = () => {
    const ids = new Set(confirm ?? []);
    const note = bulkNote.trim();
    setItems((prev) => prev.map((a) => (ids.has(a.id) ? { ...a, action: "완료", ...(note ? { note } : {}) } : a)));
    setSelected(new Set());
    setConfirm(null);
  };

  const targets = items.filter((a) => confirm?.includes(a.id));
  const detailItem = items.find((a) => a.id === detail.id);

  // 입력한 조치를 기록에 반영하고 새로 조치완료가 되면 맨 위 이력에 오늘 날짜로 추가
  const saveDetail = (d: ActionDraft) => {
    const now = new Date();
    const today = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setItems((prev) =>
      prev.map((a) =>
        a.id === detail.id
          ? {
              ...a,
              ...d,
              history: a.action === "미조치" && d.action === "완료" ? [{ date: today, owner: d.owner, what: "조치" }, ...a.history].slice(0, 3) : a.history,
            }
          : a,
      ),
    );
    setDetail((s) => ({ ...s, open: false }));
  };

  return (
    <DashboardShell title="조치 관리" page={3} alert={{ label: "조치 대기", count: open }}>
      <ActionPipelinePanel
        query={query}
        onSearch={(q) => {
          setQuery(q);
          setPage(0);
          setSelected(new Set());
        }}
        counts={counts}
      />
      <div className="relative flex min-h-px w-full flex-[1_0_0] items-start gap-4">
        <ActionWorklistPanel
          items={list}
          page={page}
          onPage={setPage}
          selected={selected}
          onToggle={toggle}
          onProcess={(id) => setDetail((s) => ({ open: true, session: s.session + 1, id }))}
          onBulkDone={() => {
            setBulkNote("");
            setConfirm([...selected]);
          }}
        />
        <ChronicSensorPanel />
      </div>
      <Dialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        tone="success"
        width={560}
        title={`선택한 ${targets.length}건을 조치완료 처리할까요?`}
        description="조치 여부가 ‘완료’로 바뀌고, 검수 대기 목록으로 이동합니다."
        actions={
          <>
            <span className="h-px min-w-px flex-1" />
            <Button kind="ghost" label="취소" onClick={() => setConfirm(null)} />
            <Button kind="success" icon={CheckCheck} label={`${targets.length}건 조치완료`} onClick={markDone} />
          </>
        }
      >
        <div className="flex w-full flex-col gap-3">
          {/* 처리할 기록을 장치·센서와 편성 호차 목록으로 묶고 많으면 안에서 스크롤 */}
          <div className="flex max-h-[15.5rem] w-full flex-col items-start overflow-y-auto rounded-[14px] border border-(--white)/7 bg-(--white)/3 p-4">
            {targets.map((a, i) => (
              <ListItem key={a.id} divider={i > 0} title={`${a.device} · ${a.sensor}`} meta={`${a.formation} · ${a.car}호차`} />
            ))}
          </div>
          <FormField label="공통 조치 내용" width="100%">
            <InputField icon={null} width="100%" maxLength={200} placeholder="모든 대상에 함께 남길 조치 내용" value={bulkNote} onChange={(e) => setBulkNote(e.target.value)} />
          </FormField>
        </div>
      </Dialog>
      {detailItem && (
        <ActionDetailModal key={detail.session} open={detail.open} item={detailItem} onClose={() => setDetail((s) => ({ ...s, open: false }))} onSubmit={saveDetail} />
      )}
    </DashboardShell>
  );
}
