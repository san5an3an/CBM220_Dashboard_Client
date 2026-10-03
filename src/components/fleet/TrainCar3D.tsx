"use client";

import { shade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { CAR_STATE, type CarState } from "./tone";

// 토큰에 없는 스테인리스 차체·유리·하부 기기 재질 색 지정
const METAL = {
  body: "linear-gradient(to bottom, #e7edf8, #b9c4da 55%, #7f8ba8)",
  roof: "linear-gradient(to bottom, #f2f6fc, #9aa6c2)",
  ac: "linear-gradient(to bottom, #ffffff, #b7c2da)",
  door: "linear-gradient(to bottom, #f2f5fb, #aeb9d0)",
  glass: "linear-gradient(to bottom, rgba(159,231,255,0.9), #27406e 45%, #0b1633)",
  wheel: "linear-gradient(135deg, #5a6690, #0c1128)",
};
const WINDOWS = [
  [11, 5],
  [32, 18],
  [66, 18],
  [100, 12],
];
const DOORS = [18, 52, 86, 114];

type TrainCar3DProps = {
  number?: string;
  state?: CarState;
  // 원래 크기(140×90) 대비 배율 지정
  scale?: number;
};

// 전동차 옆모습을 상태 색 띠·번호판과 함께 표시하고 대차가 살짝 흔들리도록 갱신
export function TrainCar3D({ number = "00", state = "normal", scale = 1 }: TrainCar3DProps) {
  const token = CAR_STATE[state];
  const selected = state === "selected";
  return (
    <div className="relative shrink-0" style={{ width: 140 * scale, height: 90 * scale }}>
      <div className="absolute top-0 left-0 h-[90px] w-[140px] origin-top-left" style={{ transform: `scale(${scale})` }}>
        <div className="absolute top-[86px] left-0 h-0.5 w-[140px] bg-(--white)/20" />
        {[20, 90].map((x) => (
          <div key={x} className="absolute top-[66px] h-2 w-[30px] rounded-[2px] border border-(--white)/12 bg-[#161c36]" style={{ left: x }} />
        ))}
        {[22, 36, 92, 106].map((x) => (
          // 바퀴가 굴러가도록 바퀴 무늬를 계속 회전 처리
          <div key={x} className="absolute top-[72px] size-3 animate-[spin_1.2s_linear_infinite] rounded-full" style={{ left: x, background: METAL.wheel }}>
            <div className="absolute inset-0 rounded-full border-[1.2px] border-[#afc0e8]/70" />
            <div className="absolute top-1 left-1 size-1 rounded-full bg-[#afc0e8]" />
            <div className="absolute top-0 left-[5.5px] h-1 w-px bg-[#afc0e8]/80" />
          </div>
        ))}
        {/* 차체는 대차 위에서 천천히 오르내리도록 표시 */}
        <div className="absolute inset-0 animate-[car-sway_2.6s_ease-in-out_infinite]">
          <div className="absolute top-[62px] left-3 h-1.5 w-[116px] bg-[#1b2244]" />
          <div className="absolute top-16 left-[54px] h-2 w-8 rounded-[1px] border border-(--white)/10 bg-[#232b52]" />
          <div className="absolute top-2 left-2 h-3 w-[124px] rounded-[10px]" style={{ background: METAL.roof }} />
          {[32, 80].map((x) => (
            <div key={x} className="absolute top-1 h-1.5 w-7 rounded-[2px] border border-[#6c7898]/60" style={{ left: x, background: METAL.ac }} />
          ))}
          <div
            className={`absolute top-3.5 left-1.5 h-[50px] w-32 rounded-[3px_3px_5px_5px] ${selected ? "border-2" : "border"}`}
            style={{
              background: METAL.body,
              borderColor: selected ? tint(token, 90) : "rgba(255,255,255,0.35)",
              boxShadow: `${state === "normal" ? "" : `0 4px 18px 0 ${tint(token, selected ? 70 : 45)}, `}inset 0 1px 0 0 rgba(255,255,255,0.7)`,
            }}
          />
          {[52, 55, 58].map((y) => (
            <div key={y} className="absolute left-[9px] h-[0.7px] w-[122px] bg-(--white)/40" style={{ top: y }} />
          ))}
          <div className="absolute top-[17px] left-1.5 h-[1.5px] w-32" style={{ background: `var(${token})` }} />
          <div className="absolute top-[45px] left-1.5 h-[5px] w-32" style={{ background: `linear-gradient(to right, var(${token}), ${shade(token, "black", 28)})` }} />
          {WINDOWS.map(([x, w]) => (
            <div key={x} className="absolute top-[21px] h-3 rounded-[2px] border border-[#2a3558]/90" style={{ left: x, width: w, background: METAL.glass }} />
          ))}
          {DOORS.map((x) => (
            <div key={x} className="absolute top-[19px] h-11 w-3" style={{ left: x }}>
              <div className="absolute inset-0 rounded-[1px] border border-[#5f6b8c]/80" style={{ background: METAL.door }} />
              <div className="absolute top-0 left-[5.5px] h-11 w-px bg-[#5f6b8c]" />
              <div className="absolute top-[3px] left-0.5 h-[11px] w-[3.5px] rounded-[1px] bg-[#223660]" />
              <div className="absolute top-[3px] left-[6.5px] h-[11px] w-[3.5px] rounded-[1px] bg-[#223660]" />
            </div>
          ))}
          {[0, 134].map((x) => (
            <div key={x} className="absolute top-5 h-10 w-1.5 rounded-[1px] bg-[#1a2140]" style={{ left: x }} />
          ))}
          <div
            className="absolute top-[54px] left-[55.5px] flex rounded-[5px] px-1.5 py-px"
            style={{ background: selected ? `var(${token})` : tint("--navy-800", 90), boxShadow: `0 0 6px 0 ${tint(token, 60)}` }}
          >
            <p className={`font-bold whitespace-nowrap ${TEXT.titleSmall} ${selected ? "text-(--text-on-accent)" : "text-(--white)"}`}>{number}</p>
          </div>
        </div>
        {selected && (
          <div
            aria-hidden
            className="absolute -top-2 left-16 h-2 w-3 animate-[holo-pulse_1.6s_ease-in-out_infinite]"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: `var(${token})`, filter: `drop-shadow(0 0 3px ${tint(token, 90)})` }}
          />
        )}
      </div>
    </div>
  );
}
