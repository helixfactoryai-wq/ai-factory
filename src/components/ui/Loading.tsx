interface SpinnerProps { size?: "sm" | "md" | "lg"; className?: string; }
const sizes = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-10 h-10 border-[3px]" };

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return <div className={sizes[size] + " rounded-full border-indigo-500/30 border-t-indigo-500 animate-spin " + className} />;
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Spinner size="md" />
        </div>
        <div className="absolute inset-0 rounded-2xl border border-indigo-500/20 animate-ping opacity-30" />
      </div>
      <p className="text-slate-500 text-sm">Loading...</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"rounded skeleton-shimmer " + className} />;
}

export function CardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card p-4 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
