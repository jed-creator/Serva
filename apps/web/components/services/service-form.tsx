'use client';

import { useActionState, useState } from 'react';
import type { ServiceActionState } from '@/app/actions/services';
import type { Service } from '@/lib/supabase/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/auth/submit-button';
import { FormError } from '@/components/auth/form-error';

const initialState: ServiceActionState = {};

interface ServiceFormProps {
  action: (
    prevState: ServiceActionState | undefined,
    formData: FormData,
  ) => Promise<ServiceActionState>;
  service?: Service | null;
  submitLabel?: string;
}

export function ServiceForm({
  action,
  service,
  submitLabel = 'Save service',
}: ServiceFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [depositChecked, setDepositChecked] = useState(
    service?.deposit_required ?? false,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? 'Edit service' : 'New service'}</CardTitle>
        <CardDescription>
          What will customers book? Set a name, price, and duration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <FormError errors={state.errors?._form} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Service name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={service?.name ?? ''}
              placeholder="Haircut & style"
            />
            {state.errors?.name && (
              <p className="text-xs text-red-600">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">
              Description{' '}
              <span className="text-zinc-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={service?.description ?? ''}
              placeholder="What's included, who it's for, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="price_dollars">Price ($)</Label>
              <Input
                id="price_dollars"
                name="price_dollars"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={
                  service ? (service.price_cents / 100).toFixed(2) : ''
                }
                placeholder="65.00"
              />
              {state.errors?.price_dollars && (
                <p className="text-xs text-red-600">
                  {state.errors.price_dollars[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="price_type">Price type</Label>
              <Select
                id="price_type"
                name="price_type"
                defaultValue={service?.price_type ?? 'fixed'}
              >
                <option value="fixed">Fixed price</option>
                <option value="starting_at">Starting at</option>
                <option value="hourly">Per hour</option>
                <option value="free">Free</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="5"
                step="5"
                required
                defaultValue={service?.duration_minutes ?? 60}
              />
              {state.errors?.duration_minutes && (
                <p className="text-xs text-red-600">
                  {state.errors.duration_minutes[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="buffer_minutes">
                Buffer between bookings (min)
              </Label>
              <Input
                id="buffer_minutes"
                name="buffer_minutes"
                type="number"
                min="0"
                step="5"
                defaultValue={service?.buffer_minutes ?? 0}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-zinc-50 rounded-md">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="deposit_required"
                checked={depositChecked}
                onChange={(e) => setDepositChecked(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="text-sm font-medium text-zinc-700">
                Require a deposit at booking time
              </span>
            </label>
            {depositChecked && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="deposit_dollars">Deposit amount ($)</Label>
                <Input
                  id="deposit_dollars"
                  name="deposit_dollars"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={
                    service?.deposit_amount_cents
                      ? (service.deposit_amount_cents / 100).toFixed(2)
                      : ''
                  }
                  placeholder="20.00"
                />
              </div>
            )}
          </div>

          <SubmitButton size="lg">{submitLabel}</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
