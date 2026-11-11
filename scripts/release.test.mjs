import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

// Execute the actual workflow publish steps against a fake registry; never publish to npm.
const workflow = readFileSync(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const native = '@rdlabo/capacitor-native-ui';
const theme = '@rdlabo/ionic-theme-ios27';

function runBetaRelease(t, { existing = {}, legacy = false, failTheme = false, conflict = false } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'release-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const version = '1.2.2-beta.pr298.sha0123456789ab';
  const folder = join(directory, 'npm-candidate');
  const names = legacy ? ['@rdlabo/ionic-theme-ios26'] : [theme];
  mkdirSync(folder);
  mkdirSync(join(directory, 'package'));
  const registry = {};
  let integrity;
  for (const name of names) {
    const manifest = { name, version };
    if (name === theme) manifest.peerDependencies = { [native]: '^2.1.0' };
    writeFileSync(join(directory, 'package/package.json'), JSON.stringify(manifest));
    const archive = join(folder, `${name.replace('@', '').replace('/', '-')}-${version}.tgz`);
    execFileSync('tar', ['-czf', archive, '-C', directory, 'package']);
    integrity = 'sha512-' + createHash('sha512').update(readFileSync(archive)).digest('base64');
    registry[`${name}@${version}`] = existing[name] === 'matching'
      ? integrity
      : existing[name] ?? 'E404';
  }
  writeFileSync(join(directory, 'registry.json'), JSON.stringify(registry));
  const log = join(directory, 'calls.jsonl');
  writeFileSync(join(directory, 'npm'), `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.CALL_LOG, JSON.stringify(args) + '\\n');
if (args[0] === 'view') {
  const value = JSON.parse(fs.readFileSync(process.env.REGISTRY))[args[1]];
  if (value.startsWith('E')) {
    process.stdout.write(JSON.stringify({error: {code: value}}));
    process.exit(1);
  }
  process.stdout.write(JSON.stringify(value));
} else if (args[0] === 'publish' && process.env.CONFLICT === 'true') {
  const registry = JSON.parse(fs.readFileSync(process.env.REGISTRY));
  for (const spec of Object.keys(registry)) registry[spec] = process.env.INTEGRITY;
  fs.writeFileSync(process.env.REGISTRY, JSON.stringify(registry));
  process.stdout.write(JSON.stringify({error: {code: 'E409'}}));
  process.exit(1);
} else if (args[0] === 'publish' && process.env.FAIL_THEME === 'true' && args[1].includes('ionic-theme-ios27')) {
  process.exit(1);
}
`, { mode: 0o755 });
  const step = 'Validate and publish candidate';
  const source = workflow.split(`      - name: ${step}\n`)[1].match(/node --input-type=module <<'JS'\n([\s\S]*?)\n          JS/)[1];
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], {
    encoding: 'utf8',
    env: {
      ...process.env, PATH: `${directory}:${process.env.PATH}`, RUNNER_TEMP: directory,
      VERSION: version, EXPECTED_VERSION: version, EXPECTED_NAME: names.at(-1), DIST_TAG: 'beta',
      CALL_LOG: log, REGISTRY: join(directory, 'registry.json'), FAIL_THEME: String(failTheme),
      CONFLICT: String(Boolean(conflict)), INTEGRITY: conflict === 'different' ? 'sha512-different' : integrity,
    },
  });
  const calls = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map(line => JSON.parse(line)) : [];
  return { result, calls, published: calls.filter(call => call[0] === 'publish') };
}

test(`beta: publishes only the theme with an independently versioned plugin`, t => {
  const { result, calls, published } = runBetaRelease(t);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(calls.map(call => call[0]), ['view', 'publish']);
  assert.match(published[0][1], /rdlabo-ionic-theme-ios27-/);
  for (const call of published) {
    assert(call.includes('--ignore-scripts'));
    assert(call.includes('--provenance'));
    assert.equal(call.at(-1), 'beta');
  }
});
test(`beta: retry publishes the theme after a failed attempt`, t => {
  assert.notEqual(runBetaRelease(t, { failTheme: true }).result.status, 0);
  const { result, published } = runBetaRelease(t, {});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(published.length, 1);
  assert.match(published[0][1], /rdlabo-ionic-theme-ios27-/);
});
test(`beta: complete release is idempotent`, t => {
  const { result, published } = runBetaRelease(t, { existing: { [theme]: 'matching' } });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(published.length, 0);
});
test('beta: a publish conflict succeeds when the same archive becomes visible', (t) => {
  const { result, calls } = runBetaRelease(t, { conflict: true });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    calls.map((call) => call[0]),
    ['view', 'publish', 'view'],
  );
});

test('beta: a publish conflict with different contents fails', (t) => {
  const { result, published } = runBetaRelease(t, { conflict: 'different' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /already exists with different contents/);
  assert.equal(published.length, 1);
});

for (const value of ['sha512-different', 'E401', 'E500']) {
  test(`beta: ${value} on theme prevents publication`, t => {
    const { result, published } = runBetaRelease(t, { existing: { [theme]: value } });
    assert.notEqual(result.status, 0);
    assert.equal(published.length, 0);
  });
}
test('ios26 beta still publishes its single package', t => {
  const { result, published } = runBetaRelease(t, { legacy: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(published.length, 1);
  assert.match(published[0][1], /rdlabo-ionic-theme-ios26-/);
});

for (const version of ['2.0.0', '2.0.0-0']) {
  test(`versioned release: publishes only the theme (${version})`, t => {
    const { result, published } = runPackageRelease(t, version);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(published.length, 1);
    assert.equal(published[0][0], 'publish');
    assert(!published[0].includes('--workspace'));
    for (const call of published) {
      assert(call.includes('--provenance'));
      assert(!call.includes('--ignore-scripts'), 'Versioned release must retain package lifecycle scripts');
      assert.equal(call.at(-1), version.includes('-') ? 'next' : 'latest');
    }
  });
}

function runPackageRelease(t, version) {
  const directory = mkdtempSync(join(tmpdir(), 'package-release-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(join(directory, 'package.json'), JSON.stringify({ name: theme, version, dependencies: { [native]: '2.1.0' } }));
  const log = join(directory, 'calls.jsonl');
  writeFileSync(join(directory, 'npm'), `#!/usr/bin/env node
require('node:fs').appendFileSync(process.env.CALL_LOG, JSON.stringify(process.argv.slice(2)) + '\\n');
`, { mode: 0o755 });
  const source = workflow.split('      - name: Publish packages\n')[1].match(/node --input-type=module <<'JS'\n([\s\S]*?)\n          JS/)[1];
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], {
    cwd: directory, encoding: 'utf8',
    env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, VERSION: version, CALL_LOG: log },
  });
  const published = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map(line => JSON.parse(line)) : [];
  return { result, published };
}

for (const name of [theme, '@rdlabo/ionic-theme-ios26']) {
  test(`beta install instructions reference only the published package: ${name}`, async () => {
    const source = workflow.split('      - name: Comment exact install command\n')[1].split('          script: |\n')[1];
    const version = '2.1.1-beta.pr343.sha0123456789ab';
    let body;
    const core = {
      summary: { addRaw(value) { body = value; return { write: async () => {} }; } },
      notice() {},
    };
    // Run the actual GitHub-script body with a local environment and no GitHub writes.
    const run = new (Object.getPrototypeOf(async function () {}).constructor)('context', 'core', 'process', source);
    await run({ repo: { owner: 'example', repo: 'theme' } }, core, { env: {
      PACKAGE_NAME: name, VERSION: version, HEAD_SHA: '0123456789abcdef', PR_NUMBER: '',
      DIST_TAG: 'beta', SOURCE_KIND: 'merge',
    } });
    assert(body.includes(`npm install ${name}@${version}\n`));
    assert(!body.includes(native), 'The independently released plugin must not inherit the theme beta version');
  });
}

test('beta: dispatch authorizes the original comment and exact PR head', async () => {
  const source = workflow
    .split('      - name: Authorize immutable candidate\n')[1]
    .split('          script: |\n')[1]
    .split('\n  dispatch-comment-beta:')[0];
  const run = new (Object.getPrototypeOf(async function () {}).constructor)('github', 'context', 'core', source);
  const sha = 'a'.repeat(40);
  const comment = {
    body: '/beta',
    created_at: '2026-11-11',
    updated_at: '2026-11-11',
    issue_url: 'https://api.github.com/repos/example/theme/issues/42',
    user: { login: 'maintainer' },
  };
  const context = {
    repo: { owner: 'example', repo: 'theme' },
    eventName: 'workflow_dispatch',
    payload: { inputs: { 'comment-id': '123', 'head-sha': sha, 'target-branch': 'main' } },
  };
  const data = (value) => async () => ({ data: value });
  const actions = { listWorkflowRunsForRepo() {}, listWorkflowRunArtifacts() {} };
  const outputs = {};
  const core = {
    notice() {},
    setFailed(message) {
      throw new Error(message);
    },
    setOutput(key, value) {
      outputs[key] = value;
    },
  };
  const pr = { state: 'open', draft: false, base: { ref: 'main' }, head: { sha, repo: { owner: { login: 'example' }, name: 'theme' } } };
  const permission = { permission: 'maintain' };
  const github = {
    rest: {
      actions,
      issues: {
        getComment: async ({ comment_id }) => {
          assert.equal(comment_id, 123);
          return { data: comment };
        },
      },
      pulls: {
        get: async ({ pull_number }) => {
          assert.equal(pull_number, 42);
          return { data: pr };
        },
      },
      repos: {
        getCollaboratorPermissionLevel: data(permission),
        getContent: data({ sha, type: 'file', content: Buffer.from(JSON.stringify({ version: '2.1.2-0' })).toString('base64') }),
      },
    },
    paginate: async (method) =>
      method === actions.listWorkflowRunsForRepo
        ? [
            ['Lint', 'lint'],
            ['E2E Screenshot Tests Pull Request', 'e2e-pull_request'],
            ['Package Candidate', 'package-candidate'],
          ].map(([name, path]) => ({
            name,
            path: `.github/workflows/${path}.yml`,
            id: 1,
            status: 'completed',
            conclusion: 'success',
          created_at: '2026-11-10',
            pull_requests: [{ number: 42, base: { ref: 'main' }, head: { sha } }],
          }))
        : [{ name: `npm-candidate-${sha}`, expired: false }],
  };
  await run(github, context, core);
  assert.equal(outputs.allowed, 'true');
  assert.equal(outputs['head-sha'], sha);
  assert.equal(outputs['source-kind'], 'comment');

  pr.head.sha = 'b'.repeat(40);
  await assert.rejects(run(github, context, core), /PR head or base changed/);
  pr.head.sha = sha;
  permission.permission = 'write';
  await run(github, context, core);
  assert.equal(outputs.allowed, 'false');
  comment.body = 'edited';
  await assert.rejects(run(github, context, core), /original \/beta comment/);
});
