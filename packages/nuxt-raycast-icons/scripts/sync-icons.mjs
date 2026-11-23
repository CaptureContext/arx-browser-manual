import {
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile
} from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceFile = process.argv[2]

if (!sourceFile) {
  throw new Error('Pass the extracted Raycast icon JSON file: pnpm sync:icons <file>')
}

const packageDirectory = fileURLToPath(new URL('..', import.meta.url))
const iconsDirectory = join(packageDirectory, 'icons')
const manifestFile = join(packageDirectory, 'icon-names.json')
const payload = JSON.parse(await readFile(resolve(sourceFile), 'utf8'))

if (!Array.isArray(payload.icons) || payload.icons.length === 0) {
  throw new Error('The extraction must contain a non-empty icons array')
}

const icons = payload.icons
  .map(({ name, svg }) => ({ name: String(name), svg: String(svg) }))
  .sort((left, right) => left.name.localeCompare(right.name))
const iconNames = new Set()

for (const icon of icons) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(icon.name)) {
    throw new Error(`Invalid icon name: ${icon.name}`)
  }

  if (iconNames.has(icon.name)) {
    throw new Error(`Duplicate icon name: ${icon.name}`)
  }

  if (!/^<svg(?:\s|>)/.test(icon.svg) || !icon.svg.endsWith('</svg>')) {
    throw new Error(`Invalid SVG for icon: ${icon.name}`)
  }

  iconNames.add(icon.name)
}

await mkdir(iconsDirectory, { recursive: true })

const expectedFiles = new Set(icons.map(icon => `${icon.name}.svg`))
const existingFiles = (await readdir(iconsDirectory)).filter(file => file.endsWith('.svg'))

await Promise.all(existingFiles
  .filter(file => !expectedFiles.has(file))
  .map(file => unlink(join(iconsDirectory, file))))

await Promise.all(icons.map(icon => (
  writeFile(join(iconsDirectory, `${icon.name}.svg`), `${icon.svg}\n`)
)))

await writeFile(manifestFile, `${JSON.stringify({
  source: payload.source ?? 'https://ray.so/icon',
  extractedAt: payload.extractedAt ?? null,
  count: icons.length,
  icons: icons.map(icon => icon.name)
}, null, 2)}\n`)

console.log(`Saved ${icons.length} Raycast icons to ${iconsDirectory}`)
