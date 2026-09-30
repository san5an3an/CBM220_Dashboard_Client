import { useSyncExternalStore } from "react";

export type HealthLevel = "ok" | "warn";
export type DeviceStatus = "normal" | "warning" | "danger";

export type CarDetail = {
  device: string;
  status: DeviceStatus;
  ratio: number;
  window: string;
  health: HealthLevel[];
};

export type Selection = { index: number; detail: CarDetail };

const DEVICES = ["MICOM", "ATC", "CMSB", "TCMS", "MASCON", "BECU", "VVVF", "SIV", "DCU", "APS"];
const WINDOW_SIZE = 190;

// 이상비율로 장치 상태 판정
export function statusOf(ratio: number): DeviceStatus {
  if (ratio >= 20) return "danger";
  if (ratio >= 10) return "warning";
  return "normal";
}

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const between = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1));

// 선택한 차량의 임의 값 생성
function randomDetail(): CarDetail {
  const ratio = between(3, 39);
  const status = statusOf(ratio);
  const warnChance = status === "danger" ? 0.45 : status === "warning" ? 0.25 : 0.08;
  return {
    device: pick(DEVICES),
    status,
    ratio,
    window: `${between(5, WINDOW_SIZE)}/${WINDOW_SIZE}`,
    health: Array.from({ length: 5 }, () => (Math.random() < warnChance ? "warn" : "ok")),
  };
}

// 첫 화면은 00호차를 위험 장치 목록과 같은 값으로 선택
const INITIAL: Selection = {
  index: 0,
  detail: { device: "CMSB", status: "danger", ratio: 26, window: "65/190", health: ["ok", "ok", "warn", "ok", "ok"] },
};

let state = INITIAL;
const listeners = new Set<() => void>();

// 차량 선택 후 값 새로 생성
export function selectCar(index: number) {
  state = { index, detail: randomDetail() };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// 현재 선택 차량 구독
export function useSelection() {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}

// 정보 카드와 무대 크기를 디자인 px 로 지정
const CARD_W = 590;
const CARD_H = 73;
const STAGE_W = 1728;
const EDGE = 16;
// 열차 아래쪽에 카드를 둘 자리가 있는 마지막 호차 지정
const LAST_BELOW = 4;
// 카드 왼쪽에서 연결 점선이 시작하는 거리 지정
const LEADER_X = 247;
// 위쪽 배치 시 옆 차량 번호판과 겹치지 않도록 띄우는 간격 지정
const ABOVE_GAP = 90;

export type InspectorLayout = {
  left: number;
  top: number;
  leader: [number, number][];
  anchor: [number, number, number];
};

const clampLeft = (x: number) => Math.min(Math.max(x, EDGE), STAGE_W - EDGE - CARD_W);

// 선택 차량 위치에 맞춰 정보 카드와 연결 점선 배치 계산
export function inspectorLayout(index: number): InspectorLayout {
  const step = index - 3;
  if (index <= LAST_BELOW) {
    // 차량 하부를 가리키고 카드는 열차 왼쪽 아래에 배치
    const end: [number, number] = [655 + step * 138, 362 + step * 34];
    // 03호차일 때 디자인과 같은 자리(왼쪽 16px)에 오도록 오프셋 지정
    const left = clampLeft(end[0] - 392 - LEADER_X);
    const top = 508;
    return {
      left,
      top,
      leader: [[left + LEADER_X, top], [left + LEADER_X, end[1] + 30], end],
      anchor: [479 + step * 138, -15.3, 0],
    };
  }
  // 차량 지붕을 가리키고 카드는 차량 위쪽 빈 곳에 배치
  const end: [number, number] = [252 + index * 138, 189.9 + index * 34];
  const left = clampLeft(end[0] - LEADER_X);
  const top = end[1] - ABOVE_GAP - CARD_H;
  return {
    left,
    top,
    leader: [[left + LEADER_X, top + CARD_H], [left + LEADER_X, end[1] - 30], end],
    anchor: [65 + index * 138, 44.3, -18.9],
  };
}
