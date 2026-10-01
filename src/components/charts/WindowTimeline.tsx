"use client";

import { useValueTip, ValueTip } from "@/components/ui/ValueTip";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

// Figma 레인 폭·높이·간격과 시간 범위(12:00~15:00, 분) 지정
const LANE_W = 404.5;
const LANE_H = 10;
const LANE_GAP = 26;
const SPAN = 180;

export type WindowSegment = { lane: number; from: number; to: number; level: "warn" | "fault" };

const DEFAULT_SEGMENTS: WindowSegment[] = [
  { lane: 0, from: 14.4, to: 36, level: "warn" },
  { lane: 0, from: 39.6, to: 82.8, level: "fault" },
  { lane: 0, from: 109.8, to: 118.8, level: "warn" },
  { lane: 1, from: 45, to: 72, level: "fault" },
  { lane: 1, from: 126, to: 133.2, level: "warn" },
  { lane: 2, from: 54, to: 61.2, level: "warn" },
];

type WindowTimelineProps = {
  segments?: WindowSegment[];
  lanes?: number;
  // 시작 시각(시) 지정
  startHour?: number;
  // 레인별 모델 이름 지정
  laneNames?: string[];
};

// 분을 시:분 문구로 변환
const hm = (startHour: number, m: number) => `${String(startHour + Math.floor(m / 60)).padStart(2, "0")}:${String(Math.round(m) % 60).padStart(2, "0")}`;

// 모델별 이상 발생 구간을 레인 위 주의·위험 막대로 표시
export function WindowTimeline({ segments = DEFAULT_SEGMENTS, lanes = 3, startHour = 12, laneNames = ["SVM", "IF", "VAE"] }: WindowTimelineProps) {
  const { tip, track, show, hide } = useValueTip<number>();
  const x = (m: number) => (m / SPAN) * LANE_W;
  const ticks = Array.from({ length: 7 }, (_, i) => i * 30);
  return (
    <div className="relative w-[412.5px]" style={{ height: 6 + LANE_GAP * (lanes - 1) + LANE_H + 28 }} onPointerMove={track} onPointerLeave={hide}>
      {Array.from({ length: lanes }, (_, i) => (
        <div key={i} className="absolute left-0 rounded-[5px] bg-(--white)/5" style={{ top: 6 + i * LANE_GAP, width: LANE_W, height: LANE_H }} />
      ))}
      {segments.map((s, i) => {
        const token = s.level === "fault" ? "--status-danger" : "--status-warning";
        return (
          <div
            key={i}
            className="absolute origin-left animate-[grow-x_700ms_ease-out_both] rounded-[5px]"
            style={{
              left: x(s.from),
              top: 6 + s.lane * LANE_GAP,
              width: x(s.to - s.from),
              height: LANE_H,
              animationDelay: `${i * 90}ms`,
              backgroundImage: `linear-gradient(to right, var(${token}), ${tint(token, 60)})`,
              boxShadow: `0 0 10px 0 ${tint(token, 60)}`,
            }}
            onPointerEnter={(e) => show(i, e)}
            onPointerLeave={hide}
          />
        );
      })}
      {ticks.map((m, i) => (
        <p
          key={m}
          className={`absolute font-medium text-(--text-tertiary) ${TEXT.labelLarge} ${i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`}
          style={{ left: x(m), top: 6 + LANE_GAP * (lanes - 1) + LANE_H + 12 }}
        >
          {hm(startHour, m)}
        </p>
      ))}
      {tip && (
        <ValueTip
          at={tip}
          label={`${laneNames[segments[tip.item].lane] ?? `레인 ${segments[tip.item].lane + 1}`} · ${segments[tip.item].level === "fault" ? "위험" : "주의"}`}
          rows={[
            { name: "구간", value: `${hm(startHour, segments[tip.item].from)} ~ ${hm(startHour, segments[tip.item].to)}`, color: `var(${segments[tip.item].level === "fault" ? "--status-danger" : "--status-warning"})` },
            { name: "길이", value: Math.round(segments[tip.item].to - segments[tip.item].from), unit: "분" },
          ]}
        />
      )}
    </div>
  );
}
