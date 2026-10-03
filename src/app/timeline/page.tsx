import { AnomalyTimeline } from "@/components/dashboard/timeline/AnomalyTimeline";
import { FitViewport } from "@/components/layout/FitViewport";

export default function TimelinePage() {
  return (
    <FitViewport>
      <AnomalyTimeline />
    </FitViewport>
  );
}
