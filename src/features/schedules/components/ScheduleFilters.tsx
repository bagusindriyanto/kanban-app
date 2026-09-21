import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ScheduleScope, ScheduleStatus } from '../api/query';
import { scopes, statuses } from '../constants/calendar';

export type ScheduleFiltersProps = {
  scope: ScheduleScope;
  status: ScheduleStatus;
  onScopeChange: (scope: ScheduleScope) => void;
  onStatusChange: (status: ScheduleStatus) => void;
};

const ScheduleFilters = ({
  scope,
  status,
  onScopeChange,
  onStatusChange,
}: ScheduleFiltersProps) => (
  <>
    <Select
      value={scope}
      onValueChange={(value) => {
        if (value !== null) onScopeChange(value as ScheduleScope);
      }}
      items={scopes}
    >
      <SelectTrigger className="w-full sm:w-50">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        <SelectGroup>
          {scopes.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
    <Select
      value={status}
      onValueChange={(value) => {
        if (value !== null) onStatusChange(value as ScheduleStatus);
      }}
      items={statuses}
    >
      <SelectTrigger className="w-full sm:w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        <SelectGroup>
          {statuses.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </>
);

export default ScheduleFilters;
