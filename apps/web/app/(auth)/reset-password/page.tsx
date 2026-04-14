'use client';

import { useActionState } from 'react';
import { resetPasswordAction, type AuthActionState } from '@/app/actions/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/auth/submit-button';
import { FormError } from '@/components/auth/form-error';

const initialState: AuthActionState = {};

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>
          Choose a new password for your Orvo account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <FormError errors={state.errors?._form} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              aria-invalid={Boolean(state.errors?.password)}
            />
            <p className="text-xs text-zinc-500">
              Minimum 8 characters, 1 uppercase, 1 number.
            </p>
            {state.errors?.password && (
              <p className="text-xs text-red-600">{state.errors.password[0]}</p>
            )}
          </div>

          <SubmitButton size="lg" pendingLabel="Updating…">
            Update password
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
