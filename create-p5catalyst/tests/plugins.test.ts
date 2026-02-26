import assert from 'node:assert/strict';
import test from 'node:test';

import { buildPluginsSource } from '../src/plugins';

test('buildPluginsSource serializes selected plugins only', () => {
  const source = buildPluginsSource({
    appName: 'Demo App',
    selectedPluginKeys: ['randomizer', 'image-export'],
    availableFactories: new Set([
      'appTitlePlugin',
      'shaderTemplatePlugin',
      'resolutionPlugin',
      'randomizerPlugin',
      'imageExportPlugin',
      'videoExportPlugin',
      'languagePlugin',
      'storeSettingsPlugin',
      'backdropPlugin',
    ]),
  });

  assert.match(source, /appTitlePlugin\("Demo App"\)/);
  assert.match(source, /randomizerPlugin\(\[/);
  assert.match(source, /imageExportPlugin\('png'\)/);
  assert.doesNotMatch(source, /videoExportPlugin\(\)/);
});
