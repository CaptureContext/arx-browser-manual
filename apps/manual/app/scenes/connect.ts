import { defineArxScene } from '~/utils/arxScene'
import { hide, show, terminal } from './helpers'

export default defineArxScene({
  caption: 'Run arx setup claude in Terminal, approve Claude Code in Arx with the Work space, Read and Page content, then ask it about your tabs.',
  setup(world) {
    world.space = 2
    world.overlays.push({ kind: 'terminal', x: 330, y: 300, w: 620, h: 420, lines: ['Last login: Tue Nov 11 on ttys001'], typing: '' })
  },
  async run(context) {
    const { world, wait, click, zoom } = context
    const term = world.overlays[0]
    zoom([640, 510], 1.3)
    await wait(600)
    await terminal(context, 'arx setup claude', ['Found Arx 0.9 on this Mac.', 'Asking Arx to connect Claude Code. Approve it in Arx…'])
    zoom(null)
    const rows = [
      { label: 'Personal', detail: 'Space', check: false },
      { label: 'Work', detail: 'Space', check: false },
      { label: 'Read tabs', detail: 'Titles and addresses', toggle: true },
      { label: 'Page content', detail: 'Text of pages in the spaces above', toggle: false },
      { label: 'Interact with pages', detail: 'Click, type and scroll', toggle: false },
    ]
    const dialog = show(world, {
      kind: 'dialog', id: 'connect', width: 440, at: [420, 90],
      icon: { kind: 'brand', name: 'brand-anthropic', color: '#d97757' },
      title: 'Connect Claude Code?', subtitle: 'Choose what it can see and do',
      rows, buttons: [{ label: 'Cancel' }, { label: 'Connect', primary: true }],
    })
    await wait(1000)
    await click('row:Work')
    dialog.rows![1]!.check = true
    await wait(500)
    await click('row:Page content')
    dialog.rows![3]!.toggle = true
    await wait(700)
    await click('dialog:Connect')
    hide(world, 'connect')
    if (term?.kind === 'terminal') term.lines.push('✓ Connected to Arx: Work · Read tabs, Page content')
    zoom([640, 510], 1.3)
    await wait(900)
    await terminal(context, 'claude "what\'s open in my Work space?"', ['⏺ arx · browser_tabs (Work)', 'Work has one open tab: capturecontext · GitHub', '(github.com/capturecontext), the org\'s repositories.'], 900)
    await wait(1500)
  },
})
