import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizePackageName, validateProjectDirectoryName } from '../src/name';

test('normalizePackageName creates npm-safe-ish names', () => {
  assert.equal(normalizePackageName('My Cool App'), 'my-cool-app');
  assert.equal(normalizePackageName('@No/Scope?Here'), 'no-scope-here');
  assert.equal(normalizePackageName('___'), 'p5catalyst-app');
});

test('validateProjectDirectoryName rejects illegal path characters', () => {
  assert.equal(
    validateProjectDirectoryName('bad/name'),
    'Project name contains characters that are not allowed by the filesystem.'
  );

  assert.equal(validateProjectDirectoryName('good-name'), null);
});
