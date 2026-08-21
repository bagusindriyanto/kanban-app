import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import UserAvatar from '@/components/shared/UserAvatar';
import { BriefcaseBusinessIcon, TimerResetIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Fte } from '@/types/dashboard';

const FteSummaryCard = ({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number | undefined;
  icon: ReactNode;
  iconClass: string;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/40 p-4 ring-1 ring-foreground/10">
      <div className="flex gap-2 items-center">
        <span
          className={`flex size-9 items-center justify-center rounded-xl bg-background ${iconClass}`}
        >
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
        <CardTitle>Analisis FTE</CardTitle>
        <CardDescription>
          Full-Time Equivalent berdasarkan baseline {baselineLabel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <FteSummaryCard
            label="Utilized FTE"
            value={summary?.utilized_fte}
            icon={<BriefcaseBusinessIcon className="size-4" />}
            iconClass="text-emerald-600"
          />
          <FteSummaryCard
            label="Productive FTE"
            value={summary?.productive_fte}
            icon={<TimerResetIcon className="size-4" />}
            iconClass="text-blue-600"
          />
        </div>

        {data?.users && data.users.length > 0 ? (
          <>
            <Separator className="my-4" />
            <div className="space-y-1">
              {data.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 rounded-xl px-2 py-2 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar profile={user} />
                    <span className="text-sm font-medium">
                      {user.full_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 tabular-nums">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Utilized
                      </p>
                      <p className="text-sm font-semibold">
                        {user.utilized_fte.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Productive
                      </p>
                      <p className="text-sm font-semibold">
                        {user.productive_fte.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default FteSection;