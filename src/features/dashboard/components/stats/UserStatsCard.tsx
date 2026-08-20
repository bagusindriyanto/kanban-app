import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/formatDuration';
import UserAvatar from '@/components/shared/UserAvatar';
import { TimerIcon } from 'lucide-react';
import type { TimeMetric, UserStats } from '@/types/dashboard';

const statItems = [
  {
    key: 'todo',
    label: 'To Do',
    textClass: 'text-todo-accent',
    dotClass: 'bg-todo-accent',
  },
  {
    key: 'on_progress',
    label: 'On Progress',
    textClass: 'text-progress-accent',
    dotClass: 'bg-progress-accent',
  },
  {
    key: 'done',
    label: 'Done',
    textClass: 'text-done-accent',
    dotClass: 'bg-done-accent',
  },
  {
    key: 'total',
    label: 'Total',
    textClass: 'text-total-accent',
    dotClass: 'bg-total-accent',
  },
] as const;

type UserStatsCardProps = {
  user: UserStats;
  timeMetric?: TimeMetric;
  className?: string;
};

const UserStatsCard = ({ user, timeMetric, className }: UserStatsCardProps) => {
  // Calculate completion percentage
  const todo = user.todo ?? 0;
  const onProgress = user.on_progress ?? 0;
  const done = user.done ?? 0;
  const total = user.total ?? 0;

  const todoPercent = total > 0 ? Math.round((todo / total) * 100) : 0;
  const onProgressPercent =
    total > 0 ? Math.round((onProgress / total) * 100) : 0;
  const donePercent = total > 0 ? Math.round((done / total) * 100) : 0;
  const completion = total > 0 ? Math.round((done / total) * 100) : 0;

  const effectiveMinute = user.effective_minute ?? 0;
  const workingMinute = user.working_minute ?? 0;
  const effectivePercent =
    workingMinute > 0 ? Math.round((effectiveMinute / workingMinute) * 100) : 0;

  return (
    <Card
      className={cn(
        'overflow-hidden p-4 shadow-sm bg-linear-to-b from-card to-muted/30',
        className,
      )}
    >
      {/* Avatar & Name — centered */}
      <div className="flex flex-col gap-2 items-center pt-2">
        <UserAvatar profile={user} size="lg" />
        <div className="mt-1 text-center">
          <p className="text-sm font-semibold leading-tight truncate max-w-45">
            {user.full_name}
          </p>
        </div>
      </div>

      <Separator />

      {/* Bar tasks */}
      <div className="overflow-hidden w-full h-2 rounded-full bg-muted">
        <div className="flex size-full">
          <div
            className="h-full bg-todo-accent transition-[width] duration-600 ease-[cubic-bezier(0.76, 0, 0.24, 1)]"
            style={{ width: `${todoPercent}%` }}
          />
          <div
            className="h-full bg-progress-accent transition-[width] duration-600 ease-[cubic-bezier(0.76, 0, 0.24, 1)]"
            style={{ width: `${onProgressPercent}%` }}
          />
          <div
            className="h-full bg-done-accent transition-[width] duration-600 ease-[cubic-bezier(0.76, 0, 0.24, 1)]"
            style={{ width: `${donePercent}%` }}
          />
        </div>
      </div>

      {/* Stats List */}
      <div className="flex flex-col gap-1.5">
        {statItems.map(({ key, label, textClass, dotClass }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <span className={`size-1.5 rounded-full ${dotClass}`} />
              {label}
            </div>
            <span className={`text-sm font-bold tabular-nums ${textClass}`}>
              {user[key] ?? 0}
            </span>
          </div>
        ))}

        {/* Completion row */}
        <div className="flex items-center justify-between pt-1.5">
          <span className="text-sm text-muted-foreground">Completion</span>
          <span className="text-sm font-bold tabular-nums">{completion}%</span>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-1.5 pb-1.5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Lama Aktivitas</p>
          <span className="text-sm font-bold tabular-nums text-muted-foreground">
            {formatDuration(effectiveMinute)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Lama Bekerja</p>
          <span className="text-sm font-bold tabular-nums text-muted-foreground">
            {formatDuration(workingMinute)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1.5">
          <p className="text-sm text-muted-foreground">Operational Time</p>
          <span className="text-sm font-bold tabular-nums">
            {effectivePercent}%
          </span>
        </div>
      </div>

      {timeMetric ? (
        <>
          <Separator />

          <div className="flex flex-col gap-1.5 pb-1.5">
            <div className="flex items-center gap-1.5 pt-0.5 text-muted-foreground">
              <TimerIcon className="size-3.5" />
              <p className="text-xs font-semibold tracking-wide uppercase">
                Rata-rata Waktu
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Waktu Siklus</p>
              <span className="text-sm font-bold tabular-nums">
                {timeMetric.avg_cycle_minutes}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Waktu Mulai</p>
              <span className="text-sm font-bold tabular-nums">
                {timeMetric.avg_time_to_start_minutes}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Pause Ratio</p>
              <span className="text-sm font-bold tabular-nums">
                {timeMetric.pause_ratio}%
              </span>
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
};

export default UserStatsCard;
