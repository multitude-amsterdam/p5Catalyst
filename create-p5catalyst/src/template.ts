import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import fse from 'fs-extra';
import spawn from 'cross-spawn';
import * as tar from 'tar';

const TEMPLATE_TARBALL_URL =
  'https://codeload.github.com/multitude-amsterdam/p5Catalyst/tar.gz/refs/heads/main';
const TEMPLATE_REPOSITORY_URL =
  'https://github.com/multitude-amsterdam/p5Catalyst.git';

async function downloadFile(url: string, destination: string, redirects = 0): Promise<void> {
  if (redirects > 8) {
    throw new Error('Too many HTTP redirects while downloading template.');
  }

  await new Promise<void>((resolve, reject) => {
    const req = https.get(url, response => {
      const status = response.statusCode ?? 0;

      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume();
        const redirectUrl = new URL(response.headers.location, url).toString();
        downloadFile(redirectUrl, destination, redirects + 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (status !== 200) {
        response.resume();
        reject(
          new Error(
            `Template download failed with HTTP ${status}. URL: ${url}`
          )
        );
        return;
      }

      const output = fs.createWriteStream(destination);
      pipeline(response, output).then(resolve).catch(reject);
    });

    req.on('error', reject);
  });
}

function hasGitInstalled(): boolean {
  const result = spawn.sync('git', ['--version'], {
    stdio: 'ignore',
  });

  return result.status === 0;
}

function runCommand(command: string, args: string[], cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'pipe',
    });

    let stderr = '';
    if (child.stderr) {
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });
    }

    child.on('error', reject);
    child.on('close', (code: number | null) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr.trim() || `${command} exited with code ${code}.`));
      }
    });
  });
}

export type TemplateWorkspace = {
  tempDir: string;
  templateDir: string;
  source: 'tarball' | 'git';
  cleanup: () => Promise<void>;
};

export async function fetchTemplateWorkspace(): Promise<TemplateWorkspace> {
  const tempDir = await fse.mkdtemp(path.join(os.tmpdir(), 'create-p5catalyst-'));
  const cleanup = async () => {
    await fse.remove(tempDir);
  };

  const tarballPath = path.join(tempDir, 'template.tar.gz');
  const extractDir = path.join(tempDir, 'template');
  await fse.ensureDir(extractDir);

  try {
    await downloadFile(TEMPLATE_TARBALL_URL, tarballPath);
    await tar.x({
      file: tarballPath,
      cwd: extractDir,
      strip: 1,
    });

    return {
      tempDir,
      templateDir: extractDir,
      source: 'tarball',
      cleanup,
    };
  } catch (tarballError) {
    if (!hasGitInstalled()) {
      const message = tarballError instanceof Error ? tarballError.message : String(tarballError);
      throw new Error(`${message}\nTemplate fallback is unavailable because git is not installed.`);
    }

    const gitDir = path.join(tempDir, 'template-git');

    try {
      await runCommand('git', ['clone', '--depth', '1', TEMPLATE_REPOSITORY_URL, gitDir]);
      await fse.remove(path.join(gitDir, '.git'));

      return {
        tempDir,
        templateDir: gitDir,
        source: 'git',
        cleanup,
      };
    } catch (gitError) {
      const tarMessage = tarballError instanceof Error ? tarballError.message : String(tarballError);
      const gitMessage = gitError instanceof Error ? gitError.message : String(gitError);
      throw new Error(
        `Failed to fetch template via tarball and git fallback.\nTarball: ${tarMessage}\nGit: ${gitMessage}`
      );
    }
  }
}
