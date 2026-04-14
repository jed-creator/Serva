'use client';

import { useActionState, useState } from 'react';
import {
  updateAvailabilityAction,
  type AvailabilityActionState,
} from '@/app/actions/availability';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubmitButton } from '@/components/auth/submit-button';

const initialState: AvailabilityActionState = {};

interface AvailabilityFormProps {
  dayLabels: string[];
  existing: Record<number, { start: string; end: string } | undefined>;
}

interface DayState {
  working: boolean;
  start: string;
  end: string;
}

export function AvailabilityForm({ dayLabels, existing }: AvailabilityFormProps) {
  const [state, formAction] = useActionState(
    updateAvailabilityAction,
    initialState,
  );

  // Build initial state from existing rules. Default: Mon-Fri 09:00-17:00.
  const [days, setDays] = useState<DayState[]>(() =>
    Array.from({ length: 7 }, (_, i) => {
      const e = existing[i];
      if (e) return { working: true, start: e.start, end: e.end };
      const isWeekday = i >= 1 && i <= 5;
      return { working: isWeekday, start: '09:00', end: '17:00' };
    }),
  );

  const setDay = (index: number, patch: Partial<DayState>) => {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly schedule</CardTitle>
        <CardDescription>
          Toggle each day and set your working hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {state.errors && state.errors.length > 0 && (
            <Alert variant="error">
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {state.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {state.success && (
            <Alert variant="success">
              <AlertDescription>Availability saved.</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            {days.map((day, i) => (
              <div
                key={i}
                className="grid grid-cols-[140px_1fr_1fr] gap-3 items-center"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={`day_${i}_working`}
                    checked={day.working}
                    onChange={(e) => setDay(i, { working: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <span className="text-sm font-medium text-zinc-700">
                    {dayLabels[i]}
                  </span>
                </label>
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor={`day_${i}_start`}
                    className="text-xs text-zinc-500"
                  >
                    Start
                  </Label>
                  <Input
                    id={`day_${i}_start`}
                    name={`day_${i}_start`}
                    type="time"
                    value={day.start}
                    disabled={!day.working}
                    onChange={(e) => setDay(i, { start: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor={`day_${i}_end`}
                    className="text-xs text-zinc-500"
                  >
                    End
                  </Label>
                  <Input
                    id={`day_${i}_end`}
                    name={`day_${i}_end`}
                    type="time"
                    value={day.end}
                    disabled={!day.working}
                    onChange={(e) => setDay(i, { end: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <SubmitButton size="lg">Save schedule</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
