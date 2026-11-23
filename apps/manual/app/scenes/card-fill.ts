import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show, touchID } from './helpers'

export default defineArxScene({
  caption: 'Click the card number field of a checkout form and pick the saved card. After Touch ID, Arx fills the number, the name and the expiry; the security code is yours to type.',
  setup(world) {
    world.space = 1
    openTab(world, 'checkout')
  },
  async run(context) {
    const { world, wait, click, move, rect, zoom } = context
    const page = world.tabs.checkout!.page
    if (page.kind !== 'checkout') return
    zoom([640, 330], 1.3)
    await click('card:number')
    page.focused = 'number'
    await wait(350)
    const [x, y, w, h] = rect('card:number')
    const list = show(world, { kind: 'autofill', x, y: y + h + 4, w, icon: 'credit-card', rows: [{ title: 'Visa ••••1111' }], manage: 'Manage payment methods…', selected: null })
    await wait(900)
    await move('autofill:0')
    list.selected = 0
    await wait(500)
    await click('autofill:0', { stay: true })
    hide(world, 'autofill')
    await touchID(context, 'Arx is trying to fill a payment card.')
    page.focused = undefined
    // Masked on purpose: a preview never shows a whole card number.
    page.number = '•••• •••• •••• 1111'
    await wait(200)
    page.name = 'Max Krouk'
    await wait(200)
    page.expiry = '08 / 29'
    await move('card:code')
    await wait(2000)
    zoom(null)
  },
})
