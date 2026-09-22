import type { CalendarController } from '@fullcalendar/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AddTaskModal from '@/features/tasks/components/form/AddTaskModal';
import ScheduleFilters, { type ScheduleFiltersProps } from './ScheduleFilters';
import { views } from '../constants/calendar';

type ScheduleControlsProps = ScheduleFiltersProps & {
  controller: CalendarController;
  viewType: string;
};

const ScheduleControls = ({
  controller,
  viewType,
  ...filters
}: ScheduleControlsProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <ScheduleFilters {...filters} />
    <Select
      value={viewType}
      onValueChange={(value) => {
        if (value !== null) controller.changeView(value);
      }}
      items={views}
    >
      <SelectTrigger className="w-30">
        <SelectValue>
          {(value: string) => {
            const selectedView = views.find((view) => view.value === value);
            if (!selectedView) return value;

            return (
              <span className="flex items-center gap-2">
                <selectedView.icon />
                <span>{selectedView.label}</span>
              </span>
            );
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectLabel>Mode Tampilan</SelectLabel>
          {views.map((view) => (
            <SelectItem key={view.value} value={view.value}>
              <span className="flex items-center gap-2">
                <view.icon /> <span>{view.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
    <ButtonGroup>
      <Button size="icon" variant="outline" onClick={() => controller.prev()}>
        <ChevronLeftIcon />
      </Button>
      <Button variant="outline" onClick={() => controller.today()}>
        Hari Ini
      </Button>
      <Button size="icon" variant="outline" onClick={() => controller.next()}>
        <ChevronRightIcon />
      </Button>
    </ButtonGroup>
    <AddTaskModal defaultScheduled />
  </div>
);

export default ScheduleControls;
