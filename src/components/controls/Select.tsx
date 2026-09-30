"use client";

import { Check, ChevronDown } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { TEXT } from "@/lib/typography";
import { POP_IN, POPOVER } from "./popover";

export type SelectOptionItem = { value: string; label: string; meta?: string };

type SelectOptionProps = {
  label: string;
  meta?: string;
  selected?: boolean;
  highlighted?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
};

// 셀렉트 목록의 옵션 한 줄 표시
export function SelectOption({ label, meta, selected = false, highlighted = false, onSelect, onHover }: SelectOptionProps) {
  return (
    <li
      role="option"
      aria-selected={selected}
      onMouseEnter={onHover}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-3 py-[9px] transition-colors duration-150 ${
        selected
          ? "bg-linear-to-r from-(--accent-cyan)/16 to-(--accent-violet)/8"
          : highlighted
            ? "bg-(--neutral-hover)"
            : ""
      }`}
    >
      <span
        className={`whitespace-nowrap ${TEXT.bodyMedium} ${
          selected
            ? "font-medium text-(--accent-cyan)"
            : highlighted
              ? "text-(--text-primary)"
              : "text-[color-mix(in_srgb,var(--text-primary)_50%,var(--text-secondary))]"
        }`}
      >
        {label}
      </span>
      <span className="h-px min-w-px flex-1" />
      {meta && <span className={`font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelSmall}`}>{meta}</span>}
      {selected && <Check className="shrink-0 animate-[pop-in_200ms_ease-out] text-(--accent-cyan)" size={16} />}
    </li>
  );
}

type SelectListProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

// Select 를 열었을 때 나오는 떠 있는 옵션 목록 표시
function SelectList({ children, id, className = "" }: SelectListProps) {
  return (
    <ul id={id} role="listbox" className={`flex w-60 flex-col gap-0.5 rounded-[12px] p-1.5 ${POPOVER} ${POP_IN} ${className}`}>
      {children}
    </ul>
  );
}

type SelectProps = {
  options: SelectOptionItem[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  width?: number | string;
};

// 눌러서 목록을 열고 옵션을 고르는 선택 상자 표시
export function Select({ options, value, onChange, placeholder = "선택", disabled = false, width = 168 }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value);

  // 목록 밖을 누르면 목록 닫힘 처리
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const openList = () => {
    setCursor(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  // 방향키·엔터·Esc 로 목록 이동과 선택 처리
  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown") setCursor((c) => Math.min(options.length - 1, c + 1));
    if (e.key === "ArrowUp") setCursor((c) => Math.max(0, c - 1));
    if (e.key === "Enter") pick(options[cursor].value);
    if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) e.preventDefault();
  };

  return (
    <div ref={root} className="relative" style={{ width }}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`relative flex h-10 w-full cursor-pointer items-center gap-2 rounded-[12px] border pr-2.5 pl-3.5 transition-[border-color,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${
          open
            ? "border-(--border-focus)/90 shadow-[0px_0px_6px_0px_color-mix(in_srgb,var(--accent-cyan)_35%,transparent)]"
            : "border-(--button-secondary-border) hover:border-(--border-strong)"
        }`}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[12px] bg-linear-to-b from-(--neutral-hover) to-(--neutral-card)" />
        <span className={`relative min-w-px flex-1 truncate text-left ${TEXT.bodyMedium} ${current ? "text-(--text-primary)" : "text-(--text-tertiary)"}`}>
          {current?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`relative shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-(--accent-cyan)" : "text-(--text-secondary)"}`}
          size={20}
          absoluteStrokeWidth
        />
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.06)]" />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-30">
          <SelectList id={listId}>
            {options.map((o, i) => (
              <SelectOption
                key={o.value}
                label={o.label}
                meta={o.meta}
                selected={o.value === value}
                highlighted={i === cursor}
                onHover={() => setCursor(i)}
                onSelect={() => pick(o.value)}
              />
            ))}
          </SelectList>
        </div>
      )}
    </div>
  );
}
