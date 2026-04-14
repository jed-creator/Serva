'use server';

/**
 * Admin-only server actions.
 * Callers MUST already be checked as admin in the calling page (layout or
 * per-action verification). These actions also verify via is_admin() at
 * the DB level through RLS policies where applicable.
 */
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { resend, FROM_EMAIL } from '@/lib/email/client';

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') throw new Error('Not an admin');
  return user;
}

export async function approveBusinessAction(businessId: string) {
  await assertAdmin();
  const admin = createAdminClient();

  const { data: business } = await admin
    .from('businesses')
    .update({ approval_status: 'approved' })
    .eq('id', businessId)
    .select('name, owner_id')
    .single();

  if (business && resend) {
    const { data: owner } = await admin
      .from('profiles')
      .select('email, first_name')
      .eq('id', business.owner_id)
      .single();

    if (owner?.email) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: owner.email,
        subject: `${business.name} has been approved on Orvo`,
        html: `<p>Hi ${owner.first_name || 'there'},</p><p>Your business <strong>${business.name}</strong> is now approved and live on Orvo. Customers can start finding and booking your services right away.</p><p>— The Orvo team</p>`,
      });
    }
  }

  revalidatePath('/admin/businesses');
}

export async function rejectBusinessAction(
  businessId: string,
  reason: string,
) {
  await assertAdmin();
  const admin = createAdminClient();

  const { data: business } = await admin
    .from('businesses')
    .update({ approval_status: 'rejected' })
    .eq('id', businessId)
    .select('name, owner_id')
    .single();

  if (business && resend) {
    const { data: owner } = await admin
      .from('profiles')
      .select('email, first_name')
      .eq('id', business.owner_id)
      .single();

    if (owner?.email) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: owner.email,
        subject: `${business.name} application update`,
        html: `<p>Hi ${owner.first_name || 'there'},</p><p>Your business <strong>${business.name}</strong> needs some changes before it can be approved:</p><p><em>${reason}</em></p><p>You can edit your business details at any time and we'll review again.</p><p>— The Orvo team</p>`,
      });
    }
  }

  revalidatePath('/admin/businesses');
}

export async function removeReviewAction(reviewId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin
    .from('reviews')
    .update({ is_removed: true, is_flagged: false })
    .eq('id', reviewId);
  revalidatePath('/admin/reviews');
}

export async function flagReviewAction(reviewId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from('reviews').update({ is_flagged: true }).eq('id', reviewId);
  revalidatePath('/admin/reviews');
}

export async function createCategoryAction(formData: FormData) {
  await assertAdmin();
  const name = formData.get('name')?.toString().trim();
  const slug = formData.get('slug')?.toString().trim();
  const icon = formData.get('icon_emoji')?.toString().trim() || null;

  if (!name || !slug) throw new Error('Name and slug are required');

  const admin = createAdminClient();
  await admin.from('categories').insert({
    name,
    slug,
    icon_emoji: icon,
    display_order: 9999,
  });
  revalidatePath('/admin/categories');
}

export async function deleteCategoryAction(categoryId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from('categories').delete().eq('id', categoryId);
  revalidatePath('/admin/categories');
}
