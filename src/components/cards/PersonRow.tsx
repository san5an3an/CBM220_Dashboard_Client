import { TEXT } from "@/lib/typography";

type PersonRowProps = {
  name: string;
  team: string;
  // 아바타 원 안에 보일 한 글자 지정
  initial: string;
  selected?: boolean;
  onSelect?: () => void;
  load?: string;
  // 부하 막대 채움 비율(0~1) 지정
  loadRatio?: number;
  showLoad?: boolean;
};

// 담당자 한 명을 아바타·소속·업무 부하와 선택 원으로 표시
export function PersonRow({ name, team, initial, selected = false, onSelect, load, loadRatio = 0.5, showLoad = true }: PersonRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-[520px] cursor-pointer items-center gap-3 rounded-[12px] border p-4 text-left transition-colors duration-200 ${
        selected
          ? "border-(--accent-cyan)/60 bg-linear-to-r from-(--accent-cyan)/16 to-(--accent-violet)/6"
          : "border-transparent hover:bg-(--neutral-hover)"
      }`}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[18px] bg-linear-to-b from-(--accent-cyan)/90 to-(--accent-violet)/60">
        <span className={`font-medium whitespace-nowrap text-(--text-on-accent) ${TEXT.bodyMedium}`}>{initial}</span>
      </span>
      <span className="flex shrink-0 flex-col items-start gap-0.5 font-medium whitespace-nowrap">
        <span className={`text-(--text-primary) ${TEXT.bodyMedium}`}>{name}</span>
        <span className={`text-(--text-secondary) ${TEXT.labelSmall}`}>{team}</span>
      </span>
      <span className="h-px min-w-px flex-1" />
      {showLoad && (
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelSmall}`}>{load}</span>
          <span className="relative h-[5px] w-[90px] overflow-hidden rounded-[3px] bg-(--neutral-track)">
            <span
              className="absolute top-0 left-0 h-full origin-left animate-[grow-x_900ms_ease-out] rounded-[3px] bg-linear-to-r from-(--accent-cyan) to-(--accent-violet) transition-[width] duration-500"
              style={{ width: `${Math.max(0, Math.min(1, loadRatio)) * 100}%` }}
            />
          </span>
        </span>
      )}
      <span
        aria-hidden
        className={`relative size-[18px] shrink-0 rounded-full border-[1.5px] transition-colors duration-200 ${
          selected ? "border-(--accent-cyan) bg-linear-to-r from-(--accent-cyan) to-(--accent-violet)" : "border-(--white)/25"
        }`}
      >
        {selected && (
          <span
            className="absolute inset-0 animate-ping rounded-full bg-(--accent-cyan)/40"
            style={{ animationIterationCount: 1, animationFillMode: "forwards" }}
          />
        )}
      </span>
    </button>
  );
}
