"use client";

import { Download, Search } from "lucide-react";
import { useState } from "react";
import { Button, Select, SquareButton } from "@/components/controls";
import { PanelHeader } from "@/components/foundations";
import { Panel, Spacer } from "@/components/ui/Panel";
import { playIntro, replayArrival } from "./consist/arrival";
import { FORMATIONS, setFormation, useFormation } from "./consist/formation";
import { ConsistScene } from "./consist/ConsistScene";

const OPTIONS = FORMATIONS.map((no) => ({ value: no, label: `${no} 편성` }));

function Toolbar() {
  const formation = useFormation();
  const [pending, setPending] = useState(formation);
  return (
    <div className="relative flex shrink-0 items-center gap-2 rounded-[16px] border border-(--border-default) bg-(--neutral-card) p-1.5">
      <Select options={OPTIONS} value={pending} onChange={setPending} />
      <SquareButton label="새로고침" onClick={replayArrival} />
      <Button
        label="조회"
        icon={Search}
        // 고른 편성으로 바꾸고 정면 연출부터 다시 재생
        onClick={() => {
          setFormation(pending);
          playIntro();
        }}
      />
      <Button label="CSV 내보내기" kind="success" icon={Download} />
    </div>
  );
}

export function ConsistPanel() {
  const formation = useFormation();
  return (
    <Panel
      className="min-h-[684px] w-full flex-[1_0_0]"
      headerClassName="gap-2.5"
      header={
        <>
          <PanelHeader eyebrow="LIVE CONSIST" title={`편성 ${formation} · 10량 이상 감지`} />
          <Spacer />
          <Toolbar />
        </>
      }
    >
      <ConsistScene />
    </Panel>
  );
}
