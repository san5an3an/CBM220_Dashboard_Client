"use client";

import { Check, CircleAlert, Info, type LucideIcon, TriangleAlert, X } from "lucide-react";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/client";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

const TOAST_TONE: Record<ToastTone, { token: string; Icon: LucideIcon }> = {
  success: { token: "--status-success", Icon: Check },
  error: { token: "--status-danger", Icon: CircleAlert },
  info: { token: "--accent-cyan", Icon: Info },
  warn: { token: "--status-warning", Icon: TriangleAlert },
};

export type ToastTone = "success" | "error" | "info" | "warn";

type ToastProps = {
  tone: ToastTone;
  title: string;
  message: string;
  onClose?: () => void;
  // 자동으로 닫히기까지 남은 시간(ms)을 아래 막대로 보여주도록 지정
  duration?: number;
};

// 작업 결과를 톤 색 아이콘·제목·설명으로 알리는 알림 카드 표시
export function Toast({ tone, title, message, onClose, duration }: ToastProps) {
  const { token, Icon } = TOAST_TONE[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="relative flex h-[60px] w-[420px] items-center gap-3.5 overflow-hidden rounded-[16px] border py-3.5 pr-[18px] pl-4"
      style={{
        borderColor: tint(token, 45),
        backgroundImage: `linear-gradient(to right, ${tint(token, 16)}, color-mix(in srgb, var(--navy-850) 96%, transparent))`,
        boxShadow: `0 0 20px 0 ${tint(token, 18)}, 0 12px 30px 0 rgba(0,0,0,0.5)`,
      }}
    >
      <span
        className="relative flex size-8 shrink-0 items-center justify-center rounded-[16px] border-[1.5px]"
        style={{
          borderColor: tint(token, 85),
          background: `radial-gradient(circle, ${tint(token, 35)}, ${tint(token, 8)}), color-mix(in srgb, var(--navy-850) 55%, transparent)`,
          boxShadow: `0 0 12px 0 ${tint(token, 60)}, inset 0 0 6.4px 0 ${tint(token, 50)}`,
        }}
      >
        <Icon style={{ color: `var(${token})` }} size={16} strokeWidth={2.4} />
      </span>
      <div className="flex min-w-px flex-1 flex-col items-start gap-0.5 font-medium">
        <p className={`whitespace-nowrap text-(--text-primary) ${TEXT.bodyMedium}`}>{title}</p>
        <p className={`truncate text-(--text-secondary) ${TEXT.labelSmall}`}>{message}</p>
      </div>
      <button type="button" aria-label="알림 닫기" onClick={onClose} className="shrink-0 cursor-pointer rounded p-0.5 text-(--text-secondary) hover:text-(--text-primary)">
        <X size={16} />
      </button>
      {duration && (
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left animate-[toast-timer_linear_forwards]"
          style={{ background: `var(${token})`, animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}

type ToastEntry = { id: number; tone: ToastTone; title: string; message: string; leaving?: boolean };
let entries: ToastEntry[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const DURATION = 4000;

// 닫히는 애니메이션 뒤 알림 목록에서 삭제
function dismiss(id: number) {
  entries = entries.map((e) => (e.id === id ? { ...e, leaving: true } : e));
  emit();
  window.setTimeout(() => {
    entries = entries.filter((e) => e.id !== id);
    emit();
  }, 240);
}

// 화면 오른쪽 위에 알림을 띄우고 잠시 뒤 자동으로 닫기 예약
export function showToast(toast: Omit<ToastEntry, "id" | "leaving">) {
  const id = ++seq;
  entries = [...entries, { ...toast, id }];
  emit();
  window.setTimeout(() => dismiss(id), DURATION);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// showToast 로 띄운 알림들을 오른쪽 위에 쌓아 표시
export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => entries, () => entries);
  const mounted = useIsClient();
  if (!mounted) return null;
  return createPortal(
    <div className="pointer-events-none fixed top-6 right-6 z-90 flex flex-col items-end gap-2.5">
      {list.map((t) => (
        <div key={t.id} className={`pointer-events-auto ${t.leaving ? "animate-[toast-out_240ms_ease-in_forwards]" : "animate-[toast-in_320ms_cubic-bezier(0.2,0.9,0.3,1.2)]"}`}>
          <Toast tone={t.tone} title={t.title} message={t.message} duration={DURATION} onClose={() => dismiss(t.id)} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
