import { TEXT } from "@/lib/typography";

type FlyoutItemProps = {
  label: string;
  current?: boolean;
  onClick?: () => void;
};

// 레일 펼침 창의 하위 메뉴 한 줄 표시
export function FlyoutItem({ label, current = false, onClick }: FlyoutItemProps) {
  return (
    <button
      type="button"
      aria-current={current ? "page" : undefined}
      onClick={onClick}
      className={`group flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-[10px] border px-3 text-left transition-colors duration-150 ${
        current ? "border-(--accent-cyan)/45 bg-linear-to-r from-(--accent-cyan)/22 to-(--accent-violet)/12" : "border-transparent hover:bg-(--neutral-hover)"
      }`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full transition-colors ${
          current ? "bg-(--accent-cyan) shadow-[0px_0px_6px_0px_color-mix(in_srgb,var(--accent-cyan)_90%,transparent)]" : "bg-(--text-tertiary) group-hover:bg-(--accent-cyan)"
        }`}
      />
      <span
        className={`min-w-px flex-1 ${TEXT.labelLarge} ${current ? "font-semibold text-(--text-primary)" : "font-medium text-(--text-secondary) group-hover:text-(--text-primary)"}`}
      >
        {label}
      </span>
    </button>
  );
}
