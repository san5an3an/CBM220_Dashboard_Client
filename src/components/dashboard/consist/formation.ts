import { useSyncExternalStore } from "react";
import { CARS, type CarState } from "./data";

// 4호선 편성 번호 401~423 목록 생성
export const FORMATIONS = Array.from({ length: 23 }, (_, i) => String(401 + i));

type CarStatus = Exclude<CarState, "selected">;
type Formation = { no: string; states: CarStatus[] };

const DEFAULT_NO = "415";
// 첫 화면 편성은 디자인의 호차별 상태 그대로 지정
const DEFAULT_STATES = CARS.map((c) => c.state as CarStatus);

// 편성 번호를 씨앗으로 늘 같은 순서의 난수 생성
function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const statesCache = new Map<string, CarStatus[]>([[DEFAULT_NO, DEFAULT_STATES]]);

// 편성마다 호차별 정상·경고·위험을 한 번 배정하고 이후 같은 값 사용
function statesOf(no: string): CarStatus[] {
  const cached = statesCache.get(no);
  if (cached) return cached;
  const random = seededRandom(Number(no));
  const states = CARS.map((): CarStatus => {
    const r = random();
    if (r < 0.25) return "danger";
    if (r < 0.5) return "warning";
    return "normal";
  });
  statesCache.set(no, states);
  return states;
}

const INITIAL: Formation = { no: DEFAULT_NO, states: DEFAULT_STATES };
let current = INITIAL;
const listeners = new Set<() => void>();

// 조회한 편성으로 바꾸고 그 편성의 호차별 상태 적용
export function setFormation(no: string) {
  current = { no, states: statesOf(no) };
  listeners.forEach((l) => l());
}

export function subscribeFormation(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// 조회한 편성 번호 구독
export function useFormation() {
  return useSyncExternalStore(subscribeFormation, () => current.no, () => DEFAULT_NO);
}

// 호차별 상태 구독
export function useCarStates() {
  return useSyncExternalStore(subscribeFormation, () => current.states, () => DEFAULT_STATES);
}

// 선택 값을 만들 때 현재 호차 상태 조회
export const carStatusAt = (index: number) => current.states[index];
