"use client";

import { type ReactNode, useId } from "react";
import { Button } from "@/components/controls";
import { TEXT } from "@/lib/typography";
import { DialogEmblem, type EmblemTone } from "./DialogEmblem";
import { Overlay } from "./Overlay";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  tone?: EmblemTone;
  // 엠블럼 대신 다른 그림을 넣을 때 지정
  visual?: ReactNode;
  children?: ReactNode;
  // 기본 취소·확인 대신 다른 버튼 묶음을 넣을 때 지정
  actions?: ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
};

// 가운데에 떠서 확인을 묻는 다이얼로그를 엠블럼·제목·설명·내용·버튼으로 표시
export function Dialog({ open, onClose, title, description, tone = "success", visual, children, actions, confirmLabel = "확인", onConfirm }: DialogProps) {
  const titleId = useId();
  return (
    <Overlay open={open} onClose={onClose}>
      {({ leaving }) => (
        <div className="flex h-full items-center justify-center">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative flex w-[520px] flex-col items-center gap-4 rounded-[24px] border border-(--border-strong) px-8 pt-8 pb-7 drop-shadow-[0px_24px_30px_rgba(0,0,0,0.6)] ${
              leaving ? "animate-[dialog-out_200ms_ease-in_forwards]" : "animate-[dialog-in_260ms_cubic-bezier(0.2,0.9,0.3,1.15)]"
            }`}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[24px] bg-linear-to-b from-(--neutral-popover) to-(--navy-850)/97" />
            <div className="relative flex w-full flex-col items-center">{visual ?? <DialogEmblem tone={tone} />}</div>
            <h2 id={titleId} className={`relative w-full text-center font-extrabold text-(--text-primary) ${TEXT.headlineSmall}`}>
              {title}
            </h2>
            {/* 설명 문구의 줄바꿈은 그대로 살려 표시 */}
            {description && <p className={`relative w-full text-center whitespace-pre-line text-(--text-secondary) ${TEXT.bodyMedium}`}>{description}</p>}
            {children && <div className="relative flex w-full flex-col items-start">{children}</div>}
            <div className="relative flex w-full items-center gap-2.5">
              {actions ?? (
                <>
                  <span className="h-px min-w-px flex-1" />
                  <Button kind="ghost" label="취소" onClick={onClose} />
                  <Button kind="primary" label={confirmLabel} onClick={onConfirm} />
                </>
              )}
            </div>
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)]" />
          </div>
        </div>
      )}
    </Overlay>
  );
}

type DialogItemsProps = {
  items: { label: string; meta: string }[];
};

// 다이얼로그 안에 대상 항목 목록을 구분선과 함께 표시
export function DialogItems({ items }: DialogItemsProps) {
  return (
    <div className="flex w-full flex-col items-start rounded-[14px] border border-(--border-default) bg-(--white)/3 px-4 py-1">
      {items.map((item, i) => (
        <div key={`${item.label}-${i}`} className={`flex w-full items-center gap-2.5 py-2.5 ${i > 0 ? "border-t border-(--white)/6" : ""}`}>
          <p className={`font-medium whitespace-nowrap text-(--text-primary) ${TEXT.bodyMedium}`}>{item.label}</p>
          <span className="h-px min-w-px flex-1" />
          <p className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelSmall}`}>{item.meta}</p>
        </div>
      ))}
    </div>
  );
}
