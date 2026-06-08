const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = __dirname;
const requiredFiles = [
  'README.md',
  'SUBMISSION.md',
  'GITHUB_RELEASE.md',
  'index.html',
  'styles.css',
  'browser-demo.js',
  'riskSkill.js',
  'skill-manifest.json',
  'examples/sample-input.json',
  'examples/sample-output-contract.json',
  'demo.js',
  'test.js',
  'package.json',
  'LICENSE',
  'JUDGES.md',
  'DORAHACKS_FIELDS.md',
  'publish-readiness.js',
  'PUBLISH_CHECKLIST.md',
  '.github/README.md',
  '.github/workflows/ci.yml'
];

const forbiddenPatterns = [
  /private[_ -]?key\s*[:=]/i,
  /seed[_ -]?phrase\s*[:=]/i,
  /api[_ -]?key\s*[:=]/i,
  /secret\s*[:=]/i,
  /password\s*[:=]/i,
  /mnemonic\s*[:=]/i
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing required file: ${file}`);
  }
}

const scannedExtensions = new Set(['.js', '.json', '.md', '.html', '.css', '.yml', '.yaml']);

function collectScannableFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') return [];
      return collectScannableFiles(fullPath);
    }

    return scannedExtensions.has(path.extname(entry.name)) ? [relativePath] : [];
  });
}

const files = collectScannableFiles(root);

for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      fail(`Potential secret-like pattern found in ${file}: ${pattern}`);
    }
  }
}

const testRun = spawnSync(process.execPath, ['test.js'], {
  cwd: root,
  encoding: 'utf8'
});

if (testRun.status !== 0) {
  process.stdout.write(testRun.stdout);
  process.stderr.write(testRun.stderr);
  fail('Tests failed during preflight');
}

console.log('preflight passed');
