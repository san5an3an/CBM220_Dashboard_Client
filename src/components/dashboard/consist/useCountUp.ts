import { useEffect, useState } from "react";

const NUMBER = /^[\d,]+(\.\d+)?$/;

// 숫자 문구를 delay 뒤 0부터 목표값까지 올리고 진행률(0~1)도 함께 반환
export function useCountUp(text: string, tick: number, ms: number, delay = 0) {
  const [shown, setShown] = useState(text);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (tick === 0) return;
    const isNumber = NUMBER.test(text);
    const target = isNumber ? Number(text.replace(/,/g, "")) : 0;
    const digits = text.split(".")[1]?.length ?? 0;
    const format = (v: number) =>
      v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    const start = performance.now() + delay;
    let frame = 0;
    const step = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / ms));
      const eased = 1 - (1 - p) ** 3;
      setProgress(eased);
      if (isNumber) setShown(format(target * eased));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text, tick, ms, delay]);

  return { shown, progress };
}
