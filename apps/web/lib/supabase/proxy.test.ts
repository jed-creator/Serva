import { describe, it, expect } from 'vitest';
import { isPublicPath, PUBLIC_PATHS } from './proxy';

describe('isPublicPath', () => {
  describe('marketing and auth routes', () => {
    it.each([
      '/',
      '/login',
      '/signup',
      '/forgot-password',
      '/reset-password',
      '/auth',
      '/auth/callback',
      '/auth/confirm/abc123',
    ])('returns true for %s', (path) => {
      expect(isPublicPath(path)).toBe(true);
    });
  });

  describe('API routes', () => {
    it.each(['/api', '/api/shop/search', '/api/book/services', '/api/eat/search'])(
      'returns true for %s',
      (path) => {
        expect(isPublicPath(path)).toBe(true);
      },
    );
  });

  describe('super-app consumer routes (anonymous-friendly)', () => {
    // Feature Outline p. 14: "Book any merchant without installing their
    // app" — the browsing model is explicitly anonymous. Every super-app
    // category root must be public.
    it.each([
      '/shop',
      '/eat',
      '/ride',
      '/trips',
      '/tickets',
      '/market',
      '/book',
      '/compare',
      '/explore',
    ])('returns true for root %s', (path) => {
      expect(isPublicPath(path)).toBe(true);
    });

    it.each([
      '/shop/provider/123',
      '/eat/restaurant/opentable/456',
      '/book/service/789',
      '/compare/shop-vs-market',
      '/explore/category/fitness',
    ])('returns true for sub-path %s', (path) => {
      expect(isPublicPath(path)).toBe(true);
    });
  });

  describe('authed-only routes', () => {
    it.each([
      '/dashboard',
      '/dashboard/bookings',
      '/admin',
      '/admin/users',
      '/services',
      '/services/new',
      '/bookings',
      '/profile',
      '/settings',
      '/calendar',
      '/analytics',
    ])('returns false for %s', (path) => {
      expect(isPublicPath(path)).toBe(false);
    });
  });

  describe('prefix boundary edge cases', () => {
    // `/shop` must not match `/shopping-cart` — the `startsWith` check
    // is gated on `${path}/` specifically to prevent this.
    it('does not treat /shopping-cart as under /shop', () => {
      expect(isPublicPath('/shopping-cart')).toBe(false);
    });

    it('does not treat /bookworm as under /book', () => {
      expect(isPublicPath('/bookworm')).toBe(false);
    });

    it('does not treat /tickets-admin as under /tickets', () => {
      expect(isPublicPath('/tickets-admin')).toBe(false);
    });
  });

  it('exposes all 16 public path roots', () => {
    // Guardrail: if someone removes a super-app route from the list by
    // accident, this count check catches it loudly.
    expect(PUBLIC_PATHS).toHaveLength(16);
  });
});
