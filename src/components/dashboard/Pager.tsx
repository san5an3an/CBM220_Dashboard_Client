"use client";

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { PageButton } from "@/components/controls";

type PagerProps = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
};

type NavProps = { icon: LucideIcon; label: string; disabled: boolean; onClick: () => void };

// 처음·이전·다음·마지막 이동 아이콘 버튼 표시
function Nav({ icon: Icon, label, disabled, onClick }: NavProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="group flex h-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[9px] disabled:cursor-not-allowed disabled:opacity-35"
    >
      <Icon className="text-(--text-secondary) transition-colors group-enabled:group-hover:text-(--text-primary)" size={18} absoluteStrokeWidth />
    </button>
  );
}

// 페이지 번호 버튼과 이동 버튼을 한 줄로 묶어 표시
export function Pager({ page, pages, onChange }: PagerProps) {
  const go = (p: number) => onChange(Math.max(0, Math.min(pages - 1, p)));
  return (
    <nav aria-label="페이지" className="flex shrink-0 items-center gap-1">
      <Nav icon={ChevronFirst} label="처음" disabled={page === 0} onClick={() => go(0)} />
      <Nav icon={ChevronLeft} label="이전" disabled={page === 0} onClick={() => go(page - 1)} />
      {Array.from({ length: pages }, (_, i) => (
        <PageButton key={i} label={String(i + 1)} current={i === page} onClick={() => go(i)} />
      ))}
      <Nav icon={ChevronRight} label="다음" disabled={page === pages - 1} onClick={() => go(page + 1)} />
      <Nav icon={ChevronLast} label="마지막" disabled={page === pages - 1} onClick={() => go(pages - 1)} />
    </nav>
  );
}
