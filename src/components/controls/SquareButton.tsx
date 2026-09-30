import { type LucideIcon, RefreshCw } from "lucide-react";

type SquareButtonProps = {
  label: string;
  icon?: LucideIcon;
  kind?: "default" | "accent";
  // 새로고침 중처럼 작업이 도는 동안 아이콘을 회전하도록 지정
  spinning?: boolean;
  onClick?: () => void;
};

// 아이콘 하나만 담은 정사각 버튼 표시
export function SquareButton({ label, icon: Icon = RefreshCw, kind = "default", spinning = false, onClick }: SquareButtonProps) {
  const accent = kind === "accent";
  return (
    <button
      type="button"
      aria-label={label}
      aria-busy={spinning}
      onClick={onClick}
      className={`group relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border transition-colors ${
        accent
          ? "border-(--status-info)/45 bg-(--status-info)/14 hover:bg-(--status-info)/22"
          : "border-(--button-secondary-border) bg-(--button-secondary-bg) hover:bg-(--neutral-hover)"
      }`}
    >
      <Icon
        className={`${accent ? "text-(--accent-cyan)" : "text-(--text-secondary) group-hover:text-(--text-primary)"} ${
          spinning ? "animate-spin" : "transition-transform duration-500 group-hover:rotate-90"
        }`}
        size={20}
        absoluteStrokeWidth
      />
    </button>
  );
}
