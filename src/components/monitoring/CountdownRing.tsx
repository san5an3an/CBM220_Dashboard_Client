"use client";

import { useEffect, useId, useState } from "react";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { arcPath } from "./live";

// Figma 링 중심·반지름·굵기 지정
const CX = 80;
const CY = 60;
const R = 55.8;
const WIDTH = 8.4;
const RING_LEN = 2 * Math.PI * R;

type CountdownRingProps = {
  // 전체 시간(초) 지정
  total?: number;
  // 처음 남은 시간(초) 지정
  remaining?: number;
  caption?: string;
  expiredCaption?: string;
  onExpire?: () => void;
};

// 남은 초를 두 자리 분:초 문구로 변환
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// 세션 만료까지 남은 시간을 1초마다 줄어드는 링과 숫자로 표시
export function CountdownRing({ total = 180, remaining = 58, caption = "남음", expiredCaption = "만료", onExpire }: CountdownRingProps) {
  const id = useId();
  const [left, setLeft] = useState(remaining);
  const [base, setBase] = useState(remaining);
  // 남은 시간을 새로 받으면 그 값부터 다시 세도록 처리
  if (base !== remaining) {
    setBase(remaining);
    setLeft(remaining);
  }

  useEffect(() => {
    if (left <= 0) {
      onExpire?.();
      return;
    }
    const t = window.setTimeout(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [left, onExpire]);

  const expired = left <= 0;
  const token = expired ? "--status-danger" : "--status-warning";
  const ratio = Math.max(0, Math.min(1, left / total));
  const urgent = !expired && left <= 10;
  return (
    <div className="relative h-[150px] w-40" role="timer" aria-label={`${mmss(left)} ${expired ? expiredCaption : caption}`}>
      {/* 만료되면 바닥 빛이 버튼 반전처럼 0.3초 동안 주황에서 빨강으로 넘어가도록 두 층으로 처리 */}
      {(["--status-warning", "--status-danger"] as const).map((t) => (
        <div
          key={t}
          className="absolute top-[104px] left-0 h-[50px] w-40 rounded-[50%] transition-opacity duration-300 ease-out"
          style={{ background: `radial-gradient(closest-side, ${tint(t, 40)}, transparent)`, opacity: t === token ? 1 : 0 }}
        />
      ))}
      <svg className="absolute inset-0 overflow-visible" viewBox="0 0 160 150" width={160} height={150}>
        <defs>
          <linearGradient id={`${id}-arc`} gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="140" y2="0">
            <stop offset="0" style={{ stopColor: expired ? "var(--status-danger)" : "var(--status-warning)", transition: "stop-color 300ms ease" }} />
            <stop offset="1" style={{ stopColor: "var(--status-danger)" }} />
          </linearGradient>
          <radialGradient id={`${id}-face`}>
            <stop offset="0" style={{ stopColor: tint(token, 18), transition: "stop-color 300ms ease" }} />
            <stop offset="1" style={{ stopColor: tint(token, 2), transition: "stop-color 300ms ease" }} />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth={WIDTH} style={{ stroke: tint("--white", 6) }} />
        {/* 남은 비율만큼 12시 방향부터 시계 방향으로 호를 그리고 만료되면 12시에 점만 남게 처리 */}
        <path
          d={arcPath(CX, CY, R, -90, 269.99)}
          fill="none"
          strokeWidth={WIDTH}
          strokeLinecap="round"
          stroke={`url(#${id}-arc)`}
          strokeDasharray={RING_LEN}
          strokeDashoffset={expired ? RING_LEN - 0.4 : RING_LEN * (1 - ratio)}
          className={urgent ? "animate-[ring-alarm_1s_ease-in-out_infinite]" : ""}
          style={{ transition: "stroke-dashoffset 900ms linear, filter 300ms ease", filter: `drop-shadow(0 0 7px ${tint(token, 70)})` }}
        />
        <circle cx={CX} cy={CY} r={46} fill={`url(#${id}-face)`} />
      </svg>
      <p className={`absolute top-8 left-1/2 -translate-x-1/2 font-extrabold whitespace-nowrap text-(--text-primary) tabular-nums ${TEXT.displaySmall}`}>{mmss(left)}</p>
      <p className={`absolute top-[72px] left-1/2 -translate-x-1/2 font-semibold whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: `var(${token})`, transition: "color 300ms ease" }}>
        {expired ? expiredCaption : caption}
      </p>
    </div>
  );
}
