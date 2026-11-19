import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Fragment, useId } from 'react';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type MultiComboboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TItem,
> = {
  name: TName;
  control: Control<TFieldValues>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  items: TItem[] | undefined;
  valueKey: keyof TItem;
  labelKey: keyof TItem;
  placeholder?: string;
  className?: string;
};

const MultiComboboxField = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TItem,
>({
  name,
  control,
  label,
  required,
  disabled,
  items = [],
  valueKey,
  labelKey,
  placeholder,
  className,
}: MultiComboboxFieldProps<TFieldValues, TName, TItem>) => {
  const id = useId();
  const anchor = useComboboxAnchor();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedIds = Array.isArray(field.value)
          ? (field.value as string[])
          : [];

        const selectedItems =
          items?.filter((item) =>
            selectedIds.includes(String(item[valueKey])),
          ) ?? [];

        return (
          <Field
            data-invalid={fieldState.invalid}
            className={className}
            data-disabled={disabled}
          >
            <FieldLabel htmlFor={id} className="gap-0.5">
              {label}
              {required && <span className="text-red-500">*</span>}
            </FieldLabel>
            <Combobox
              multiple
              autoHighlight
              disabled={disabled}
              items={items}
              value={selectedItems}
              onValueChange={(selected) => {
                field.onChange(
                  (selected ?? []).map((item) => String(item[valueKey])),
                );
              }}
              itemToStringLabel={(item) => String(item[labelKey])}
              itemToStringValue={(item) => String(item[valueKey])}
              isItemEqualToValue={(item, value) =>
                String(item[valueKey]) === String(value[valueKey])
              }
            >
              <ComboboxChips ref={anchor} className="w-full">
                <ComboboxValue>
                  {(items: TItem[]) => (
                    <Fragment>
                      {items.map((item) => (
                        <ComboboxChip key={String(item[valueKey])}>
                          {String(item[labelKey])}
                        </ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        id={id}
                        aria-invalid={fieldState.invalid}
                        placeholder={items.length > 0 ? undefined : placeholder}
                        disabled={disabled}
                      />
                    </Fragment>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty>
                <ComboboxList>
                  {(item: TItem) => (
                    <ComboboxItem key={String(item[valueKey])} value={item}>
                      {String(item[labelKey])}
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

export default MultiComboboxField;
