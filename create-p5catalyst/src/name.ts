const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
const FILESYSTEM_FORBIDDEN = /[<>:"/\\|?*\x00-\x1f]/;

export function validateProjectDirectoryName(name: string): string | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'Project name cannot be empty.';
  }

  if (trimmed === '.' || trimmed === '..') {
    return 'Project name cannot be "." or "..".';
  }

  if (FILESYSTEM_FORBIDDEN.test(trimmed)) {
    return 'Project name contains characters that are not allowed by the filesystem.';
  }

  if (/[\s.]$/.test(trimmed)) {
    return 'Project name cannot end with a space or period.';
  }

  if (WINDOWS_RESERVED_NAMES.test(trimmed)) {
    return 'Project name is reserved on Windows. Pick another name.';
  }

  return null;
}

export function normalizePackageName(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/[-_.]{2,}/g, '-')
    .replace(/^[-_.]+/, '')
    .replace(/[-_.]+$/, '');

  if (!normalized) {
    return 'p5catalyst-app';
  }

  const startsWithInvalid = /^[._]/.test(normalized);
  return startsWithInvalid ? `p5catalyst-${normalized.replace(/^[._]+/, '') || 'app'}` : normalized;
}
