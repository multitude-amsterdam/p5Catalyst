import path from 'node:path';

import kleur from 'kleur';
import ora from 'ora';
import prompts from 'prompts';

import { validateProjectDirectoryName } from './name';
import {
  type PluginKey,
  getAvailablePluginOptions,
  getDefaultPluginSelection,
  parsePluginArg,
  discoverAvailablePluginFactories,
} from './plugins';
import {
  type Language,
  isDirectoryEmpty,
  copyTemplate,
  applyProjectTransforms,
} from './scaffold';
import { fetchTemplateWorkspace } from './template';

type CliArgs = {
  name?: string;
  language?: Language;
  pluginArg?: string;
  yes: boolean;
};

function parseArgs(argv: string[]): CliArgs {
  const parsed: CliArgs = { yes: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--') {
      continue;
    }

    if (arg === '--yes' || arg === '-y') {
      parsed.yes = true;
      continue;
    }

    if (arg === '--ts') {
      if (parsed.language === 'js') {
        throw new Error('Cannot use --ts and --js together.');
      }
      parsed.language = 'ts';
      continue;
    }

    if (arg === '--js') {
      if (parsed.language === 'ts') {
        throw new Error('Cannot use --ts and --js together.');
      }
      parsed.language = 'js';
      continue;
    }

    if (arg === '--name') {
      const value = argv[index + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('Missing value for --name. Example: --name my-app');
      }
      parsed.name = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('--name=')) {
      parsed.name = arg.slice('--name='.length);
      continue;
    }

    if (arg === '--plugins') {
      const value = argv[index + 1];
      if (!value || value.startsWith('-')) {
        throw new Error(
          'Missing value for --plugins. Example: --plugins randomizer,image-export'
        );
      }
      parsed.pluginArg = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('--plugins=')) {
      parsed.pluginArg = arg.slice('--plugins='.length);
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (!parsed.name) {
      parsed.name = arg;
      continue;
    }

    throw new Error(`Unexpected positional argument: ${arg}`);
  }

  return parsed;
}

async function promptRequiredInputs(args: CliArgs): Promise<{
  appName: string;
  language: Language;
}> {
  const onCancel = () => {
    throw new Error('Operation cancelled by user.');
  };

  let appName = args.name ?? 'p5catalyst-app';
  if (!args.name && !args.yes) {
    const response = await prompts(
      {
        type: 'text',
        name: 'appName',
        message: 'Project name',
        initial: 'p5catalyst-app',
        validate: value => validateProjectDirectoryName(value) ?? true,
      },
      { onCancel }
    );
    appName = response.appName;
  }

  const nameError = validateProjectDirectoryName(appName);
  if (nameError) {
    throw new Error(nameError);
  }

  let language: Language = args.language ?? 'ts';
  if (!args.language && !args.yes) {
    const response = await prompts(
      {
        type: 'select',
        name: 'language',
        message: 'Language',
        initial: 0,
        choices: [
          { title: 'TypeScript', value: 'ts' },
          { title: 'JavaScript', value: 'js' },
        ],
      },
      { onCancel }
    );

    language = response.language;
  }

  return { appName, language };
}

async function choosePlugins(params: {
  args: CliArgs;
  availablePluginOptions: ReturnType<typeof getAvailablePluginOptions>;
}): Promise<PluginKey[]> {
  const { args, availablePluginOptions } = params;

  if (availablePluginOptions.length === 0) {
    return [];
  }

  if (args.pluginArg) {
    return parsePluginArg(args.pluginArg, availablePluginOptions);
  }

  if (args.yes) {
    return getDefaultPluginSelection(availablePluginOptions);
  }

  const defaults = new Set(getDefaultPluginSelection(availablePluginOptions));

  const response = await prompts(
    {
      type: 'multiselect',
      name: 'plugins',
      message: 'Select plugins',
      instructions: false,
      choices: availablePluginOptions.map(option => ({
        title: option.label,
        value: option.key,
        selected: defaults.has(option.key),
        description: option.description,
      })),
      min: 0,
    },
    {
      onCancel: () => {
        throw new Error('Operation cancelled by user.');
      },
    }
  );

  return response.plugins as PluginKey[];
}

async function run(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const { appName, language } = await promptRequiredInputs(args);

  const targetDir = path.resolve(process.cwd(), appName);
  const targetExists = await isDirectoryEmpty(targetDir).then(empty => !empty);

  let overwrite = false;
  if (targetExists) {
    if (args.yes) {
      throw new Error(
        `Target directory is not empty: ${targetDir}. Remove it or rerun without --yes to confirm overwrite.`
      );
    }

    const response = await prompts(
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Directory ${appName} is not empty. Overwrite it?`,
        initial: false,
      },
      {
        onCancel: () => {
          throw new Error('Operation cancelled by user.');
        },
      }
    );

    overwrite = Boolean(response.overwrite);
    if (!overwrite) {
      throw new Error('Aborted because target directory was not empty.');
    }
  }

  const downloadSpinner = ora('Downloading p5Catalyst template...').start();
  const workspace = await fetchTemplateWorkspace();
  downloadSpinner.succeed(`Template fetched via ${workspace.source}.`);

  try {
    const availableFactories = await discoverAvailablePluginFactories(
      workspace.templateDir
    );
    const availablePluginOptions = getAvailablePluginOptions(availableFactories);

    const selectedPluginKeys = await choosePlugins({
      args,
      availablePluginOptions,
    });

    const scaffoldSpinner = ora('Scaffolding project...').start();

    await copyTemplate(workspace.templateDir, targetDir, overwrite);
    await applyProjectTransforms(targetDir, {
      appName,
      language,
      selectedPluginKeys,
      availableFactories,
      availablePluginOptions,
    });

    scaffoldSpinner.succeed('Project created successfully.');

    const relativeTarget = path.relative(process.cwd(), targetDir) || '.';
    const displayDir = relativeTarget.startsWith('.')
      ? relativeTarget
      : `./${relativeTarget}`;

    console.log('');
    console.log(kleur.bold('Next steps:'));
    console.log(`  cd ${displayDir}`);
    console.log('  npm install');
    console.log('  npm run dev');
    console.log('');
  } finally {
    await workspace.cleanup();
  }
}

run().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(kleur.red(`Error: ${message}`));
  process.exitCode = 1;
});
