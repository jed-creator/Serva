'use client';

import { useActionState } from 'react';
import type { BusinessActionState } from '@/app/actions/business';
import type { Category, Business } from '@/lib/supabase/types';
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

const initialState: BusinessActionState = {};

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
] as const;

interface BusinessFormProps {
  action: (
    prevState: BusinessActionState | undefined,
    formData: FormData,
  ) => Promise<BusinessActionState>;
  categories: Category[];
  business?: Business | null;
  submitLabel?: string;
  title?: string;
  description?: string;
}

type OperatingHours =
  | Record<string, { open: string; close: string } | null>
  | null;

function hoursDefault(
  business: Business | null | undefined,
  key: string,
  field: 'open' | 'close',
): string {
  const hours = business?.operating_hours as OperatingHours;
  const entry = hours?.[key];
  return entry?.[field] ?? '';
}

export function BusinessForm({
  action,
  categories,
  business,
  submitLabel = 'Save business',
  title = 'Your business',
  description = 'Tell customers about your business so they can find and book you.',
}: BusinessFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const address = business?.address;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-6">
          <FormError errors={state.errors?._form} />

          {/* --- Business info --- */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
              Business info
            </h3>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Business name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={business?.name ?? ''}
                aria-invalid={Boolean(state.errors?.name)}
              />
              {state.errors?.name && (
                <p className="text-xs text-red-600">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                id="category_id"
                name="category_id"
                required
                defaultValue={business?.category_id ?? ''}
                aria-invalid={Boolean(state.errors?.category_id)}
              >
                <option value="" disabled>
                  Choose a category…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon_emoji} {c.name}
                  </option>
                ))}
              </Select>
              {state.errors?.category_id && (
                <p className="text-xs text-red-600">
                  {state.errors.category_id[0]}
                </p>
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
                rows={4}
                defaultValue={business?.description ?? ''}
                placeholder="What do you offer? What makes you unique?"
              />
            </div>
          </section>

          {/* --- Contact --- */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
              Contact
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={business?.phone ?? ''}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Business email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={business?.email ?? ''}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="website">
                Website{' '}
                <span className="text-zinc-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={business?.website ?? ''}
                placeholder="https://example.com"
              />
            </div>
          </section>

          {/* --- Address --- */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
              Address
            </h3>

            <div className="flex flex-col gap-2">
              <Label htmlFor="address_line1">Street address</Label>
              <Input
                id="address_line1"
                name="address_line1"
                type="text"
                required
                defaultValue={address?.line1 ?? ''}
                aria-invalid={Boolean(state.errors?.address_line1)}
              />
              {state.errors?.address_line1 && (
                <p className="text-xs text-red-600">
                  {state.errors.address_line1[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="address_line2">
                Apt / Suite{' '}
                <span className="text-zinc-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="address_line2"
                name="address_line2"
                type="text"
                defaultValue={address?.line2 ?? ''}
              />
            </div>

            <div className="grid grid-cols-6 gap-4">
              <div className="flex flex-col gap-2 col-span-3">
                <Label htmlFor="address_city">City</Label>
                <Input
                  id="address_city"
                  name="address_city"
                  type="text"
                  required
                  defaultValue={address?.city ?? ''}
                  aria-invalid={Boolean(state.errors?.address_city)}
                />
              </div>
              <div className="flex flex-col gap-2 col-span-1">
                <Label htmlFor="address_state">State</Label>
                <Input
                  id="address_state"
                  name="address_state"
                  type="text"
                  required
                  maxLength={2}
                  defaultValue={address?.state ?? ''}
                  placeholder="CA"
                />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <Label htmlFor="address_postal_code">ZIP</Label>
                <Input
                  id="address_postal_code"
                  name="address_postal_code"
                  type="text"
                  required
                  defaultValue={address?.postal_code ?? ''}
                />
              </div>
            </div>
            <input type="hidden" name="address_country" value="US" />
            <p className="text-xs text-zinc-500">
              We&apos;ll geocode your address so customers can find you with
              location search.
            </p>
          </section>

          {/* --- Hours --- */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
              Operating hours
            </h3>
            <p className="text-xs text-zinc-500">
              Leave both fields blank to mark a day as closed. Use 24-hour
              format (09:00, 17:00).
            </p>
            <div className="flex flex-col gap-2">
              {DAYS.map(({ key, label }) => (
                <div
                  key={key}
                  className="grid grid-cols-[120px_1fr_1fr] items-center gap-2"
                >
                  <Label htmlFor={`${key}_open`}>{label}</Label>
                  <Input
                    id={`${key}_open`}
                    name={`${key}_open`}
                    type="time"
                    defaultValue={hoursDefault(business, key, 'open')}
                  />
                  <Input
                    name={`${key}_close`}
                    type="time"
                    defaultValue={hoursDefault(business, key, 'close')}
                  />
                </div>
              ))}
            </div>
          </section>

          <SubmitButton size="lg" pendingLabel="Saving…">
            {submitLabel}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
