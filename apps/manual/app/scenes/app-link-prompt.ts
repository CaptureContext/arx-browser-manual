import { defineArxScene } from '~/utils/arxScene'
import { dismiss, show } from './helpers'

export default defineArxScene({
  caption: 'Connecting Linear from Claude\'s Work window: sign in in Little Arx in Work, and when Linear hands the link back, Arx asks on that window. Send to Claude Work runs your script, and the Work window gets the link.',
  setup(world) {
    world.windowHidden = true
    world.tabs.chooser!.page = { kind: 'chooser', site: 'Claude', account: 'max@capturecontext.dev' }
    world.tabs.chooser!.url = 'linear.app/oauth/authorize'
    world.tabs.chooser!.title = 'Authorize Claude – Linear'
    world.overlays.push({
      kind: 'app', id: 'claude', x: 120, y: 110, w: 460, h: 330, title: 'Claude — Work', heading: 'Connectors',
      lines: [
        { text: 'Linear', detail: 'Issues and projects', icon: 'check-list', button: 'Connect' },
        { text: 'Figma', detail: 'Design files', icon: 'brush', value: 'Connected', tone: 'green' },
      ],
    })
  },
  async run(context) {
    const { world, wait, click, move } = context
    const claude = world.overlays[0]
    if (claude?.kind !== 'app') return
    await wait(900)
    await click('line-button:Linear')
    await wait(400)
    show(world, { kind: 'little', x: 560, y: 60, w: 620, h: 600, tab: 'chooser', space: 'Work', profile: 'Work' })
    await wait(1400)
    await click('chooser:account')
    await wait(600)
    const prompt = show(world, {
      kind: 'prompt', id: 'send', at: [870, 380],
      icon: { kind: 'letter', letter: 'C', bg: '#d97757', fg: '#fff' },
      title: 'Send This Link to Claude Work?',
      body: 'https://linear.app wants to open this link.',
      link: 'claude://…',
      note: 'Arx runs your script from Air Traffic Control with this link.',
      check: { label: 'Always allow https://linear.app to open this', on: false },
      buttons: [{ label: 'Show Script' }, { label: 'Cancel', hint: 'esc' }, { label: 'Send to Claude Work', primary: true }],
    })
    await move([1010, 300])
    await wait(2400)
    await click('prompt:Send to Claude Work')
    prompt.busy = 'Sending…'
    await wait(1100)
    dismiss(world, 'send')
    world.overlays.push(world.overlays.shift()!)
    claude.lines[0]!.button = undefined
    Object.assign(claude.lines[0]!, { value: 'Connected', tone: 'green' })
    await move('line:Linear')
    await wait(2400)
  },
})
