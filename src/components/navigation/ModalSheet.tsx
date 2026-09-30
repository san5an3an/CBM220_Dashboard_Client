"use client";

import { type ReactNode, useId } from "react";
import { ModalFooter } from "./ModalFooter";
import { ModalHeader } from "./ModalHeader";
import { Overlay } from "./Overlay";

type ModalSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions: ReactNode;
  note?: string;
  noteError?: boolean;
};

// 오른쪽에서 밀려 들어오는 큰 모달 시트를 머리·본문·푸터로 표시
export function ModalSheet({ open, onClose, title, children, actions, note, noteError }: ModalSheetProps) {
  const titleId = useId();
  return (
    <Overlay open={open} onClose={onClose} exitMs={260}>
      {({ leaving }) => (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`absolute top-0 right-0 flex h-full w-[1120px] max-w-full flex-col items-start gap-4 overflow-clip border border-(--accent-cyan)/30 bg-linear-to-b from-(--neutral-sheet) to-(--navy-850) p-4 shadow-[-4px_0px_40px_0px_color-mix(in_srgb,var(--accent-cyan)_15%,transparent),-20px_0px_60px_0px_rgba(0,0,0,0.7)] ${
            leaving ? "animate-[sheet-out_260ms_ease-in_forwards]" : "animate-[sheet-in_340ms_cubic-bezier(0.2,0.8,0.2,1)]"
          }`}
        >
          <ModalHeader title={title} onClose={onClose} titleId={titleId} />
          <div className="min-h-px w-full flex-1 overflow-auto">{children}</div>
          <ModalFooter note={note} error={noteError}>
            {actions}
          </ModalFooter>
        </div>
      )}
    </Overlay>
  );
}
