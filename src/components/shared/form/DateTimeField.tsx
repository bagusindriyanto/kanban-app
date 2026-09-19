import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TimePickerDemo } from '@/components/ui/time-picker-demo';
import { cn } from '@/lib/utils';
import { endOfDay, format, startOfDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Trash2Icon, CalendarIcon } from 'lucide-react';
import { useId } from 'react';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DropdownProps } from '@daypicker/react';

const DateDropdown = ({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: DropdownProps) => {
  const handleValueChange = (newValue: string | null) => {
    if (onChange && newValue !== null) {
      const syntheticEvent = {
        target: {
          value: newValue,
        },
      } as React.ChangeEvent<HTMLSelectElement>;

      onChange(syntheticEvent);
    }
  };

  return (
    <Select
      items={options}
      value={String(value)}
      onValueChange={handleValueChange}
    >
      <SelectTrigger aria-label={ariaLabel}>
        <SelectValue>
          {options?.find((option) => String(option.value) === String(value))
            ?.label || ''}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-fit">
        <SelectGroup>
          {options?.map((option) => (
            <SelectItem
              key={option.value}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

type DateTimeFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  control: Control<TFieldValues>;
  side: 'left' | 'right' | 'top' | 'bottom' | 'inline-start' | 'inline-end';
  label?: string;
  required?: boolean;
  disabled?: boolean;
  disabledDate?: 'after' | 'before';
  className?: string;
};

const DateTimeField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  side,
  label,
  required,
  disabled,
  disabledDate = 'after',
  className,
}: DateTimeFieldProps<TFieldValues, TName>) => {
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={className}
          data-disabled={disabled}
        >
          <FieldLabel htmlFor={id} className="gap-0.5">
            {label}
            {required && <span className="text-red-500">*</span>}
          </FieldLabel>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="secondary"
                  id={id}
                  aria-invalid={fieldState.invalid}
                  className={cn(
                    'w-full justify-start text-left',
                    !field.value && 'text-muted-foreground',
                  )}
                  disabled={disabled}
                />
              }
            >
              <CalendarIcon data-icon="inline-start" />
              {field.value ? (
                format(field.value, 'd/M/yyyy, HH:mm:ss', {
                  locale: idLocale,
                })
              ) : (
                <span>Pilih tanggal dan waktu</span>
              )}
            </PopoverTrigger>
            <PopoverContent side={side} className="p-0 w-auto">
              <Calendar
                mode="single"
                locale={idLocale}
                captionLayout="dropdown"
                components={{ Dropdown: DateDropdown }}
                classNames={{
                  nav: 'flex items-center w-full absolute top-0 inset-x-0 justify-between pointer-events-none [&>button]:pointer-events-auto',
                }}
                weekStartsOn={1}
                selected={field.value}
                onSelect={field.onChange}
                disabled={
                  disabledDate === 'before'
                    ? { before: startOfDay(new Date()) }
                    : disabledDate === 'after'
                      ? { after: endOfDay(new Date()) }
                      : undefined
                }
                autoFocus
              />
              <div className="flex gap-1 justify-between items-end px-3 py-2 border-t">
                <TimePickerDemo setDate={field.onChange} date={field.value} />
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => field.onChange(undefined)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default DateTimeField;
