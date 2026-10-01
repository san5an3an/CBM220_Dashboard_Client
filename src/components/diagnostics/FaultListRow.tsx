"use client";

import { GradeChip } from "@/components/foundations/GradeChip";
import { type Grade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

export type FaultRecord = {
  grade: Grade;
  title: string;
  desc: string;
  train: string;
  device: string;
  station: string;
  dist: string;
  time: string;
  clear: string;
};

export const DEFAULT_FAULT: FaultRecord = {
  grade: "A",
  title: "BECU-PB not showing as applying",
  desc: "스위치 고장으로 인한 화재 감지 장치 CPUM 고장",
  train: "4101 (01)",
  device: "ABCD · 1234",
  station: "동대문역사문화공원",
  dist: "00.0km",
  time: "08:41:12",
  clear: "해소 09:02:40",
};

type FaultListRowProps = Partial<FaultRecord> & {
  selected?: boolean;
  onSelect?: () => void;
};

function Pair({ top, bottom, width }: { top: string; bottom: string; width: number }) {
  return (
    <div className="relative flex shrink-0 flex-col items-start gap-0.5 overflow-clip whitespace-nowrap" style={{ width }}>
      <p className={`font-semibold text-(--text-primary) ${TEXT.labelLarge}`}>{top}</p>
      <p className={`font-medium text-(--text-tertiary) ${TEXT.labelSmall}`}>{bottom}</p>
    </div>
  );
}

// 고장 한 건을 등급·내용·열차·위치·발생 시각 한 줄로 표시하고 누르면 선택
export function FaultListRow({ selected = false, onSelect, ...rest }: FaultListRowProps) {
  const f = { ...DEFAULT_FAULT, ...rest };
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      // 버튼과 같은 0.12초 눌림 전환을 쓰되 넓은 행이라 줄어드는 정도는 0.99 로 지정
      className={`group relative flex h-[60px] w-[1100px] cursor-pointer items-center gap-4 rounded-[14px] border px-4 text-left transition-[scale,translate,border-color,background-color] duration-[120ms,120ms,300ms,300ms] ease-out active:scale-[0.99] ${
        selected ? "border-(--accent-cyan)/50" : "border-(--white)/5 bg-(--neutral-card) hover:border-(--white)/12 hover:bg-(--white)/5"
      }`}
    >
      {/* 선택 배경과 빛은 서서히 나타나도록 겹쳐 표시 */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 ${selected ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage: `linear-gradient(to right, ${tint("--accent-cyan", 14)}, ${tint("--accent-violet", 5)})`,
          boxShadow: `0 0 8px 0 ${tint("--accent-cyan", 20)}`,
        }}
      />
      <span className="relative">
        <GradeChip grade={f.grade} />
      </span>
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-0.5 overflow-clip font-medium whitespace-nowrap">
        <p className={`w-full truncate text-(--text-primary) ${TEXT.bodyMedium}`}>{f.title}</p>
        <p className={`w-full truncate text-(--text-tertiary) ${TEXT.labelSmall}`}>{f.desc}</p>
      </div>
      <Pair top={f.train} bottom={f.device} width={150} />
      <Pair top={f.station} bottom={f.dist} width={170} />
      <Pair top={f.time} bottom={f.clear} width={110} />
    </button>
  );
}
