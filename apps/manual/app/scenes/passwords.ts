import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, pick, show } from './helpers'

const MORE = [{ label: 'Copy Username' }, { label: 'Copy Password' }, { label: 'Show Password' }, { label: 'Edit…' }, { separator: true }, { label: 'Delete…', danger: true }]

export default defineArxScene({
  caption: 'A profile\'s Passwords: filter them, show one after Touch ID, copy another, add one by hand, and import more from a CSV file.',
  setup(world) {
    world.settings = demoSettings()
    world.settings.pane = 'passwords'
  },
  async run(context) {
    const { world, wait, click, type, zoom } = context
    const settings = world.settings!
    zoom([640, 300], 1.15)
    await wait(600)
    await click('passwords:search')
    await type('git', (value) => { settings.passwordQuery = value })
    await wait(1100)
    settings.passwordQuery = ''
    await wait(500)
    await click('password-more:github.com')
    await pick(context, MORE, 'Show Password', { leftward: true })
    show(world, { kind: 'touchid', reason: 'Arx is trying to show the password for github.com.' })
    context.label('Touch ID')
    await wait(1500)
    hide(world, 'touchid')
    settings.passwords[0]!.shown = true
    await wait(1200)
    await click('password-more:linear.app')
    await pick(context, MORE, 'Copy Password', { leftward: true })
    world.toast = { text: 'Copied Password' }
    await wait(1100)
    world.toast = null
    await click('passwords:add')
    const add = show(world, {
      kind: 'dialog', id: 'add', dim: true, width: 400, title: 'Add Password',
      fields: [{ label: 'Website', value: '', focused: true }, { label: 'Username', value: '' }, { label: 'Password', value: '', secure: true }],
      buttons: [{ label: 'Cancel' }, { label: 'Save', primary: true }],
    })
    const fields = add.fields!
    await type('vercel.com', (value) => { fields[0]!.value = value }, { cps: 22 })
    fields[0]!.focused = false
    fields[1]!.focused = true
    await type('max@capturecontext.dev', (value) => { fields[1]!.value = value }, { cps: 28 })
    fields[1]!.focused = false
    fields[2]!.focused = true
    await type('copper-lake-7', (value) => { fields[2]!.value = value }, { cps: 24 })
    await click('dialog:Save')
    hide(world, 'add')
    settings.passwords.push({ site: 'vercel.com', user: 'max@capturecontext.dev', shown: false })
    await wait(900)
    await click('passwords:import')
    const panel = show(world, { kind: 'panel', title: 'Import passwords from a CSV file', items: ['Desktop', 'Documents', 'Passwords.csv'], selected: 0, action: 'Import' })
    await wait(600)
    await click('panel:Passwords.csv')
    panel.selected = 2
    await wait(400)
    await click('panel:Import')
    hide(world, 'panel')
    settings.passwords.push({ site: 'notion.so', user: 'max@capturecontext.dev', shown: false }, { site: 'slack.com', user: 'max@capturecontext.dev', shown: false })
    await wait(1800)
  },
})
