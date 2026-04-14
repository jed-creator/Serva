'use server';

/**
 * Server Actions for business CRUD.
 *
 * Business creation/update uses SQL helper functions (migration 003) so
 * the PostGIS location column can be populated via ST_MakePoint.
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { businessOnboardingSchema, buildSlug } from '@/lib/validations/business';
import { geocodeAddress } from '@/lib/geocoding';

export type BusinessActionState = {
  errors?: {
    name?: string[];
    category_id?: string[];
    description?: string[];
    phone?: string[];
    email?: string[];
    website?: string[];
    address_line1?: string[];
    address_city?: string[];
    address_state?: string[];
    address_postal_code?: string[];
    _form?: string[];
  };
  success?: boolean;
  businessId?: string;
};

function buildOperatingHoursFromForm(formData: FormData) {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const result: Record<string, { open: string; close: string } | null> = {};
  for (const d of days) {
    const open = formData.get(`${d}_open`)?.toString() || '';
    const close = formData.get(`${d}_close`)?.toString() || '';
    if (open && close) {
      result[d] = { open, close };
    } else {
      result[d] = null;
    }
  }
  return result;
}

export async function createBusinessAction(
  _prevState: BusinessActionState | undefined,
  formData: FormData,
): Promise<BusinessActionState> {
  const validated = businessOnboardingSchema.safeParse({
    name: formData.get('name'),
    category_id: formData.get('category_id'),
    description: formData.get('description') || '',
    phone: formData.get('phone') || '',
    email: formData.get('email') || '',
    website: formData.get('website') || '',
    address_line1: formData.get('address_line1'),
    address_line2: formData.get('address_line2') || '',
    address_city: formData.get('address_city'),
    address_state: formData.get('address_state'),
    address_postal_code: formData.get('address_postal_code'),
    address_country: formData.get('address_country') || 'US',
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const input = validated.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { errors: { _form: ['You must be signed in.'] } };
  }

  // Geocode the address (best effort — not blocking)
  const geo = await geocodeAddress({
    line1: input.address_line1,
    city: input.address_city,
    state: input.address_state,
    postal_code: input.address_postal_code,
    country: input.address_country,
  });

  const address = {
    line1: input.address_line1,
    line2: input.address_line2 || null,
    city: input.address_city,
    state: input.address_state,
    postal_code: input.address_postal_code,
    country: input.address_country,
  };

  const operatingHours = buildOperatingHoursFromForm(formData);

  const { data, error } = await supabase.rpc('create_business_with_location', {
    p_name: input.name,
    p_slug: buildSlug(input.name),
    p_category_id: input.category_id,
    p_description: input.description || '',
    p_address: address,
    p_longitude: geo?.longitude ?? null,
    p_latitude: geo?.latitude ?? null,
    p_phone: input.phone || '',
    p_email: input.email || '',
    p_website: input.website || '',
    p_operating_hours: operatingHours,
  });

  if (error) {
    return { errors: { _form: [error.message] } };
  }

  // Upgrade user role to provider if still consumer
  await supabase
    .from('profiles')
    .update({ role: 'provider' })
    .eq('id', user.id)
    .eq('role', 'consumer');

  revalidatePath('/', 'layout');
  redirect(`/dashboard/business?created=1`);
}

export async function updateBusinessAction(
  businessId: string,
  _prevState: BusinessActionState | undefined,
  formData: FormData,
): Promise<BusinessActionState> {
  const validated = businessOnboardingSchema.safeParse({
    name: formData.get('name'),
    category_id: formData.get('category_id'),
    description: formData.get('description') || '',
    phone: formData.get('phone') || '',
    email: formData.get('email') || '',
    website: formData.get('website') || '',
    address_line1: formData.get('address_line1'),
    address_line2: formData.get('address_line2') || '',
    address_city: formData.get('address_city'),
    address_state: formData.get('address_state'),
    address_postal_code: formData.get('address_postal_code'),
    address_country: formData.get('address_country') || 'US',
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const input = validated.data;
  const supabase = await createClient();

  const geo = await geocodeAddress({
    line1: input.address_line1,
    city: input.address_city,
    state: input.address_state,
    postal_code: input.address_postal_code,
    country: input.address_country,
  });

  const address = {
    line1: input.address_line1,
    line2: input.address_line2 || null,
    city: input.address_city,
    state: input.address_state,
    postal_code: input.address_postal_code,
    country: input.address_country,
  };

  const operatingHours = buildOperatingHoursFromForm(formData);

  const { error } = await supabase.rpc('update_business_with_location', {
    p_business_id: businessId,
    p_name: input.name,
    p_category_id: input.category_id,
    p_description: input.description || '',
    p_address: address,
    p_longitude: geo?.longitude ?? null,
    p_latitude: geo?.latitude ?? null,
    p_phone: input.phone || '',
    p_email: input.email || '',
    p_website: input.website || '',
    p_operating_hours: operatingHours,
  });

  if (error) {
    return { errors: { _form: [error.message] } };
  }

  revalidatePath('/', 'layout');
  return { success: true, businessId };
}
