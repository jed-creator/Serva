/**
 * Stub adapter generator.
 *
 * Turns a `{ key, category, displayName }` provider manifest row into a
 * minimal `IntegrationAdapter` on disk. The generated stub satisfies the
 * conformance helper — `search` + `details` capabilities declared,
 * `search()` returns `[]`, `getDetails()` throws — so the registry can
 * surface the provider as "known but not yet implemented" without
 * crashing consumer code.
 *
 * The library exports pure functions (`toExportName`, `renderIndex`,
 * `renderTest`) plus a filesystem-touching `generateStubAdapter`. Vitest
 * tests the pure functions directly and runs `generateStubAdapter`
 * against a temp dir.
 *
 * A CLI entry at the bottom of the file lets us shell out to this script
 * for bulk generation (`node tools/scripts/gen-stub-adapter.ts …`). That
 * entry imports the manifest from `manifest.ts` and runs the generator
 * over every row whose key isn't already present on disk.
 */
import {
  mkdirSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export type StubSpec = {
  key: string;
  category: string;
  displayName: string;
};

/**
 * Turns a provider key (snake_case or kebab-case) into a camelCase
 * export identifier with an `Adapter` suffix.
 *
 *   uber_eats          → uberEatsAdapter
 *   yelp_guest_manager → yelpGuestManagerAdapter
 *   uber-eats          → uberEatsAdapter
 *   resy               → resyAdapter
 */
export function toExportName(key: string): string {
  const parts = key.split(/[_-]/).filter((p) => p.length > 0);
  const [first, ...rest] = parts;
  const camel =
    first +
    rest.map((p) => p[0].toUpperCase() + p.slice(1)).join('');
  return `${camel}Adapter`;
}

function escapeSingleQuotes(s: string): string {
  return s.replace(/'/g, "\\'");
}

export function renderIndex(spec: StubSpec): string {
  const exportName = toExportName(spec.key);
  const displayEscaped = escapeSingleQuotes(spec.displayName);
  return `/**
 * ${spec.displayName} adapter (stub).
 *
 * Minimum-viable implementation — declares \`search\` + \`details\`
 * capabilities, returns an empty search result set, and throws on
 * \`getDetails\`. This exists so the registry can list ${spec.displayName}
 * as a known provider while the real connector is being negotiated.
 * Replace the method bodies (and expand capabilities) when a real
 * client lands.
 */
import type { IntegrationAdapter } from '../../../core';

export const ${exportName}: IntegrationAdapter = {
  key: '${spec.key}',
  category: '${spec.category}',
  displayName: '${displayEscaped}',
  capabilities: ['search', 'details'],

  async search() {
    return [];
  },

  async getDetails() {
    throw new Error('${displayEscaped} adapter: not implemented');
  },
};
`;
}

export function renderTest(spec: StubSpec): string {
  const exportName = toExportName(spec.key);
  return `import { describe, it, expect } from 'vitest';
import { ${exportName} } from './index';
import { assertAdapterConforms } from '../../../core';

describe('${exportName}', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(${exportName})).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await ${exportName}.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(${exportName}.getDetails('x')).rejects.toThrow();
  });
});
`;
}

export function generateStubAdapter(
  spec: StubSpec,
  targetRoot: string
): { indexPath: string; testPath: string } {
  const dir = join(targetRoot, spec.category, spec.key);
  mkdirSync(dir, { recursive: true });

  const indexPath = join(dir, 'index.ts');
  const testPath = join(dir, 'adapter.test.ts');

  if (existsSync(indexPath)) {
    throw new Error(`${indexPath} already exists — refusing to overwrite`);
  }

  writeFileSync(indexPath, renderIndex(spec));
  writeFileSync(testPath, renderTest(spec));

  return { indexPath, testPath };
}

// -----------------------------------------------------------------------
// CLI entry — only runs when this file is invoked directly via `node`.
// `node tools/scripts/gen-stub-adapter.ts` will generate every row in
// `manifest.ts` that doesn't already exist on disk, under the
// `lib/integrations/adapters/` tree. Already-present folders (including
// the five reference adapters) are skipped silently.
// -----------------------------------------------------------------------

function isDirectInvocation(): boolean {
  if (typeof process === 'undefined' || !process.argv[1]) return false;
  try {
    return process.argv[1] === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isDirectInvocation()) {
  // Top-level await is fine in ESM Node; the surrounding `if` is
  // evaluated at module top level.
  const { MANIFEST } = await import('./manifest.ts');
  const here = dirname(fileURLToPath(import.meta.url));
  const adaptersRoot = join(here, '..', '..', 'lib', 'integrations', 'adapters');

  let created = 0;
  let skipped = 0;
  for (const spec of MANIFEST) {
    const indexPath = join(adaptersRoot, spec.category, spec.key, 'index.ts');
    if (existsSync(indexPath)) {
      skipped += 1;
      continue;
    }
    generateStubAdapter(spec, adaptersRoot);
    created += 1;
    console.log(`  + ${spec.category}/${spec.key}`);
  }
  console.log(`\nDone. ${created} stubs created, ${skipped} skipped (already present).`);
}
