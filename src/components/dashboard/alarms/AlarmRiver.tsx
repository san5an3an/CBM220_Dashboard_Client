"use client";

import type { DateRange } from "@/components/controls";
import { FaultBubble } from "@/components/diagnostics";
import { inDateTimeRange } from "../DateRangeField";
import { GradeChip } from "@/components/foundations";
import { GRADE, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { BUBBLES, DAYS, GRADE_LABEL, GRADES } from "./data";

// Figma 강 차트의 날짜 눈금 시작·간격, 레인 위치·높이 지정
const H = 312;
const PLOT_X = 150;
const DAY_W = (1708 - PLOT_X) / 6;
const LANE_X = 148;
const LANE_TOP = [14, 72, 130, 188, 246];
const LANE_H = 40;
// 선택 고리가 버블보다 커지는 폭과 말풍선이 버블 가운데에서 떨어지는 거리 지정
const RING_PAD = 14;
const TIP_DX = 40;
const TIP_DY = 22;

type AlarmRiverProps = {
  // 커서를 둘 버블 순번 지정 (없으면 커서 숨김)
  active: number | null;
  onHover: (bubble: number) => void;
  onSelect: (bubble: number) => void;
  // 조회 날짜 기간·시간대 지정 (밖의 버블은 흐리게)
  range: DateRange;
};

// 7일간 알람을 등급별 레인 위 건수 크기 버블로 흘려 보여주고 고른 버블에 시각 커서·설명 표시
export function AlarmRiver({ active, onHover, onSelect, range }: AlarmRiverProps) {
  const inRange = (b: (typeof BUBBLES)[number]) => !b.at || inDateTimeRange(range, b.at);
  const current = active === null ? undefined : BUBBLES[active];
  const ring = current ? current.size + RING_PAD : 0;
  return (
    <div className="relative w-full shrink-0" style={{ height: H }}>
      {DAYS.map((d, i) => (
        <div key={d} className="absolute top-2.5 h-[276px] w-px bg-(--chart-grid)" style={{ left: PLOT_X + i * DAY_W }} />
      ))}
      {GRADES.map((g, i) => {
        const token = GRADE[g];
        return (
          <div key={g} className="absolute left-0 flex items-center" style={{ top: LANE_TOP[i], height: LANE_H, width: 1708 }}>
            <div className="flex shrink-0 items-center gap-2" style={{ width: LANE_X }}>
              <GradeChip grade={g} />
              <p className={`font-semibold whitespace-nowrap text-(--text-secondary) ${TEXT.labelLarge}`}>{GRADE_LABEL[g]}</p>
            </div>
            <div
              className="relative h-10 min-w-px flex-1 rounded-[14px] border"
              style={{ borderColor: tint(token, 14), backgroundImage: `linear-gradient(to right, ${tint(token, 8)}, ${tint(token, 1)})` }}
            >
              <div className="absolute top-[19.5px] right-3 left-3 h-px" style={{ background: tint(token, 25) }} />
            </div>
          </div>
        );
      })}
      <div className={`absolute top-[296px] flex justify-between font-medium text-(--text-tertiary) ${TEXT.labelSmall}`} style={{ left: PLOT_X + 1, width: 1558 }}>
        {DAYS.map((d) => (
          <p key={d}>{d}</p>
        ))}
      </div>
      {current && (
        <>
          {/* 고른 버블 시점에 세로 커서와 선택 고리를 옮겨 표시 */}
          <div
            aria-hidden
            className="absolute top-1.5 h-[298px] w-0.5 transition-[left] duration-300"
            style={{
              left: current.x - 1,
              background: `linear-gradient(to bottom, transparent, ${tint("--accent-cyan", 80)}, transparent)`,
              boxShadow: `0 0 8px 0 ${tint("--accent-cyan", 80)}`,
            }}
          />
          <div
            aria-hidden
            className="absolute animate-[glow-breathe_2s_ease-in-out_infinite] rounded-full border-2 border-(--accent-cyan) transition-all duration-300"
            style={{ left: current.x - ring / 2, top: current.y - ring / 2, width: ring, height: ring, boxShadow: `0 0 14px 0 ${tint("--accent-cyan", 60)}` }}
          />
        </>
      )}
      {BUBBLES.map((b, i) => (
        <button
          disabled={!inRange(b)}
          key={`${b.grade}-${b.time}`}
          type="button"
          aria-label={`${b.time} ${b.title} ${b.count}건`}
          aria-pressed={i === active}
          // 마우스를 올린 버블에 커서를 두고 떼어도 그 자리에 유지
          onMouseEnter={() => onHover(i)}
          onFocus={() => onHover(i)}
          onClick={() => onSelect(i)}
          className="absolute cursor-pointer rounded-full transition-[transform,opacity] duration-300 hover:scale-110 disabled:pointer-events-none disabled:opacity-20"
          style={{ left: b.x - b.size / 2, top: b.y - b.size / 2, animation: `pop-in 400ms ease-out ${i * 40}ms both` }}
        >
          <FaultBubble grade={b.grade} count={b.count} size={b.size} phase={i * 0.37} />
        </button>
      ))}
      {current && (
        <div
          className="pointer-events-none absolute z-10 flex flex-col gap-0.5 rounded-[12px] border border-(--accent-cyan)/60 bg-linear-to-b from-(--navy-650) to-(--navy-800) px-3 py-2 whitespace-nowrap transition-[left,top] duration-300"
          style={{ left: Math.min(current.x + TIP_DX, 1734 - 220), top: Math.max(0, current.y - TIP_DY), boxShadow: `0 6px 18px 0 ${tint("--accent-cyan", 35)}` }}
        >
          <p className={`font-semibold text-(--accent-cyan) ${TEXT.labelSmall}`}>
            {current.time} · {current.count}건
          </p>
          <p className={`font-medium text-(--text-primary) ${TEXT.bodyMedium}`}>{current.title}</p>
        </div>
      )}
    </div>
  );
}
