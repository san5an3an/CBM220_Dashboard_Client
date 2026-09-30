"use client";

import { useEffect, useRef, useState } from "react";

// 값이 바뀔 때마다 이전 값에서 새 값까지 부드럽게 이어지는 숫자 반환
export function useAnimatedNumber(target: number, ms = 1200) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const begin = from.current;
    let frame = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const v = begin + (target - begin) * (1 - (1 - p) ** 3);
      from.current = v;
      setShown(v);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);

  return shown;
}

// 숫자 문구의 소수 자릿수와 천 단위 쉼표를 유지해 표시 문구 생성
export function formatLike(sample: string, value: number) {
  const digits = sample.split(".")[1]?.length ?? 0;
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// 숫자 문구면 차오르는 숫자로, 아니면 그대로 표시할 문구 반환
export function useCountText(text: string, ms = 1200) {
  const numeric = /^-?[\d,]+(\.\d+)?$/.test(text);
  const target = numeric ? Number(text.replace(/,/g, "")) : 0;
  const shown = useAnimatedNumber(target, ms);
  return numeric ? formatLike(text, shown) : text;
}
