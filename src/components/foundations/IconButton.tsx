import { Moon, Power } from "lucide-react";

const KIND = {
  theme: { Icon: Moon, label: "테마 전환" },
  exit: { Icon: Power, label: "로그아웃" },
} as const;

type IconButtonProps = {
  kind: keyof typeof KIND;
  onClick?: () => void;
};

// 테마 전환·로그아웃 같은 아이콘 전용 버튼 표시
export function IconButton({ kind, onClick }: IconButtonProps) {
  const { Icon, label } = KIND[kind];
  const exit = kind === "exit";
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`group relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] ${
        exit
          ? "drop-shadow-[0px_4px_7px_color-mix(in_srgb,var(--status-danger)_45%,transparent)]"
          : "border border-(--border-default) bg-(--neutral-hover) hover:bg-(--neutral-control)"
      }`}
    >
      {exit && <span aria-hidden className="flip-hover pointer-events-none absolute inset-0 rounded-[12px] bg-(image:--gradient-danger)" />}
      <Icon
        className={`relative transition-transform duration-300 ${exit ? "text-(--white) group-hover:scale-110" : "text-(--text-secondary) group-hover:-rotate-20"}`}
        size={20}
        absoluteStrokeWidth
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-[inherit] ${
          exit ? "shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.4)]" : "shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)]"
        }`}
      />
    </button>
  );
}
