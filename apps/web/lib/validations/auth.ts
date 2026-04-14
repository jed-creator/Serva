/**
 * Zod schemas for auth forms — shared between server actions and client UI.
 * Uses zod 4 API (z.email() standalone, { error: } for messages).
 */
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters.' })
    .regex(/[A-Z]/, { error: 'Must contain at least one uppercase letter.' })
    .regex(/[0-9]/, { error: 'Must contain at least one number.' }),
  firstName: z
    .string()
    .min(1, { error: 'First name is required.' })
    .max(100),
  lastName: z.string().min(1, { error: 'Last name is required.' }).max(100),
  role: z.enum(['consumer', 'provider']).default('consumer'),
});

export const loginSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address.' }),
  password: z.string().min(1, { error: 'Password is required.' }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address.' }),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters.' })
    .regex(/[A-Z]/, { error: 'Must contain at least one uppercase letter.' })
    .regex(/[0-9]/, { error: 'Must contain at least one number.' }),
});

export const profileSchema = z.object({
  firstName: z.string().min(1, { error: 'First name is required.' }).max(100),
  lastName: z.string().min(1, { error: 'Last name is required.' }).max(100),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, { error: 'Please enter a valid phone number.' })
    .optional()
    .or(z.literal('')),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
