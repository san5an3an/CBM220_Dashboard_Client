"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type OverlayProps = {
  open: boolean;
  onClose: () => void;
  // 닫힐 때 애니메이션 시간(ms) 지정
  exitMs?: number;
  className?: string;
  children: (state: { leaving: boolean }) => ReactNode;
};

// 화면 위에 어두운 배경을 깔고 내용을 띄우며 Esc·배경 클릭으로 닫기 처리
export function Overlay({ open, onClose, exitMs = 220, className = "", children }: OverlayProps) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [leaving, setLeaving] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // 열림 값이 바뀌는 순간을 렌더 중에 잡아 닫힘 애니메이션 시작 여부 계산
  if (open !== prevOpen) {
    setPrevOpen(open);
    setLeaving(!open);
  }
  const shown = open || leaving;

  // 닫힘 애니메이션이 끝나면 내용을 치우고 원래 누르던 버튼으로 초점 되돌림
  useEffect(() => {
    if (!leaving) return;
    const id = window.setTimeout(() => {
      setLeaving(false);
      returnFocus.current?.focus();
    }, exitMs);
    return () => window.clearTimeout(id);
  }, [leaving, exitMs]);

  // 열려 있는 동안 Esc 닫기와 뒤쪽 페이지 스크롤 잠금 처리
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!shown) return null;
  return createPortal(
    <div className={`fixed inset-0 z-80 ${className}`}>
      <div
        aria-hidden
        onClick={onClose}
        className={`absolute inset-0 bg-(--navy-950)/60 backdrop-blur-[2px] ${leaving ? "animate-[fade-out_220ms_ease-in_forwards]" : "animate-[fade-in_220ms_ease-out]"}`}
      />
      <div ref={panel} className="pointer-events-none relative h-full w-full [&>*]:pointer-events-auto">
        {children({ leaving })}
      </div>
    </div>,
    document.body,
  );
}
