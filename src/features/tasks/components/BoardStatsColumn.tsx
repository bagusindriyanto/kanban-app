import {
  CircleCheckBigIcon,
  CircleDotIcon,
  LayoutListIcon,
  LoaderIcon,
} from 'lucide-react';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { SlidingNumber } from '@/components/shared/SlidingNumber';
import type { TaskWithProfile } from '../api/query';

const BoardStatsColumn = ({ tasks }: { tasks: TaskWithProfile[] }) => {
  const todoCount = tasks?.filter((task) => task.status === 'todo').length || 0;
  const onProgressCount =
    tasks?.filter((task) => task.status === 'on progress').length || 0;
  const doneCount = tasks?.filter((task) => task.status === 'done').length || 0;
  const totalCount = tasks?.length || 0;

  const chartData = [
    { label: 'progress', value: doneCount, fill: 'var(--color-progress)' }, // progress
  ];
  const chartConfig = {
    value: {
      label: 'Progress',
    },
    progress: {
      label: 'Progress',
      color: 'var(--chart-1)',
    },
  };

  const endAngle = totalCount > 0 ? 90 - (doneCount / totalCount) * 360 : 0;
  const progress = totalCount > 0 ? doneCount / totalCount : 0;
  const progressLabel = new Intl.NumberFormat('id-ID', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(progress);

  return (
    <div className="flex flex-col rounded-2xl border select-none size-full w-85 min-w-85 max-sm:w-full max-sm:min-w-full max-sm:snap-center shadow-xs border-border/70 bg-card">
      <h2 className="p-3 text-lg font-semibold tracking-tight text-card-foreground">
        Statistik
      </h2>
      <ChartContainer config={chartConfig} className="flex-1">
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={endAngle}
          innerRadius={80}
          outerRadius={90}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted last:fill-background"
            polarRadius={[90, 80]}
          />
          <RadialBar dataKey="value" background cornerRadius={10} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="text-4xl font-bold fill-foreground"
                      >
                        {progressLabel}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Complete
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
      <div className="grid grid-cols-2 gap-2 p-3">
        <div className="flex flex-col gap-2 justify-between p-3 rounded-lg border border-todo-border bg-todo">
          <div className="flex items-center gap-1.5 text-xs font-medium text-todo-foreground">
            <CircleDotIcon className="size-3.5" />
            To Do
          </div>
          <span className="text-2xl font-bold tracking-tight text-todo-foreground">
            <SlidingNumber value={todoCount} />
          </span>
        </div>
        <div className="flex flex-col gap-2 justify-between p-3 rounded-lg border border-progress-border bg-progress">
          <div className="flex items-center gap-1.5 text-xs font-medium text-progress-foreground">
            <LoaderIcon className="size-3.5" />
            On Progress
          </div>
          <span className="text-2xl font-bold tracking-tight text-progress-foreground">
            <SlidingNumber value={onProgressCount} />
          </span>
        </div>
        <div className="flex flex-col gap-2 justify-between p-3 rounded-lg border border-done-border bg-done">
          <div className="flex items-center gap-1.5 text-xs font-medium text-done-foreground">
            <CircleCheckBigIcon className="size-3.5" />
            Done
          </div>
          <span className="text-2xl font-bold tracking-tight text-done-foreground">
            <SlidingNumber value={doneCount} />
          </span>
        </div>
        <div className="flex flex-col gap-2 justify-between p-3 rounded-lg border border-total-border bg-total">
          <div className="flex items-center gap-1.5 text-xs font-medium text-total-foreground">
            <LayoutListIcon className="size-3.5" />
            Total
          </div>
          <span className="text-2xl font-bold tracking-tight text-total-foreground">
            <SlidingNumber value={totalCount} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default BoardStatsColumn;
