'use server';

/**
 * Server Actions for service CRUD.
 * Services belong to a business — ownership is enforced by RLS policies.
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { serviceSchema } from '@/lib/validations/services';

export type ServiceActionState = {
  errors?: {
    name?: string[];
    description?: string[];
    price_dollars?: string[];
    price_type?: string[];
    duration_minutes?: string[];
    buffer_minutes?: string[];
    deposit_dollars?: string[];
    _form?: string[];
  };
  success?: boolean;
};

async function getUserBusinessId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  return data?.id ?? null;
}

export async function createServiceAction(
  _prevState: ServiceActionState | undefined,
  formData: FormData,
): Promise<ServiceActionState> {
  const validated = serviceSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || '',
    price_dollars: formData.get('price_dollars'),
    price_type: formData.get('price_type') || 'fixed',
    duration_minutes: formData.get('duration_minutes'),
    buffer_minutes: formData.get('buffer_minutes') || 0,
    deposit_required: formData.get('deposit_required') === 'on',
    deposit_dollars: formData.get('deposit_dollars') || 0,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const businessId = await getUserBusinessId();
  if (!businessId) {
    return { errors: { _form: ['Create a business profile first.'] } };
  }

  const input = validated.data;
  const priceCents = Math.round(input.price_dollars * 100);
  const depositCents = input.deposit_required
    ? Math.round((input.deposit_dollars ?? 0) * 100)
    : null;

  const supabase = await createClient();
  const { error } = await supabase.from('services').insert({
    business_id: businessId,
    name: input.name,
    description: input.description || null,
    price_cents: priceCents,
    price_type: input.price_type,
    duration_minutes: input.duration_minutes,
    buffer_minutes: input.buffer_minutes,
    deposit_required: input.deposit_required,
    deposit_amount_cents: depositCents,
  });

  if (error) {
    return { errors: { _form: [error.message] } };
  }

  revalidatePath('/dashboard/services');
  redirect('/dashboard/services');
}

export async function updateServiceAction(
  serviceId: string,
  _prevState: ServiceActionState | undefined,
  formData: FormData,
): Promise<ServiceActionState> {
  const validated = serviceSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || '',
    price_dollars: formData.get('price_dollars'),
    price_type: formData.get('price_type') || 'fixed',
    duration_minutes: formData.get('duration_minutes'),
    buffer_minutes: formData.get('buffer_minutes') || 0,
    deposit_required: formData.get('deposit_required') === 'on',
    deposit_dollars: formData.get('deposit_dollars') || 0,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const input = validated.data;
  const priceCents = Math.round(input.price_dollars * 100);
  const depositCents = input.deposit_required
    ? Math.round((input.deposit_dollars ?? 0) * 100)
    : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from('services')
    .update({
      name: input.name,
      description: input.description || null,
      price_cents: priceCents,
      price_type: input.price_type,
      duration_minutes: input.duration_minutes,
      buffer_minutes: input.buffer_minutes,
      deposit_required: input.deposit_required,
      deposit_amount_cents: depositCents,
    })
    .eq('id', serviceId);

  if (error) {
    return { errors: { _form: [error.message] } };
  }

  revalidatePath('/dashboard/services');
  redirect('/dashboard/services');
}

export async function deleteServiceAction(serviceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/services');
}

export async function toggleServiceActiveAction(
  serviceId: string,
  newActive: boolean,
) {
  const supabase = await createClient();
  await supabase
    .from('services')
    .update({ is_active: newActive })
    .eq('id', serviceId);
  revalidatePath('/dashboard/services');
}
