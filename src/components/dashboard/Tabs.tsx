"use client";

import { useState } from "react";
import { SegmentItem } from "@/components/controls";

type TabsProps = {
  items: readonly string[];
  initial?: number;
  // 틀을 가득 채우고 칸을 같은 폭으로 나누도록 지정
  grow?: boolean;
  // false 를 돌려주면 선택을 바꾸지 않도록 처리
  onChange?: (index: number) => boolean | void;
};

// 세그먼트 탭 칸을 한 줄 틀에 묶어 하나만 고르도록 표시
export function Tabs({ items, initial = 0, grow = false, onChange }: TabsProps) {
  const [active, setActive] = useState(initial);
  return (
    <div role="tablist" className={`relative flex items-center rounded-[12px] border border-(--border-default) bg-(--neutral-control) p-1 ${grow ? "w-full gap-1" : "shrink-0"}`}>
      {items.map((label, i) => (
        <SegmentItem
          key={label}
          label={label}
          grow={grow}
          active={i === active}
          onClick={() => {
            if (onChange?.(i) !== false) setActive(i);
          }}
        />
      ))}
    </div>
  );
}
