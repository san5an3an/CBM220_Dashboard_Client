// API 연동 전까지 쓸 이상 센서 조치 임시 데이터 생성
import type { DateRange } from "@/components/controls";

export type ActionState = "미조치" | "완료";
export type InspectState = "미검수" | "완료";

export type ActionItem = {
  id: number;
  // 발생 연-월-일과 시:분 지정
  ymd: string;
  time: string;
  device: string;
  sensor: string;
  actual: number;
  expected: number;
  formation: string;
  car: number;
  action: ActionState;
  inspect: InspectState;
};

const pad = (n: number) => String(n).padStart(2, "0");
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const ymdOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Figma 마지막 날(09-23)을 오늘로 옮기되, 마지막 기록 시각(09:12)이 아직 안 지났으면 어제로 옮겨 미래 기록이 없게 계산
const NOW = new Date();
export const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
const LAST_DAY = NOW.getHours() * 60 + NOW.getMinutes() >= 9 * 60 + 12 ? TODAY : addDays(TODAY, -1);
const SHIFT = Math.round((LAST_DAY.getTime() - new Date(2026, 8, 23).getTime()) / 86_400_000);

// Figma 표 10줄 지정 [월-일, 시:분, 장치, 센서, 실제, 기대, 편성, 호차, 조치, 검수]
type Raw = [string, string, string, string, number, number, string, number, ActionState, InspectState];
const FIGMA_ROWS: Raw[] = [
  ["09-23", "09:12", "AXLE_BEARING", "압축기 토출압력", 0.6, 0.2, "401", 1, "미조치", "미검수"],
  ["09-22", "10:13", "DRIVING_GEAR", "압축기 흡입압력", 0.65, 0.23, "402", 2, "미조치", "미검수"],
  ["09-21", "11:14", "TRACTION_MOTOR", "베어링 진동 RMS", 0.7, 0.26, "403", 3, "완료", "미검수"],
  ["09-20", "12:15", "CMSB", "베어링 온도", 0.75, 0.29, "404", 4, "미조치", "미검수"],
  ["09-19", "13:16", "ECU", "모터 권선온도", 0.8, 0.32, "405", 5, "완료", "완료"],
  ["09-18", "14:17", "MICOM_COOLER", "모터 전류 불균형", 0.85, 0.2, "406", 6, "미조치", "미검수"],
  ["09-17", "15:18", "MICOM_AIRPURIFIER", "냉각수 유량", 0.9, 0.23, "407", 7, "완료", "완료"],
  ["09-16", "16:19", "DCU", "오일 온도", 0.6, 0.26, "408", 8, "미조치", "미검수"],
  ["09-16", "11:02", "VVVF", "축전지 셀전압", 0.58, 0.21, "409", 1, "미조치", "미검수"],
  ["09-15", "09:40", "SIV", "축전지 내부저항", 0.55, 0.22, "410", 2, "완료", "미검수"],
];

// Figma 요약(총 24 · 미조치 16 · 조치완료 8 · 미검수 19)에 맞춰 나머지 14줄의 조치·검수 상태 지정
const EXTRA_STATE: [ActionState, InspectState][] = [
  ["미조치", "미검수"], ["완료", "완료"], ["미조치", "미검수"], ["미조치", "미검수"], ["완료", "미검수"], ["미조치", "미검수"], ["미조치", "미검수"],
  ["완료", "완료"], ["미조치", "미검수"], ["미조치", "미검수"], ["완료", "완료"], ["미조치", "미검수"], ["미조치", "미검수"], ["미조치", "미검수"],
];

const shifted = (md: string) => addDays(new Date(2026, Number(md.slice(0, 2)) - 1, Number(md.slice(3, 5))), SHIFT);

// Figma 10줄 뒤로 같은 장치·센서를 반나절 간격으로 거슬러 올라가며 14줄 더 생성
const extra = EXTRA_STATE.map(([action, inspect], i): Raw => {
  const base = FIGMA_ROWS[i % FIGMA_ROWS.length];
  const day = new Date(2026, 8, 15 - Math.floor((i + 1) / 2));
  const hour = 8 + ((i * 5) % 11);
  return [`${pad(day.getMonth() + 1)}-${pad(day.getDate())}`, `${pad(hour)}:${pad((i * 17) % 60)}`, base[2], base[3], Math.round((base[4] - 0.03 * (i % 4)) * 100) / 100, base[5], String(401 + ((i + 3) % 10)), ((i + 4) % 8) + 1, action, inspect];
});

export const ACTIONS: ActionItem[] = [...FIGMA_ROWS, ...extra].map(([md, time, device, sensor, actual, expected, formation, car, action, inspect], i) => ({
  id: i + 1,
  ymd: ymdOf(shifted(md)),
  time,
  device,
  sensor,
  actual,
  expected,
  formation,
  car,
  action,
  inspect,
}));

// 처음 조회 기간(가장 오래된 기록 날 ~ 오늘) 지정 — 처음엔 전체 기록이 보이도록
const first = ACTIONS.reduce((m, a) => (a.ymd < m ? a.ymd : m), ACTIONS[0].ymd);
export const INITIAL_RANGE: DateRange = {
  start: new Date(Number(first.slice(0, 4)), Number(first.slice(5, 7)) - 1, Number(first.slice(8, 10))),
  end: TODAY,
  startTime: "00:00",
  endTime: "23:59",
};

export const DEVICES = ["장치 (전체)", ...Array.from(new Set(ACTIONS.map((a) => a.device)))];
export const ACTION_OPTIONS = ["조치 (전체)", "미조치", "완료"];
export const INSPECT_OPTIONS = ["검수 (전체)", "미검수", "완료"];

// Figma 센서 빈발 이상 랭킹 10줄 지정
export const CHRONIC: { name: string; count: number }[] = [
  { name: "압축기 토출압력 · AXLE", count: 40 },
  { name: "압축기 흡입압력 · DRIVING", count: 39 },
  { name: "베어링 진동 · TRACTION", count: 38 },
  { name: "베어링 온도 · CMSB", count: 34 },
  { name: "모터 권선온도 · ECU", count: 33 },
  { name: "전류 불균형 · MICOM", count: 32 },
  { name: "냉각수 유량 · MICOM", count: 28 },
  { name: "오일 온도 · DCU", count: 27 },
  { name: "셀전압 · VVVF", count: 26 },
  { name: "내부저항 · SIV", count: 22 },
];

// 발생 시각을 표에 보일 "월-일 시:분" 문구로 변환
export const whenText = (a: ActionItem) => `${a.ymd.slice(5)} ${a.time}`;
export const atOf = (a: ActionItem) => new Date(Number(a.ymd.slice(0, 4)), Number(a.ymd.slice(5, 7)) - 1, Number(a.ymd.slice(8, 10)), Number(a.time.slice(0, 2)), Number(a.time.slice(3, 5)));
