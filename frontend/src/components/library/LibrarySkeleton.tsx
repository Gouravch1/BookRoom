export function LibrarySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div
            className="aspect-[3/4] rounded-xl skeleton-shimmer"
            style={{ animationDelay: `${i * 80}ms` }}
          />
          <div className="skeleton-shimmer h-3 w-3/4 rounded-full" style={{ animationDelay: `${i * 80 + 40}ms` }} />
          <div className="skeleton-shimmer h-2.5 w-1/2 rounded-full" style={{ animationDelay: `${i * 80 + 80}ms` }} />
        </div>
      ))}
    </div>
  );
}
