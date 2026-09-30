import { useSyncExternalStore } from "react";

// 열차 도착 애니메이션 재생 시간
export const ARRIVAL_MS = 2600;

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
