"use client";

import { useCountText } from "@/lib/motion";
import { shade, tint, TONE } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type StepTone = "slate" | "cyan" | "amber" | "mint";

type PipelineStepProps = {
  step?: string;
  label?: string;
  value?: string;
  unit?: string;
  sub?: string;
  tone?: StepTone;
  // 큰 수치형(metric)과 한 줄 상태형(status) 중 선택
  type?: "metric" | "status";
  // 다음 단계로 이어지는 화살표 표시 지정
  showArrow?: boolean;
  // 진행 중이면 번호 구슬 바깥에 원형 로딩 표시 지정
  loading?: boolean;
  width?: number | string;
};

// 진단 단계 하나를 번호 구슬·수치·다음 단계 화살표로 표시하고 화살표 빛이 흐르도록 갱신
export function PipelineStep({
  step = "01",
  label = "전체 진단 대상",
  value = "20",
  unit = "편성",
  sub = "2026.07.06 14:17 기준",
  tone = "slate",
  type = "metric",
  showArrow = true,
  loading = false,
  width = 400,
}: PipelineStepProps) {
  const token = TONE[tone];
  const metric = type === "metric";
  const shown = useCountText(value);
  const orb = metric ? 56 : 44;
  return (
    <div
      className={`relative flex items-center rounded-[20px] border ${metric ? "h-[108px] gap-[18px] pr-12 pl-6" : "gap-3 p-4"}`}
      style={{ width, borderColor: tint(token, 45), filter: `drop-shadow(0 8px 12px ${tint(token, 25)})` }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[20px]" style={{ backgroundImage: `linear-gradient(to right, ${tint(token, 20)}, ${tint(token, 4)})` }} />
      <div className="relative shrink-0" style={{ width: orb, height: orb }}>
        <div
          className="relative flex size-full items-center justify-center overflow-clip rounded-full"
          style={{
            backgroundImage: `linear-gradient(135deg, ${shade(token, "white", 30)}, var(${token}) 50%, ${shade(token, "black", 35)})`,
            boxShadow: `0 4px 16px 0 ${tint(token, 60)}, inset 0 2px 0 0 rgba(255,255,255,0.5)`,
          }}
        >
          <p className={`relative text-(--text-on-accent) ${metric ? `font-bold ${TEXT.titleMedium}` : `font-semibold ${TEXT.labelLarge}`}`}>{step}</p>
        </div>
        {loading && (
          // 구슬 바깥을 꼬리가 옅어지는 호가 도는 로딩 표시
          <span role="status" aria-label={`${step} 진행 중`} className="absolute -inset-[5px]">
            <span
              aria-hidden
              className="absolute inset-0 animate-spin rounded-full [animation-duration:0.9s]"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg 60deg, ${tint(token, 20)} 150deg, var(${token}) 360deg)`,
                mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
                filter: `drop-shadow(0 0 4px ${tint(token, 70)})`,
              }}
            />
          </span>
        )}
      </div>
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-0.5 overflow-clip whitespace-nowrap">
        <p className={`font-semibold text-(--text-secondary) ${TEXT.labelLarge}`}>{label}</p>
        <div className="flex items-baseline gap-1">
          <p className={`font-extrabold text-(--text-primary) tabular-nums ${metric ? TEXT.displaySmall : TEXT.headlineSmall}`}>{shown}</p>
          <p className={`font-medium text-(--text-secondary) ${TEXT.labelLarge}`}>{unit}</p>
        </div>
        <p className={`font-medium text-(--text-tertiary) ${TEXT.labelSmall}`}>{sub}</p>
      </div>
      {showArrow && (
        // 다음 단계 쪽으로 빛이 흘러가는 꺾쇠 화살표 표시
        <div
          aria-hidden
          className="absolute top-1/2 animate-[chevron-flow_1.6s_ease-in-out_infinite]"
          style={{ right: metric ? 11 : 17.6, width: metric ? 22 : 15.4, height: metric ? 40 : 28, marginTop: metric ? -20 : -20 }}
        >
          <div
            className="size-full"
            style={{
              clipPath: "polygon(0 0, 36.4% 0, 100% 50%, 36.4% 100%, 0 100%, 63.6% 50%)",
              background: tint(token, 80),
              filter: `drop-shadow(0 0 4px ${tint(token, 60)})`,
            }}
          />
        </div>
      )}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.1)]" />
    </div>
  );
}
