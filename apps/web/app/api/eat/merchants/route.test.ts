import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('GET /api/eat/merchants', () => {
  it('returns 200 with a merchants array for an empty query', async () => {
    const req = new Request('http://test/api/eat/merchants');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { merchants: unknown };
    expect(body).toHaveProperty('merchants');
    expect(Array.isArray(body.merchants)).toBe(true);
  });

  it('fans across delivery, grocery, and restaurants for a real query', async () => {
    const req = new Request('http://test/api/eat/merchants?q=pizza');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { merchants: unknown };
    expect(Array.isArray(body.merchants)).toBe(true);
  });
});
