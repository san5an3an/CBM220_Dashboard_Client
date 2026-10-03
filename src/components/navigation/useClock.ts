"use client";

import { useEffect, useState } from "react";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");

// 날짜를 "2026.07.06 (월) 08:42" 형태로 변환
export const formatClock = (d: Date) =>
  `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} (${DAYS[d.getDay()]}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;

// 1초마다 현재 시각을 새로 읽어 반환
export function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
