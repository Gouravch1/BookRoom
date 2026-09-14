export function FreeBookSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div
            className="aspect-[3/4] rounded-xl skeleton-shimmer"
            style={{ animationDelay: `${i * 70}ms` }}
          />
          <div
            className="skeleton-shimmer h-3 w-3/4 rounded-full"
            style={{ animationDelay: `${i * 70 + 35}ms` }}
          />
          <div
            className="skeleton-shimmer h-2.5 w-1/2 rounded-full"
            style={{ animationDelay: `${i * 70 + 70}ms` }}
          />
          <div
            className="skeleton-shimmer h-7 w-full rounded-lg"
            style={{ animationDelay: `${i * 70 + 105}ms` }}
          />
        </div>
      ))}
    </div>
  );
}
