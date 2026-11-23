import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { pick, show } from './helpers'

export default defineArxScene({
  caption: 'Open a client\'s grant, add the Work space, turn on Page content and Interact with pages, and ask only before closing or removing.',
  setup(world) {
    world.settings = demoSettings()
    world.settings.pane = 'agents'
  },
  async run(context) {
    const { world, wait, click, zoom } = context
    zoom([640, 400], 1.15)
    await wait(700)
    await click('agent:Claude Code')
    const rows = [
      { label: 'Personal', detail: 'Profile', check: true },
      { label: 'Work', detail: 'Space', check: false },
      { label: 'Read tabs', detail: 'What it can see', toggle: true },
      { label: 'Page content', detail: 'What it can see', toggle: false },
      { label: 'Interact with pages', detail: 'What it can do', toggle: false },
      { label: 'Ask before changes', popup: 'Every time' },
    ]
    const dialog = show(world, { kind: 'dialog', id: 'grant', width: 440, dim: true, title: 'Claude Code', subtitle: 'Local assistant · Grant', rows, buttons: [{ label: 'Done', primary: true }] })
    await wait(1000)
    await click('row:Work')
    dialog.rows![1]!.check = true
    await wait(500)
    await click('row:Page content')
    dialog.rows![3]!.toggle = true
    await wait(500)
    await click('row:Interact with pages')
    dialog.rows![4]!.toggle = true
    await wait(700)
    await click('row:Ask before changes')
    await pick(context, [{ label: 'Every time', checked: true }, { label: 'Only for closing or removing' }, { label: 'Never' }], 'Only for closing or removing')
    dialog.rows![5]!.popup = 'Only for closing or removing'
    await wait(1300)
    await click('dialog:Done')
    world.overlays = []
    world.settings!.agents[0]!.detail = 'Personal, Work · Read tabs, Page content, Interact'
    await wait(1500)
  },
})
