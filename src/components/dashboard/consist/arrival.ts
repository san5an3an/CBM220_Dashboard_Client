import { useSyncExternalStore } from "react";

// 열차 도착 애니메이션 재생 시간 지정
export const ARRIVAL_MS = 2600;
// 열차가 멈춘 뒤 카드와 점선이 나타나는 시간 지정
export const REVEAL_MS = 400;
// 카드가 나타난 뒤 숫자와 게이지가 차오르는 시간 지정
export const COUNT_MS = 1400;

// 열차가 멈춘 뒤 카드가 나타나도록 애니메이션 값 생성
export const revealAnimation = (tick: number) =>
  tick === 0 ? { opacity: 0 } : { animation: `reveal ${REVEAL_MS}ms ease-out ${ARRIVAL_MS}ms both` };

// 열차가 멈춘 뒤 카드·점선·선택 링이 나타나는 정도(0~1) 저장
export const reveal = { value: 0 };

let tick = 0;
const listeners = new Set<() => void>();

// 열차 도착 애니메이션 다시 재생
export function replayArrival() {
  tick += 1;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// 재생 요청 횟수 구독
export function useArrivalTick() {
  return useSyncExternalStore(subscribe, () => tick, () => 0);
}
