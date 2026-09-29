/**
 * Route-transition skeletons.
 *
 * Every dashboard page is `force-dynamic` and blocks on Headscale, so before
 * this existed a nav click did nothing visible until the server responded —
 * seconds of frozen UI on a slow control plane, with the old page still showing
 * its old data. A `loading.tsx` per route turns that into an instant response.
 *
 * These mirror the real page chrome (header, hero band, table rows, context
 * pane) so the layout doesn't jump when content arrives.
 */

export function SkeletonBlock({ w, h, radius = 8, className = '' }: { w?: number | string; h: number; radius?: number; className?: string }) {
  return (
    <div
      className={`skeleton-block ${className}`}
      style={{ width: w ?? '100%', height: h, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

function SkeletonHeader({ withStats }: { withStats?: boolean }) {
  return (
    <div className="px-5 sm:px-8 pt-7 pb-4 flex-shrink-0">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2.5">
          <SkeletonBlock w={180} h={22} />
          <SkeletonBlock w={130} h={12} />
        </div>
        <SkeletonBlock w={124} h={34} radius={10} />
      </div>
      {withStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[0, 1, 2, 3].map(i => <SkeletonBlock key={i} h={68} radius={12} />)}
        </div>
      )}
    </div>
  );
}

function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-3.5"
          style={{ borderBottom: '1px solid var(--border-1)', opacity: 1 - i * 0.11 }}
        >
          <SkeletonBlock w={28} h={28} radius={8} />
          <div className="flex-1 space-y-1.5">
            <SkeletonBlock w="42%" h={12} />
            <SkeletonBlock w="24%" h={10} />
          </div>
          <SkeletonBlock w={74} h={22} radius={999} />
          <SkeletonBlock w={64} h={26} radius={8} />
        </div>
      ))}
    </div>
  );
}

/** The standard table-plus-context-pane page shell used by most routes. */
export function PageSkeleton({
  hero = false,
  stats = false,
  rows = 6,
  pane = true,
}: {
  /** Pages with a StatsHero ring band under the header (Nodes, Routes). */
  hero?: boolean;
  /** Pages with StatCards inside the header (Settings, Keys). */
  stats?: boolean;
  rows?: number;
  pane?: boolean;
}) {
  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }} role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      <SkeletonHeader withStats={stats} />

      {hero && (
        <div className="px-5 sm:px-8 pt-1 pb-4 flex-shrink-0">
          <SkeletonBlock h={116} radius={14} />
        </div>
      )}

      <div className="flex-1 min-h-0 px-5 sm:px-8 pb-8 flex gap-6">
        <div className="flex-1 min-w-0">
          <SkeletonRows count={rows} />
        </div>
        {pane && (
          <div className="skeleton-pane w-[300px] flex-shrink-0 space-y-4">
            <SkeletonBlock h={140} radius={12} />
            <SkeletonBlock h={190} radius={12} />
          </div>
        )}
      </div>
    </div>
  );
}
