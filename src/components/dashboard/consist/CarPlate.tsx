import type { CarState } from "./data";

const PLATE_STYLE: Record<CarState, { plate: string; unit: string }> = {
  normal: {
    plate: "bg-(--neutral-sheet)/92 border-(--status-success)/90 shadow-[0px_2px_6px_0px_var(--effect-shadow-panel),0px_0px_8px_0px_color-mix(in_srgb,var(--status-success)_70%,transparent)] text-(--text-primary)",
    unit: "text-(--status-success)",
  },
  warning: {
    plate: "bg-(--neutral-sheet)/92 border-(--status-warning)/90 shadow-[0px_2px_6px_0px_var(--effect-shadow-panel),0px_0px_8px_0px_color-mix(in_srgb,var(--status-warning)_70%,transparent)] text-(--text-primary)",
    unit: "text-(--status-warning)",
  },
  danger: {
    plate: "bg-(--neutral-sheet)/92 border-(--status-danger)/90 shadow-[0px_2px_6px_0px_var(--effect-shadow-panel),0px_0px_8px_0px_color-mix(in_srgb,var(--status-danger)_70%,transparent)] text-(--text-primary)",
    unit: "text-(--status-danger)",
  },
  selected: {
    plate: "bg-(--accent-cyan) border-(--accent-cyan)/90 shadow-[0px_2px_6px_0px_var(--effect-shadow-panel),0px_0px_8px_0px_color-mix(in_srgb,var(--accent-cyan)_70%,transparent)] text-(--text-on-accent)",
    unit: "",
  },
};

type CarPlateProps = {
  no: string;
  state: CarState;
  index: number;
};

// 차량 간격에 맞춰 호차 번호판 배치
export function CarPlate({ no, state, index }: CarPlateProps) {
  const style = PLATE_STYLE[state];
  return (
    <div
      className={`absolute flex items-center gap-[3px] overflow-clip whitespace-nowrap rounded-[8px] border-[1.5px] px-2 py-0.5 ${style.plate}`}
      style={{ left: 222 + index * 138, top: 173.5 + index * 34 }}
    >
      <p className="text-[14px] font-bold leading-5 tracking-[0.1px]">{no}</p>
      <p className={`text-[11px] font-semibold leading-4 tracking-[0.5px] ${style.unit}`}>호차</p>
    </div>
  );
}
