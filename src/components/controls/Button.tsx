import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { TEXT } from "@/lib/typography";

const KIND = {
  primary: {
    box: "drop-shadow-[0px_4px_7px_color-mix(in_srgb,var(--blue-500)_40%,transparent)]",
    fill: "flip-hover bg-(image:--gradient-primary)",
    text: "text-(--white)",
    shine: "shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.35)]",
  },
  secondary: {
    box: "border border-(--button-secondary-border)",
    fill: "bg-(--button-secondary-bg) transition-colors group-hover:bg-(--neutral-hover)",
    text: "text-(--button-secondary-text)",
    shine: "shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.06)]",
  },
  success: {
    box: "border border-(--status-success-border) bg-(--button-success-bg) transition-colors hover:bg-(--status-success-subtle)",
    fill: "",
    text: "text-(--button-success-text)",
    shine: "",
  },
  ghost: {
    box: "transition-colors hover:bg-(--neutral-hover)",
    fill: "",
    text: "text-(--button-ghost-text) group-hover:text-(--text-primary)",
    shine: "",
  },
  danger: {
    box: "drop-shadow-[0px_4px_7px_color-mix(in_srgb,var(--status-danger)_40%,transparent)]",
    fill: "flip-hover bg-(image:--gradient-danger)",
    text: "text-(--white)",
    shine: "shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.3)]",
  },
} as const;

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  kind?: keyof typeof KIND;
  icon?: LucideIcon;
};

// 종류별 색과 선택 아이콘을 가진 기본 버튼 표시
export function Button({ label, kind = "primary", icon: Icon, className = "", type = "button", ...rest }: ButtonProps) {
  const k = KIND[kind];
  return (
    <button
      type={type}
      className={`group relative flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] pr-4 pl-3.5 disabled:cursor-not-allowed disabled:opacity-45 ${k.box} ${className}`}
      {...rest}
    >
      {k.fill && <span aria-hidden className={`pointer-events-none absolute inset-0 rounded-[12px] ${k.fill}`} />}
      {Icon && <Icon className={`relative shrink-0 ${k.text}`} size={18} absoluteStrokeWidth />}
      <span className={`relative font-semibold whitespace-nowrap ${TEXT.labelLarge} ${k.text}`}>{label}</span>
      {k.shine && <span aria-hidden className={`pointer-events-none absolute inset-0 rounded-[inherit] ${k.shine}`} />}
    </button>
  );
}
