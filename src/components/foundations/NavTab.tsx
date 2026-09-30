import { TEXT } from "@/lib/typography";

type NavTabProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

// 상단 페이지 이동 탭 표시
export function NavTab({ label, active = false, onClick }: NavTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`group relative flex shrink-0 cursor-pointer items-center rounded-[12px] px-[18px] py-2.5 transition-colors duration-200 ${
        active
          ? "drop-shadow-[0px_6px_9px_color-mix(in_srgb,var(--accent-cyan)_35%,transparent)]"
          : "border border-(--border-default) bg-(--neutral-hover) hover:bg-(--neutral-control)"
      }`}
    >
      {active && (
        <>
          <span aria-hidden className="flip-hover pointer-events-none absolute inset-0 rounded-[12px] bg-(image:--gradient-accent)" />
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.45)]" />
        </>
      )}
      <span
        className={`relative whitespace-nowrap ${TEXT.titleSmall} ${
          active ? "font-bold text-(--text-on-accent)" : "font-medium text-(--text-secondary) group-hover:text-(--text-primary)"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
