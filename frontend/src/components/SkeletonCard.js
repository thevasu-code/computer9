export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-2.5 bg-gray-100 rounded w-16" />
        <div className="h-3.5 bg-gray-100 rounded w-full" />
        <div className="h-3.5 bg-gray-100 rounded w-3/4" />
        <div className="h-2 bg-gray-100 rounded w-12 mt-1" />
        <div className="h-5 bg-gray-100 rounded w-20 mt-2" />
        <div className="h-9 bg-gray-100 rounded-lg w-full mt-3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 5 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
