import { createAdminClient } from '@/lib/supabase/server';
import {
  createCategoryAction,
  deleteCategoryAction,
} from '@/app/actions/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon_emoji: string | null;
  display_order: number;
}

export default async function AdminCategoriesPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('categories')
    .select('*')
    .order('display_order');
  const categories = (data ?? []) as CategoryRow[];

  async function handleCreate(formData: FormData) {
    'use server';
    await createCategoryAction(formData);
  }
  async function handleDelete(id: string) {
    'use server';
    await deleteCategoryAction(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
          Categories
        </h1>
        <p className="text-zinc-600 mt-1">
          Service categories businesses choose from during onboarding.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add category</CardTitle>
          <CardDescription>
            Give it a unique slug used in URLs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={handleCreate}
            className="grid grid-cols-[2fr_2fr_1fr_auto] gap-3 items-end"
          >
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" required placeholder="dog-walking" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="icon_emoji">Emoji</Label>
              <Input id="icon_emoji" name="icon_emoji" maxLength={4} />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-4 py-2 font-medium text-zinc-500">Icon</th>
              <th className="px-4 py-2 font-medium text-zinc-500">Name</th>
              <th className="px-4 py-2 font-medium text-zinc-500">Slug</th>
              <th className="px-4 py-2 font-medium text-zinc-500">Order</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-zinc-200">
                <td className="px-4 py-2 text-lg">{c.icon_emoji}</td>
                <td className="px-4 py-2 text-zinc-900">{c.name}</td>
                <td className="px-4 py-2 text-zinc-500 font-mono text-xs">
                  {c.slug}
                </td>
                <td className="px-4 py-2 text-zinc-500">{c.display_order}</td>
                <td className="px-4 py-2 text-right">
                  <form action={handleDelete.bind(null, c.id)}>
                    <Button variant="ghost" size="sm" type="submit">
                      Delete
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
