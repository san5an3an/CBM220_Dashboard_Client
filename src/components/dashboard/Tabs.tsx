"use client";

import { useState } from "react";
import { SegmentItem } from "@/components/controls";

type TabsProps = {
  items: readonly string[];
  initial?: number;
  // false 를 돌려주면 선택을 바꾸지 않도록 처리
  onChange?: (index: number) => boolean | void;
};

// 세그먼트 탭 칸을 한 줄 틀에 묶어 하나만 고르도록 표시
export function Tabs({ items, initial = 0, onChange }: TabsProps) {
  const [active, setActive] = useState(initial);
  return (
    <div role="tablist" className="relative flex shrink-0 items-center rounded-[12px] border border-(--border-default) bg-(--neutral-control) p-1">
      {items.map((label, i) => (
        <SegmentItem
          key={label}
          label={label}
          active={i === active}
          onClick={() => {
            if (onChange?.(i) !== false) setActive(i);
          }}
        />
      ))}
    </div>
  );
}
