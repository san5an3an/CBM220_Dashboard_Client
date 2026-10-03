import type { LucideIcon } from "lucide-react";
import { TEXT } from "@/lib/typography";

type RailItemProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  // 메뉴 펼침 창이 열려 있는 동안 떠 있는 모양을 유지하도록 지정
  hovered?: boolean;
  onClick?: () => void;
};

// 사이드 레일의 아이콘·이름 메뉴 한 칸 표시
export function RailItem({ icon: Icon, label, active = false, hovered = false, onClick }: RailItemProps) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`group relative flex h-[68px] w-[76px] shrink-0 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-[16px] border transition-[background-color,border-color,box-shadow] duration-200 ${
        active
          ? "border-(--accent-cyan)/45 shadow-[0px_4px_9px_0px_color-mix(in_srgb,var(--accent-cyan)_35%,transparent),inset_0px_1px_0px_0px_rgba(255,255,255,0.15)]"
          : hovered
            ? "border-(--border-strong) bg-(--white)/7"
            : "border-transparent hover:border-(--border-strong) hover:bg-(--white)/7"
      }`}
    >
      {active && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[16px] bg-linear-135 from-(--accent-cyan)/22 to-(--accent-violet)/12" />}
      <Icon
        className={`relative transition-colors ${active ? "text-(--accent-cyan)" : "text-(--text-secondary) group-hover:text-(--text-primary)"}`}
        size={24}
        absoluteStrokeWidth
      />
      <span className={`relative text-center whitespace-nowrap ${TEXT.labelSmall} ${active ? "font-semibold text-(--text-primary)" : "font-medium text-(--text-secondary)"}`}>
        {label}
      </span>
    </button>
  );
}
