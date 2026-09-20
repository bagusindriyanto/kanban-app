import { formatToSQL } from '@/utils/formatTimestamp';
import z from 'zod';

const baseSchema = z.object({
  content: z.string().min(1, 'Mohon pilih salah satu aktivitas.'),
  user_id: z.string().min(1, 'Mohon pilih PIC.'),
  status: z.enum(['todo', 'on progress', 'done'], {
    error: 'Status harus dipilih.',
  }),
  minute_pause: z.number().nonnegative('Durasi pause harus 0 atau lebih.'),
  pause_time: z.boolean(),
  detail: z.coerce
    .string()
    .max(100, 'Detail tidak boleh lebih dari 100 karakter.')
    .trim()
    .optional(),
  timestamp_todo: z.date('Mohon isi tanggal dan waktu.'),
  timestamp_progress: z.date('Mohon isi tanggal dan waktu.').nullish(),
  timestamp_done: z.date('Mohon isi tanggal dan waktu.').nullish(),
  is_scheduled: z.boolean(),
  scheduled_at: z.date().nullish(),
});

export const formSchema = baseSchema.superRefine((data, ctx) => {
  if (data.is_scheduled && !data.scheduled_at) {
    ctx.addIssue({
      code: 'custom',
      message: 'Mohon isi tanggal dan waktu.',
      path: ['scheduled_at'],
    });
  }
  if (data.status !== 'todo' && !data.timestamp_progress) {
    ctx.addIssue({
      code: 'custom',
      message: 'Mohon isi tanggal dan waktu.',
      path: ['timestamp_progress'],
    });
  }
  if (data.status === 'done' && !data.timestamp_done) {
    ctx.addIssue({
      code: 'custom',
      message: 'Mohon isi tanggal dan waktu.',
      path: ['timestamp_done'],
    });
  }
});

export type UpdateTaskFormInput = z.input<typeof formSchema>;

export const submitSchema = baseSchema
  .omit({
    is_scheduled: true,
  })
  .extend({
    id: z.number(),
    assigner_id: z.string().nullish(),
  })
  .transform((data) => ({
    ...data,
    detail: data.detail || null,
    minute_activity:
      data.timestamp_progress && data.timestamp_done
        ? Math.floor(
            (data.timestamp_done.getTime() -
              data.timestamp_progress.getTime()) /
              60000,
          ) - data.minute_pause
        : 0,
    pause_time: data.pause_time ? formatToSQL(new Date()) : null,
    timestamp_todo: new Date(data.timestamp_todo).toISOString(),
    timestamp_progress: formatToSQL(data.timestamp_progress),
    timestamp_done: formatToSQL(data.timestamp_done),
    scheduled_at: formatToSQL(data.scheduled_at),
    // updated_at: formatToSQL(new Date()),
  }));

export type UpdateTaskSubmitInput = z.output<typeof submitSchema>;
