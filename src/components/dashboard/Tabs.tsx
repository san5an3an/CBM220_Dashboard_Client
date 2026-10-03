"use client";

import { useState } from "react";
import { SegmentItem } from "@/components/controls";

type TabsProps = {
  items: readonly string[];
  onChange?: (index: number) => void;
};

// 세그먼트 탭 칸을 한 줄 틀에 묶어 하나만 고르도록 표시
export function Tabs({ items, onChange }: TabsProps) {
  const [active, setActive] = useState(0);
  return (
    <div role="tablist" className="relative flex shrink-0 items-center rounded-[12px] border border-(--border-default) bg-(--neutral-control) p-1">
      {items.map((label, i) => (
        <SegmentItem
          key={label}
          label={label}
          active={i === active}
          onClick={() => {
            setActive(i);
            onChange?.(i);
          }}
        />
      ))}
    </div>
  );
}
