import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { FieldGroup, FieldSeparator, FieldSet } from '@/components/ui/field';
import { useFetchUsers } from '@/features/users/api/fetchUsers';
import useAuthStore from '@/stores/authStore';
import TextareaField from '@/components/shared/form/TextareaField';
import SwitchField from '@/components/shared/form/SwitchField';
import DateTimeField from '@/components/shared/form/DateTimeField';
import ComboboxField from '@/components/shared/form/ComboboxField';
import { useAddTask } from '@/features/tasks/api/addTask';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import ActivitiesCombobox from '@/features/activities/components/ActivitiesCombobox';
import {
  formSchema,
  submitSchema,
  type AddTaskFormInput,
} from '../../schemas/addTaskSchema';

type AddTaskFormProps = {
  isMobile: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddTaskForm = ({ isMobile, onOpenChange }: AddTaskFormProps) => {
  // Fetch Data
  const { data: users } = useFetchUsers();
  const { mutateAsync: addTaskMutate, isPending } = useAddTask();

  const currentUser = useAuthStore((state) => state.currentUser);
  const filteredUsers = users?.filter((user) => {
    if (!currentUser) return true;
    return user.user_id !== currentUser.id;
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      user_id: null,
      detail: '',
      is_scheduled: false,
      is_assigned: false,
      scheduled_at: undefined,
    },
  });

  const [isScheduled, isAssigned] = useWatch({
    control: form.control,
    name: ['is_scheduled', 'is_assigned'],
  });

  const onSubmit = (data: AddTaskFormInput) => {
    if (!currentUser) return;

    const payload = {
      ...data,
      user_id: isAssigned ? data.user_id : currentUser.id,
      assigner_id: isAssigned ? currentUser.id : null,
    };

    const result = submitSchema.safeParse(payload);

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    toast.promise(addTaskMutate(result.data), {
      loading: 'Sedang menambahkan task...',
      success: () => {
        form.reset();
        onOpenChange(false);
        return 'Task berhasil ditambahkan';
      },
      error: (err) => {
        return {
          message: 'Task gagal ditambahkan',
          description: err?.message || null,
        };
      },
    });
  };

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 mt-4 pb-2 md:-mx-4 md:mt-0">
        <FieldSet>
          {isMobile && (
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card mt-2">
              Aktivitas
            </FieldSeparator>
          )}
          <FieldGroup>
            {/* Activity */}
            <ActivitiesCombobox name="content" control={form.control} />
          </FieldGroup>
          {isMobile && (
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card mt-2">
              Penugasan
            </FieldSeparator>
          )}
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-17">
            {/* Assigned Switch */}
            <SwitchField
              name="is_assigned"
              control={form.control}
              label="Tugaskan Task?"
              className="mt-6"
            />
            {/* PIC Combo Box */}
            <ComboboxField
              name="user_id"
              control={form.control}
              label="Tugaskan ke"
              required={isAssigned}
              disabled={!isAssigned}
              items={filteredUsers}
              valueKey="user_id"
              labelKey="name"
              placeholder="Pilih PIC"
            />
          </FieldGroup>
          {isMobile && (
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card mt-2">
              Jadwal
            </FieldSeparator>
          )}
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-17">
            {/* Appointment Switch */}
            <SwitchField
              name="is_scheduled"
              control={form.control}
              label="Jadwalkan Task?"
              className="mt-6"
            />
            {/* Appointment Date */}
            <DateTimeField
              name="scheduled_at"
              control={form.control}
              label="Tanggal & Waktu Jadwal"
              required={isScheduled}
              disabled={!isScheduled}
              side={isMobile ? 'bottom' : 'right'}
              disabledDate="before"
            />
          </FieldGroup>
          {isMobile && (
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card mt-2">
              Detail
            </FieldSeparator>
          )}
          {/* Detail */}
          <FieldGroup>
            <TextareaField
              name="detail"
              control={form.control}
              label="Detail"
              placeholder="Detail task"
            />
          </FieldGroup>
        </FieldSet>
      </div>
      <div className="mt-4 grid grid-cols-2 shrink-0 gap-2 px-4 pb-4 md:mt-6 md:grid-cols-[1fr_auto] md:justify-items-end md:justify-end md:p-0">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => onOpenChange(false)}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          {isPending ? 'Tambah...' : 'Tambah'}
        </Button>
      </div>
    </form>
  );
};

export default AddTaskForm;
