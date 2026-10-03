"use client";

import { useAnimatedNumber } from "@/lib/motion";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

// 혼잡도 단계별 색 토큰 지정
export const CROWD = {
  여유: "--accent-cyan",
  보통: "--status-success",
  혼잡: "--status-warning",
  매우혼잡: "--status-danger",
} as const;

export type Crowd = keyof typeof CROWD;

// 헬스 칸 상태별 색 토큰 지정
export const HEALTH = { ok: "--status-success", warn: "--status-warning", bad: "--status-danger" } as const;

export type Health = keyof typeof HEALTH;

export type CarSensor = {
  temp: number;
  crowd: Crowd;
  bcp: number;
  asp: number;
  health: Health[];
};

export const DEFAULT_SENSOR: CarSensor = { temp: 26, crowd: "혼잡", bcp: 2.4, asp: 4.8, health: ["ok", "ok", "warn", "ok", "ok"] };

// 혼잡도를 단계 색 칩으로 표시
function CrowdChip({ crowd, size = "small" }: { crowd: Crowd; size?: "small" | "medium" }) {
  const token = CROWD[crowd];
  return (
    <span key={crowd} className="shrink-0 animate-[pop-in_300ms_ease-out] rounded-full border px-2 py-0.5" style={{ background: tint(token, 16), borderColor: tint(token, 45) }}>
      <p className={`font-semibold whitespace-nowrap ${size === "small" ? TEXT.labelSmall : TEXT.labelMedium}`} style={{ color: `var(${token})` }}>
        {crowd}
      </p>
    </span>
  );
}

// 헬스 칸을 왼쪽부터 차례로 켜지며 상태 색으로 표시
function HealthBar({ health, height = 4, width }: { health: Health[]; height?: number; width?: number }) {
  return (
    <div className={`flex gap-[3px] ${width ? "" : "w-full"}`}>
      {health.map((h, i) => (
        <div
          key={`${i}-${h}`}
          className={`rounded-[2px] ${width ? "shrink-0" : "min-w-px flex-1"}`}
          style={{
            height,
            width,
            background: `var(${HEALTH[h]})`,
            boxShadow: `0 0 4px 0 ${tint(HEALTH[h], 65)}`,
            transformOrigin: "left",
            animation: `grow-x 300ms ease-out ${i * 80}ms both`,
          }}
        />
      ))}
    </div>
  );
}

// 숫자가 바뀔 때 이전 값에서 이어지며 소수 자릿수를 지켜 표시
function useFixed(value: number, digits: number) {
  return useAnimatedNumber(value, 900).toFixed(digits);
}

// 차량별 온도·혼잡도·제동·공기압과 헬스 칸을 작은 카드로 표시
export function CarSensorCard({
  temp = DEFAULT_SENSOR.temp,
  crowd = DEFAULT_SENSOR.crowd,
  bcp = DEFAULT_SENSOR.bcp,
  asp = DEFAULT_SENSOR.asp,
  health = DEFAULT_SENSOR.health,
}: Partial<CarSensor>) {
  const t = useFixed(temp, 0);
  const b = useFixed(bcp, 1);
  const a = useFixed(asp, 1);
  const row = "flex w-full items-center justify-between whitespace-nowrap";
  const key = `font-medium text-(--text-secondary) ${TEXT.labelMedium}`;
  const num = "text-(--text-primary) tabular-nums";
  return (
    <div className="relative flex w-[140px] flex-col items-start gap-[7px] rounded-[14px] border border-(--white)/8 px-3 py-2.5">
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[14px] bg-linear-to-b from-(--white)/6 to-(--white)/2" />
      <div className={`relative ${row}`}>
        <p className={key}>온도</p>
        <p className={`font-bold ${num} ${TEXT.titleSmall}`}>{t}°C</p>
      </div>
      <div className={`relative ${row}`}>
        <p className={key}>혼잡도</p>
        <CrowdChip crowd={crowd} />
      </div>
      <div className="relative h-px w-full bg-(--white)/8" />
      <div className={`relative ${row}`}>
        <p className={key}>BCP</p>
        <p className={`font-semibold ${num} ${TEXT.labelLarge}`}>{b}</p>
      </div>
      <div className={`relative ${row}`}>
        <p className={key}>ASP</p>
        <p className={`font-semibold ${num} ${TEXT.labelLarge}`}>{a}</p>
      </div>
      <div className="relative w-full">
        <HealthBar health={health} />
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.06)]" />
    </div>
  );
}
