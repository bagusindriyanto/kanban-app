import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Comparison, Dashboard } from '@/types/dashboard';
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CircleCheckBigIcon,
  CircleDotIcon,
  LayoutListIcon,
  LoaderIcon,
  MinusIcon,
} from 'lucide-react';

const DeltaBadge = ({ value }: { value: number | null | undefined }) => {
  if (!value) {
    return (
      <Badge
        variant="secondary"
        className="gap-0.5 font-semibold text-muted-foreground tabular-nums"
      >
        <MinusIcon />
        0%
      </Badge>
    );
  }

  const isPositive = value > 0;
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-0.5 font-semibold tabular-nums',
        isPositive
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
      )}
    >
      {isPositive ? <ArrowUpRightIcon /> : <ArrowDownRightIcon />}
      {isPositive ? '+' : ''}
      {value}%
    </Badge>
  );
};

const KpiStrip = ({
  summary,
  comparison,
}: {
  summary: Dashboard['stats']['summary'] | undefined;
  comparison: Comparison | undefined;
}) => {
  return (
    <div className="overflow-hidden rounded-4xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid divide-y *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-normal text-sm">Total To Do</CardTitle>
            <CardAction>
              <CircleDotIcon className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-2xl leading-none tracking-tight tabular-nums">
              {summary?.todo ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-normal text-sm">
              Total On Progress
            </CardTitle>
            <CardAction>
              <LoaderIcon className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-2xl leading-none tracking-tight tabular-nums">
              {summary?.on_progress ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-normal text-sm">Total Done</CardTitle>
            <CardAction>
              <CircleCheckBigIcon className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="font-medium text-2xl leading-none tracking-tight tabular-nums">
                {summary?.done ?? 0}
              </p>
              <DeltaBadge value={comparison?.deltas?.done} />
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-normal text-sm">
              Total Aktivitas
            </CardTitle>
            <CardAction>
              <LayoutListIcon className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="font-medium text-2xl leading-none tracking-tight tabular-nums">
                {summary?.total ?? 0}
              </p>
              <DeltaBadge value={comparison?.deltas?.total} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KpiStrip;
