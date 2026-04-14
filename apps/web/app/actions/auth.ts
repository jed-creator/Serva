'use server';

/**
 * Server Actions for authentication.
 * Called from <form action={...}> on the client via useActionState.
 *
 * All return an AuthActionState so forms can display errors / success.
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth';

export type AuthActionState = {
  errors?: {
    email?: string[];
    password?: string[];
    firstName?: string[];
    lastName?: string[];
    role?: string[];
    _form?: string[];
  };
  success?: boolean;
  message?: string;
};

const getAppUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function signupAction(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    role: formData.get('role') || 'consumer',
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { email, password, firstName, lastName, role } = validated.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role,
      },
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { errors: { _form: [error.message] } };
  }

  return {
    success: true,
    message:
      'Account created — check your email for a verification link before logging in.',
  };
}

export async function loginAction(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    return { errors: { _form: [error.message] } };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function forgotPasswordAction(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validated.data.email,
    {
      redirectTo: `${getAppUrl()}/auth/callback?next=/reset-password`,
    },
  );

  if (error) {
    return { errors: { _form: [error.message] } };
  }

  return {
    success: true,
    message:
      'If that email is registered, a password reset link is on its way.',
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = resetPasswordSchema.safeParse({
    password: formData.get('password'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    return { errors: { _form: [error.message] } };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
