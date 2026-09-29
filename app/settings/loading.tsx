import { PageSkeleton } from '@/components/ui';

export default function Loading() {
  // Settings is a card stack, not a table, but the header + StatCard strip is
  // the part that governs perceived layout shift.
  return <PageSkeleton stats rows={6} pane={false} />;
}
