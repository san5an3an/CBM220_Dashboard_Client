// API 연동 전까지 쓸 임시 실시간 데이터 생성

// 서버와 브라우저의 첫 화면이 같도록 고정 시드 난수 생성
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type TrendPoint = { t: number; avg: number; max: number };

export const TREND_RANGES = [
  { label: "최근 7일", days: 7 },
  { label: "최근 30일", days: 30 },
  { label: "최근 90일", days: 90 },
] as const;

const POINTS = 48;
const DAY = 24 * 60 * 60 * 1000;
// 추이 마지막 날을 실제 오늘로 지정
const NOW = new Date();
export const TODAY = Date.UTC(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

function wave(i: number, phase: number, rand: () => number) {
  return Math.sin(i / 7 + phase) * 0.9 + Math.sin(i / 3.1 + phase * 2) * 0.35 + (rand() - 0.5) * 0.25;
}

export function initialTrend(days: number): TrendPoint[] {
  const rand = seeded(days * 97);
  const step = (days * DAY) / (POINTS - 1);
  return Array.from({ length: POINTS }, (_, i) => {
    const avg = 9.5 + wave(i, days / 5, rand) * 1.4;
    const max = avg + 2.2 + wave(i, days / 3 + 1, rand) * 1.8;
    return { t: TODAY - days * DAY + i * step, avg: round1(avg), max: round1(max) };
  });
}

// 가장 오래된 점을 빼고 새 점 추가
export function nextTrend(prev: TrendPoint[]): TrendPoint[] {
  const last = prev[prev.length - 1];
  const step = prev[1].t - prev[0].t;
  const avg = clamp(last.avg + (Math.random() - 0.5) * 0.9 + (9.5 - last.avg) * 0.08, 6, 14);
  const max = clamp(Math.max(avg + 0.8, last.max + (Math.random() - 0.5) * 1.1 + (avg + 2.2 - last.max) * 0.1), avg + 0.8, 18);
  return [...prev.slice(1), { t: last.t + step, avg: round1(avg), max: round1(max) }];
}

export type RiskItem = { device: string; ratio: number };

const RISK_BASE: RiskItem[] = [
  { device: "MICOM · 03호차", ratio: 34 },
  { device: "ATC · 05호차", ratio: 29 },
  { device: "CMSB · 00호차", ratio: 26 },
  { device: "TCMS · 09호차", ratio: 22 },
  { device: "MASCON · 08호차", ratio: 18 },
  { device: "BECU · 02호차", ratio: 15 },
  { device: "VVVF · 07호차", ratio: 13 },
];

export const initialRisk = () => RISK_BASE.slice(0, 5);

let riskState = RISK_BASE.map((r) => ({ ...r }));

// 값을 조금씩 바꾸고 상위 5개 재정렬
export function nextRisk(): RiskItem[] {
  riskState = riskState.map((r) => ({ ...r, ratio: Math.round(clamp(r.ratio + (Math.random() - 0.5) * 5, 8, 39)) }));
  return [...riskState].sort((a, b) => b.ratio - a.ratio).slice(0, 5);
}

// 말풍선에 보일 값을 소수 첫째 자리로 반올림
const round1 = (v: number) => Math.round(v * 10) / 10;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function formatDay(t: number) {
  const d = new Date(t);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
