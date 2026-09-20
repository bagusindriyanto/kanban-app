import { formatToSQL } from '@/utils/formatTimestamp';
import z from 'zod';

const baseSchema = z.object({
  content: z.string().min(1, 'Mohon pilih salah satu aktivitas.'),
  user_id: z.string().nullish(),
  detail: z.coerce
    .string()
    .max(100, 'Detail tidak boleh lebih dari 100 karakter.')
    .trim()
    .optional(),
  is_scheduled: z.boolean(),
  is_assigned: z.boolean(),
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
  if (data.is_assigned && !data.user_id) {
    ctx.addIssue({
      code: 'custom',
      message: 'Mohon pilih PIC.',
      path: ['user_id'],
    });
  }
});

export type AddTaskFormInput = z.input<typeof formSchema>;

export const submitSchema = baseSchema
  .omit({
    is_scheduled: true,
    is_assigned: true,
  })
  .extend({
    user_id: z.string(),
    assigner_id: z.string().nullish(),
  })
  .transform((data) => ({
    ...data,
    scheduled_at: formatToSQL(data.scheduled_at),
  }));

export type AddTaskSubmitInput = z.output<typeof submitSchema>;
