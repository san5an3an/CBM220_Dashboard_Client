"use client";

import { PanelHeader } from "@/components/foundations";
import { DeviceBar3D } from "@/components/monitoring";
import { TEXT } from "@/lib/typography";
import { Panel } from "@/components/ui/Panel";
import { CHRONIC } from "./data";

// 40회 막대가 트랙의 약 95%가 되도록 축 최대값 지정
const AXIS_MAX = 42;

// 이상으로 자주 지목된 센서를 횟수 순 입체 막대 10줄로 표시
export function ChronicSensorPanel() {
  return (
    <Panel className="h-full w-[520px] shrink-0" header={<PanelHeader eyebrow="CHRONIC SENSORS" title="센서 빈발 이상 랭킹" />}>
      <div className="flex w-full flex-col gap-3">
        <p className={`font-medium text-(--text-secondary) ${TEXT.labelSmall}`}>이상으로 자주 지목된 센서 = 반복 고장 부품 후보</p>
        <div className="flex w-full flex-col gap-[18px]">
          {CHRONIC.map((c, i) => (
            <DeviceBar3D key={c.name} rank={i + 1} name={c.name} percent={c.count} max={AXIS_MAX} width="100%" unit="회" tipLabel="이상 지목" />
          ))}
        </div>
      </div>
    </Panel>
  );
}
