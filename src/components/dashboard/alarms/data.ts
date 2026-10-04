// API 연동 전까지 쓸 알람·이벤트 임시 데이터 생성
import type { DateRange } from "@/components/controls";
import type { Grade } from "@/lib/tone";

export type AlarmStatus = "신규" | "확인" | "조치중" | "완료" | "오탐";

export type Alarm = {
  no: number;
  grade: Grade;
  device: string;
  model: string;
  ratio: number;
  window: number;
  status: AlarmStatus;
  owner: string;
  formation: string;
  car: string;
  // 발생 연-월-일·월-일과 시:분:초 지정
  ymd: string;
  date: string;
  time: string;
  // 알람 발생 흐름 차트에서 이 알람이 속한 버블 순번 지정
  bubble?: number;
  // 입력한 알람 제목 지정 (없으면 장치 이름으로 생성)
  title?: string;
  memo?: string;
};

export type RiverBubble = {
  grade: Grade;
  // Figma 차트 안 버블 가운데 좌표와 지름(px) 지정
  x: number;
  y: number;
  size: number;
  count: number;
  time: string;
  title: string;
  // 버블 발생 시각 지정 (기간 밖 버블을 흐리게 할 때 비교)
  at?: Date;
};

// 등급별 영문 단계와 표시 이름 지정
export const GRADE_CODE: Record<Grade, string> = { A: "CRIT", B: "HIGH", C: "MID", D: "LOW", W: "FP" };
export const GRADE_LABEL: Record<Grade, string> = {
  A: "위험 · CRIT",
  B: "경고 · HIGH",
  C: "주의 · MID",
  D: "참고 · LOW",
  W: "오탐 · FP",
};
export const GRADES: Grade[] = ["A", "B", "C", "D", "W"];

export const STATUSES: AlarmStatus[] = ["신규", "확인", "조치중", "완료", "오탐"];
// 아직 처리가 끝나지 않은 상태 지정
export const OPEN_STATUS: AlarmStatus[] = ["신규", "확인", "조치중"];

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monthDay = (d: Date, sep: string) => `${pad(d.getMonth() + 1)}${sep}${pad(d.getDate())}`;
export const ymdOf = (d: Date) => `${d.getFullYear()}-${monthDay(d, "-")}`;

// 임시 데이터 마지막 날(Figma 09-23)을 오늘로 옮기되, 마지막 알람 시각(08:05)이 아직 안 지났으면 어제로 옮겨 미래 알람이 없게 계산
const NOW = new Date();
export const TODAY = startOfDay(NOW);
const LAST_DAY = NOW.getHours() * 60 + NOW.getMinutes() >= 8 * 60 + 5 ? TODAY : addDays(TODAY, -1);
const SHIFT = Math.round((LAST_DAY.getTime() - new Date(2026, 8, 23).getTime()) / DAY);
// Figma 월-일(09-21)을 오늘 기준으로 옮긴 날짜로 변환
const shifted = (md: string) => addDays(new Date(2026, Number(md.slice(0, 2)) - 1, Number(md.slice(3, 5))), SHIFT);

// 데이터 마지막 날까지 7일 눈금과 처음 조회 기간(눈금 첫날 ~ 오늘) 지정
export const DAYS = Array.from({ length: 7 }, (_, i) => monthDay(addDays(LAST_DAY, i - 6), "."));
export const INITIAL_RANGE: DateRange = { start: addDays(LAST_DAY, -6), end: TODAY, startTime: "00:00", endTime: "23:59" };

// Figma 버블 21개의 등급·가운데 좌표·지름·건수 지정
const RAW_BUBBLES: RiverBubble[] = [
  { grade: "A", x: 253.87, y: 33, size: 34, count: 2, time: "09.17 09:36", title: "BECU_PB 이상 감지" },
  { grade: "A", x: 591.43, y: 33, size: 44, count: 4, time: "09.18 16:48", title: "ATC 이상 감지" },
  { grade: "A", x: 980.93, y: 33, size: 30, count: 1, time: "09.20 04:48", title: "SIV 이상 감지" },
  { grade: "A", x: 1344.46, y: 33, size: 52, count: 6, time: "09.21 10:07", title: "MICOM_COOLER 이상 감지" },
  { grade: "A", x: 1656.07, y: 39, size: 38, count: 3, time: "09.22 19:12", title: "VVVF 이상 감지" },
  { grade: "B", x: 383.7, y: 91, size: 38, count: 3, time: "09.17 21:36", title: "TCMS 이상 감지" },
  { grade: "B", x: 695.3, y: 91, size: 32, count: 2, time: "09.19 02:24", title: "BCU 이상 감지" },
  { grade: "B", x: 1084.8, y: 91, size: 48, count: 5, time: "09.20 11:08", title: "MICOM_AIRPURIFIER 이상 감지" },
  { grade: "B", x: 1474.3, y: 91, size: 34, count: 2, time: "09.22 09:06", title: "ECU 이상 감지" },
  { grade: "C", x: 227.9, y: 149, size: 30, count: 1, time: "09.17 07:12", title: "MASCON 이상 감지" },
  { grade: "C", x: 461.6, y: 149, size: 42, count: 4, time: "09.18 04:48", title: "PIS 이상 감지" },
  { grade: "C", x: 877.07, y: 149, size: 54, count: 7, time: "09.19 19:12", title: "CPUM 이상 감지" },
  { grade: "C", x: 1240.6, y: 149, size: 36, count: 3, time: "09.21 04:48", title: "HVAC 이상 감지" },
  { grade: "C", x: 1578.17, y: 149, size: 44, count: 4, time: "09.22 12:00", title: "PA 이상 감지" },
  { grade: "C", x: 1708, y: 149, size: 28, count: 1, time: "09.23 08:05", title: "CMSB 이상 감지" },
  { grade: "D", x: 539.5, y: 207, size: 32, count: 2, time: "09.18 12:00", title: "ENCODER 이상 감지" },
  { grade: "D", x: 1162.7, y: 207, size: 38, count: 3, time: "09.20 21:36", title: "MCB 이상 감지" },
  { grade: "D", x: 1526.23, y: 207, size: 28, count: 1, time: "09.22 07:12", title: "MC 이상 감지" },
  { grade: "W", x: 331.77, y: 265, size: 28, count: 1, time: "09.17 16:48", title: "APS_FAN 이상 감지" },
  { grade: "W", x: 799.17, y: 265, size: 34, count: 2, time: "09.19 12:00", title: "UPS 이상 감지" },
  { grade: "W", x: 1422.37, y: 265, size: 30, count: 1, time: "09.21 21:36", title: "TRS 이상 감지" },
];

// Figma 워크리스트 5행을 앞에 두고 같은 등급·날짜 버블에 맞춘 알람 20건 지정
const RAW_ALARMS: Omit<Alarm, "ymd">[] = [
  { no: 3, grade: "A", device: "MICOM_COOLER", model: "VAE", ratio: 18, window: 18, status: "조치중", owner: "박기술", formation: "403", car: "03", date: "09-21", time: "10:07:14", bubble: 3 },
  { no: 7, grade: "B", device: "MICOM_AIRPURIFIER", model: "PCA", ratio: 23, window: 23, status: "신규", owner: "미지정", formation: "404", car: "04", date: "09-20", time: "11:08:21", bubble: 7 },
  { no: 9, grade: "B", device: "ECU", model: "SVM", ratio: 13, window: 13, status: "확인", owner: "이현장", formation: "402", car: "02", date: "09-22", time: "09:06:07", bubble: 8 },
  { no: 14, grade: "C", device: "CMSB", model: "IF", ratio: 8, window: 8, status: "신규", owner: "미지정", formation: "401", car: "01", date: "09-23", time: "08:05:00", bubble: 14 },
  { no: 16, grade: "D", device: "DCU", model: "IF", ratio: 4, window: 4, status: "오탐", owner: "김정비", formation: "405", car: "05", date: "09-19", time: "12:09:28" },
  { no: 1, grade: "A", device: "BECU_PB", model: "VAE", ratio: 26.4, window: 26, status: "완료", owner: "박기술", formation: "401", car: "00", date: "09-17", time: "09:36:41", bubble: 0 },
  { no: 2, grade: "A", device: "ATC", model: "SVM", ratio: 21.7, window: 22, status: "조치중", owner: "이현장", formation: "402", car: "05", date: "09-18", time: "16:48:09", bubble: 1 },
  { no: 4, grade: "A", device: "VVVF", model: "IF", ratio: 19.2, window: 19, status: "신규", owner: "미지정", formation: "415", car: "07", date: "09-22", time: "19:12:55", bubble: 4 },
  { no: 5, grade: "B", device: "TCMS", model: "PCA", ratio: 15.8, window: 16, status: "완료", owner: "김정비", formation: "403", car: "09", date: "09-17", time: "21:36:02", bubble: 5 },
  { no: 6, grade: "B", device: "BCU", model: "VAE", ratio: 12.1, window: 12, status: "확인", owner: "박기술", formation: "404", car: "02", date: "09-19", time: "02:24:37", bubble: 6 },
  { no: 8, grade: "B", device: "MICOM_AIRPURIFIER", model: "SVM", ratio: 14.6, window: 15, status: "완료", owner: "이현장", formation: "405", car: "06", date: "09-20", time: "13:42:18", bubble: 7 },
  { no: 10, grade: "C", device: "MASCON", model: "IF", ratio: 9.3, window: 9, status: "완료", owner: "김정비", formation: "401", car: "08", date: "09-17", time: "07:12:44", bubble: 9 },
  { no: 11, grade: "C", device: "PIS", model: "PCA", ratio: 7.4, window: 7, status: "신규", owner: "미지정", formation: "402", car: "03", date: "09-18", time: "04:48:30", bubble: 10 },
  { no: 12, grade: "C", device: "CPUM", model: "VAE", ratio: 10.8, window: 11, status: "조치중", owner: "박기술", formation: "403", car: "01", date: "09-19", time: "19:12:06", bubble: 11 },
  { no: 13, grade: "C", device: "HVAC", model: "SVM", ratio: 6.9, window: 7, status: "확인", owner: "이현장", formation: "404", car: "07", date: "09-21", time: "04:48:51", bubble: 12 },
  { no: 15, grade: "C", device: "PA", model: "IF", ratio: 8.6, window: 9, status: "신규", owner: "미지정", formation: "415", car: "04", date: "09-22", time: "12:00:23", bubble: 13 },
  { no: 17, grade: "D", device: "ENCODER", model: "PCA", ratio: 3.2, window: 3, status: "완료", owner: "김정비", formation: "405", car: "09", date: "09-18", time: "12:00:47", bubble: 15 },
  { no: 18, grade: "D", device: "MC", model: "SVM", ratio: 2.7, window: 3, status: "신규", owner: "미지정", formation: "401", car: "06", date: "09-22", time: "07:12:15", bubble: 17 },
  { no: 19, grade: "W", device: "APS_FAN", model: "VAE", ratio: 1.8, window: 2, status: "오탐", owner: "박기술", formation: "402", car: "08", date: "09-17", time: "16:48:39", bubble: 18 },
  { no: 20, grade: "W", device: "UPS", model: "IF", ratio: 1.4, window: 1, status: "완료", owner: "이현장", formation: "403", car: "05", date: "09-19", time: "12:00:58", bubble: 19 },
];

// Figma 날짜를 오늘 기준으로 옮긴 버블·알람 목록 생성
export const BUBBLES: RiverBubble[] = RAW_BUBBLES.map((b) => {
  const d = shifted(b.time.replace(".", "-"));
  const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(b.time.slice(6, 8)), Number(b.time.slice(9, 11)));
  return { ...b, at, time: `${monthDay(d, ".")}${b.time.slice(5)}` };
});
export const ALARMS: Alarm[] = RAW_ALARMS.map((a) => {
  const d = shifted(a.date);
  return { ...a, ymd: ymdOf(d), date: monthDay(d, "-") };
});

export const DEVICES = ["장치 (전체)", ...Array.from(new Set(ALARMS.map((a) => a.device)))];
export const STATUS_OPTIONS = ["상태 (전체)", ...STATUSES];

export const alarmNo = (a: Alarm) => `#ALM-${String(a.no).padStart(4, "0")}`;
export const pad4 = (n: number) => String(n).padStart(4, "0");

// 상태를 워크리스트 설명 끝 문구로 변환
export const statusText = (s: AlarmStatus) => (s === "오탐" ? "오탐 처리" : s);

export const alarmTitle = (a: Alarm) => a.title ?? `${a.device} 이상 감지`;
