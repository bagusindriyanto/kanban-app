import type { Column } from '../constants/column';
import TaskCard from './card/TaskCard';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { TaskWithProfile } from '../api/query';

type StatusColumnProps = {
  title: Column['title'];
  columnId: Column['id'];
  tasks: TaskWithProfile[];
};

const StatusColumn = ({ title, columnId, tasks }: StatusColumnProps) => {
  // Ref untuk scroll container (dipakai oleh virtualizer + droppable)
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: columnId,
  });

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 100,
    getItemKey: (index) => tasks[index]?.id ?? index,
  });
  const virtualItems = virtualizer.getVirtualItems();

  // Gabungkan droppable ref dan scroll ref
  const mergedRef = (node: HTMLDivElement | null) => {
    scrollRef.current = node;
    droppableRef(node);
  };

  return (
    <div
      className={cn(
        'flex flex-col min-h-0 rounded-xl border shadow-sm border-border/70',
        {
          'bg-todo': title === 'To Do',
          'bg-progress': title === 'On Progress',
          'bg-done': title === 'Done',
        },
      )}
    >
      <h2
        className={cn('text-lg font-semibold p-3 tracking-tight', {
          'text-todo-foreground': title === 'To Do',
          'text-progress-foreground': title === 'On Progress',
          'text-done-foreground': title === 'Done',
        })}
      >
        {title}
      </h2>
      <div
        ref={mergedRef}
        className={cn(
          'overflow-y-auto flex-1 rounded-b-xl transition-colors duration-200',
          {
            'ring-2 ring-inset bg-primary/5 dark:bg-primary/10 ring-primary/30':
              isDropTarget,
          },
        )}
      >
        <div
          className="relative w-full"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          <div
            className="absolute top-0 left-0 space-y-3 w-full first:pt-2 last:pb-3"
            style={{
              transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
            }}
          >
            {virtualItems.map((virtualItem) => {
              const task = tasks[virtualItem.index];
              return (
                <div
                  key={task.id}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  className="px-3"
                >
                  <TaskCard task={task} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusColumn;
