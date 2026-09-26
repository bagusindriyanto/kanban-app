import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BriefcaseBusinessIcon, TimerResetIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Fte } from '@/types/dashboard';

const FteSummaryCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | undefined;
  icon: ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/40 p-4 ring-1 ring-foreground/10">
      <div className="flex gap-2 items-center">
        <span className="flex size-9 items-center justify-center rounded-xl bg-background text-primary">
          {icon}
        </span>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold tracking-tight tabular-nums">
        {value?.toFixed(2) ?? '0.00'}
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          FTE
        </span>
      </p>
    </div>
  );
};

const FteSection = ({ data }: { data: Fte | undefined }) => {
  const summary = data?.summary;
  const workingDays = data?.working_days;

  const baselineLabel = workingDays
    ? `${workingDays.mon_fri} hari (Sen–Jum) + ${workingDays.saturday} hari (Sab)`
    : '-';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kapasitas tim (FTE)</CardTitle>
        <CardDescription>
          Baseline {baselineLabel}; 450 menit per hari kerja dan 300 menit per Sabtu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <FteSummaryCard
            label="Utilized FTE"
            value={summary?.utilized_fte}
            icon={<BriefcaseBusinessIcon className="size-4" />}
          />
          <FteSummaryCard
            label="Productive FTE"
            value={summary?.productive_fte}
            icon={<TimerResetIcon className="size-4" />}
          />
        </div>

      </CardContent>
    </Card>
  );
};

export default FteSection;
