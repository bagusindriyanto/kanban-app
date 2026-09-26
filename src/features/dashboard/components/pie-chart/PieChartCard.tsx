import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { BanIcon } from 'lucide-react';
import usePieChartData from '../../hooks/usePieChartData';
import type { PieChartData } from '../../schemas/dashboardSchema';
import { EvilPieChart } from '@/components/evilcharts/charts/recharts-pie-chart';

const PieChartItem = ({ tasks }: { tasks: PieChartData['tasks'] }) => {
  const { chartData, chartConfig } = usePieChartData(tasks);

  return (
    <EvilPieChart
      className="size-full max-h-50 p-4"
      data={chartData}
      dataKey="effective_minute"
      nameKey="content"
      config={chartConfig}
    >
      <EvilPieChart.Legend isClickable />
      <EvilPieChart.Tooltip />
      <EvilPieChart.Pie isClickable>
        <EvilPieChart.Label />
      </EvilPieChart.Pie>
    </EvilPieChart>
  );
};

const EmptyChartItem = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BanIcon />
        </EmptyMedia>
        <EmptyTitle>Tidak Ada Aktivitas</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
};

const PieChartCard = ({ data }: { data: PieChartData[] | undefined }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proporsi Aktivitas</CardTitle>
        <CardDescription>
          Menampilkan proporsi setiap aktivitas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {!data || data.length === 0 ? (
          <EmptyChartItem />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.map(({ id, full_name, tasks }) => (
              <div key={id} className="flex min-w-0 flex-col gap-2">
                <h2 className="font-semibold tracking-tight">{full_name}</h2>
                <PieChartItem tasks={tasks} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChartCard;
