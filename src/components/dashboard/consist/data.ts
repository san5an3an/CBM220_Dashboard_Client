export type CarState = "normal" | "warning" | "danger" | "selected";

export type Car = {
  no: string;
  state: CarState;
  // 운전석이 붙는 차체 끝 지정
  cab?: "left" | "right";
  pantograph?: boolean;
};

export const CARS: Car[] = [
  { no: "00", state: "danger", cab: "left" },
  { no: "01", state: "normal" },
  { no: "02", state: "normal", pantograph: true },
  { no: "03", state: "danger" },
  { no: "04", state: "normal" },
  { no: "05", state: "danger", pantograph: true },
  { no: "06", state: "normal" },
  { no: "07", state: "normal", pantograph: true },
  { no: "08", state: "warning" },
  { no: "09", state: "danger", cab: "right" },
];

export type Telemetry = {
  label: string;
  value: string;
  unit?: string;
  tag?: string;
  range: [string, string];
  // 카드 테두리와 게이지 색을 CSS 변수 이름으로 지정
  color: string;
  left: string;
};

export const TELEMETRY: Telemetry[] = [
  {
    label: "총 추론 건수",
    value: "8,642",
    unit: "건",
    range: ["0", "10,000"],
    color: "--accent-cyan",
    left: "left-[16px]",
  },
  {
    label: "커버 장치",
    value: "21",
    unit: "/ 26",
    range: ["0", "26 장치"],
    color: "--status-success",
    left: "left-[308px]",
  },
  {
    label: "평균 이상비율",
    value: "10.1",
    unit: "%",
    range: ["누적 6.8%", "30 %"],
    color: "--accent-violet",
    left: "left-[600px]",
  },
  {
    label: "경고 장치",
    value: "4",
    unit: "개",
    tag: "경고",
    range: ["0", "≥ 10%"],
    color: "--status-warning",
    left: "left-[892px]",
  },
  {
    label: "최근 추론",
    value: "12:30",
    range: ["09-23", "3분 전"],
    color: "--slate-400",
    left: "left-[1184px]",
  },
  {
    label: "위험 장치",
    value: "4",
    unit: "개",
    tag: "위험",
    range: ["0", "≥ 20%"],
    color: "--status-danger",
    left: "left-[1476px]",
  },
];

// 카드 아래에서 편성 괄호선까지 연결선 좌표 지정
export const CONNECTORS: { color: string; points: [number, number][] }[] = [
  { color: "--accent-violet", points: [[134, 136], [134, 150], [216.1, 139.4]] },
  { color: "--accent-cyan", points: [[426.2, 138], [426.2, 191.2]] },
  { color: "--status-success", points: [[718.2, 136], [718.2, 263.1]] },
  { color: "--status-warning", points: [[1010.2, 136], [1010.2, 335]] },
  { color: "--slate-400", points: [[1302.2, 136], [1302.2, 407]] },
  { color: "--status-danger", points: [[1594, 138], [1594, 152], [1568.1, 472.5]] },
];
