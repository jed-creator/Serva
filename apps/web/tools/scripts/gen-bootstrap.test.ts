import { describe, it, expect } from 'vitest';
import { renderBootstrap } from './gen-bootstrap';

describe('renderBootstrap', () => {
  const references = [
    {
      key: 'opentable',
      category: 'restaurants',
      displayName: 'OpenTable',
      exportName: 'openTableAdapter',
    },
  ];

  const stubs = [
    { key: 'resy', category: 'restaurants', displayName: 'Resy' },
    { key: 'uber_eats', category: 'delivery', displayName: 'Uber Eats' },
  ];

  const out = renderBootstrap({ references, stubs });

  it('flags the file as generated with instructions to regenerate', () => {
    expect(out).toContain('GENERATED FILE — do not edit by hand');
    expect(out).toContain('gen-bootstrap.ts');
  });

  it('imports each reference adapter under its pinned export name', () => {
    expect(out).toContain(
      "import { openTableAdapter } from './adapters/restaurants/opentable';"
    );
  });

  it('imports each stub under its toExportName-derived name', () => {
    expect(out).toContain(
      "import { resyAdapter } from './adapters/restaurants/resy';"
    );
    expect(out).toContain(
      "import { uberEatsAdapter } from './adapters/delivery/uber_eats';"
    );
  });

  it('exports ALL_ADAPTERS containing every adapter in order', () => {
    expect(out).toContain('export const ALL_ADAPTERS: IntegrationAdapter[]');
    // Reference comes first, then stubs.
    const refIdx = out.indexOf('openTableAdapter,');
    const stubIdx = out.indexOf('resyAdapter,');
    expect(refIdx).toBeGreaterThan(-1);
    expect(stubIdx).toBeGreaterThan(-1);
    expect(refIdx).toBeLessThan(stubIdx);
  });

  it('exports a bootstrap(registry) function that iterates ALL_ADAPTERS', () => {
    expect(out).toContain(
      'export function bootstrap(registry: IntegrationRegistry): void'
    );
    expect(out).toContain('for (const adapter of ALL_ADAPTERS)');
    expect(out).toContain('registry.register(adapter);');
  });

  it('states the total count in the doc header', () => {
    expect(out).toContain('3 adapters (1 reference + 2 stubs)');
  });
});
