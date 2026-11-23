import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { pick } from './helpers'

const HANDLING = [{ label: 'Open with System Default' }, { label: 'Open in Claude', checked: true }, { label: 'Other App…' }, { label: 'Run script' }]

export default defineArxScene({
  caption: 'The plus in Settings → Links makes a new handler. Click its app button, type "cla" and press Return: Name and Scheme fill in, and the card catches claude:// links. Add a route for the Work profile, choose Run script, and press Tab to use the example.',
  setup(world) {
    world.settings = demoSettings()
    world.settings.pane = 'applinks'
    world.settings.appLinks = { card: false, name: '', scheme: '', saved: false, picker: null, routes: [] }
  },
  async run(context) {
    const { world, wait, click, type, key, move, zoom } = context
    const links = world.settings!.appLinks!
    zoom([700, 300], 1.2)
    await wait(600)
    await click('applinks:new')
    context.label('New Handler')
    links.card = true
    await wait(900)
    await click('applinks:app')
    links.picker = {
      query: '', highlighted: 0,
      apps: [
        { name: 'Claude', scheme: 'claude', color: '#d97757' },
        { name: 'Figma', scheme: 'figma', color: '#a259ff' },
        { name: 'Linear', scheme: 'linear', color: '#5e6ad2' },
        { name: 'Slack', scheme: 'slack', color: '#e01e5a' },
        { name: 'Zoom', scheme: 'zoommtg', color: '#2d8cff' },
      ],
    }
    await wait(900)
    await type('cla', (value) => { links.picker!.query = value })
    await wait(600)
    await key('↩ Return')
    links.picker = null
    Object.assign(links, { name: 'Claude', scheme: 'claude', saved: true, routes: [{ title: 'Otherwise', handling: 'Open in Claude' }] })
    await wait(1500)
    await click('applinks:add-profile')
    await pick(context, [{ label: 'Personal' }, { label: 'Shops' }, { label: 'Work' }], 'Work')
    links.routes.unshift({ title: 'In Work', handling: 'Open in Claude' })
    await wait(1200)
    await click('route:In Work')
    await pick(context, HANDLING, 'Run script', { leftward: true })
    const route = links.routes[0]!
    route.handling = 'Run script'
    route.script = { text: '', focused: true }
    await move('applinks:script')
    await wait(1400)
    await key('⇥ Tab')
    route.script.text = 'fxclaude open-url work "$1"'
    await wait(2400)
    zoom(null)
  },
})
