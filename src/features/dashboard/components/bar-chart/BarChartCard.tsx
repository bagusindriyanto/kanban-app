import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { EvilBarChart } from '@/components/evilcharts/charts/recharts-bar-chart';
import { formatDuration } from '@/utils/formatDuration';
import type { ChartData } from '@/types/dashboard';

const chartConfig = {
  effective_minute: {
    label: 'Waktu aktivitas',
    colors: { light: ['var(--chart-2)'], dark: ['var(--chart-2)'] },
  },
  working_minute: {
    label: 'Waktu kerja',
    colors: { light: ['var(--chart-4)'], dark: ['var(--chart-4)'] },
  },
};

const BarChartCard = ({
  data,
}: {
  data: { charts: ChartData[]; max_minute: number } | undefined;
}) => {
  const byDate = new Map<
    string,
    { date: string; effective_minute: number; working_minute: number }
  >();

  for (const user of data?.charts ?? []) {
    for (const day of user.chart_data) {
      const total = byDate.get(day.date) ?? {
        date: day.date,
        effective_minute: 0,
        working_minute: 0,
      };
      total.effective_minute += day.effective_minute;
      total.working_minute += day.working_minute;
      byDate.set(day.date, total);
    }
  }

  const chartData = [...byDate.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Tren aktivitas & waktu kerja</CardTitle>
        <CardDescription>
          Total durasi harian seluruh PIC pada periode terpilih.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Belum ada data waktu</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <EvilBarChart
            data={chartData}
            config={chartConfig}
            className="h-72 w-full"
            animationType="none"
            barRadius={3}
          >
            <EvilBarChart.Grid />
            <EvilBarChart.Legend />
            <EvilBarChart.XAxis
              dataKey="date"
              tickFormatter={(value: string) =>
                new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })
              }
            />
            <EvilBarChart.YAxis
              tickFormatter={(value: number) => formatDuration(value)}
            />
            <EvilBarChart.Tooltip />
            <EvilBarChart.Bar dataKey="effective_minute" />
            <EvilBarChart.Bar dataKey="working_minute" />
          </EvilBarChart>
        )}
      </CardContent>
    </Card>
  );
};

export default BarChartCard;
