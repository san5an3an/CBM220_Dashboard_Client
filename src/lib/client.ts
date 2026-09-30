"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

// 서버 렌더에서는 false, 브라우저에서는 true 를 반환
export function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}
