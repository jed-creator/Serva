import { describe, it, expect } from 'vitest';
import { MoneySchema, GeoPointSchema, MediaAssetSchema, CurrencySchema } from './common';

describe('super-app common schemas', () => {
  it('parses Money', () => {
    expect(MoneySchema.parse({ amount: 1299, currency: 'USD' })).toEqual({
      amount: 1299,
      currency: 'USD',
    });
  });

  it('rejects negative money amounts', () => {
    expect(() => MoneySchema.parse({ amount: -1, currency: 'USD' })).toThrow();
  });

  it('rejects non-integer money amounts', () => {
    expect(() => MoneySchema.parse({ amount: 12.34, currency: 'USD' })).toThrow();
  });

  it('accepts all supported currencies', () => {
    for (const c of ['USD', 'CAD', 'EUR', 'GBP'] as const) {
      expect(CurrencySchema.parse(c)).toBe(c);
    }
  });

  it('parses GeoPoint', () => {
    expect(GeoPointSchema.parse({ lat: 43.65, lng: -79.38 })).toEqual({
      lat: 43.65,
      lng: -79.38,
    });
  });

  it('rejects out-of-range latitude', () => {
    expect(() => GeoPointSchema.parse({ lat: 91, lng: 0 })).toThrow();
  });

  it('rejects out-of-range longitude', () => {
    expect(() => GeoPointSchema.parse({ lat: 0, lng: -181 })).toThrow();
  });

  it('parses MediaAsset image', () => {
    expect(
      MediaAssetSchema.parse({ url: 'https://cdn.example.com/img.jpg', kind: 'image' })
    ).toMatchObject({ kind: 'image' });
  });

  it('parses MediaAsset with alt text', () => {
    const parsed = MediaAssetSchema.parse({
      url: 'https://cdn.example.com/v.mp4',
      kind: 'video',
      alt: 'Demo video',
    });
    expect(parsed.alt).toBe('Demo video');
  });

  it('rejects MediaAsset with bad URL', () => {
    expect(() =>
      MediaAssetSchema.parse({ url: 'not-a-url', kind: 'image' })
    ).toThrow();
  });
});
