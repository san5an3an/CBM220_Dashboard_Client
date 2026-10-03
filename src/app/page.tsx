import { FleetOverview } from "@/components/dashboard/FleetOverview";
import { FitViewport } from "@/components/layout/FitViewport";

export default function Home() {
  return (
    <FitViewport>
      <FleetOverview />
    </FitViewport>
  );
}
