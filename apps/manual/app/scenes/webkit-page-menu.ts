import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { contextMenu, hide, pick, show } from './helpers'

const MENU = [{ label: 'Back' }, { label: 'Reload' }, { separator: true }, { label: 'Save Page As…' }, { label: 'Print…' }, { label: 'Share…' }, { separator: true }, { label: 'View Page Source' }]
const FORMATS = [{ label: 'Web Archive (Safari)', checked: true }, { label: 'Web Page, HTML Only' }, { label: 'PDF' }]

export default defineArxScene({
  caption: 'netflix.com opens as a WebKit page, marked by a compass on its tab. Right-click it for the page menu, which lists only what works right now. Save Page As… saves a Web Archive, the page\'s HTML or a PDF.',
  setup(world) {
    world.tabs.stream!.webkit = true
    openTab(world, 'stream')
  },
  async run(context) {
    const { world, wait, click, move, zoom } = context
    await wait(600)
    zoom([170, 560], 1.7)
    await move('tab:stream')
    await wait(1500)
    zoom(null)
    await contextMenu(context, [860, 520], MENU, 'Save Page As…', 1900)
    show(world, {
      kind: 'dialog', id: 'save', width: 380, title: 'Save',
      fields: [{ label: 'Save As:', value: 'Netflix.webarchive' }],
      rows: [{ label: 'Where:', popup: 'Downloads' }, { label: 'Format:', popup: 'Web Archive (Safari)' }],
      buttons: [{ label: 'Cancel' }, { label: 'Save', primary: true }],
    })
    await wait(1100)
    await click('row:Format:', { offset: [110, 0] })
    await pick(context, FORMATS, 'PDF', { leftward: true })
    const dialog = world.overlays.find(item => item.kind === 'dialog')
    if (dialog?.kind === 'dialog') {
      dialog.rows![1]!.popup = 'PDF'
      dialog.fields![0]!.value = 'Netflix.pdf'
    }
    await wait(1800)
    await click('dialog:Cancel')
    hide(world, 'save')
    await wait(700)
  },
})
