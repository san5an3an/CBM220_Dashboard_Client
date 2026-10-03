"use client";

import { shade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import type { Direction } from "./tone";

const LAMP = "--yellow-400";
// 전조등 빛줄기가 넓게 퍼지는 쪽에서 좁아지는 삼각형 모양 지정
const BEAM = "polygon(0 0, 100% 50%, 0 100%)";

type Train3DProps = {
  // 상행은 앞코 왼쪽, 하행은 앞코 오른쪽이 되도록 진행 방향 지정
  dir?: Direction;
  number?: string;
  className?: string;
};

// 노선도 위 열차를 앞코 방향·전조등 빛줄기와 함께 측면 입체 모양으로 표시
export function Train3D({ dir = "up", number = "401", className = "" }: Train3DProps) {
  const flip = dir === "down";
  return (
    <div className={`relative h-[22px] w-9 shrink-0 ${className}`}>
      {/* 하행은 앞코가 오른쪽이 되도록 그림만 좌우 반전 처리 */}
      <div aria-hidden className="absolute inset-0" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
        <div className="absolute top-[5.5px] left-[-23px] h-[14px] w-[26px] animate-[beam-flicker_2.4s_ease-in-out_infinite] blur-[1px]">
          <div className="size-full" style={{ clipPath: BEAM, background: `linear-gradient(to left, ${tint(LAMP, 55)}, transparent)` }} />
        </div>
        <div className="absolute top-2.5 left-[-13px] h-[5px] w-4 blur-[0.4px]" style={{ clipPath: BEAM, background: `linear-gradient(to left, ${tint(LAMP, 90)}, transparent)` }} />
        <div className="absolute top-[19.5px] left-[-19px] h-[3px] w-[18px] rounded-full blur-[1px]" style={{ background: tint(LAMP, 35) }} />
        <div
          className="absolute top-0 left-0 h-[18px] w-9 border-[0.5px] border-(--white)/35"
          style={{
            borderRadius: "7px 3px 3px 3px / 9px 3px 3px 3px",
            background: `linear-gradient(to bottom, ${shade("--accent-cyan", "white", 55)}, var(--accent-cyan) 45%, ${shade("--accent-cyan", "black", 40)})`,
            boxShadow: `0 2px 10px 0 ${tint("--accent-cyan", 60)}, inset 0 1px 0 0 rgba(255,255,255,0.5)`,
          }}
        />
        <div className="absolute top-0.5 left-0 h-1.5 w-[7px] rounded-tl-[6px] border-[0.5px] border-(--navy-950)" style={{ background: tint("--text-on-accent", 85) }} />
        <div className="absolute top-0.5 left-3 h-0.5 w-[18px] rounded-[1.5px]" style={{ background: tint("--text-on-accent", 55) }} />
        <div className="absolute top-[6.5px] left-[-3px] size-3 rounded-full blur-[2px]" style={{ background: tint(LAMP, 70) }} />
        <div className="absolute top-[11px] left-[1.5px] size-[3px] rounded-full" style={{ background: shade(LAMP, "white", 70), boxShadow: `0 0 6px 1px ${shade(LAMP, "white", 40)}` }} />
        <div className="absolute top-[18px] left-[3px] h-0.5 w-[30px] bg-(--navy-950)" />
        {[4, 9, 22, 27].map((x) => (
          <div key={x} className="absolute top-[18px] size-1 rounded-full border-[0.75px] border-(--accent-cyan)/80 bg-(--navy-700)" style={{ left: x }} />
        ))}
      </div>
      <p
        className={`absolute top-1 h-4 w-6 -translate-x-1/2 text-center font-semibold text-(--text-on-accent) ${TEXT.labelSmall}`}
        style={{ left: flip ? 15 : 21 }}
      >
        {number}
      </p>
    </div>
  );
}
