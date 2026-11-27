// Homefront Budget — the hand-in program (Node 22, standard library only).
//
// It hands the site in: it copies app/ (the static site) and screenshots/
// (four real renders of the site) from beside this file into the output
// directory, then writes /output/dossier.json — the summary the judge reads
// (the screenshots, the first load's files and bytes, and the site's source)
// — with the vendored make.fun library in vendor/makefun-frontend.ts, which
// must stay exactly as the kit shipped it: the scorer rebuilds the dossier
// with its own copy and requires the two to match byte for byte.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program is deterministic: same repository, same bytes out, every run.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly, before copying anything, if the entry is incomplete: a
// missing index.html or an empty screenshots/ folder would hand in a site
// the judge cannot open, and the scorer would refuse it anyway.
const appDir = join(here, 'app');
if (!existsSync(join(appDir, 'index.html'))) {
  throw new Error(`refusing to hand in: ${join(appDir, 'index.html')} is missing`);
}
const shotDir = join(here, 'screenshots');
if (!existsSync(shotDir) || readdirSync(shotDir).filter((n) => !n.startsWith('.')).length === 0) {
  throw new Error(`refusing to hand in: ${shotDir} holds no screenshots`);
}

// Fresh output: the two runs the grader makes must agree byte for byte, so
// nothing stale may survive from an earlier run.
mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The caps are the scorer's own (see the kit's RULES.txt): at most 4 shots of
// 256 KiB, at most 993 files and 16 MiB in app/, and the dossier text capped
// at 160 KiB. buildDossier refuses anything past them, so a bad entry fails
// here, loudly, instead of silently reaching the judge.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

// A short human-readable summary of what was handed in.
function countFiles(dir) {
  let files = 0;
  let bytes = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const info = statSync(path);
    if (info.isDirectory()) {
      const sub = countFiles(path);
      files += sub.files;
      bytes += sub.bytes;
    } else {
      files += 1;
      bytes += info.size;
    }
  }
  return { files, bytes };
}
const app = countFiles(join(outDir, 'app'));
const shots = countFiles(join(outDir, 'screenshots'));
console.log(`Homefront handed in: app/ ${app.files} files, ${app.bytes} bytes; ` +
  `screenshots/ ${shots.files} files, ${shots.bytes} bytes; ` +
  `dossier.json ${dossier.length} bytes.`);
