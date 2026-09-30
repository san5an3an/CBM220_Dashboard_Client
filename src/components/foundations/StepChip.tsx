import { TEXT } from "@/lib/typography";

type StepChipProps = {
  step: string;
  label: string;
  // 진행 중인 단계는 테두리가 흐르듯 빛나도록 지정
  running?: boolean;
};

// 파이프라인 단계 번호와 이름을 미니 칩으로 표시
export function StepChip({ step, label, running = false }: StepChipProps) {
  return (
    <div
      className={`relative flex w-[87px] flex-col items-center gap-0.5 rounded-[10px] border bg-(--neutral-hover) p-4 whitespace-nowrap ${TEXT.labelSmall} ${
        running ? "animate-[border-glow_1.6s_ease-in-out_infinite] border-(--accent-cyan)" : "border-(--border-sheet)"
      }`}
    >
      <p className="font-semibold text-(--accent-cyan)">{step}</p>
      <p className="font-medium text-(--text-secondary)">{label}</p>
    </div>
  );
}
