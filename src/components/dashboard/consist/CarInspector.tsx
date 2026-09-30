import { SELECTED_CAR } from "./data";

const KEY = "whitespace-nowrap text-[11px] font-medium leading-4 tracking-[0.5px] text-(--text-secondary)";
const VALUE = "whitespace-nowrap text-[16px] font-bold leading-6 tracking-[0.15px] text-(--text-primary)";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative flex shrink-0 flex-col items-start gap-1 overflow-clip">
      <p className={KEY}>{label}</p>
      <p className={VALUE}>{value}</p>
    </div>
  );
}

export function CarInspector() {
  const car = SELECTED_CAR;
  return (
    <div className="absolute left-4 top-[508px] flex items-center gap-[18px] overflow-clip rounded-[18px] border border-(--accent-cyan)/60 py-3 pl-[18px] pr-5 shadow-[0px_8px_28px_0px_var(--accent-cyan-glow)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[18px]"
        style={{
          backgroundImage: "var(--gradient-dialog)",
        }}
      />
      <div className="relative flex shrink-0 flex-col items-start gap-1 overflow-clip whitespace-nowrap">
        <p className="text-[11px] font-semibold leading-4 tracking-[0.5px] text-(--accent-cyan)">SELECTED CAR · 최고 위험 장치</p>
        <p className="text-[22px] font-bold leading-7 text-(--text-primary)">{car.title}</p>
      </div>
      <div className="relative h-9 w-px shrink-0 bg-(--border-strong)" />
      <Metric label="장치" value={car.device} />
      <div className="relative flex shrink-0 flex-col items-start gap-1 overflow-clip">
        <p className={KEY}>상태</p>
        <div className="relative flex shrink-0 items-start overflow-clip rounded-full border border-(--status-danger-border) bg-(--status-danger-subtle) px-2 py-0.5">
          <p className="whitespace-nowrap text-[12px] font-semibold leading-4 tracking-[0.5px] text-(--status-danger)">{car.status}</p>
        </div>
      </div>
      <Metric label="이상비율" value={car.ratio} />
      <Metric label="window" value={car.window} />
      <div className="relative flex shrink-0 flex-col items-start gap-1.5 overflow-clip">
        <p className={KEY}>헬스</p>
        <div className="relative flex shrink-0 items-start gap-[3px] overflow-clip">
          {car.health.map((level, i) => (
            <div
              key={i}
              className={`h-1.5 w-3.5 shrink-0 rounded-[2px] ${
                level === "ok"
                  ? "bg-(--status-success) shadow-[0px_0px_4px_0px_var(--status-success-border)]"
                  : "bg-(--status-warning) shadow-[0px_0px_4px_0px_var(--status-warning-border)]"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_var(--effect-inner-highlight)]" />
    </div>
  );
}
