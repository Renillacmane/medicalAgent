import RhombusLoader from "@/components/ui/RhombusLoader";

export default function RecommendationsLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-4">
      <RhombusLoader size={48} />
      <p className="text-sm text-slate-500">Loading recommendations…</p>
    </div>
  );
}
