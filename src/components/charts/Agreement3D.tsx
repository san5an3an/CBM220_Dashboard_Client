"use client";

import { type IsoShade, IsoPrism, IsoView, isoHeight, isoSide, screenToIso } from "@/components/three/iso";
import { useAnimatedList } from "@/components/monitoring/live";
import { tint } from "@/lib/tone";
import { useValueTip, ValueTip } from "@/components/ui/ValueTip";
import { TEXT } from "@/lib/typography";

// Figma 크기·막대 가운데 x·바닥 중심 y·가장 큰 막대 높이 지정
const W = 480;
const H = 300;
const CENTERS = [70, 180, 290, 400];
const BASE_Y = 247;
const MAX_PX = 200;
const SIDE = isoSide(68);
const TOKENS = ["--accent-violet", "--accent-cyan", "--status-warning", "--status-danger"];
const SHADE: IsoShade = { left: [0.85, 0.3], right: [0.5, 0.12], topWhite: 0.6, topAlpha: 1 };

type Agreement3DProps = {
  // 이상으로 판정한 모델 수 0·1·2·3 개별 건수 지정
  counts?: [number, number, number, number];
  labels?: [string, string, string, string];
};

// 같은 시점에 이상으로 판정한 모델 수별 건수를 제곱근 높이 등각 막대로 표시
export function Agreement3D({ counts = [142, 9, 4, 29], labels = ["0개 · 정상", "1개", "2개", "3개 · 모두"] }: Agreement3DProps) {
  const max = Math.max(...counts, 1);
  const heights = counts.map((c) => Math.sqrt(c / max) * MAX_PX);
  const shown = useAnimatedList(heights, 1200);
  const values = useAnimatedList(counts, 1200);
  const { tip, track, show, hide } = useValueTip<number>();
  return (
    <div className="relative h-[300px] w-[480px]" onPointerMove={track} onPointerLeave={hide}>
      <div className="absolute top-[190px] left-[30px] h-[110px] w-[420px] rounded-[50%]" style={{ background: `radial-gradient(closest-side, ${tint("--accent-violet", 30)}, transparent)` }} />
      <IsoView width={W} height={H}>
        {counts.map((_, i) => (
          <IsoPrism
            key={i}
            token={TOKENS[i]}
            side={SIDE}
            height={isoHeight(heights[i])}
            shade={SHADE}
            position={screenToIso(CENTERS[i] - W / 2, BASE_Y - H / 2)}
            onHover={(over) => (over ? show(i) : hide())}
          />
        ))}
      </IsoView>
      {counts.map((_, i) => (
        <div key={i}>
          <p className={`absolute -translate-x-1/2 font-bold text-(--text-primary) tabular-nums ${TEXT.titleSmall}`} style={{ left: CENTERS[i], top: BASE_Y - 17 - shown[i] - 28 }}>
            {Math.round(values[i])}
          </p>
          <p className={`absolute top-[272px] -translate-x-1/2 font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelSmall}`} style={{ left: CENTERS[i] }}>
            {labels[i]}
          </p>
        </div>
      ))}
      {tip && <ValueTip at={tip} label={`이상 판정 모델 ${labels[tip.item]}`} rows={[{ name: "건수", value: counts[tip.item], unit: "건", color: `var(${TOKENS[tip.item]})` }]} />}
    </div>
  );
}
