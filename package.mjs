import { readFileSync, mkdirSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(root, 'ipollowork.plugin.json')));
const stage = mkdtempSync(path.join(tmpdir(), 'checkpoint-package-'));
const dist = path.join(root, 'dist');
mkdirSync(dist, { recursive: true });
try {
  cpSync(path.join(root, 'ipollowork.plugin.json'), path.join(stage, 'ipollowork.plugin.json'));
  cpSync(path.join(root, 'ui'), path.join(stage, 'ui'), { recursive: true });
  const install = path.join(dist, `${manifest.id}-${manifest.package.version}.ipollowork-plugin`);
  rmSync(install, { force: true });
  execFileSync('zip', ['-X', '-qr', install, 'ipollowork.plugin.json', 'ui'], { cwd: stage });
  console.log(install);
} finally {
  rmSync(stage, { recursive: true, force: true });
}
