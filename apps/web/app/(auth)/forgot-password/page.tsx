'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction, type AuthActionState } from '@/app/actions/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubmitButton } from '@/components/auth/submit-button';
import { FormError } from '@/components/auth/form-error';

const initialState: AuthActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.success ? (
          <div className="flex flex-col gap-4">
            <Alert variant="success">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
            <Link
              href="/login"
              className="text-sm text-brand-accent text-center hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <FormError errors={state.errors?._form} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={Boolean(state.errors?.email)}
              />
              {state.errors?.email && (
                <p className="text-xs text-red-600">{state.errors.email[0]}</p>
              )}
            </div>

            <SubmitButton size="lg" pendingLabel="Sending…">
              Send reset link
            </SubmitButton>

            <p className="text-sm text-center text-zinc-600 mt-2">
              Remembered?{' '}
              <Link
                href="/login"
                className="text-brand-accent font-medium hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
