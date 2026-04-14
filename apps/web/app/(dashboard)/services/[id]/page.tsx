import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { updateServiceAction } from '@/app/actions/services';
import type { ServiceActionState } from '@/app/actions/services';
import { ServiceForm } from '@/components/services/service-form';
import type { Service } from '@/lib/supabase/types';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!service) notFound();

  // Verify ownership via RLS — query was already filtered
  const boundUpdate = async (
    prevState: ServiceActionState | undefined,
    formData: FormData,
  ) => {
    'use server';
    return updateServiceAction(id, prevState, formData);
  };

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
          Edit service
        </h1>
      </div>
      <ServiceForm
        action={boundUpdate}
        service={service as Service}
        submitLabel="Save changes"
      />
    </div>
  );
}
