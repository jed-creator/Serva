/**
 * Supabase database types for Serva.
 *
 * Hand-authored from db/migrations/001_initial_schema.sql. When the schema
 * grows, we can replace this with `supabase gen types typescript` output.
 */

export type UserRole = 'consumer' | 'provider' | 'provider_staff' | 'admin';
export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';
export type PriceType = 'fixed' | 'starting_at' | 'hourly' | 'free';
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';
export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'refunded'
  | 'failed';
export type BusinessApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended';
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'file'
  | 'signature';

export interface Profile {
  id: string;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  stripe_customer_id: string | null;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_emoji: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BusinessAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface BusinessOperatingHours {
  // Keys are 0-6 (Sun-Sat). Values are { open: "09:00", close: "17:00" } or null for closed.
  [day: string]: { open: string; close: string } | null;
}

export interface CancellationPolicy {
  free_cancel_hours: number;
  late_cancel_fee_cents: number;
  no_show_fee_cents: number;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category_id: string | null;
  description: string | null;
  address: BusinessAddress | null;
  // location is Postgres GEOGRAPHY — we don't type it directly, we write via RPC
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  operating_hours: BusinessOperatingHours | null;
  approval_status: BusinessApprovalStatus;
  subscription_tier: SubscriptionTier;
  stripe_account_id: string | null;
  avg_rating: number;
  total_reviews: number;
  cancellation_policy: CancellationPolicy;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  price_type: PriceType;
  duration_minutes: number;
  buffer_minutes: number;
  deposit_required: boolean;
  deposit_amount_cents: number | null;
  intake_form_id: string | null;
  max_per_day: number | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  business_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityRule {
  id: string;
  staff_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // 'HH:MM:SS'
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  consumer_id: string;
  business_id: string;
  service_id: string;
  staff_id: string | null;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_cents: number;
  deposit_cents: number;
  payment_status: PaymentStatus;
  intake_submission_id: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  reminder_24h_sent: boolean;
  reminder_1h_sent: boolean;
  created_at: string;
  updated_at: string;
}
