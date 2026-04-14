import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createServiceAction } from '@/app/actions/services';
import { ServiceForm } from '@/components/services/service-form';

export default async function NewServicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!business) redirect('/dashboard/business/new');

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div>
        <Link
          href="/dashboard/services"
          className="text-sm text-brand-accent hover:underline"
        >
          ← Back to services
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary mt-2">
          Add a service
        </h1>
      </div>
      <ServiceForm action={createServiceAction} submitLabel="Create service" />
    </div>
  );
}
