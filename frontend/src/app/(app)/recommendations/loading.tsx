import { LoadingPulse } from "@/components/design";

export default function RecommendationsLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-4">
      <LoadingPulse message="Loading recommendations…" />
    </div>
  );
}
