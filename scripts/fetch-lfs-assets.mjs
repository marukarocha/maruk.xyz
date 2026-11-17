#!/usr/bin/env node
/**
 * The repository keeps large .glb assets in Git LFS (see .gitattributes).
 * Vercel does not download LFS objects (and the default GitHub Actions
 * checkout does not either), so the build would ship tiny pointer files and
 * the 3D viewer fails with "not valid JSON" / broken GLB data.
 *
 * This script runs before `vite build`, finds any file that is still an LFS
 * pointer, downloads its real content from the public GitHub LFS media
 * endpoint and verifies the bytes against the pointer's size and sha256.
 *
 * It is a no-op when the checkout already has the real files (e.g. a local
 * clone with `git lfs pull`).
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const POINTER_PREFIX = 'version https://git-lfs.github.com/spec/v1';
const POINTER_MAX_BYTES = 1024;
const SEARCH_DIRS = ['public', 'src'];
const CONCURRENCY = 3;

const repo =
  process.env.GITHUB_REPOSITORY ||
  (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
    ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
    : 'marukarocha/maruk.xyz');

const ref =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.LFS_REF ||
  'master';

async function walk(dir, files = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

async function readPointer(file) {
  const info = await stat(file);
  // Real LFS content (glb, png, ...) is always larger than a pointer file.
  if (info.size > POINTER_MAX_BYTES) return null;
  const text = (await readFile(file)).toString('utf8');
  if (!text.startsWith(POINTER_PREFIX)) return null;
  const oid = /oid sha256:([a-f0-9]{64})/.exec(text)?.[1];
  const size = Number(/size (\d+)/.exec(text)?.[1]);
  if (!oid || !Number.isFinite(size) || size <= 0) {
    throw new Error(`ponteiro LFS invalido: ${path.relative(ROOT, file)}`);
  }
  return { oid, size };
}

const encodePath = (relPath) =>
  relPath.split('/').map(encodeURIComponent).join('/');

async function materialize(relPath, pointer) {
  const url = `https://media.githubusercontent.com/media/${repo}/${ref}/${encodePath(relPath)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ao baixar ${url}`);
  }
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length !== pointer.size) {
    throw new Error(`${relPath}: ${data.length} bytes, esperado ${pointer.size}`);
  }
  const digest = createHash('sha256').update(data).digest('hex');
  if (digest !== pointer.oid) {
    throw new Error(`${relPath}: sha256 ${digest}, esperado ${pointer.oid}`);
  }
  await writeFile(path.join(ROOT, relPath), data);
  console.log(`[lfs] ${relPath}: ${(data.length / 1024 / 1024).toFixed(2)} MB`);
}

async function mapLimit(items, limit, task) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await task(items[index]);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const files = [];
  for (const dir of SEARCH_DIRS) {
    if (existsSync(dir)) await walk(path.join(ROOT, dir), files);
  }

  const pointers = [];
  for (const file of files) {
    const pointer = await readPointer(file);
    if (pointer) {
      const relPath = path.relative(ROOT, file).split(path.sep).join('/');
      pointers.push({ relPath, pointer });
    }
  }

  if (pointers.length === 0) {
    console.log('[lfs] nenhum ponteiro LFS encontrado; nada a fazer.');
    return;
  }

  console.log(`[lfs] ${pointers.length} arquivo(s) LFS a materializar (${repo} @ ${ref})`);
  await mapLimit(pointers, CONCURRENCY, ({ relPath, pointer }) =>
    materialize(relPath, pointer),
  );
  console.log('[lfs] ok');
}

main().catch((error) => {
  console.error(`[lfs] falhou: ${error.message}`);
  process.exit(1);
});
