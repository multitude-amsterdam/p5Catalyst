import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, '../dist/cli.js');

try {
  fs.chmodSync(cliPath, 0o755);
} catch {
  // ignore on platforms where chmod may be unsupported
}
