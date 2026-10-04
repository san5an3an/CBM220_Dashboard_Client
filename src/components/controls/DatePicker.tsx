"use client";

import { ChevronLeft, ChevronRight, Clock, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { TEXT } from "@/lib/typography";
import { Button } from "./Button";
import { CalendarLegendItem } from "./CalendarLegendItem";
import { POP_IN, POPOVER } from "./popover";
import { SegmentItem } from "./Segmented";
import { TimePicker } from "./TimePicker";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const PRESET_DAYS = [7, 14, 30];
const DAY = 86_400_000;

const pad = (n: number) => String(n).padStart(2, "0");
// 날짜를 연-월-일 문자열 키로 변환
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
const mmdd = (d: Date) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export type DateRange = { start: Date; end: Date; startTime: string; endTime: string };

// 달의 첫 주 일요일부터 마지막 주 토요일까지 날짜 목록을 주 단위로 생성
function monthWeeks(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const start = addDays(first, -first.getDay());
  const count = Math.ceil((first.getDay() + last.getDate()) / 7);
  return Array.from({ length: count }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
}

type DatePickerProps = {
  today: Date;
  initial: DateRange;
  // 데이터가 없는 날짜를 연-월-일 문자열로 지정
  missing?: string[];
  onApply: (range: DateRange) => void;
  onCancel: () => void;
};

// 기간을 두 번 눌러 고르고 데이터 없는 날·오늘 이후 날짜를 구분해 보여주는 달력 팝오버 표시
export function DatePicker({ today, initial, missing = [], onApply, onCancel }: DatePickerProps) {
  const todayStart = dayStart(today);
  const [month, setMonth] = useState(new Date(initial.end.getFullYear(), initial.end.getMonth(), 1));
  const [start, setStart] = useState<Date>(dayStart(initial.start));
  const [end, setEnd] = useState<Date | null>(dayStart(initial.end));
  const [hover, setHover] = useState<Date | null>(null);
  const [times, setTimes] = useState({ start: initial.startTime, end: initial.endTime });
  const [editing, setEditing] = useState<"start" | "end" | null>(null);
  const missingSet = useMemo(() => new Set(missing), [missing]);
  const weeks = useMemo(() => monthWeeks(month), [month]);

  // 끝 날짜를 고르기 전에는 마우스 위치까지 기간을 미리 칠하도록 계산
  const rangeEnd = end ?? hover ?? start;
  const [lo, hi] = start <= rangeEnd ? [start, rangeEnd] : [rangeEnd, start];
  const days = Math.round((hi.getTime() - lo.getTime()) / DAY) + 1;
  const missingInRange = missing.filter((k) => k >= keyOf(lo) && k <= keyOf(hi));

  const pick = (d: Date) => {
    if (end || d < start) {
      setStart(d);
      setEnd(null);
    } else {
      setEnd(d);
    }
  };
  const preset = (n: number) => {
    const last = addDays(todayStart, -1);
    setStart(addDays(last, -(n - 1)));
    setEnd(last);
    setMonth(new Date(last.getFullYear(), last.getMonth(), 1));
  };
  const presetActive = (n: number) => end && keyOf(end) === keyOf(addDays(todayStart, -1)) && days === n;
  const shiftMonth = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div role="dialog" aria-label="기간 선택" className={`relative flex w-[372px] flex-col items-start gap-3 rounded-[18px] p-4 ${POPOVER} ${POP_IN}`}>
      <div className="flex w-full items-center gap-2">
        <button type="button" aria-label="이전 달" onClick={() => shiftMonth(-1)} className="cursor-pointer rounded-md p-1 text-(--text-secondary) hover:bg-(--neutral-hover) hover:text-(--text-primary)">
          <ChevronLeft size={14} />
        </button>
        <span className="flex-1" />
        <span className={`font-bold text-(--text-primary) ${TEXT.titleSmall}`}>
          {month.getFullYear()}년 {month.getMonth() + 1}월
        </span>
        <span className="flex-1" />
        <button type="button" aria-label="다음 달" onClick={() => shiftMonth(1)} className="cursor-pointer rounded-md p-1 text-(--text-secondary) hover:bg-(--neutral-hover) hover:text-(--text-primary)">
          <ChevronRight size={14} />
        </button>
      </div>

      <div key={keyOf(month)} role="grid" className="flex w-full animate-[fade-up_220ms_ease-out] flex-col gap-1" onMouseLeave={() => setHover(null)}>
        <div role="row" className="flex w-full gap-1">
          {WEEKDAYS.map((w, i) => (
            <span key={w} role="columnheader" className={`flex h-7 flex-1 items-center justify-center font-semibold ${TEXT.labelLarge} ${i === 0 ? "text-(--status-danger)" : "text-(--text-tertiary)"}`}>
              {w}
            </span>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={keyOf(week[0])} role="row" className="flex h-[46px] w-full gap-1">
            {week.map((d) => {
              const k = keyOf(d);
              const outside = d.getMonth() !== month.getMonth();
              const future = d > todayStart;
              const edge = k === keyOf(lo) || k === keyOf(hi);
              const inside = d > lo && d < hi;
              const isToday = k === keyOf(todayStart);
              const isMissing = missingSet.has(k);
              const dot = isToday ? "bg-(--accent-cyan)" : isMissing ? "bg-(--status-warning)" : "";
              return (
                <button
                  key={k}
                  type="button"
                  role="gridcell"
                  aria-selected={edge || inside}
                  disabled={future}
                  onClick={() => pick(d)}
                  onMouseEnter={() => !end && setHover(d)}
                  className={`flex h-[46px] min-w-px flex-1 flex-col items-center justify-center gap-[5px] transition-[background-color,box-shadow] duration-150 ${TEXT.bodyMedium} ${
                    edge
                      ? "rounded-[10px] bg-(image:--gradient-accent) font-medium text-(--text-on-accent) shadow-[0px_0px_7px_0px_color-mix(in_srgb,var(--accent-cyan)_50%,transparent)]"
                      : inside
                        ? "rounded-[6px] bg-(--accent-cyan)/12"
                        : isToday
                          ? "rounded-[10px] border border-(--accent-cyan)/50"
                          : "rounded-[10px] hover:bg-(--neutral-hover)"
                  } ${
                    edge ? "" : future || outside ? "text-(--text-tertiary)" : isMissing ? "text-(--status-warning)" : "text-(--text-primary)"
                  } ${outside ? "opacity-40" : ""} ${future ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span>{d.getDate()}</span>
                  {dot && !edge && <span className={`size-1 rounded-full ${dot}`} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3">
        <span className={`flex items-center gap-[3px] py-px font-medium text-(--accent-cyan) ${TEXT.labelSmall}`}>
          <span className="size-1 rounded-full bg-(--accent-cyan)" />
          오늘
        </span>
        <span className={`flex items-center gap-[3px] py-px font-medium text-(--status-warning) ${TEXT.labelSmall}`}>
          <span className="size-1 rounded-full bg-(--status-warning)" />
          데이터 없음
        </span>
        <CalendarLegendItem type="unavailable" label="선택 불가" />
      </div>

      {missingInRange.length > 0 && (
        <div className="flex w-full animate-[fade-up_220ms_ease-out] items-center gap-2 rounded-[10px] border border-(--status-warning)/25 bg-(--status-warning)/8 px-3 py-2.5">
          <TriangleAlert className="shrink-0 text-(--status-warning)" size={14} />
          <p className={`min-w-px flex-1 font-medium text-(--status-warning) ${TEXT.labelSmall}`}>
            {missingInRange.map((k) => `${Number(k.slice(8))}일`).join(", ")} 데이터 없음 · 학습에서 자동 제외 (실제 {days - missingInRange.length}일)
          </p>
        </div>
      )}

      <div className="flex w-full items-start gap-1.5">
        {PRESET_DAYS.map((n, i) => (
          <SegmentItem key={n} grow label={i === 0 ? `최근 ${n}일` : `${n}일`} active={!!presetActive(n)} onClick={() => preset(n)} />
        ))}
      </div>

      <div className="flex w-full items-start gap-2">
        {(["start", "end"] as const).map((which) => (
          <button
            key={which}
            type="button"
            aria-label={which === "start" ? "시작 시간" : "종료 시간"}
            onClick={() => setEditing(which)}
            className={`flex h-10 min-w-px flex-1 cursor-pointer items-center gap-2 rounded-[12px] border bg-(--neutral-input) px-3 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.5)] ${
              editing === which ? "border-(--border-focus)/90" : "border-(--button-secondary-border)"
            }`}
          >
            <span className={`flex-1 text-left text-(--text-primary) tabular-nums ${TEXT.bodyMedium}`}>{times[which]}</span>
            <Clock className="text-(--text-tertiary)" size={18} absoluteStrokeWidth />
          </button>
        ))}
      </div>

      <div className="flex w-full items-center gap-2">
        <span className={`font-medium whitespace-nowrap text-(--accent-cyan) ${TEXT.labelMedium}`}>
          {days}일 · {mmdd(lo)} ~ {mmdd(hi)}
        </span>
        <span className="flex-1" />
        <Button kind="ghost" label="취소" onClick={onCancel} />
        <Button kind="primary" label="적용" disabled={!end} onClick={() => end && onApply({ start: lo, end: hi, startTime: times.start, endTime: times.end })} />
      </div>

      {/* 화면 끝에서 잘리지 않도록 시간 선택 창을 달력 위에 덮어 가운데 표시 */}
      {editing && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded-[inherit]">
          <div aria-hidden onClick={() => setEditing(null)} className="absolute inset-0 animate-[fade-in_160ms_ease-out] rounded-[inherit] bg-(--navy-950)/55" />
          <div className="relative">
            <TimePicker
              title={editing === "start" ? "시작 시간" : "종료 시간"}
              value={times[editing]}
              onCancel={() => setEditing(null)}
              onApply={(v) => {
                setTimes((t) => ({ ...t, [editing]: v }));
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
