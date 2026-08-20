import { FilterCalendar } from '@/components/shared/filter/FilterCalendar';
import { RefreshToggle } from '@/components/shared/RefreshToggle';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import ErrorBanner from '@/components/shared/ErrorBanner';
// import { Badge } from '@/components/ui/badge';
import { useFetchDashboard } from '@/features/dashboard/api/fetchDashboard';
import UserStatsCardSkeleton from '../features/dashboard/components/stats/UserStatsCardSkeleton';
import UserStatsCard from '../features/dashboard/components/stats/UserStatsCard';
import BarChartCard from '../features/dashboard/components/bar-chart/BarChartCard';
import DataTableCard from '../features/dashboard/components/data-table/DataTableCard';
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters';
import OfflineBanner from '@/components/shared/OfflineBanner';
import KpiStrip from '@/features/dashboard/components/stats/KpiStrip';
import PieChartCard from '@/features/dashboard/components/pie-chart/PieChartCard';

const DashboardPage = () => {
  const { dashboardFilters } = useDashboardFilters();

  const { data, error, isLoading, dataUpdatedAt } = useFetchDashboard({
    filters: dashboardFilters,
  });

  // const {
  //   data,
  //   error: fetchStatsError,
  //   isLoading,
  //   dataUpdatedAt,
  // } = useFetchStats(queryParams);

  // const { data: tableData, error: fetchTableDataError } =
  //   useFetchTableData(queryParams);

  // const { data: chartData, error: fetchChartDataError } =
  //   useFetchChartData(queryParams);

  // Cek status online/offline
  const isOnline = useOnlineStatus();

  return (
    <div className="flex flex-col gap-4">
      {/* Filter */}
      <div className="flex justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Performance Dashboard
          </h2>
          <p className="text-muted-foreground">{data?.division ?? '-'}</p>
        </div>
        <div className="flex gap-2 items-center">
          <RefreshToggle dataUpdatedAt={dataUpdatedAt} />
          {/* Filter Tanggal */}
          <FilterCalendar />
        </div>
      </div>
      {/* Main */}
      {!isOnline ? (
        <OfflineBanner />
      ) : error ? (
        <ErrorBanner errorMessage={error.message} />
      ) : null}
      {/* KPI */}
      <KpiStrip
        summary={data?.stats?.summary}
        comparison={data?.comparison}
      />
      {/* User Stats */}
      <div className="my-6">
        <h3 className="mb-3 text-lg font-semibold tracking-tight">
          Statistik Per PIC
        </h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <UserStatsCardSkeleton
                  key={i}
                  className="w-[calc((100%-4*16px)/5)]"
                />
              ))
            : data?.stats?.users?.map((user) => (
                <UserStatsCard
                  key={user.id}
                  user={user}
                  timeMetric={data?.time_metrics?.users?.find(
                    (tm) => tm.id === user.id,
                  )}
                  className="w-[calc((100%-4*16px)/5)]"
                />
              ))}
        </div>
      </div>
      {/* Table */}
      <DataTableCard data={data?.table?.rows} />
      {/* Bar Chart */}
      <BarChartCard data={data?.chart} />
      {/* Pie Chart */}
      <PieChartCard data={data?.pie_chart} />
    </div>
  );
};

export default DashboardPage;
