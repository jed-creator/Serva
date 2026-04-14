'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, type AuthActionState } from '@/app/actions/auth';
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

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Welcome back to Orvo. Enter your email and password to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
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

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(state.errors?.password)}
            />
            {state.errors?.password && (
              <p className="text-xs text-red-600">{state.errors.password[0]}</p>
            )}
          </div>

          <SubmitButton size="lg" pendingLabel="Signing in…">
            Sign in
          </SubmitButton>

          <p className="text-sm text-center text-zinc-600 mt-2">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-brand-accent font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
