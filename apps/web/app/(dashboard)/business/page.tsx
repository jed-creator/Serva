import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateBusinessAction } from '@/app/actions/business';
import { BusinessForm } from '@/components/business/business-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { BusinessActionState } from '@/app/actions/business';
import type { Business } from '@/lib/supabase/types';

export default async function BusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!business) {
    redirect('/dashboard/business/new');
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  // Server action bound to this business ID
  const boundUpdate = async (
    prevState: BusinessActionState | undefined,
    formData: FormData,
  ) => {
    'use server';
    return updateBusinessAction(business.id, prevState, formData);
  };

  const params = await searchParams;
  const justCreated = params.created === '1';

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
            {(business as Business).name}
          </h1>
          <p className="text-zinc-600 mt-1">
            Status:{' '}
            <span className="font-medium capitalize">
              {business.approval_status}
            </span>
          </p>
        </div>
        <Link href="/dashboard/services">
          <Button variant="outline">Manage services →</Button>
        </Link>
      </div>

      {justCreated && (
        <Alert variant="success">
          <AlertDescription>
            Business created! Next step — add the services you offer so
            customers can book them.
          </AlertDescription>
        </Alert>
      )}

      <BusinessForm
        action={boundUpdate}
        categories={categories ?? []}
        business={business as Business}
        title="Business details"
        description="Changes save immediately when you click Save."
        submitLabel="Save changes"
      />
    </div>
  );
}
