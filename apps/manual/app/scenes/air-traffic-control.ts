import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show } from './helpers'

export default defineArxScene({
  caption: 'Add a route so meet.google.com opens in Little Arx in the most recent space, check it with the tester, then click a Meet link in Calendar.',
  setup(world) {
    world.settings = demoSettings()
    world.settings.pane = 'links'
  },
  async run(context) {
    const { world, wait, click, type, move, zoom } = context
    const settings = world.settings!
    zoom([640, 300], 1.2)
    await wait(700)
    await click('setting:new-route')
    const dialog = show(world, {
      kind: 'dialog', id: 'route', dim: true, width: 420, title: 'New Route',
      fields: [{ label: 'When a link goes to', value: '', focused: true }],
      rows: [{ label: 'Open it in', popup: 'Most Recent Space' }, { label: 'Using', popup: 'Little Arx' }],
      buttons: [{ label: 'Cancel' }, { label: 'Add Route', primary: true }],
    })
    await wait(500)
    await type('meet.google.com', (value) => { dialog.fields![0]!.value = value })
    await wait(800)
    await click('dialog:Add Route')
    hide(world, 'route')
    settings.routes.push({ host: 'meet.google.com', space: 'the most recent space', open: 'Little Arx' })
    await wait(800)
    await click('setting:tester')
    await type('https://meet.google.com/abc-defg-hij', (value) => { settings.tester.text = value }, { cps: 28 })
    await wait(400)
    settings.tester.result = 'Little Arx, in the most recent space (meet.google.com)'
    await wait(1800)
    zoom(null)
    world.settings = null
    world.windowHidden = true
    const calendar = show(world, { kind: 'calendar', x: 300, y: 110, w: 640, h: 420, popover: false })
    await wait(900)
    await click('calendar-event')
    calendar.popover = true
    await wait(900)
    await click('meet-link')
    hide(world, 'calendar')
    show(world, { kind: 'little', x: 380, y: 90, w: 600, h: 520, tab: 'meet' })
    await move([700, 650])
    await wait(2200)
  },
})
