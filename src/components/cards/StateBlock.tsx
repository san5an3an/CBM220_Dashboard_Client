"use client";

import { Ban, Check, type LucideIcon, Search, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/controls";
import { DialogEmblem, type EmblemTone } from "@/components/navigation";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { IsoCube } from "./IsoCube";

export type StateKind = "empty" | "error" | "loading" | "success";

const STATE_KIND: Record<StateKind, { token: string; emblem?: EmblemTone; Icon?: LucideIcon }> = {
  empty: { token: "--accent-violet", emblem: "person", Icon: Ban },
  error: { token: "--status-danger", emblem: "error", Icon: TriangleAlert },
  loading: { token: "--accent-cyan" },
  success: { token: "--status-success", emblem: "success", Icon: Check },
};

type StateBlockProps = {
  kind?: StateKind;
  title: string;
  body: string;
  meta?: string;
  showMeta?: boolean;
  // 기본 검색 버튼 대신 넣을 동작 버튼 지정
  children?: ReactNode;
  onAction?: () => void;
};

// 불러오는 중 가운데 큐브를 감싸고 도는 로딩 호 표시
function LoadingEmblem({ token }: { token: string }) {
  return (
    <div className="relative h-40 w-[180px] shrink-0">
      <div className="absolute top-[100px] left-[5px] h-14 w-[170px] rounded-[50%]" style={{ background: `radial-gradient(closest-side, ${tint(token, 45)}, transparent)` }} />
      <div className="absolute top-[106px] left-5 h-11 w-[140px] rounded-[50%] border-2 border-dashed" style={{ borderColor: tint(token, 55) }} />
      <div className="absolute top-5 left-10 size-[100px] rounded-full border-[6px] border-(--white)/6" />
      <div
        className="absolute top-5 left-10 size-[100px] animate-spin rounded-full [animation-duration:1.1s]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg 120deg, color-mix(in srgb, var(--blue-500) 20%, transparent) 120deg, color-mix(in srgb, var(--blue-500) 60%, var(--white)) 250deg, var(${token}) 360deg)`,
          mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px))",
          filter: `drop-shadow(0 0 8px ${tint(token, 60)})`,
        }}
      />
      <IsoCube token={token} width={40} spinning period={4000} className="absolute top-3.5 left-10 size-[100px]" />
    </div>
  );
}

// 빈 결과·오류·로딩·완료 상태를 엠블럼과 안내 문구, 동작 버튼으로 표시
export function StateBlock({ kind = "empty", title, body, meta, showMeta = true, children, onAction }: StateBlockProps) {
  const { token, emblem, Icon } = STATE_KIND[kind];
  return (
    <div
      className="relative flex w-[520px] animate-[fade-up_360ms_ease-out] flex-col items-center gap-3 rounded-[20px] border border-(--border-default) px-8 py-7"
      style={{ backgroundImage: `radial-gradient(50% 50% at 50% 50%, ${tint(token, 10)}, transparent)` }}
    >
      {emblem ? <DialogEmblem tone={emblem} icon={Icon} dashedOrbit /> : <LoadingEmblem token={token} />}
      <p className={`font-extrabold whitespace-nowrap text-(--text-primary) ${TEXT.headlineSmall}`}>{title}</p>
      <p className={`text-center whitespace-nowrap text-(--text-secondary) ${TEXT.bodyMedium}`}>{body}</p>
      {showMeta && meta && (
        <span className="flex items-start rounded-full border px-3 py-[5px]" style={{ borderColor: tint(token, 40), background: tint(token, 12) }}>
          <span className={`font-semibold whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: `var(${token})` }}>
            {meta}
          </span>
        </span>
      )}
      <div className="flex items-start pt-1.5">{children ?? <Button label="검색" icon={Search} onClick={onAction} />}</div>
    </div>
  );
}
