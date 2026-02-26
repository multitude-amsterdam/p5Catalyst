import path from 'node:path';

import fs from 'fs-extra';

import { normalizePackageName } from './name';
import {
  type PluginKey,
  type PluginOption,
  buildPluginsSource,
  pluginLabelsForReadme,
} from './plugins';

export type Language = 'ts' | 'js';

export type ApplyTransformsOptions = {
  appName: string;
  language: Language;
  selectedPluginKeys: PluginKey[];
  availableFactories: Set<string>;
  availablePluginOptions: PluginOption[];
};

export async function isDirectoryEmpty(dir: string): Promise<boolean> {
  if (!(await fs.pathExists(dir))) {
    return true;
  }

  const stats = await fs.stat(dir);
  if (!stats.isDirectory()) {
    return false;
  }

  const entries = await fs.readdir(dir);
  return entries.length === 0;
}

export async function copyTemplate(
  templateDir: string,
  targetDir: string,
  overwrite: boolean
): Promise<void> {
  if (overwrite && (await fs.pathExists(targetDir))) {
    await fs.remove(targetDir);
  }

  await fs.ensureDir(targetDir);
  await fs.copy(templateDir, targetDir, {
    overwrite: true,
    errorOnExist: false,
    filter(src) {
      return !src.includes(`${path.sep}.git${path.sep}`);
    },
  });
}

function pathExistsSyncSafe(filePath: string): boolean {
  try {
    return fs.pathExistsSync(filePath);
  } catch {
    return false;
  }
}

function resolveMainEntry(projectDir: string): string {
  const srcDir = path.join(projectDir, 'src');
  const tsMain = path.join(srcDir, 'main.ts');
  const jsMain = path.join(srcDir, 'main.js');

  if (pathExistsSyncSafe(tsMain)) return tsMain;
  if (pathExistsSyncSafe(jsMain)) return jsMain;

  throw new Error('Could not locate src/main.ts or src/main.js in the generated project.');
}

async function rewriteMainEntryForGeneratedPlugins(mainEntryPath: string): Promise<void> {
  const pluginImportLine = "import { plugins } from './plugins.generated';";

  const original = await fs.readFile(mainEntryPath, 'utf8');
  let content = original.replace(
    /^\s*import\s*\{\s*plugins\s*\}\s*from\s*['"][^'"]+['"];?\s*$/gm,
    ''
  );

  const importLines = [...content.matchAll(/^import .*;$/gm)];
  if (importLines.length > 0) {
    const lastImport = importLines[importLines.length - 1];
    const insertionPoint = (lastImport.index ?? 0) + lastImport[0].length;
    content = `${content.slice(0, insertionPoint)}\n${pluginImportLine}${content.slice(insertionPoint)}`;
  } else {
    content = `${pluginImportLine}\n${content}`;
  }

  const catalystCallPattern =
    /new\s+Catalyst\s*\(\s*([A-Za-z0-9_$]+)\s*,\s*([A-Za-z0-9_$]+)\s*(?:,\s*([A-Za-z0-9_$]+)\s*)?\);/;
  let matchedCatalystCall = false;
  const replaced = content.replace(
    catalystCallPattern,
    (_full, sketchSeedArg, createGuiArg) => {
      matchedCatalystCall = true;
      return `new Catalyst(${sketchSeedArg}, ${createGuiArg}, plugins);`;
    }
  );

  if (!matchedCatalystCall) {
    throw new Error(
      `Could not update Catalyst initialization in ${mainEntryPath}. Please ensure it calls new Catalyst(...).`
    );
  }

  await fs.writeFile(mainEntryPath, replaced);
}

async function renameTopLevelTsAppFilesToJs(projectDir: string): Promise<void> {
  const srcDir = path.join(projectDir, 'src');
  const filesToRename = ['main', 'sketch', 'create-gui', 'create-plugins'];

  for (const baseName of filesToRename) {
    const tsPath = path.join(srcDir, `${baseName}.ts`);
    const jsPath = path.join(srcDir, `${baseName}.js`);

    if (await fs.pathExists(tsPath)) {
      await fs.move(tsPath, jsPath, { overwrite: true });
    }
  }

  const srcEntries = await fs.readdir(srcDir);
  for (const entry of srcEntries) {
    if (!entry.endsWith('.js') && !entry.endsWith('.ts')) continue;

    const filePath = path.join(srcDir, entry);
    const content = await fs.readFile(filePath, 'utf8');
    const updated = content
      .replace(/(from\s+['"][^'"]+)\.ts(['"])/g, '$1.js$2')
      .replace(/(import\s*\(['"][^'"]+)\.ts(['"]\))/g, '$1.js$2');

    if (updated !== content) {
      await fs.writeFile(filePath, updated);
    }
  }
}

async function updateGeneratedPackageJson(
  projectDir: string,
  options: ApplyTransformsOptions
): Promise<void> {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  packageJson.name = normalizePackageName(options.appName);
  packageJson.private = true;

  const hasVideoPlugin = options.selectedPluginKeys.includes('video-export');

  if (!hasVideoPlugin) {
    if (packageJson.dependencies) {
      delete packageJson.dependencies['@ffmpeg/ffmpeg'];
      delete packageJson.dependencies['@ffmpeg/util'];
    }
    if (packageJson.devDependencies) {
      delete packageJson.devDependencies['@ffmpeg/ffmpeg'];
      delete packageJson.devDependencies['@ffmpeg/util'];
    }
  }

  if (options.language === 'js') {
    if (packageJson.devDependencies) {
      delete packageJson.devDependencies.typescript;
      delete packageJson.devDependencies['@types/p5'];
    }

    if (packageJson.scripts && packageJson.scripts.build) {
      packageJson.scripts.build = 'vite build';
    }

    if (typeof packageJson.main === 'string' && packageJson.main.endsWith('.ts')) {
      packageJson.main = packageJson.main.replace(/\.ts$/, '.js');
    }
  }

  await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

async function stubFfmpegModuleWhenVideoDisabled(
  projectDir: string,
  hasVideoPlugin: boolean
): Promise<void> {
  if (hasVideoPlugin) {
    return;
  }

  const candidates = [
    path.join(projectDir, 'src', 'lib', 'ffmpeg', 'index.ts'),
    path.join(projectDir, 'src', 'lib', 'ffmpeg', 'index.js'),
  ];
  const ffmpegPath = candidates.find(candidate => fs.pathExistsSync(candidate));

  if (!ffmpegPath) {
    return;
  }

  const stubSource = [
    "// Generated by create-p5catalyst: video export was disabled at scaffold time.",
    'const NOOP_VIDEO_FORMAT = {',
    "  guiName: 'Disabled',",
    "  ext: 'mp4',",
    "  mimeType: 'video/mp4',",
    '  command: \"\",',
    '};',
    '',
    'export const videoFormats = {',
    '  DISABLED: NOOP_VIDEO_FORMAT,',
    '};',
    '',
    'export function setVideoFormatSettings() {}',
    'export function getFFmpegProgress() {',
    '  return 0;',
    '}',
    'export function resetFFmpegProgress() {}',
    'export async function ffmpegInit() {}',
    'export function logFFMPEG() {}',
    'export function saveToLocalFFMPEG() {}',
    'export async function ffmpegCreateVideo() {}',
    'export function cancelFFmpegExport() {}',
    '',
  ].join('\n');

  await fs.writeFile(ffmpegPath, stubSource);
}

async function addReadmeHeader(
  projectDir: string,
  options: ApplyTransformsOptions
): Promise<void> {
  const readmePath = path.join(projectDir, 'README.md');
  const existing = (await fs.pathExists(readmePath)) ? await fs.readFile(readmePath, 'utf8') : '';

  const selectedLabels = pluginLabelsForReadme(
    options.selectedPluginKeys,
    options.availablePluginOptions
  );

  const note = [
    '# This project was created with npm create p5catalyst',
    '',
    'Generated options:',
    `- App name: ${options.appName}`,
    `- Language: ${options.language === 'ts' ? 'TypeScript' : 'JavaScript'}`,
    `- Plugins: ${selectedLabels.length > 0 ? selectedLabels.join(', ') : 'none'}`,
    '',
  ].join('\n');

  const normalizedExisting = existing.replace(/^\s+/, '');
  await fs.writeFile(readmePath, `${note}${normalizedExisting}`);
}

export async function applyProjectTransforms(
  projectDir: string,
  options: ApplyTransformsOptions
): Promise<void> {
  if (options.language === 'js') {
    await renameTopLevelTsAppFilesToJs(projectDir);
  }

  const mainEntryPath = resolveMainEntry(projectDir);
  const pluginFileExt = path.extname(mainEntryPath) === '.ts' && options.language === 'ts' ? 'ts' : 'js';
  const pluginFilePath = path.join(projectDir, 'src', `plugins.generated.${pluginFileExt}`);

  const pluginSource = buildPluginsSource({
    appName: options.appName,
    selectedPluginKeys: options.selectedPluginKeys,
    availableFactories: options.availableFactories,
  });
  await fs.writeFile(pluginFilePath, pluginSource);

  await fs.remove(path.join(projectDir, 'src', 'create-plugins.ts'));
  await fs.remove(path.join(projectDir, 'src', 'create-plugins.js'));

  await rewriteMainEntryForGeneratedPlugins(mainEntryPath);
  await updateGeneratedPackageJson(projectDir, options);
  await stubFfmpegModuleWhenVideoDisabled(
    projectDir,
    options.selectedPluginKeys.includes('video-export')
  );
  await addReadmeHeader(projectDir, options);
}
