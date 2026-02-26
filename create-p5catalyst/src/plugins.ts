import path from 'node:path';
import fs from 'fs-extra';

export type PluginKey =
  | 'i18n'
  | 'backdrop'
  | 'randomizer'
  | 'image-export'
  | 'video-export'
  | 'file-io';

export type PluginOption = {
  key: PluginKey;
  label: string;
  description: string;
  factory: string;
  defaultSelected: boolean;
  aliases: string[];
  createCall: () => string;
};

const OPTIONAL_PLUGIN_DEFINITIONS: PluginOption[] = [
  {
    key: 'i18n',
    label: 'i18n language plugin',
    description: 'Set default GUI language support.',
    factory: 'languagePlugin',
    defaultSelected: true,
    aliases: ['i18n', 'language', 'lang', 'languageplugin'],
    createCall: () => "languagePlugin('en')",
  },
  {
    key: 'backdrop',
    label: 'Backdrop/overlay plugin',
    description: 'Allow backdrop and overlay media upload in the GUI.',
    factory: 'backdropPlugin',
    defaultSelected: true,
    aliases: ['backdrop', 'overlay', 'backdropplugin'],
    createCall: () => 'backdropPlugin()',
  },
  {
    key: 'randomizer',
    label: 'Randomizer plugin',
    description: 'Add randomization controls for selected controller IDs.',
    factory: 'randomizerPlugin',
    defaultSelected: true,
    aliases: ['randomizer', 'random', 'randomizerplugin'],
    createCall: () =>
      [
        'randomizerPlugin([',
        '    // Replace with your own controller IDs.',
        "    'colorBoxesCircle',",
        "    'sliderCircleDiameter',",
        "    'colorBoxesBg',",
        "    'sliderNBg',",
        '  ])',
      ].join('\n'),
  },
  {
    key: 'image-export',
    label: 'Export PNG/frames plugin',
    description: 'Add image export tools (PNG by default).',
    factory: 'imageExportPlugin',
    defaultSelected: true,
    aliases: ['image-export', 'image', 'png', 'frames', 'imageexportplugin'],
    createCall: () => "imageExportPlugin('png')",
  },
  {
    key: 'video-export',
    label: 'Export video (ffmpeg)',
    description: 'Record and export video using ffmpeg.',
    factory: 'videoExportPlugin',
    defaultSelected: true,
    aliases: ['video-export', 'video', 'ffmpeg', 'videoexportplugin'],
    createCall: () => 'videoExportPlugin()',
  },
  {
    key: 'file-io',
    label: 'File I/O settings plugin',
    description: 'Save and load GUI settings as JSON.',
    factory: 'storeSettingsPlugin',
    defaultSelected: true,
    aliases: [
      'file-io',
      'fileio',
      'settings',
      'store-settings',
      'storesettingsplugin',
    ],
    createCall: () => 'storeSettingsPlugin()',
  },
];

export async function discoverAvailablePluginFactories(
  templateDir: string
): Promise<Set<string>> {
  const pluginDir = path.join(templateDir, 'src', 'lib', 'plugins');
  const factories = new Set<string>();

  if (!(await fs.pathExists(pluginDir))) {
    return factories;
  }

  const files = await fs.readdir(pluginDir);

  for (const file of files) {
    if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
    if (file.endsWith('.d.ts')) continue;

    const content = await fs.readFile(path.join(pluginDir, file), 'utf8');

    for (const match of content.matchAll(/export\s+function\s+([A-Za-z0-9_]+)/g)) {
      factories.add(match[1]);
    }

    for (const match of content.matchAll(/export\s+const\s+([A-Za-z0-9_]+)/g)) {
      factories.add(match[1]);
    }
  }

  return factories;
}

export function getAvailablePluginOptions(
  factories: Set<string>
): PluginOption[] {
  return OPTIONAL_PLUGIN_DEFINITIONS.filter(option =>
    factories.has(option.factory)
  );
}

export function getDefaultPluginSelection(options: PluginOption[]): PluginKey[] {
  return options
    .filter(option => option.defaultSelected)
    .map(option => option.key);
}

export function parsePluginArg(
  value: string,
  availableOptions: PluginOption[]
): PluginKey[] {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  if (normalized === 'none') {
    return [];
  }

  if (normalized === 'default' || normalized === 'defaults' || normalized === 'all') {
    return getDefaultPluginSelection(availableOptions);
  }

  const availableKeySet = new Set(availableOptions.map(option => option.key));
  const aliasToKey = new Map<string, PluginKey>();

  for (const option of availableOptions) {
    aliasToKey.set(option.key, option.key);
    for (const alias of option.aliases) {
      aliasToKey.set(alias, option.key);
    }
  }

  const selected: PluginKey[] = [];
  const unknown: string[] = [];

  for (const token of normalized.split(',').map(part => part.trim()).filter(Boolean)) {
    const key = aliasToKey.get(token);
    if (!key) {
      unknown.push(token);
      continue;
    }

    if (!availableKeySet.has(key)) {
      unknown.push(token);
      continue;
    }

    if (!selected.includes(key)) {
      selected.push(key);
    }
  }

  if (unknown.length > 0) {
    throw new Error(
      `Unknown plugin value(s): ${unknown.join(', ')}. ` +
        `Use comma-separated keys from: ${availableOptions
          .map(option => option.key)
          .join(', ')}`
    );
  }

  return selected;
}

function renderArray(name: string, entries: string[]): string {
  const lines = [`const ${name} = [`];

  for (const [index, entry] of entries.entries()) {
    const comma = index < entries.length - 1 ? ',' : '';
    const entryLines = entry.split('\n');
    lines.push(...entryLines.map(line => `  ${line}`));
    const lastIndex = lines.length - 1;
    lines[lastIndex] = `${lines[lastIndex]}${comma}`;
  }

  lines.push('];');
  return lines.join('\n');
}

export function buildPluginsSource(params: {
  appName: string;
  selectedPluginKeys: PluginKey[];
  availableFactories: Set<string>;
}): string {
  const { appName, selectedPluginKeys, availableFactories } = params;

  if (!availableFactories.has('appTitlePlugin')) {
    throw new Error(
      'Template does not export appTitlePlugin; cannot generate plugins file safely.'
    );
  }

  const imports = new Set<string>(['appTitlePlugin']);
  const defaultPluginEntries: string[] = [];

  if (availableFactories.has('shaderTemplatePlugin')) {
    imports.add('shaderTemplatePlugin');
    defaultPluginEntries.push('shaderTemplatePlugin()');
  }

  defaultPluginEntries.push([
    '{',
    "    name: 'create-tabs',",
    '    beforeUserCreatesGui: (gui) => {',
    "      gui.addTabs('appearance', 'export');",
    '    },',
    '  }',
  ].join('\n'));

  if (availableFactories.has('resolutionPlugin')) {
    imports.add('resolutionPlugin');
    defaultPluginEntries.push('resolutionPlugin()');
  }

  const selected = new Set(selectedPluginKeys);
  const optionalEntries: string[] = [];

  for (const option of getAvailablePluginOptions(availableFactories)) {
    if (!selected.has(option.key)) continue;
    imports.add(option.factory);
    optionalEntries.push(option.createCall());
  }

  const importSection = [
    'import {',
    ...Array.from(imports)
      .sort((a, b) => a.localeCompare(b))
      .map(name => `  ${name},`),
    "} from './lib/plugins';",
  ].join('\n');

  const blocks = [
    importSection,
    '',
    renderArray('defaultPlugins', defaultPluginEntries),
    '',
    renderArray('plugins', [
      `appTitlePlugin(${JSON.stringify(appName)})`,
      '...defaultPlugins',
      ...optionalEntries,
    ]),
    '',
    'export { plugins };',
    '',
  ];

  return blocks.join('\n');
}

export function pluginLabelsForReadme(
  selectedPluginKeys: PluginKey[],
  availableOptions: PluginOption[]
): string[] {
  const lookup = new Map(availableOptions.map(option => [option.key, option.label]));
  return selectedPluginKeys
    .map(key => lookup.get(key))
    .filter((value): value is string => Boolean(value));
}
