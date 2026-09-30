import { TEXT } from "@/lib/typography";

type PageButtonProps = {
  label: string;
  current?: boolean;
  onClick?: () => void;
};

// 페이지 번호 버튼 한 칸 표시
export function PageButton({ label, current = false, onClick }: PageButtonProps) {
  return (
    <button
      type="button"
      aria-current={current ? "page" : undefined}
      onClick={onClick}
      className={`flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[9px] transition-colors ${
        current
          ? "bg-(image:--gradient-accent) drop-shadow-[0px_2px_5px_color-mix(in_srgb,var(--accent-cyan)_35%,transparent)]"
          : "hover:bg-(--neutral-hover)"
      }`}
    >
      <span className={`font-semibold tabular-nums ${TEXT.labelLarge} ${current ? "text-(--text-on-accent)" : "text-(--text-secondary)"}`}>{label}</span>
    </button>
  );
}
