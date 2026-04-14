'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signupAction, type AuthActionState } from '@/app/actions/auth';
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

export default function SignupPage() {
  const [state, formAction] = useActionState(signupAction, initialState);

  if (state.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>
            We sent a verification link to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="success">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
          <p className="text-sm text-zinc-600 mt-4 text-center">
            Once verified, you can{' '}
            <Link
              href="/login"
              className="text-brand-accent font-medium hover:underline"
            >
              sign in here
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start using Serva to book or manage services in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <FormError errors={state.errors?._form} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                aria-invalid={Boolean(state.errors?.firstName)}
              />
              {state.errors?.firstName && (
                <p className="text-xs text-red-600">
                  {state.errors.firstName[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                aria-invalid={Boolean(state.errors?.lastName)}
              />
              {state.errors?.lastName && (
                <p className="text-xs text-red-600">
                  {state.errors.lastName[0]}
                </p>
              )}
            </div>
          </div>

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
            <Label htmlFor="password">Password</Label>
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="role">I want to…</Label>
            <select
              id="role"
              name="role"
              defaultValue="consumer"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <option value="consumer">Book services as a customer</option>
              <option value="provider">List my business on Serva</option>
            </select>
          </div>

          <SubmitButton size="lg" pendingLabel="Creating account…">
            Create account
          </SubmitButton>

          <p className="text-sm text-center text-zinc-600 mt-2">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-brand-accent font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
