import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { closeSheet, sheet } from './helpers'

const DETAIL = 'Page language: French. It\'s translated on this Mac; its text doesn\'t leave the Mac.'

export default defineArxScene({
  caption: 'On a page in another language, the address bar\'s second line says Translation Available. Click it and choose Translate: the page turns English in place, links included. Click the line again for Show Original.',
  setup(world) {
    const page = world.tabs.news!.page
    if (page.kind === 'news') page.french = true
    openTab(world, 'news')
    world.addressNote = 'Translation Available'
  },
  async run(context) {
    const { world, wait, click, move, zoom } = context
    const page = world.tabs.news!.page
    if (page.kind !== 'news') return
    await wait(900)
    zoom([330, 200], 1.5)
    await click('address-note')
    sheet(world, {
      id: 'translate', chrome: 'popover', title: 'Translate this page to: English?', lead: DETAIL, sections: [],
      buttons: [{ label: 'Options', left: true }, { label: 'Translate', primary: true }],
    }, { width: 300, at: [14, 84] })
    await wait(1900)
    await click('form:Translate')
    closeSheet(world, 'translate')
    world.addressNote = 'Translating…'
    zoom(null)
    await move([780, 430])
    await wait(900)
    page.french = false
    world.addressNote = 'Translated from: French'
    await wait(2600)
    zoom([330, 200], 1.5)
    await click('address-note')
    sheet(world, {
      id: 'translate', chrome: 'popover', title: 'Translated: French → English', lead: DETAIL, sections: [],
      buttons: [{ label: 'Options', left: true }, { label: 'Show Original', primary: true }],
    }, { width: 300, at: [14, 84] })
    await wait(1500)
    await click('form:Show Original')
    closeSheet(world, 'translate')
    page.french = true
    world.addressNote = 'Translation Available'
    zoom(null)
    await move([780, 430])
    await wait(2000)
  },
})
