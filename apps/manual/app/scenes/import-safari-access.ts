import { defineArxScene } from '~/utils/arxScene'
import { dismiss, show } from './helpers'
import { welcome, WINDOW } from './import-parts'

const ACCESS = [
  { label: 'Arx doesn\'t have Full Disk Access yet.', icon: 'lock', detail: 'macOS keeps Safari\'s bookmarks, tabs and history in a protected folder, so Arx needs Full Disk Access to read them. Arx reads them only when you import, and changes nothing there.' },
  { label: '', button: 'Open System Settings' },
]
const STEPS = 'In System Settings, turn on Arx under Privacy & Security › Full Disk Access, then come back to Arx. If macOS asks to quit and reopen Arx, do that and import again.'

export default defineArxScene({
  caption: 'Pick Safari in the welcome window: Arx says it needs Full Disk Access. Open System Settings, turn on Arx, and come back: Arx checks again by itself and lists what Safari has.',
  setup(world) {
    world.overlays.push({ kind: 'form', form: welcome('Arc', [
      { label: '14 favorites', icon: 'star', toggle: true },
      { label: '48 bookmarks and pinned tabs (folders: 9)', icon: 'pin', toggle: true },
      { label: '23 open tabs', icon: 'app-window-list', toggle: true },
    ]), ...WINDOW })
  },
  async run(context) {
    const { world, wait, click, move } = context
    const overlay = world.overlays[0]
    if (overlay?.kind !== 'form') return
    const form = overlay.form
    await wait(900)
    await click('tile:Safari')
    Object.assign(form, welcome('Safari', ACCESS, false), { note: STEPS })
    await wait(2600)
    await click('act:Open System Settings')
    const settings = show(world, {
      kind: 'app', id: 'system', x: 330, y: 150, w: 620, h: 400, title: 'System Settings', heading: 'Full Disk Access',
      lines: [
        { text: 'Allow the applications below to access data like Mail, Messages, Safari, Home, Time Machine backups, and certain administrative settings for all users on this Mac.' },
        { text: 'Arx', icon: 'globe-01', toggle: false },
        { text: 'Terminal', icon: 'terminal', toggle: true },
      ],
    })
    await wait(1300)
    await click('line-toggle:Arx')
    settings.lines[1]!.toggle = true
    await wait(1200)
    context.label('Back to Arx')
    dismiss(world, 'system')
    form.sections = [{ rows: [{ label: 'Reading Safari…', spinner: true }] }]
    form.note = undefined
    await move([640, 470])
    await wait(1300)
    Object.assign(form, welcome('Safari', [
      { label: '9 favorites', icon: 'star', toggle: true },
      { label: '112 bookmarks and pinned tabs (folders: 14)', icon: 'pin', toggle: true },
      { label: '6 open tabs', icon: 'app-window-list', toggle: true },
      { label: '4,210 history entries', icon: 'clock', toggle: true },
      { label: 'Keep its spaces', icon: 'app-window-grid-2x2', detail: 'Each of its spaces comes in as a space of its own.', toggle: true },
      { label: 'Passwords and sign-ins', icon: 'key', detail: 'macOS asks first.', button: 'Set Up…' },
    ]))
    await wait(3000)
  },
})
