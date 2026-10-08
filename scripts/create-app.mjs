import { constants } from 'node:fs'
import { copyFile, lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const templateDirectory = resolve(fileURLToPath(new URL('../', import.meta.url)))
const templateEntries = [
  'src',
  'public',
  'scripts',
  'docs',
  'package.json',
  'package-lock.json',
  'index.html',
  'README.md',
  '.gitignore',
  'components.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'eslint.config.js',
]
const excludedNames = new Set(['node_modules', 'dist', '.git', '.agents', '.codex', '.aws'])

export function validateAppName(appName) {
  if (typeof appName !== 'string' || !/^[a-z][a-z0-9-]*$/.test(appName)) {
    throw new Error('アプリ名は英小文字で始まる英小文字・数字・ハイフンで指定してください。')
  }
  if (appName.length > 214) {
    throw new Error('アプリ名は214文字以内で指定してください。')
  }
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(appName)) {
    throw new Error('アプリ名にWindowsの予約名は使用できません。')
  }
}

async function findEntry(path) {
  try {
    return await lstat(path)
  } catch (error) {
    if (error.code === 'ENOENT') return undefined
    throw error
  }
}

// Existing parent links must also be resolved before checking destination safety.
async function resolvePhysicalPath(path) {
  const missing = []
  let current = resolve(path)

  while (!(await findEntry(current))) {
    missing.unshift(basename(current))
    const parent = dirname(current)
    if (parent === current) throw new Error('コピー先の親ディレクトリを確認できません。')
    current = parent
  }

  return resolve(await realpath(current), ...missing)
}

function containsPath(parent, child) {
  const path = relative(parent, child)
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
}

function shouldExclude(name) {
  const normalized = name.toLowerCase()
  return excludedNames.has(normalized) || normalized === '.env' || normalized.startsWith('.env.')
}

async function collectTemplate(sourceDir) {
  const directories = []
  const files = []

  async function visit(relativePath) {
    if (shouldExclude(basename(relativePath))) return
    const sourcePath = join(sourceDir, relativePath)
    const entry = await findEntry(sourcePath)
    // Links can point outside the template or expose local files; copy regular files only.
    if (!entry || entry.isSymbolicLink()) return
    if (entry.isDirectory()) {
      directories.push(relativePath)
      for (const child of await readdir(sourcePath)) await visit(join(relativePath, child))
    } else if (entry.isFile()) {
      files.push({ relativePath, sourcePath })
    }
  }

  for (const entry of templateEntries) await visit(entry)
  return { directories, files }
}

async function prepareNames(sourceDir, files, appName) {
  const filePaths = new Set(files.map(({ relativePath }) => relativePath))
  const configPath = join('src', 'config', 'app-config.json')
  const required = ['package.json', 'package-lock.json', 'index.html', configPath]
  for (const path of required) {
    if (!filePaths.has(path)) throw new Error(`テンプレートに必要なファイルがありません: ${path}`)
  }

  const [packageText, lockText, htmlText, configText] = await Promise.all(
    required.map((path) => readFile(join(sourceDir, path), 'utf8')),
  )
  const packageJson = JSON.parse(packageText)
  const lockJson = JSON.parse(lockText)
  const configJson = JSON.parse(configText)
  if (!lockJson.packages?.['']) throw new Error('package-lock.json のルート情報がありません。')
  if (!/<title\b[^>]*>[\s\S]*?<\/title\s*>/i.test(htmlText)) {
    throw new Error('index.html に title がありません。')
  }
  packageJson.name = appName
  lockJson.name = appName
  lockJson.packages[''].name = appName
  configJson.id = appName
  configJson.title = appName

  return new Map([
    ['package.json', `${JSON.stringify(packageJson, null, 2)}\n`],
    ['package-lock.json', `${JSON.stringify(lockJson, null, 2)}\n`],
    [configPath, `${JSON.stringify(configJson, null, 2)}\n`],
    ['index.html', htmlText.replace(/<title\b[^>]*>[\s\S]*?<\/title\s*>/i, () => `<title>${appName}</title>`)],
  ])
}

export async function createApp({ appName, destination, sourceDir = templateDirectory, cwd = process.cwd() }) {
  validateAppName(appName)
  const sourcePath = await realpath(resolve(sourceDir))
  if (!(await lstat(sourcePath)).isDirectory()) throw new Error('テンプレートはディレクトリで指定してください。')

  const requestedDestination = destination === undefined
    ? join(dirname(sourcePath), appName)
    : resolve(cwd, destination)
  const destinationPath = await resolvePhysicalPath(requestedDestination)
  if (containsPath(sourcePath, destinationPath) || containsPath(destinationPath, sourcePath)) {
    throw new Error('コピー先にはテンプレート自身・その親・内部のディレクトリを指定できません。')
  }
  if (await findEntry(requestedDestination)) throw new Error('コピー先は既に存在します。別のパスを指定してください。')

  const { directories, files } = await collectTemplate(sourcePath)
  const renamedFiles = await prepareNames(sourcePath, files, appName)

  await mkdir(dirname(destinationPath), { recursive: true })
  // A non-recursive mkdir reserves a new destination and refuses an existing one.
  await mkdir(destinationPath)
  try {
    for (const directory of directories) await mkdir(join(destinationPath, directory))
    for (const { relativePath, sourcePath: fileSource } of files) {
      const target = join(destinationPath, relativePath)
      if (renamedFiles.has(relativePath)) {
        await writeFile(target, renamedFiles.get(relativePath), { encoding: 'utf8', flag: 'wx' })
      } else {
        await copyFile(fileSource, target, constants.COPYFILE_EXCL)
      }
    }
  } catch (error) {
    throw new Error(`${error.message}\n作成途中のディレクトリ: ${destinationPath}`, { cause: error })
  }

  return destinationPath
}

async function runCli(args) {
  const usage = '使い方: node scripts/create-app.mjs <app-name> [destination]'
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    console.log(usage)
    return
  }
  if (args.length < 1 || args.length > 2) throw new Error(usage)
  const destination = await createApp({ appName: args[0], destination: args[1] })
  console.log(`作成しました: ${destination}`)
  console.log('作成先で npm ci を実行し、npm run dev で起動してください。')
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  runCli(process.argv.slice(2)).catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
