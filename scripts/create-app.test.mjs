/**
 * アプリ複製スクリプトの自動テストです。テスト用の一時フォルダーで確認します。
 * 既存のコピー先を上書きしないこと、アプリ名の更新、除外するファイルなどを検証します。
 * testは確認項目、assertは期待どおりかを判定する関数。npm.cmd testで実行します。
 */

import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { syncBuiltinESMExports } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { promisify } from 'node:util'
import { createApp, validateAppName } from './create-app.mjs'

const execFileAsync = promisify(execFile)

async function makeFixture(t, { withoutOptionalDirectories = false } = {}) {
  const fixtureParent = await realpath(tmpdir())
  const fixtureRoot = await mkdtemp(join(fixtureParent, 'app-template-test-'))
  t.after(async () => {
    // Delete only this test's own directory, after checking its absolute parent and name.
    const target = resolve(fixtureRoot)
    assert.equal(dirname(target), fixtureParent)
    assert.ok(basename(target).startsWith('app-template-test-'))
    await rm(target, { recursive: true, force: true })
  })
  const sourceDir = join(fixtureRoot, 'template')
  await mkdir(sourceDir)

  const contents = {
    'package.json': JSON.stringify({ name: 'template', private: true, scripts: { dev: 'vite' } }),
    'package-lock.json': JSON.stringify({ name: 'template', lockfileVersion: 3, packages: { '': { name: 'template', dependencies: { react: '^19.0.0' } }, 'node_modules/react': { version: '19.0.0' } } }),
    'index.html': '<!doctype html>\n<html lang="ja"><head><title>元のタイトル</title></head><body><div id="root"></div></body></html>\n',
    'README.md': '# 開発ベース\n',
    '.gitignore': 'node_modules\ndist\n.env*\n',
    'vite.config.ts': 'export default {}\n',
    'tsconfig.json': '{"files": []}\n',
    'tsconfig.app.json': '{}\n',
    'tsconfig.node.json': '{}\n',
    'eslint.config.js': 'export default []\n',
    'components.json': '{"style": "base"}\n',
    'src/config/app-config.json': JSON.stringify({ id: 'template', title: 'テンプレート', description: '汎用アプリ', badge: 'Sample', footer: 'My footer', language: 'ja' }),
    'src/App.tsx': 'export const App = () => <p>サンプルアプリ</p>\n',
    'src/data/chart-data.json': '{"values":[1,0,-3,12.4,0.0001],"unit":"℃"}\n',
    'public/favicon.svg': '<svg xmlns="http://www.w3.org/2000/svg" />\n',
    'scripts/create-app.mjs': '// copied generator\n',
    'docs/template.md': '# 画面の追加\n',
    '.env': 'SECRET=root-secret\n',
    '.env.local': 'SECRET=root-local-secret\n',
    'node_modules/dependency/index.js': '// dependency\n',
    'dist/index.html': '<html>build</html>\n',
    '.git/config': '[core]\n',
    '.aws/credentials': 'local only\n',
    'personal-notes.txt': 'local only\n',
    'src/.env.production': 'SECRET=nested-secret\n',
    'src/node_modules/local/index.js': '// nested dependency\n',
    'src/dist/nested.js': '// nested build\n',
    'scripts/.git/config': 'nested git\n',
  }
  for (const [path, content] of Object.entries(contents)) {
    if (withoutOptionalDirectories && /^(public|scripts|docs)\//.test(path)) continue
    const target = join(sourceDir, path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, content, 'utf8')
  }
  return { fixtureRoot, sourceDir, contents }
}

async function snapshotDirectory(directory) {
  const result = {}
  async function visit(path, key) {
    const stat = await lstat(path)
    if (stat.isDirectory()) {
      result[key] = 'directory'
      for (const entry of (await readdir(path)).sort()) {
        await visit(join(path, entry), key ? `${key}/${entry}` : entry)
      }
    } else if (stat.isSymbolicLink()) {
      result[key] = 'link'
    } else {
      result[key] = (await readFile(path)).toString('base64')
    }
  }
  await visit(directory, '')
  return result
}

test('copies allowed files, updates names, and preserves template data without changing the source', async (t) => {
  const { fixtureRoot, sourceDir, contents } = await makeFixture(t)
  const before = await snapshotDirectory(sourceDir)
  const destination = await createApp({ appName: 'sample-app', sourceDir })
  assert.equal(destination, join(fixtureRoot, 'sample-app'))
  assert.deepEqual(await snapshotDirectory(sourceDir), before)

  const packageJson = JSON.parse(await readFile(join(destination, 'package.json'), 'utf8'))
  assert.equal(packageJson.name, 'sample-app')
  assert.deepEqual(packageJson.scripts, { dev: 'vite' })
  const lockJson = JSON.parse(await readFile(join(destination, 'package-lock.json'), 'utf8'))
  assert.equal(lockJson.name, 'sample-app')
  assert.equal(lockJson.packages[''].name, 'sample-app')
  assert.deepEqual(lockJson.packages['node_modules/react'], { version: '19.0.0' })

  const config = JSON.parse(await readFile(join(destination, 'src/config/app-config.json'), 'utf8'))
  assert.deepEqual(config, {
    id: 'sample-app', title: 'sample-app', description: '汎用アプリ', badge: 'Sample', footer: 'My footer', language: 'ja',
  })
  assert.equal(
    await readFile(join(destination, 'index.html'), 'utf8'),
    contents['index.html'].replace('<title>元のタイトル</title>', '<title>sample-app</title>'),
  )
  for (const path of ['README.md', '.gitignore', 'src/App.tsx', 'src/data/chart-data.json', 'public/favicon.svg', 'scripts/create-app.mjs', 'docs/template.md']) {
    assert.equal(await readFile(join(destination, path), 'utf8'), contents[path])
  }
  for (const path of ['.env', '.env.local', 'node_modules', 'dist', '.git', '.aws', 'personal-notes.txt', 'src/.env.production', 'src/node_modules', 'src/dist', 'scripts/.git']) {
    await assert.rejects(lstat(join(destination, path)), { code: 'ENOENT' })
  }
})

test('supports relative and absolute destinations without requiring optional directories', async (t) => {
  const { fixtureRoot, sourceDir } = await makeFixture(t, { withoutOptionalDirectories: true })
  const result = await createApp({ appName: 'relative-app', sourceDir, cwd: fixtureRoot, destination: 'new/apps/relative-app' })
  assert.equal(result, join(fixtureRoot, 'new/apps/relative-app'))
  for (const directory of ['public', 'scripts', 'docs']) {
    await assert.rejects(lstat(join(result, directory)), { code: 'ENOENT' })
  }
  const absolute = join(fixtureRoot, 'absolute-app')
  assert.equal(await createApp({ appName: 'absolute-app', sourceDir, destination: absolute }), absolute)
})

test('refuses an existing destination and leaves its contents unchanged', async (t) => {
  const { fixtureRoot, sourceDir } = await makeFixture(t)
  const destination = join(fixtureRoot, 'existing-app')
  await mkdir(destination)
  await writeFile(join(destination, 'important.txt'), 'Keep this content.\n', 'utf8')
  const before = await snapshotDirectory(fixtureRoot)
  await assert.rejects(createApp({ appName: 'existing-app', sourceDir, destination }), /既に存在/)
  assert.deepEqual(await snapshotDirectory(fixtureRoot), before)
})

test('refuses template, ancestor, and descendant destinations before changing files', async (t) => {
  const { fixtureRoot, sourceDir } = await makeFixture(t)
  const before = await snapshotDirectory(fixtureRoot)
  for (const destination of [sourceDir, fixtureRoot, join(sourceDir, 'generated'), join(sourceDir, 'new/deep/app')]) {
    await assert.rejects(createApp({ appName: 'unsafe-app', sourceDir, destination }), /テンプレート自身/)
  }
  assert.deepEqual(await snapshotDirectory(fixtureRoot), before)
})

test('refuses a destination whose existing parent links into the template', async (t) => {
  const { fixtureRoot, sourceDir } = await makeFixture(t)
  const link = join(fixtureRoot, 'template-link')
  try {
    await symlink(sourceDir, link, process.platform === 'win32' ? 'junction' : 'dir')
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'ENOTSUP') {
      t.skip('This environment cannot create directory links.')
      return
    }
    throw error
  }
  const before = await snapshotDirectory(fixtureRoot)
  await assert.rejects(createApp({ appName: 'unsafe-app', sourceDir, destination: join(link, 'generated') }), /テンプレート自身/)
  assert.deepEqual(await snapshotDirectory(fixtureRoot), before)
})

test('rejects invalid app names before creating a destination', async (t) => {
  const { fixtureRoot, sourceDir } = await makeFixture(t)
  const before = await snapshotDirectory(fixtureRoot)
  for (const appName of ['', 'App', '123app', '-app', 'my_app', '../app', 'app/name', 'アプリ', 'app name', undefined]) {
    assert.throws(() => validateAppName(appName), /アプリ名/)
    await assert.rejects(createApp({ appName, sourceDir, destination: join(fixtureRoot, 'rejected-app') }), /アプリ名/)
  }
  assert.deepEqual(await snapshotDirectory(fixtureRoot), before)
})

test('rejects long names and Windows reserved names before changing files', async (t) => {
  const { fixtureRoot, sourceDir } = await makeFixture(t)
  const before = await snapshotDirectory(fixtureRoot)
  const reservedNames = ['con', 'prn', 'aux', 'nul', ...Array.from({ length: 9 }, (_, index) => `com${index + 1}`), ...Array.from({ length: 9 }, (_, index) => `lpt${index + 1}`)]
  for (const appName of [...reservedNames, ...reservedNames.map((name) => name.toUpperCase()), 'a'.repeat(215)]) {
    await assert.rejects(createApp({ appName, sourceDir, destination: join(fixtureRoot, 'rejected-app') }), /アプリ名/)
  }
  for (const appName of ['a'.repeat(214), 'con-app', 'console', 'com10', 'lpt10', 'auxiliary']) {
    assert.doesNotThrow(() => validateAppName(appName))
  }
  assert.deepEqual(await snapshotDirectory(fixtureRoot), before)
})

test('keeps a partially copied destination and reports its path when copying fails', async (t) => {
  const { fixtureRoot, sourceDir } = await makeFixture(t)
  const sourceBefore = await snapshotDirectory(sourceDir)
  const destination = join(fixtureRoot, 'partial-app')
  const originalCopyFile = fs.promises.copyFile
  const copiedFiles = []
  const failure = new Error('Simulated copy I/O failure')
  const copyMock = t.mock.method(fs.promises, 'copyFile', async (source, target, flags) => {
    if (copiedFiles.length === 1) throw failure
    await originalCopyFile(source, target, flags)
    copiedFiles.push({ source, target })
  })
  syncBuiltinESMExports()
  try {
    await assert.rejects(createApp({ appName: 'partial-app', sourceDir, destination }), (error) => {
      assert.ok(error.message.includes(failure.message))
      assert.ok(error.message.includes(`作成途中のディレクトリ: ${destination}`))
      assert.equal(error.cause, failure)
      return true
    })
  } finally {
    copyMock.mock.restore()
    syncBuiltinESMExports()
  }
  assert.ok((await lstat(destination)).isDirectory())
  assert.equal(copiedFiles.length, 1)
  assert.deepEqual(await readFile(copiedFiles[0].target), await readFile(copiedFiles[0].source))
  assert.deepEqual(await snapshotDirectory(sourceDir), sourceBefore)
})

test('CLI prints npm ci guidance and does not install dependencies', async (t) => {
  const { fixtureRoot, sourceDir } = await makeFixture(t)
  const script = join(sourceDir, 'scripts/create-app.mjs')
  await writeFile(script, await readFile(new URL('./create-app.mjs', import.meta.url)))
  const sourceBefore = await snapshotDirectory(sourceDir)
  const destination = join(fixtureRoot, 'cli-app')
  const { stdout, stderr } = await execFileAsync(process.execPath, [script, 'cli-app', destination], { cwd: fixtureRoot, encoding: 'utf8' })
  assert.equal(stderr, '')
  assert.ok(stdout.includes(destination))
  assert.match(stdout, /npm ci/)
  assert.match(stdout, /npm run dev/)
  await assert.rejects(lstat(join(destination, 'node_modules')), { code: 'ENOENT' })
  assert.deepEqual(await snapshotDirectory(sourceDir), sourceBefore)
})

test('does not copy source links to local files outside the template', async (t) => {
  const { fixtureRoot, sourceDir } = await makeFixture(t)
  const privateDirectory = join(fixtureRoot, 'private-documents')
  await mkdir(privateDirectory)
  await writeFile(join(privateDirectory, 'secret.txt'), 'Private information\n', 'utf8')
  const sourceLink = join(sourceDir, 'src/local-linked-data')
  try {
    await symlink(privateDirectory, sourceLink, process.platform === 'win32' ? 'junction' : 'dir')
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'ENOTSUP') {
      t.skip('This environment cannot create directory links.')
      return
    }
    throw error
  }
  const sourceBefore = await snapshotDirectory(sourceDir)
  const privateBefore = await snapshotDirectory(privateDirectory)
  const destination = await createApp({ appName: 'safe-app', sourceDir })
  await assert.rejects(lstat(join(destination, 'src/local-linked-data')), { code: 'ENOENT' })
  assert.deepEqual(await snapshotDirectory(sourceDir), sourceBefore)
  assert.deepEqual(await snapshotDirectory(privateDirectory), privateBefore)
})

test('validates required template files before creating a destination', async (t) => {
  const { fixtureRoot, sourceDir } = await makeFixture(t)
  await writeFile(join(sourceDir, 'package-lock.json'), '{"name":"template","packages":{}}', 'utf8')
  const before = await snapshotDirectory(fixtureRoot)
  const destination = join(fixtureRoot, 'invalid-template-app')
  await assert.rejects(createApp({ appName: 'invalid-template-app', sourceDir, destination }), /ルート情報/)
  assert.deepEqual(await snapshotDirectory(fixtureRoot), before)
})
