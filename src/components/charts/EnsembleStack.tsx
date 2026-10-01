"use client";

import { type IsoShade, IsoPrism, IsoView, isoHeight, isoSide, screenToIso } from "@/components/three/iso";
import { useValueTip, ValueTip } from "@/components/ui/ValueTip";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

// Figma 판 윗면·옆면 불투명도를 바닥 판은 더 진하게 지정
const PLATE: IsoShade = { left: [0.72, 0.36], right: [0.45, 0.18], topWhite: 0.07, topAlpha: 0.32 };
const BASE_PLATE: IsoShade = { left: [1, 0.52], right: [0.65, 0.26], topWhite: 0.1, topAlpha: 0.46 };

// 두 변형의 크기와 판마다 윗면 중심·마름모 폭·두께·색·이름 지정
const LAYOUT = {
  stack: {
    w: 360,
    h: 330,
    plates: [
      { cx: 170, cy: 260, width: 200, thick: 10, token: "--accent-cyan", label: "", shade: BASE_PLATE },
      { cx: 170, cy: 192, width: 168, thick: 6, token: "--status-success", label: "VAE", shade: PLATE },
      { cx: 170, cy: 134, width: 168, thick: 6, token: "--accent-cyan", label: "IF", shade: PLATE },
      { cx: 170, cy: 76, width: 168, thick: 6, token: "--accent-violet", label: "SVM", shade: PLATE },
    ],
  },
  fail: {
    w: 170,
    h: 150,
    plates: [
      { cx: 85, cy: 124, width: 112, thick: 6, token: "--status-success", label: "", shade: PLATE },
      { cx: 85, cy: 88, width: 112, thick: 6, token: "--status-danger", label: "", shade: PLATE },
      { cx: 85, cy: 52, width: 112, thick: 6, token: "--accent-violet", label: "", shade: PLATE },
    ],
  },
} as const;

type EnsembleStackProps = {
  variant?: keyof typeof LAYOUT;
  // 판 아래 결과 문구 지정
  caption?: string;
  // 위 판부터 차례로 모델 이상 점수 지정 (API 연동 전 임시 값)
  scores?: number[];
};

// 앙상블 모델을 떠 있는 반투명 등각 판 층으로 쌓아 표시
export function EnsembleStack({ variant = "stack", caption = "다수결 2 / 3", scores = [0.82, 0.64, 0.91] }: EnsembleStackProps) {
  const L = LAYOUT[variant];
  const { tip, track, show, hide } = useValueTip<number>();
  // 판 순서를 위에서부터 센 모델 번호로 변환
  const models = L.plates.length - 1;
  const order = (i: number) => models - i;
  return (
    <div className="relative" style={{ width: L.w, height: L.h }} onPointerMove={track} onPointerLeave={hide}>
      {variant === "stack" && (
        <div className="absolute top-[236px] left-5 h-[90px] w-[300px] rounded-[50%]" style={{ background: `radial-gradient(closest-side, ${tint("--accent-cyan", 45)}, transparent)` }} />
      )}
      <IsoView width={L.w} height={L.h}>
        {L.plates.map((p, i) => (
          <IsoPrism
            key={i}
            token={p.token}
            side={isoSide(p.width)}
            height={isoHeight(p.thick)}
            shade={p.shade}
            outline
            position={screenToIso(p.cx - L.w / 2, p.cy + p.thick - L.h / 2)}
            bob={i === 0 ? 0 : 2.5}
            phase={i * 0.9}
            onHover={(over) => (over ? show(i) : hide())}
          />
        ))}
      </IsoView>
      {L.plates.map((p) =>
        p.label ? (
          <div key={p.label}>
            <div className="absolute left-64 h-px w-2" style={{ top: p.cy + 2, background: tint(p.token, 60) }} />
            <p className={`absolute left-[266px] font-semibold ${TEXT.labelSmall}`} style={{ top: p.cy - 6, color: `var(${p.token})` }}>
              {p.label}
            </p>
          </div>
        ) : null,
      )}
      {variant === "stack" && (
        <p className={`absolute top-[252px] left-[170px] -translate-x-1/2 font-medium whitespace-nowrap text-(--text-primary) ${TEXT.bodyMedium}`}>{caption}</p>
      )}
      {tip &&
        (variant === "stack" && tip.item === 0 ? (
          <ValueTip at={tip} label="앙상블 결과" rows={[{ value: caption, color: `var(${L.plates[0].token})` }]} />
        ) : (
          <ValueTip
            at={tip}
            label={L.plates[tip.item].label || `모델 ${order(tip.item) + 1}`}
            rows={[{ name: "이상 점수", value: (scores[order(tip.item)] ?? 0).toFixed(2), color: `var(${L.plates[tip.item].token})` }]}
          />
        ))}
    </div>
  );
}
