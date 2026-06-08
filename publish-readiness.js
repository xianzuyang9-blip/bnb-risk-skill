const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const crypto = require('crypto');

const root = __dirname;
const workspaceRoot = path.resolve(root, '..', '..');
const zipPath = path.join(workspaceRoot, 'BNB-Risk-Skill-Hackathon-MVP-2026-06-08.zip');
const outPath = path.join(root, 'PUBLISH_READINESS.md');

const requiredFiles = [
  'README.md',
  'SUBMISSION.md',
  'DORAHACKS_FIELDS.md',
  'GITHUB_RELEASE.md',
  'PUBLISH_CHECKLIST.md',
  'index.html',
  'browser-demo.js',
  'riskSkill.js',
  'skill-manifest.json',
  'examples/sample-input.json',
  'examples/sample-output-contract.json',
  'demo.js',
  'test.js',
  'preflight.js',
  'package.json',
  'LICENSE',
  '.github/workflows/ci.yml',
];

const forbiddenPatterns = [
  ['private key assignment', /private[_ -]?key\s*[:=]/i],
  ['seed phrase assignment', /seed[_ -]?phrase\s*[:=]/i],
  ['api key assignment', /api[_ -]?key\s*[:=]/i],
  ['secret assignment', /secret\s*[:=]/i],
  ['password assignment', /password\s*[:=]/i],
  ['mnemonic assignment', /mnemonic\s*[:=]/i],
  ['evm wallet address literal', /\b0x[a-f0-9]{40}\b/i],
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
  });
  return {
    command: [command, ...args].join(' '),
    status: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    const relative = path.relative(root, full);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') return [];
      return collectFiles(full);
    }
    return [relative.replace(/\\/g, '/')];
  });
}

function sha256(file) {
  if (!fs.existsSync(file)) return '';
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
}

function scanForbidden(files) {
  const hits = [];
  for (const file of files) {
    const extension = path.extname(file).toLowerCase();
    if (!['.js', '.json', '.md', '.html', '.css', '.yml', '.yaml', '.txt'].includes(extension)) continue;
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    for (const [label, pattern] of forbiddenPatterns) {
      if (pattern.test(text)) hits.push({ file, label });
    }
  }
  return hits;
}

function extractField(file, heading) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const pattern = new RegExp(`## ${heading}\\n\\n\\\`\\\`\\\`text\\n([\\s\\S]*?)\\n\\\`\\\`\\\``, 'i');
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function renderMarkdown(context) {
  const lines = [];
  lines.push('# Publish Readiness Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Verdict');
  lines.push('');
  lines.push(context.ready ? 'Ready for manual GitHub/DoraHacks publishing gate.' : 'Not ready. Fix failed checks before publishing.');
  lines.push('');
  lines.push('Manual publishing still requires browser login and user confirmation. Do not put secrets in forms, commits, release notes, or issues.');
  lines.push('');
  lines.push('## Commands');
  lines.push('');
  for (const result of context.commands) {
    lines.push(`- \`${result.command}\`: ${result.status === 0 ? 'passed' : `failed (${result.status})`}`);
  }
  lines.push('');
  lines.push('## Required Files');
  lines.push('');
  for (const file of requiredFiles) {
    lines.push(`- ${context.missingFiles.includes(file) ? 'missing' : 'present'}: \`${file}\``);
  }
  lines.push('');
  lines.push('## Zip');
  lines.push('');
  lines.push(`- Path: \`${path.relative(workspaceRoot, zipPath).replace(/\\/g, '/')}\``);
  lines.push(`- SHA256: \`${context.zipHash || 'missing'}\``);
  lines.push('');
  lines.push('## Safety Scan');
  lines.push('');
  if (!context.secretHits.length) {
    lines.push('No forbidden secret-like patterns found in scannable project files.');
  } else {
    for (const hit of context.secretHits) {
      lines.push(`- ${hit.label}: \`${hit.file}\``);
    }
  }
  lines.push('');
  lines.push('## DoraHacks Copy');
  lines.push('');
  lines.push(`- Project name: ${context.fields.projectName || 'missing'}`);
  lines.push(`- Track: ${context.fields.track || 'missing'}`);
  lines.push(`- Tagline: ${context.fields.tagline || 'missing'}`);
  lines.push('');
  lines.push('## Safety Boundary');
  lines.push('');
  lines.push('- Simulation only.');
  lines.push('- No real trading.');
  lines.push('- No wallet connection.');
  lines.push('- No private keys or seed phrases.');
  lines.push('- No exchange credentials.');
  lines.push('- No profit guarantees.');
  lines.push('- No autonomous execution.');
  lines.push('');
  lines.push('## Next Manual Steps');
  lines.push('');
  lines.push('1. Create a public GitHub repository named `bnb-risk-skill`.');
  lines.push('2. Push the project files from this folder.');
  lines.push('3. Confirm GitHub Actions runs `npm run preflight`.');
  lines.push('4. Add repository and demo links to `DORAHACKS_FIELDS.md`.');
  lines.push('5. Submit on DoraHacks only after user confirmation.');
  lines.push('');
  return lines.join('\n');
}

const files = collectFiles(root);
const commands = [
  run(process.execPath, ['test.js']),
  run(process.execPath, ['demo.js']),
  run(process.execPath, ['preflight.js']),
];
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
const secretHits = scanForbidden(files);
const zipHash = sha256(zipPath);
const fields = {
  projectName: extractField('DORAHACKS_FIELDS.md', 'Project Name'),
  track: extractField('DORAHACKS_FIELDS.md', 'Track'),
  tagline: extractField('DORAHACKS_FIELDS.md', 'Tagline'),
};
const ready = commands.every((result) => result.status === 0) && !missingFiles.length && !secretHits.length && Boolean(zipHash);

fs.writeFileSync(outPath, renderMarkdown({ commands, missingFiles, secretHits, zipHash, fields, ready }));
console.log(`publish readiness ${ready ? 'passed' : 'failed'}`);
console.log(`wrote ${outPath}`);
if (!ready) process.exitCode = 1;
