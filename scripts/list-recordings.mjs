// Lists every ::recording in the manual: planned shots and recorded clips.
//   pnpm recordings
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const contentDir = new URL('../apps/manual/content/', import.meta.url).pathname
const files = readdirSync(contentDir, { recursive: true, encoding: 'utf8' }).filter(file => file.endsWith('.md')).sort()

let planned = 0
let recorded = 0
for (const file of files) {
  for (const match of readFileSync(join(contentDir, file), 'utf8').matchAll(/::recording\{([^}]*)\}/g)) {
    const attrs = Object.fromEntries([...match[1].matchAll(/(\w+)="([^"]*)"/g)].map(([, key, value]) => [key, value]))
    if (attrs.src) recorded++
    else planned++
    console.log(`${attrs.src ? '✓' : '○'} ${file}${attrs.src ? `  →  ${attrs.src}` : ''}\n    ${attrs.shot ?? '(no shot description)'}`)
  }
}
console.log(`\n${recorded} recorded, ${planned} planned. The home page clip is in apps/manual/app/pages/index.vue.`)
