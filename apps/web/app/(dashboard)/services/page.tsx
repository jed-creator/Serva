import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  deleteServiceAction,
  toggleServiceActiveAction,
} from '@/app/actions/services';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Service } from '@/lib/supabase/types';

function formatPrice(cents: number, type: string): string {
  const dollars = (cents / 100).toFixed(2);
  switch (type) {
    case 'hourly':
      return `$${dollars}/hr`;
    case 'starting_at':
      return `From $${dollars}`;
    case 'free':
      return 'Free';
    default:
      return `$${dollars}`;
  }
}

export default async function ServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!business) redirect('/dashboard/business/new');

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', business.id)
    .order('display_order')
    .order('created_at');

  const serviceList = (services ?? []) as Service[];

  // Bound delete action
  async function handleDelete(id: string) {
    'use server';
    await deleteServiceAction(id);
  }

  async function handleToggle(id: string, nowActive: boolean) {
    'use server';
    await toggleServiceActiveAction(id, nowActive);
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
            Services
          </h1>
          <p className="text-zinc-600 mt-1">
            Services are the bookable items customers pick during checkout.
          </p>
        </div>
        <Link href="/dashboard/services/new">
          <Button>Add service</Button>
        </Link>
      </div>

      {serviceList.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No services yet</CardTitle>
            <CardDescription>
              Add your first service — customers won&apos;t be able to book
              until you do.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/services/new">
              <Button>Add your first service</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {serviceList.map((service) => (
            <Card
              key={service.id}
              className={!service.is_active ? 'opacity-60' : undefined}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {service.name}
                    </h3>
                    {!service.is_active && (
                      <span className="text-xs text-zinc-500 uppercase tracking-wide">
                        Inactive
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-zinc-600 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-zinc-700">
                    <span className="font-medium">
                      {formatPrice(service.price_cents, service.price_type)}
                    </span>
                    <span className="text-zinc-400">·</span>
                    <span>{service.duration_minutes} min</span>
                    {service.buffer_minutes > 0 && (
                      <>
                        <span className="text-zinc-400">·</span>
                        <span>{service.buffer_minutes} min buffer</span>
                      </>
                    )}
                    {service.deposit_required && (
                      <>
                        <span className="text-zinc-400">·</span>
                        <span>
                          ${((service.deposit_amount_cents ?? 0) / 100).toFixed(2)}{' '}
                          deposit
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/services/${service.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <form
                    action={handleToggle.bind(
                      null,
                      service.id,
                      !service.is_active,
                    )}
                  >
                    <Button variant="ghost" size="sm" type="submit">
                      {service.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </form>
                  <form action={handleDelete.bind(null, service.id)}>
                    <Button variant="ghost" size="sm" type="submit">
                      Delete
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
