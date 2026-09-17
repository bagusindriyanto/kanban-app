import { useFetchActivities } from '@/features/activities/api/fetchActivities';
import { useAddActivity } from '@/features/activities/api/addActivity';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useId } from 'react';
import { Controller } from 'react-hook-form';
import { ListXIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { useFetchCurrentUser } from '@/features/users/api/fetchCurrentUser';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import type { Activity } from '../api/query';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

type ActivitiesComboboxProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName;
  control: Control<TFieldValues>;
  className?: string;
};

const ActivitiesCombobox = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  control,
  className,
}: ActivitiesComboboxProps<TFieldValues, TName>) => {
  const id = useId();
  const { data: currentUser, isLoading: isLoadingCurrentUser } =
    useFetchCurrentUser();
  const divisionId = currentUser?.division_id ?? undefined;
  const { data: contents, isLoading: isLoadingActivities } = useFetchActivities(
    { divisionId },
  );
  const { mutateAsync, isPending } = useAddActivity();
  const isLoading = isLoadingCurrentUser || isLoadingActivities;

  const onSubmit = (name: string) => {
    if (!divisionId) return;

    toast.promise(mutateAsync({ name, division_id: divisionId }), {
      loading: 'Sedang menambahkan aktivitas...',
      success: () => {
        return 'Aktivitas berhasil ditambahkan';
      },
      error: (err) => {
        return {
          message: 'Aktivitas gagal ditambahkan',
          description: err.message || null,
        };
      },
    });
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedContent =
          contents?.find(
            (content) => String(content.name) === String(field.value),
          ) ?? null;

        return (
          <Field
            data-invalid={fieldState.invalid}
            className={className}
            data-disabled={isLoading || !divisionId}
          >
            <FieldLabel htmlFor={id} className="gap-0.5">
              Aktivitas <span className="text-red-500">*</span>
            </FieldLabel>
            <Combobox
              autoHighlight
              items={contents}
              value={selectedContent}
              inputValue={field.value || ''}
              onInputValueChange={field.onChange}
              onValueChange={(content) => {
                if (content) field.onChange(content.name);
              }}
              itemToStringLabel={(content) => content.name}
              itemToStringValue={(content) => content.name}
            >
              <ComboboxInput
                id={id}
                aria-invalid={fieldState.invalid}
                placeholder="Cari atau buat aktivitas"
                disabled={isLoading || !divisionId}
                showClear
              />
              <ComboboxContent>
                <ComboboxEmpty>
                  {field.value.trim() ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-4">
                      <p className="text-sm text-muted-foreground">
                        &quot;{field.value.trim()}&quot; tidak ditemukan.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isPending || !divisionId}
                        onClick={() => {
                          onSubmit(field.value.trim());
                        }}
                      >
                        {isPending ? (
                          <>
                            <Spinner data-icon="inline-start" />
                            Menambahkan...
                          </>
                        ) : (
                          <>
                            <PlusIcon data-icon="inline-start" />
                            Tambahkan Aktivitas
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Empty className="py-6">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ListXIcon />
                        </EmptyMedia>
                        <EmptyTitle className="text-foreground text-base">
                          Daftar Aktivitas Kosong
                        </EmptyTitle>
                        <EmptyDescription>
                          Silakan ketik aktivitas untuk menambahkannya.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </ComboboxEmpty>
                <ComboboxList>
                  {(content: Activity) => (
                    <ComboboxItem key={content.name} value={content}>
                      {content.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};

export default ActivitiesCombobox;
