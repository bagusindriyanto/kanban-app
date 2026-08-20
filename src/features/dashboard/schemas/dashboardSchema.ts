import z from 'zod';

const userStatsSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  avatar: z.string().nullable(),
  todo: z.coerce.number(),
  on_progress: z.coerce.number(),
  done: z.coerce.number(),
  total: z.coerce.number(),
  effective_minute: z.coerce.number(),
  working_minute: z.coerce.number(),
});

const tableDataSchema = z.object({
  user_id: z.string(),
  content: z.string(),
  sum_effective_minute: z.coerce.number(),
  avg_effective_minute: z.coerce.number(),
  tasks_count: z.coerce.number(),
  user: z.object({
    id: z.string(),
    profile: z.object({
      full_name: z.string(),
      avatar: z.string().nullable(),
    }),
    role: z.string(),
  }),
});

const chartDataSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  chart_data: z.array(
    z.object({
      date: z.string(),
      effective_minute: z.coerce.number(),
      working_minute: z.coerce.number(),
    }),
  ),
});

const pieChartDataSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  avatar: z.string().nullable(),
  tasks: z.array(
    z.object({
      content: z.string(),
      effective_minute: z.coerce.number(),
      tasks_count: z.coerce.number(),
    }),
  ),
});

const timeMetricSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  avatar: z.string().nullable(),
  tasks_count: z.coerce.number(),
  avg_cycle_minutes: z.coerce.number(),
  avg_time_to_start_minutes: z.coerce.number(),
  avg_processing_minutes: z.coerce.number(),
  avg_pause_minutes: z.coerce.number(),
  pause_ratio: z.coerce.number(),
});

const timeMetricsSummarySchema = z.object({
  tasks_count: z.coerce.number(),
  avg_cycle_minutes: z.coerce.number(),
  avg_time_to_start_minutes: z.coerce.number(),
  avg_processing_minutes: z.coerce.number(),
  avg_pause_minutes: z.coerce.number(),
  pause_ratio: z.coerce.number(),
});

const periodSummarySchema = z.object({
  done: z.coerce.number(),
  total: z.coerce.number(),
  effective_minute: z.coerce.number(),
  working_minute: z.coerce.number(),
});

const comparisonSchema = z.object({
  current: periodSummarySchema,
  previous: periodSummarySchema,
  period: z.object({
    current: z.object({ from: z.string(), to: z.string() }),
    previous: z.object({ from: z.string(), to: z.string() }),
  }),
  deltas: z.object({
    done: z.coerce.number().nullable(),
    total: z.coerce.number().nullable(),
    effective_minute: z.coerce.number().nullable(),
    working_minute: z.coerce.number().nullable(),
  }),
});

export const dashboardSchema = z.object({
  division: z.string().optional().default(''),
  stats: z.object({
    summary: z
      .object({
        todo: z.coerce.number(),
        on_progress: z.coerce.number(),
        done: z.coerce.number(),
        total: z.coerce.number(),
      })
      .default({
        todo: 0,
        on_progress: 0,
        done: 0,
        total: 0,
      }),
    users: z.array(userStatsSchema).default([]),
  }),
  table: z.object({
    rows: z.array(tableDataSchema).default([]),
    rows_count: z.coerce.number().default(0),
  }),
  chart: z.object({
    max_minute: z.coerce.number().default(0),
    charts: z.array(chartDataSchema).default([]),
  }),
  pie_chart: z.array(pieChartDataSchema).default([]),
  time_metrics: z
    .object({
      summary: timeMetricsSummarySchema.default({
        tasks_count: 0,
        avg_cycle_minutes: 0,
        avg_time_to_start_minutes: 0,
        avg_processing_minutes: 0,
        avg_pause_minutes: 0,
        pause_ratio: 0,
      }),
      users: z.array(timeMetricSchema).default([]),
    })
    .default({
      summary: {
        tasks_count: 0,
        avg_cycle_minutes: 0,
        avg_time_to_start_minutes: 0,
        avg_processing_minutes: 0,
        avg_pause_minutes: 0,
        pause_ratio: 0,
      },
      users: [],
    }),
  comparison: comparisonSchema.default({
    current: { done: 0, total: 0, effective_minute: 0, working_minute: 0 },
    previous: { done: 0, total: 0, effective_minute: 0, working_minute: 0 },
    period: {
      current: { from: '', to: '' },
      previous: { from: '', to: '' },
    },
    deltas: {
      done: null,
      total: null,
      effective_minute: null,
      working_minute: null,
    },
  }),
});

export type UserStats = z.infer<typeof userStatsSchema>;
export type TableData = z.infer<typeof tableDataSchema>;
export type ChartData = z.infer<typeof chartDataSchema>;
export type PieChartData = z.infer<typeof pieChartDataSchema>;
export type TimeMetric = z.infer<typeof timeMetricSchema>;
export type TimeMetricsSummary = z.infer<typeof timeMetricsSummarySchema>;
export type Comparison = z.infer<typeof comparisonSchema>;
export type Dashboard = z.infer<typeof dashboardSchema>;
