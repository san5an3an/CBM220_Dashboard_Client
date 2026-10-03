"use client";

import { useId, useState } from "react";
import { useAnimatedNumber } from "@/lib/motion";
import { shade, tint } from "@/lib/tone";
import { useValueTip, ValueTip } from "@/components/ui/ValueTip";
import { TEXT } from "@/lib/typography";
import { polar, useAnimatedList, useInterval } from "./live";

// Figma 휠 중심·허브·눈금 원 반지름과 바큇살 길이 규칙(78 + 건수 × 13) 지정
const C = 360;
const HUB_EDGE = 66;
const RINGS = [0, 4, 8, 12];
const NAME_R = 300;
const LIVE_MS = 4000;
const spokeLen = (count: number) => 78 + count * 13;

export type RadarDevice = { name: string; count: number };

const DEFAULT_DEVICES: RadarDevice[] = [
  { name: "차축 베어링", count: 14 },
  { name: "제동 장치", count: 9 },
  { name: "추진 제어 장치", count: 12 },
  { name: "보조 전원 장치", count: 5 },
  { name: "냉/난방 장치", count: 3 },
  { name: "출입문", count: 7 },
  { name: "주변압기", count: 11 },
  { name: "집전 장치", count: 2 },
  { name: "대차", count: 4 },
  { name: "연결기", count: 6 },
  { name: "차상 신호", count: 8 },
  { name: "TCMS", count: 1 },
  { name: "방송 장치", count: 3 },
  { name: "견인 전동기", count: 10 },
  { name: "공기 압축기", count: 5 },
  { name: "조명", count: 2 },
  { name: "차륜", count: 4 },
  { name: "배터리", count: 6 },
  { name: "화재 감지", count: 3 },
  { name: "CCTV", count: 8 },
  { name: "운전 제어기", count: 12 },
];

// 건수 구간별 바큇살 색 토큰 계산
// 건수가 구간을 넘어 색이 바뀔 때 버튼 반전과 같은 0.3초 동안 넘어가도록 지정
const FADE = "stroke 300ms ease, fill 300ms ease, filter 300ms ease, opacity 150ms ease";

const spokeToken = (count: number) => (count >= 10 ? "--status-danger" : count >= 6 ? "--status-warning" : "--accent-cyan");

type DeviceRadarProps = {
  devices?: RadarDevice[];
  // 몇 초마다 한 장치의 건수가 바뀌는 임시 실시간 표시 지정
  live?: boolean;
};

// 장치별 고장 건수를 허브에서 뻗는 바큇살 길이로 표시하고 누른 장치를 가운데에 표시
export function DeviceRadar({ devices = DEFAULT_DEVICES, live = true }: DeviceRadarProps) {
  const id = useId().replace(/:/g, "");
  const [counts, setCounts] = useState(() => devices.map((d) => d.count));
  const [selected, setSelected] = useState(0);
  const lens = useAnimatedList(counts.map(spokeLen), 1400);
  const hubValue = useAnimatedNumber(counts[selected], 800);
  const { tip, track, show, hide } = useValueTip<number>();
  const step = 360 / devices.length;

  useInterval(() => {
    if (!live) return;
    const i = Math.floor(Math.random() * devices.length);
    setCounts((c) => c.map((v, j) => (j === i ? Math.max(0, Math.min(16, v + (Math.random() < 0.55 ? 1 : -1))) : v)));
  }, LIVE_MS);

  return (
    <div className="relative size-[720px]" onPointerMove={track} onPointerLeave={hide}>
      <svg className="absolute inset-0 overflow-visible" viewBox="0 0 720 720" width={720} height={720}>
        <defs>
          <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--navy-700)" }} />
            <stop offset="1" style={{ stopColor: "var(--navy-900)" }} />
          </linearGradient>
          <radialGradient id={`${id}-hub`} cx="0.5" cy="0.35" r="0.7">
            <stop offset="0" style={{ stopColor: shade("--navy-650", "white", 10) }} />
            <stop offset="1" style={{ stopColor: "var(--navy-850)" }} />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={320} fill={`url(#${id}-plate)`} style={{ filter: "drop-shadow(0 26px 30px rgba(0,0,0,0.6))" }} />
        <circle cx={C} cy={C} r={319.5} fill="none" strokeWidth={1} style={{ stroke: tint("--white", 10) }} />
        {RINGS.map((n) => (
          <g key={n}>
            <circle cx={C} cy={C} r={spokeLen(n)} fill="none" strokeWidth={1} strokeDasharray="3 5" style={{ stroke: tint("--white", 10) }} />
            {n > 0 && (
              <text x={polar(C, C, spokeLen(n) + 6, -81)[0]} y={polar(C, C, spokeLen(n) + 6, -81)[1]} className={`font-medium ${TEXT.labelSmall}`} style={{ fill: "var(--text-tertiary)" }}>
                {n}건
              </text>
            )}
          </g>
        ))}
        {devices.map((d, i) => {
          const deg = -90 + step * i;
          const active = i === selected;
          const token = active ? "--accent-cyan" : spokeToken(counts[i]);
          const len = lens[i];
          const [x0, y0] = polar(C, C, HUB_EDGE, deg);
          const [x1, y1] = polar(C, C, Math.max(HUB_EDGE + 1, len), deg);
          const [gx, gy] = polar(C, C, Math.max(HUB_EDGE + 1, len - 8), deg);
          const [tx, ty] = polar(C, C, len + 18, deg);
          const [nx, ny] = polar(C, C, NAME_R, deg);
          const [ex, ey] = polar(C, C, NAME_R - 12, deg);
          return (
            <g
              key={d.name}
              role="button"
              tabIndex={0}
              aria-label={`${d.name} ${counts[i]}건`}
              aria-pressed={active}
              className="cursor-pointer outline-none [&:hover_.spoke]:opacity-100 [&:focus-visible_.spoke]:opacity-100"
              onClick={() => setSelected(i)}
              onPointerEnter={(e) => show(i, e)}
              onPointerLeave={hide}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(i)}
            >
              <line x1={x0} y1={y0} x2={ex} y2={ey} strokeWidth={1} strokeDasharray="2 4" style={{ stroke: tint("--white", active ? 22 : 8) }} />
              <line x1={x0} y1={y0 + 5} x2={x1} y2={y1 + 5} strokeWidth={10} strokeLinecap="round" style={{ stroke: shade(token, "black", 55), transition: FADE }} />
              <line
                className="spoke"
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y1}
                strokeWidth={10}
                strokeLinecap="round"
                style={{ stroke: `var(${token})`, opacity: active ? 1 : 0.85, filter: `drop-shadow(0 0 ${active ? 10 : 6}px ${tint(token, active ? 80 : 50)})`, transition: FADE }}
              />
              <line x1={x0} y1={y0 - 2} x2={gx} y2={gy - 2} strokeWidth={2} strokeLinecap="round" style={{ stroke: tint("--white", 45) }} />
              <circle cx={x1} cy={y1} r={active ? 10 : 8} style={{ fill: shade(token, "white", 30), stroke: "var(--white)", strokeWidth: active ? 2 : 0, filter: `drop-shadow(0 0 6px ${tint(token, 80)})`, transition: FADE }} />
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" className={`font-semibold ${TEXT.labelSmall}`} style={{ fill: "var(--text-primary)" }}>
                {counts[i]}
              </text>
              <foreignObject x={nx - 48} y={ny - 8} width={96} height={16}>
                <p className={`truncate text-center font-semibold ${TEXT.labelMedium}`} style={{ color: active ? "var(--accent-cyan)" : "var(--text-secondary)" }}>
                  {d.name}
                </p>
              </foreignObject>
              <line x1={x0} y1={y0} x2={nx} y2={ny} strokeWidth={24} style={{ stroke: "transparent" }} />
            </g>
          );
        })}
        <circle cx={C} cy={C + 4} r={64} style={{ fill: "rgba(0,0,0,0.5)", filter: "blur(6px)" }} />
        <circle cx={C} cy={C} r={62} fill={`url(#${id}-hub)`} style={{ stroke: tint("--accent-cyan", 45), strokeWidth: 1.5, filter: `drop-shadow(0 0 16px ${tint("--accent-cyan", 30)})` }} />
      </svg>
      <div className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center whitespace-nowrap">
        <p key={selected} className={`animate-[fade-up_300ms_ease-out] font-semibold text-(--accent-cyan) ${TEXT.labelMedium}`}>
          {devices[selected].name}
        </p>
        <div className="flex items-baseline gap-0.5">
          <p className={`font-extrabold text-(--text-primary) tabular-nums ${TEXT.displaySmall}`}>{Math.round(hubValue)}</p>
          <p className={`font-medium text-(--text-secondary) ${TEXT.labelLarge}`}>건</p>
        </div>
      </div>
      {tip && <ValueTip at={tip} label={devices[tip.item].name} rows={[{ name: "고장", value: counts[tip.item], unit: "건", color: `var(${spokeToken(counts[tip.item])})` }]} />}
    </div>
  );
}
