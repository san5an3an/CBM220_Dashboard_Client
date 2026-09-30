"use client";

import { GRADE, type Grade, shade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

// 건수 1건당 버블 지름이 커지는 크기(px)와 최소 지름 지정
const PER_COUNT = 4.67;
const MIN = 24;

// 고장 건수로 버블 지름 계산
const bubbleSize = (count: number) => Math.round(MIN + PER_COUNT * Math.max(1, count));

type FaultBubbleProps = {
  grade?: Grade;
  count?: number;
  // 지름(px)을 지정하고 없으면 건수로 계산
  size?: number;
  // 위아래로 떠 있는 움직임의 시작 위상(초) 지정
  phase?: number;
};

// 고장 건수를 등급 색 입체 구슬로 표시하고 천천히 떠 있도록 갱신
export function FaultBubble({ grade = "A", count = 3, size, phase = 0 }: FaultBubbleProps) {
  const token = GRADE[grade];
  const d = size ?? bubbleSize(count);
  return (
    <div className="relative shrink-0 animate-[holo-pulse_3s_ease-in-out_infinite]" style={{ width: d, height: d, animationDelay: `${-phase}s` }}>
      <div aria-hidden className="absolute -inset-[22%] rounded-full blur-[5px]" style={{ background: `radial-gradient(closest-side, ${tint(token, 35)} 70%, transparent)` }} />
      <div
        aria-hidden
        className="absolute inset-[4.5%] rounded-full"
        style={{
          background: `radial-gradient(50% 50% at 68% 70%, ${shade(token, "white", 55)}, var(${token}) 45%, ${shade(token, "black", 55)})`,
          boxShadow: `0 4px 12px 0 ${tint(token, 45)}, inset 0 1px 0 0 rgba(255,255,255,0.5)`,
        }}
      />
      <div aria-hidden className="absolute top-[11%] left-[24%] h-[18%] w-[32%] -rotate-20 rounded-full bg-(--white)/55 blur-[1px]" />
      <p className={`absolute inset-0 flex items-center justify-center font-semibold ${TEXT.labelLarge} ${grade === "C" ? "text-(--text-on-accent)" : "text-(--white)"}`}>
        {count}
      </p>
    </div>
  );
}
