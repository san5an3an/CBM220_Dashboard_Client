import { AlarmEvents } from "@/components/dashboard/alarms/AlarmEvents";
import { FitViewport } from "@/components/layout/FitViewport";

export default function AlarmsPage() {
  return (
    <FitViewport>
      <AlarmEvents />
    </FitViewport>
  );
}
