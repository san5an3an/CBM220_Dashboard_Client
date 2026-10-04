import { type LucideIcon, Search } from "lucide-react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { TEXT } from "@/lib/typography";

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  // 아이콘 없이 쓰려면 null 지정
  icon?: LucideIcon | null;
  iconSide?: "leading" | "trailing";
  invalid?: boolean;
  width?: number | string;
  // 여러 줄 입력칸으로 쓸 때 높이(px) 지정
  multiline?: number;
};

// 아이콘을 앞이나 뒤에 붙인 한 줄 입력칸 표시
export function InputField({ icon: Icon = Search, iconSide = "leading", invalid = false, width = 220, multiline, className = "", ...rest }: InputFieldProps) {
  const icon = Icon && <Icon className="relative shrink-0 text-(--text-tertiary) transition-colors group-focus-within:text-(--accent-cyan)" size={18} absoluteStrokeWidth />;
  return (
    <label
      className={`group relative flex gap-2 rounded-[12px] border bg-(--neutral-input) px-3 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.5)] transition-[border-color,box-shadow] duration-200 ${
        invalid
          ? "border-(--border-error)"
          : "border-(--button-secondary-border) focus-within:border-(--border-focus)/90 focus-within:shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.5),0px_0px_6px_0px_color-mix(in_srgb,var(--accent-cyan)_35%,transparent)]"
      } ${multiline ? "items-start pt-3" : "h-10 items-center"} ${className}`}
      style={{ width, height: multiline }}
    >
      {iconSide === "leading" && icon}
      {multiline ? (
        <textarea
          aria-invalid={invalid}
          className={`relative h-full min-w-px flex-1 resize-none bg-transparent text-(--text-primary) outline-none placeholder:text-(--text-tertiary) ${TEXT.bodyMedium}`}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          aria-invalid={invalid}
          className={`relative min-w-px flex-1 bg-transparent text-(--text-primary) outline-none placeholder:text-(--text-tertiary) ${TEXT.bodyMedium}`}
          {...rest}
        />
      )}
      {iconSide === "trailing" && icon}
    </label>
  );
}
