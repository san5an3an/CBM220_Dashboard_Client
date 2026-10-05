// API 연동 전까지 쓸 일별 이상비율 임시 데이터 생성
import type { FormationStatus } from "@/components/fleet";

export type DayStatus = "정상" | "주의" | "위험";

export type DailyRecord = {
  // 날짜(UTC 자정 시각) 지정
  t: number;
  inferences: number;
  windows: number;
  avg: number;
  max: number;
  status: DayStatus;
};

const DAY = 24 * 60 * 60 * 1000;
// Figma 마지막 날(09-23)을 실제 오늘로 옮겨 기록 날짜 계산
const NOW = new Date();
export const TODAY = Date.UTC(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
const SHIFT = TODAY - Date.UTC(2026, 8, 23);
// 위험·주의 판정 기준 이상비율(%) 지정
export const DANGER_AT = 20;
const CAUTION_AT = 2;

// Figma 화면의 08-25 ~ 09-23 일별 평균 이상비율 지정 (마지막 값이 오늘)
const FIGMA_AVG = [
  3.5, 2.1, 6.2, 2.0, 3.4, 3.8, 24.1, 5.2, 6.0, 4.8, 4.4, 4.9, 6.3, 23.0, 4.1,
  3.9, 6.5, 4.6, 3.2, 2.2, 21.2, 3.7, 3.5, 6.8, 6.1, 2.6, 3.1, 22.2, 6.1, 6.7,
];

// Figma 표에 적힌 날짜별 추론 건수·이상 window·평균·최대 값 지정
const FIGMA_ROWS: Record<string, [number, number, number, number]> = {
  "09-23": [11, 1, 6.67, 11.82],
  "09-22": [15, 1, 6.06, 18.96],
  "09-21": [33, 8, 22.16, 32.54],
  "09-20": [25, 0, 3.15, 13.26],
};

export const DEVICES = ["장치 (전체)", "MICOM", "ATC", "CMSB", "TCMS", "MASCON"];
export const MODELS = ["모델 (전체)", "SVM", "IF", "VAE"];
export const RANGES = [
  { label: "최근 7일", days: 7 },
  { label: "최근 14일", days: 14 },
  { label: "최근 30일", days: 30 },
] as const;

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

const round2 = (v: number) => Math.round(v * 100) / 100;

export const statusOf = (avg: number): DayStatus => (avg >= DANGER_AT ? "위험" : avg >= CAUTION_AT ? "주의" : "정상");

// 표시 상태를 기둥 색 상태로 연결
export const PILLAR_STATUS: Record<DayStatus, FormationStatus> = { 정상: "run", 주의: "inspect", 위험: "fault" };

export function formatDay(t: number) {
  const d = new Date(t);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export const formatDate = (t: number) => `${new Date(t).getUTCFullYear()}-${formatDay(t)}`;

// 장치·모델 필터마다 다른 값이 나오도록 최근 30일 기록 생성
export function dailyRecords(device: number, model: number): DailyRecord[] {
  const all = device === 0 && model === 0;
  const rand = seeded(31 + device * 7 + model * 13);
  const scale = all ? 1 : 0.55 + rand() * 0.5;
  return FIGMA_AVG.map((base, i) => {
    const t = TODAY - (FIGMA_AVG.length - 1 - i) * DAY;
    const known = all ? FIGMA_ROWS[formatDay(t - SHIFT)] : undefined;
    const avg = known ? known[2] : round2(base * scale + (rand() - 0.5) * 0.08);
    const status = statusOf(avg);
    return {
      t,
      inferences: known ? known[0] : Math.round(8 + rand() * 27),
      windows: known ? known[1] : status === "위험" ? Math.round(5 + rand() * 4) : Math.round(rand() * 2),
      avg,
      max: known ? known[3] : round2(avg + 4 + rand() * 10),
      status,
    };
  });
}

// 평균 이상비율을 기둥 단계(1~8)로 변환
export const pillarLevel = (avg: number) => Math.max(1, Math.min(8, Math.round(avg / 3)));
