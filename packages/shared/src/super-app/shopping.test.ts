import { describe, it, expect } from 'vitest';
import {
  ProductSchema,
  ProductVariantSchema,
  ProductOfferSchema,
  ProductSearchQuerySchema,
} from './shopping';

describe('shopping schemas', () => {
  it('parses a minimal product', () => {
    const p = ProductSchema.parse({
      id: 'p_1',
      title: 'Heavyweight Hoodie',
      brand: 'Generic',
      description: 'Cotton hoodie',
      category: 'apparel',
      media: [],
      fingerprint: 'sha256:abc',
    });
    expect(p.title).toBe('Heavyweight Hoodie');
  });

  it('rejects a product with an empty title', () => {
    expect(() =>
      ProductSchema.parse({
        id: 'p_1',
        title: '',
        brand: 'Generic',
        description: 'Cotton hoodie',
        category: 'apparel',
        media: [],
        fingerprint: 'sha256:abc',
      })
    ).toThrow();
  });

  it('parses a product variant', () => {
    const v = ProductVariantSchema.parse({
      id: 'v_1',
      productId: 'p_1',
      size: 'M',
      color: 'blue',
      sku: 'SKU-M-BLUE',
    });
    expect(v.color).toBe('blue');
  });

  it('parses a product offer with money', () => {
    const o = ProductOfferSchema.parse({
      id: 'o_1',
      productId: 'p_1',
      provider: 'shopify',
      externalId: 'sku_123',
      price: { amount: 4999, currency: 'USD' },
      url: 'https://shop.example.com/hoodie',
      inStock: true,
    });
    expect(o.provider).toBe('shopify');
    expect(o.price.amount).toBe(4999);
  });

  it('rejects a product offer with a bad URL', () => {
    expect(() =>
      ProductOfferSchema.parse({
        id: 'o_1',
        productId: 'p_1',
        provider: 'shopify',
        externalId: 'sku_123',
        price: { amount: 4999, currency: 'USD' },
        url: 'not-a-url',
        inStock: true,
      })
    ).toThrow();
  });

  it('parses a search query and applies the default limit', () => {
    const q = ProductSearchQuerySchema.parse({ text: 'blue heavyweight hoodie' });
    expect(q.text).toBe('blue heavyweight hoodie');
    expect(q.limit).toBe(20);
  });

  it('rejects a search query with an empty text field', () => {
    expect(() => ProductSearchQuerySchema.parse({ text: '' })).toThrow();
  });

  it('rejects a search query limit over 100', () => {
    expect(() =>
      ProductSearchQuerySchema.parse({ text: 'hoodie', limit: 101 })
    ).toThrow();
  });
});
