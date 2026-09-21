import type { CalendarController } from '@fullcalendar/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
    <ButtonGroup>
      <Button size="icon" variant="outline" onClick={() => controller.prev()}>
        <ChevronLeftIcon />
      </Button>
      <Button variant="outline" onClick={() => controller.today()}>
        Hari ini
      </Button>
      <Button size="icon" variant="outline" onClick={() => controller.next()}>
        <ChevronRightIcon />
      </Button>
    </ButtonGroup>
    <Select
      value={viewType}
      onValueChange={(value) => {
        if (value !== null) controller.changeView(value);
      }}
      items={views}
    >
      <SelectTrigger className="w-30">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        <SelectGroup>
          {views.map((view) => (
            <SelectItem key={view.value} value={view.value}>
              {view.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
    <AddTaskModal defaultScheduled />
  </div>
);

export default ScheduleControls;
