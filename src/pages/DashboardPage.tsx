import { FilterCalendar } from '@/components/shared/filter/FilterCalendar';
import { RefreshToggle } from '@/components/shared/RefreshToggle';
import ErrorBanner from '@/components/shared/ErrorBanner';
import OfflineBanner from '@/components/shared/OfflineBanner';
import UserAvatar from '@/components/shared/UserAvatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFetchDashboard } from '@/features/dashboard/api/fetchDashboard';
import BarChartCard from '@/features/dashboard/components/bar-chart/BarChartCard';
import DataTableCard from '@/features/dashboard/components/data-table/DataTableCard';
import FteSection from '@/features/dashboard/components/fte/FteSection';
import PieChartCard from '@/features/dashboard/components/pie-chart/PieChartCard';
import KpiStrip from '@/features/dashboard/components/stats/KpiStrip';
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { Dashboard, TimeMetricsSummary } from '@/types/dashboard';
import { formatDuration } from '@/utils/formatDuration';

const formatMinutes = (minutes: number) => formatDuration(Math.round(minutes));

const TimeMetricsCard = ({ data }: { data: TimeMetricsSummary }) => {
  const metrics = [
    { label: 'Waktu mulai', value: formatMinutes(data.avg_time_to_start_minutes) },
    { label: 'Pengerjaan', value: formatMinutes(data.avg_processing_minutes) },
    { label: 'Jeda', value: formatMinutes(data.avg_pause_minutes) },
    { label: 'Rasio jeda', value: `${data.pause_ratio}%` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Efisiensi waktu</CardTitle>
        <CardDescription>
          Rata-rata dari {data.tasks_count.toLocaleString('id-ID')} tugas selesai.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="rounded-2xl bg-muted p-4">
          <p className="text-sm text-muted-foreground">Waktu siklus rata-rata</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {data.tasks_count ? formatMinutes(data.avg_cycle_minutes) : '—'}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-1">
              <dt className="text-sm text-muted-foreground">{metric.label}</dt>
              <dd className="text-lg font-semibold tabular-nums">
                {data.tasks_count ? metric.value : '—'}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};

const TeamPerformanceCard = ({ data }: { data: Dashboard }) => {
  const timeByUser = new Map(data.time_metrics.users.map((user) => [user.id, user]));
  const users = [...data.stats.users].sort((a, b) => b.done - a.done);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Kinerja PIC</CardTitle>
        <CardDescription>
          Volume tugas dan waktu per orang pada periode terpilih.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Belum ada PIC</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PIC</TableHead>
                <TableHead className="text-right">Selesai</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Waktu efektif</TableHead>
                <TableHead className="text-right">Siklus rata-rata</TableHead>
                <TableHead className="text-right">Rasio jeda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const time = timeByUser.get(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <UserAvatar profile={user} size="sm" />
                        <span>{user.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {user.done.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {user.total.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMinutes(user.effective_minute)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {time?.tasks_count ? formatMinutes(time.avg_cycle_minutes) : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {time?.tasks_count ? `${time.pause_ratio}%` : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const { dashboardFilters } = useDashboardFilters();
  const { data, error, isLoading, dataUpdatedAt } = useFetchDashboard({
    filters: dashboardFilters,
  });
  const isOnline = useOnlineStatus();
  const period = data?.comparison.period.current;

  return (
    <main className="flex min-w-0 flex-col gap-6 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Performance Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            {data?.division || 'Ringkasan kinerja divisi'}
            {period?.from && period?.to
              ? ` · ${period.from} – ${period.to}`
              : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RefreshToggle dataUpdatedAt={dataUpdatedAt} />
          <FilterCalendar />
        </div>
      </header>

      {!isOnline && <OfflineBanner />}
      {error && <ErrorBanner errorMessage={error.message} />}

      {data ? (
        <>
          <section aria-label="Ringkasan tugas">
            <KpiStrip summary={data.stats.summary} comparison={data.comparison} />
          </section>

          <section aria-label="Tren dan efisiensi" className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
            <BarChartCard data={data.chart} />
            <TimeMetricsCard data={data.time_metrics.summary} />
          </section>

          <section aria-label="Kinerja dan kapasitas tim" className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
            <TeamPerformanceCard data={data} />
            <FteSection data={data.fte} />
          </section>

          <section aria-label="Rincian aktivitas" className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-semibold">Rincian aktivitas</h2>
              <p className="text-sm text-muted-foreground">
                Komposisi waktu dan data aktivitas per PIC.
              </p>
            </div>
            <Tabs defaultValue="table">
              <TabsList aria-label="Tampilan rincian aktivitas">
                <TabsTrigger value="table">Detail aktivitas</TabsTrigger>
                <TabsTrigger value="composition">Komposisi</TabsTrigger>
              </TabsList>
              <TabsContent value="table">
                <DataTableCard data={data.table.rows} />
              </TabsContent>
              <TabsContent value="composition">
                <PieChartCard data={data.pie_chart} />
              </TabsContent>
            </Tabs>
          </section>
        </>
      ) : isLoading ? (
        <div className="flex flex-col gap-4" aria-label="Memuat dashboard">
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Dashboard belum tersedia</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
    </main>
  );
};

export default DashboardPage;
