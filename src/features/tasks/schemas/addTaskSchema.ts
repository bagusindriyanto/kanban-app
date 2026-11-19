import { formatToSQL } from '@/utils/formatTimestamp';
import z from 'zod';

const baseSchema = z.object({
  content: z.string().min(1, 'Mohon pilih salah satu aktivitas.'),
  user_ids: z.array(z.string()),
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
  if (data.is_assigned && data.user_ids.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Mohon pilih PIC.',
      path: ['user_ids'],
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
    user_ids: z.array(z.string()).min(1),
    assigner_id: z.string().nullish(),
  })
  .transform((data) => {
    const { user_ids, ...task } = data;

    return user_ids.map((user_id) => ({
      ...task,
      user_id,
      scheduled_at: formatToSQL(task.scheduled_at),
    }));
  });

export type AddTaskSubmitInput = z.output<typeof submitSchema>;
