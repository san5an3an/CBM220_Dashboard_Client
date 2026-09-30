"use client";

import { useState } from "react";
import { shade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { clamp, useInterval } from "./live";

// Figma 유리관 간격·크기와 관 영역 위치 지정
const GAP = 100;
const TUBE_W = 40;
const TUBE_H = 300;
const TUBE_TOP = 40;
const LIVE_MS = 3000;

const FILL = {
  over: `linear-gradient(to bottom, ${shade("--status-danger", "white", 30)}, var(--status-danger) 35%, ${shade("--status-danger", "black", 20)})`,
  under: "linear-gradient(to bottom, color-mix(in srgb, var(--accent-cyan), white 30%), var(--accent-cyan) 35%, var(--blue-500))",
};

type ThresholdTubes3DProps = {
  // 관마다의 비율(0~100) 지정
  values?: number[];
  labels?: string[];
  // 기준 비율(0~100) 지정
  threshold?: number;
  // 몇 초마다 값이 조금씩 바뀌는 임시 실시간 표시 지정
  live?: boolean;
};

// 항목별 비율을 기준선과 함께 액체가 찬 유리관 줄로 표시
export function ThresholdTubes3D({
  values = [72, 64, 94, 88, 64, 56, 88, 82, 82],
  labels = values.map((_, i) => `(x${i + 1})`),
  threshold = 70,
  live = true,
}: ThresholdTubes3DProps) {
  const [data, setData] = useState(values);
  const key = values.join(",");
  const [base, setBase] = useState(key);
  // 값을 새로 받으면 그 값부터 다시 표시하도록 처리
  if (base !== key) {
    setBase(key);
    setData(values);
  }
  useInterval(() => {
    if (live) setData((d) => d.map((v) => Math.round(clamp(v + (Math.random() - 0.5) * 12, 30, 99))));
  }, LIVE_MS);

  const lineTop = TUBE_TOP + TUBE_H * (1 - threshold / 100);
  const width = GAP * (data.length - 1) + 100;
  return (
    <div className="relative h-[400px]" style={{ width }}>
      <div
        className="absolute top-[342px] left-2.5 h-3.5 rounded-[7px] shadow-[0px_6px_20px_0px_color-mix(in_srgb,var(--accent-cyan)_20%,transparent)]"
        style={{ width: width - 20, backgroundImage: `linear-gradient(to bottom, ${shade("--navy-650", "white", 8)}, var(--navy-800))` }}
      />
      {data.map((v, i) => {
        const over = v >= threshold;
        const token = over ? "--status-danger" : "--accent-cyan";
        const left = 30 + GAP * i;
        return (
          <div key={i}>
            <div
              className="absolute top-[334px] h-6 w-[70px] rounded-[50%] blur-[6px] transition-colors duration-700"
              style={{ left: left - 15, background: tint(token, 35) }}
            />
            <div className="absolute overflow-clip rounded-[20px] border border-(--white)/10" style={{ left, top: TUBE_TOP, width: TUBE_W, height: TUBE_H }}>
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[20px] bg-linear-to-r from-(--white)/6 via-(--white)/2 to-(--white)/7" />
              <div
                className="absolute right-[-1px] bottom-[-1px] left-[-1px] rounded-[20px] transition-[height] duration-1000 ease-out"
                style={{ height: (TUBE_H * v) / 100 }}
              >
                <div aria-hidden className="absolute inset-0 rounded-[20px] transition-opacity duration-700" style={{ backgroundImage: FILL.under, opacity: over ? 0 : 1 }} />
                <div aria-hidden className="absolute inset-0 rounded-[20px] transition-opacity duration-700" style={{ backgroundImage: FILL.over, opacity: over ? 1 : 0 }} />
                <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.45)]" />
                {/* 액체 윗면 빛이 살짝 출렁이게 처리 */}
                <span
                  className="absolute inset-x-2 top-1 h-1 animate-[liquid-wobble_2.4s_ease-in-out_infinite] rounded-full bg-(--white)/35 blur-[1px]"
                  style={{ animationDelay: `${i * 0.27}s` }}
                />
              </div>
              <div className="absolute top-[11px] bottom-[11px] left-[7px] w-1.5 rounded-[3px] bg-linear-to-b from-(--white)/40 to-(--white)/4" />
              <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_2px_6px_0px_rgba(0,0,0,0.55)]" />
            </div>
            <p
              className={`absolute top-2 w-[60px] -translate-x-1/2 text-center font-semibold tabular-nums transition-colors duration-700 ${TEXT.labelLarge}`}
              style={{ left: left + TUBE_W / 2, color: over ? "var(--status-danger)" : "var(--text-primary)" }}
            >
              {v}%
            </p>
            <p className={`absolute top-[362px] w-[60px] -translate-x-1/2 text-center font-medium text-(--text-tertiary) ${TEXT.labelSmall}`} style={{ left: left + TUBE_W / 2 }}>
              {labels[i]}
            </p>
          </div>
        );
      })}
      <div
        className="absolute left-[69px] h-0.5 border-t-2 border-dashed border-(--status-danger)/90"
        style={{ top: lineTop, width: width - 69, filter: `drop-shadow(0 0 4px ${tint("--status-danger", 80)})` }}
      />
      <div className="absolute left-0 flex items-start overflow-clip rounded-full border border-(--status-danger)/60 bg-(--status-danger)/20 px-2 py-0.5" style={{ top: lineTop - 26 }}>
        <p className={`font-semibold whitespace-nowrap text-(--status-danger) ${TEXT.labelSmall}`}>기준 {threshold}%</p>
      </div>
    </div>
  );
}
