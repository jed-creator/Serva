import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  toExportName,
  renderIndex,
  renderTest,
  generateStubAdapter,
} from './gen-stub-adapter';

describe('gen-stub-adapter', () => {
  describe('toExportName', () => {
    it('camelCases snake_case keys and appends Adapter', () => {
      expect(toExportName('uber_eats')).toBe('uberEatsAdapter');
      expect(toExportName('yelp_guest_manager')).toBe('yelpGuestManagerAdapter');
    });

    it('handles single-word keys', () => {
      expect(toExportName('resy')).toBe('resyAdapter');
    });

    it('camelCases hyphenated keys as well', () => {
      expect(toExportName('uber-eats')).toBe('uberEatsAdapter');
    });
  });

  describe('renderIndex', () => {
    it('produces an adapter module with the right key/category/displayName', () => {
      const out = renderIndex({
        key: 'resy',
        category: 'restaurants',
        displayName: 'Resy',
      });
      expect(out).toContain("key: 'resy'");
      expect(out).toContain("category: 'restaurants'");
      expect(out).toContain("displayName: 'Resy'");
      expect(out).toContain("capabilities: ['search', 'details']");
      expect(out).toContain('export const resyAdapter: IntegrationAdapter');
      expect(out).toContain('async search()');
      expect(out).toContain('return [];');
      expect(out).toContain("throw new Error('Resy adapter: not implemented')");
    });

    it("escapes apostrophes in display names", () => {
      const out = renderIndex({
        key: 'lovely',
        category: 'restaurants',
        displayName: "L'Ovely",
      });
      expect(out).toContain("displayName: 'L\\'Ovely'");
    });
  });

  describe('renderTest', () => {
    it('produces a conformance + empty-search + throwing-details test', () => {
      const out = renderTest({
        key: 'resy',
        category: 'restaurants',
        displayName: 'Resy',
      });
      expect(out).toContain("import { resyAdapter } from './index'");
      expect(out).toContain('assertAdapterConforms(resyAdapter)');
      expect(out).toContain('expect(results).toEqual([])');
      expect(out).toContain('rejects.toThrow()');
    });
  });

  describe('generateStubAdapter (filesystem)', () => {
    let tempRoot: string;

    beforeAll(() => {
      tempRoot = mkdtempSync(join(tmpdir(), 'gen-stub-adapter-'));
    });

    afterAll(() => {
      rmSync(tempRoot, { recursive: true, force: true });
    });

    it('writes index.ts and adapter.test.ts under <category>/<key>/', () => {
      const { indexPath, testPath } = generateStubAdapter(
        { key: 'resy', category: 'restaurants', displayName: 'Resy' },
        tempRoot
      );
      expect(existsSync(indexPath)).toBe(true);
      expect(existsSync(testPath)).toBe(true);
      expect(indexPath).toContain('restaurants/resy/index.ts');
      expect(testPath).toContain('restaurants/resy/adapter.test.ts');

      const indexContents = readFileSync(indexPath, 'utf-8');
      expect(indexContents).toContain('resyAdapter');
    });

    it('refuses to overwrite an existing index.ts', () => {
      // resy already generated above
      expect(() =>
        generateStubAdapter(
          { key: 'resy', category: 'restaurants', displayName: 'Resy' },
          tempRoot
        )
      ).toThrow(/already exists/);
    });
  });
});
