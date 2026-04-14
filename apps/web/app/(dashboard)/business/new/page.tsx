import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createBusinessAction } from '@/app/actions/business';
import { BusinessForm } from '@/components/business/business-form';

export default async function NewBusinessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // If the user already has a business, send them to the edit page instead.
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (existing) {
    redirect('/dashboard/business');
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
          Set up your business
        </h1>
        <p className="text-zinc-600 mt-1">
          Add your business details so customers can find and book you on
          Serva. You can edit anything later.
        </p>
      </div>
      <BusinessForm
        action={createBusinessAction}
        categories={categories ?? []}
        title="Business details"
        description="Fields marked required must be filled in. Everything else is optional."
        submitLabel="Create business"
      />
    </div>
  );
}
