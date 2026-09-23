import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  CalendarCheckIcon,
  CalendarChevronsRightIcon,
  CalendarClockIcon,
} from 'lucide-react';
import UserAvatar from '@/components/shared/UserAvatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import type { TaskStatus } from '@/types/task';
import type { ScheduleTask } from '../api/query';
import { cn } from 'cn';

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  'on progress': 'On Progress',
  done: 'Done',
};

const formatTimestamp = (timestamp: string | null) =>
  timestamp
    ? format(new Date(timestamp), "EEEE, d MMMM yyyy 'pukul' HH.mm", {
        locale: idLocale,
      })
    : null;

type ScheduleTaskModalProps = {
  task: ScheduleTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ScheduleTaskModal = ({
  task,
  open,
  onOpenChange,
}: ScheduleTaskModalProps) => {
  if (!task) return null;

  const scheduledAt = formatTimestamp(task.scheduled_at);
  const progressAt = formatTimestamp(task.timestamp_progress);
  const doneAt = formatTimestamp(task.timestamp_done);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="pr-10">
          <DialogTitle>{task.content}</DialogTitle>
          <DialogDescription>
            TASK-{task.id}
            <Badge
              className={cn('ml-1', {
                'bg-todo text-todo-foreground': task.status === 'todo',
                'bg-progress text-progress-foreground':
                  task.status === 'on progress',
                'bg-done text-done-foreground': task.status === 'done',
              })}
            >
              {statusLabels[task.status]}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-1.5">
            <h3 className="font-medium">Detail</h3>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {task.detail?.trim() || 'Tidak ada detail.'}
            </p>
          </section>

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <CalendarClockIcon
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-xs text-muted-foreground">Jadwal</p>
                <p className="font-medium tabular-nums">
                  {scheduledAt ?? 'Tidak dijadwalkan'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarChevronsRightIcon
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-xs text-muted-foreground">
                  Mulai dikerjakan
                </p>
                <p className="font-medium tabular-nums">
                  {progressAt ?? 'Belum dimulai'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarCheckIcon
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-xs text-muted-foreground">Selesai</p>
                <p className="font-medium tabular-nums">
                  {doneAt ?? 'Belum selesai'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <section className="flex flex-col gap-2">
            <h3 className="font-medium">PIC</h3>
            <ItemGroup>
              <Item variant="muted">
                <ItemMedia>
                  <UserAvatar profile={task.user} size="lg" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{task.user.full_name}</ItemTitle>
                  <ItemDescription>
                    {task.user.role?.name ?? '-'}
                  </ItemDescription>
                </ItemContent>
              </Item>

              {task.assigner ? (
                <>
                  <h3 className="font-medium">Ditugaskan oleh</h3>
                  <Item variant="muted">
                    <ItemMedia>
                      <UserAvatar profile={task.assigner} size="lg" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{task.assigner.full_name}</ItemTitle>
                      <ItemDescription>
                        {task.assigner.role?.name ?? '-'}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </>
              ) : null}
            </ItemGroup>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleTaskModal;
