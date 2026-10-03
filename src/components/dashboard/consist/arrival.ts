import { useSyncExternalStore } from "react";

// 정면 연출에서 다가옴·정차·출발 구간 시간 지정
export const INTRO_APPROACH_MS = 1600;
export const INTRO_HOLD_MS = 1500;
export const INTRO_DEPART_MS = 900;
export const INTRO_MS = INTRO_APPROACH_MS + INTRO_HOLD_MS + INTRO_DEPART_MS;
// 출발한 열차가 지나가며 화면이 어두워지는 시간 지정
export const INTRO_FADE_MS = 500;
// 열차 도착 애니메이션 재생 시간 지정
export const ARRIVAL_MS = 2600;
// 열차가 멈춘 뒤 카드와 점선이 나타나는 시간 지정
export const REVEAL_MS = 400;

export type Arrival = { tick: number; intro: boolean };

// 천천히 출발해 가속했다가 부드럽게 멈추는 진행률 계산
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

// 정면 연출이 있으면 그만큼 도착 시작을 늦추도록 지연 시간 계산
export const introDelay = (a: Arrival) => (a.intro ? INTRO_MS : 0);

// 열차가 멈춘 뒤 카드가 나타나도록 애니메이션 값 생성
export const revealAnimation = (a: Arrival) =>
  a.tick === 0 ? { opacity: 0 } : { animation: `reveal ${REVEAL_MS}ms ease-out ${introDelay(a) + ARRIVAL_MS}ms both` };

// 열차가 멈춘 뒤 카드·점선·선택 링이 나타나는 정도(0~1) 저장
export const reveal = { value: 0 };
// 정면 연출이 진행 중인지 저장
export const introActive = { value: false };

const INITIAL: Arrival = { tick: 0, intro: false };
let state = INITIAL;
const listeners = new Set<() => void>();

function play(intro: boolean) {
  state = { tick: state.tick + 1, intro };
  listeners.forEach((l) => l());
}

// 열차 도착 애니메이션만 다시 재생
export function replayArrival() {
  play(false);
}

// 정면 연출 뒤 도착 애니메이션 재생
export function playIntro() {
  play(true);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// 재생 요청 상태 구독
export function useArrival() {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}
