"use client";

import { Check, Minus } from "lucide-react";

type CheckBoxProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  // 일부만 골라졌을 때 가로줄 표시
  mixed?: boolean;
};

// 모델 선택 카드와 같은 모양의 작은 체크 상자 표시
export function CheckBox({ checked, label, onChange, mixed = false }: CheckBoxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed && !checked ? "mixed" : checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-(--white)/30 transition-colors ${
        checked || mixed ? "bg-(image:--gradient-accent)" : "bg-(--white)/4 hover:bg-(--white)/10"
      }`}
    >
      {checked && <Check key="on" className="animate-[pop-in_200ms_ease-out] text-(--text-on-accent)" size={14} strokeWidth={3} />}
      {!checked && mixed && <Minus key="mixed" className="animate-[pop-in_200ms_ease-out] text-(--text-on-accent)" size={14} strokeWidth={3} />}
    </button>
  );
}
