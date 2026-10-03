"use client";

import type { LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import { TEXT } from "@/lib/typography";
import { FlyoutItem } from "./FlyoutItem";
import { RailItem } from "./RailItem";

type RailFlyoutProps = {
  eyebrow: string;
  title: string;
  items: string[];
  current?: string;
  onSelect?: (item: string) => void;
};

// 레일 메뉴 옆에 붙는 하위 메뉴 펼침 창 표시
function RailFlyout({ eyebrow, title, items, current, onSelect }: RailFlyoutProps) {
  return (
    <div
      role="menu"
      aria-label={title}
      className="relative flex w-[216px] flex-col items-start gap-1 rounded-[16px] border border-(--border-default) px-2.5 pt-3.5 pb-2.5 shadow-[0px_0px_24px_0px_color-mix(in_srgb,var(--accent-cyan)_50%,transparent),0px_16px_36px_0px_rgba(0,0,0,0.5)]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[16px] bg-linear-to-b from-(--neutral-panel) to-(--neutral-panel-end)" />
      <span aria-hidden className="absolute top-[18px] -left-[5px] size-2.5 rotate-45 bg-(--neutral-panel)" />
      <div className="relative flex w-full flex-col items-start gap-0.5 px-1.5 pb-2.5 whitespace-nowrap">
        <p className={`font-semibold text-(--accent-cyan) ${TEXT.labelSmall}`}>{eyebrow}</p>
        <p className={`font-bold text-(--text-primary) ${TEXT.titleSmall}`}>{title}</p>
      </div>
      <div className="relative h-px w-full bg-(--white)/8" />
      <div className="relative h-1 w-2.5" />
      {items.map((item) => (
        <div key={item} role="none" className="relative w-full">
          <FlyoutItem label={item} current={item === current} onClick={() => onSelect?.(item)} />
        </div>
      ))}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.07)]" />
    </div>
  );
}

type RailMenuProps = {
  icon: LucideIcon;
  label: string;
  eyebrow: string;
  items: string[];
  active?: boolean;
  current?: string;
  onSelect?: (item: string) => void;
};

// 마우스를 올리면 오른쪽에 하위 메뉴 창이 펼쳐지는 레일 메뉴 표시
export function RailMenu({ icon, label, eyebrow, items, active = false, current, onSelect }: RailMenuProps) {
  const [open, setOpen] = useState(false);
  const closing = useRef<number | undefined>(undefined);
  // 메뉴와 창 사이를 지나가는 동안 닫히지 않도록 잠깐 기다렸다 닫기 처리
  const show = () => {
    window.clearTimeout(closing.current);
    setOpen(true);
  };
  const hide = () => {
    closing.current = window.setTimeout(() => setOpen(false), 140);
  };
  return (
    <div className="relative h-[68px] w-[76px]" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <RailItem icon={icon} label={label} active={active} hovered={open} onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="absolute -top-1 left-[94px] z-40 animate-[flyout-in_180ms_ease-out]">
          <RailFlyout
            eyebrow={eyebrow}
            title={label}
            items={items}
            current={current}
            onSelect={(item) => {
              setOpen(false);
              onSelect?.(item);
            }}
          />
        </div>
      )}
    </div>
  );
}
