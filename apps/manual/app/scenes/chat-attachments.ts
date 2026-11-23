import { defineArxScene } from '~/utils/arxScene'
import { hide, pick } from './helpers'

const pad = ([x, y, w, h]: [number, number, number, number]): [number, number, number, number] => [x - 6, y - 6, w + 12, h + 12]

export default defineArxScene({
  caption: 'Drag an image from Finder onto the chat, paste a screenshot with ⌘V, and add a capture of part of the page with +. Remove one with its ×, then send them with your question.',
  setup(world) {
    world.selected = 'browser'
    world.chat = { width: 360, title: 'New Chat', model: 'Claude Opus', messages: [], suggestions: [], thinking: false, attachments: [] }
    world.overlays.push({ kind: 'finder', x: 330, y: 470, w: 420, h: 250, files: [{ name: 'mockup.png', kind: 'image' }, { name: 'notes.pdf', kind: 'pdf' }] })
  },
  async run(context) {
    const { world, wait, drag, key, click, move, type, rect } = context
    const chat = world.chat!
    await wait(800)
    const finder = world.overlays[0]
    await drag('file:mockup.png', 'chat:composer', {
      hold: 600,
      onMove: (x) => {
        if (finder?.kind === 'finder') finder.lifted = 'mockup.png'
        chat.dropping = x > 900
      },
    })
    chat.dropping = false
    chat.attachments!.push({ id: 'mockup', name: 'mockup.png', kind: 'image' })
    hide(world, 'finder')
    await wait(900)
    await key('⌘ V')
    chat.attachments!.push({ id: 'shot', name: 'Screenshot', kind: 'screenshot' })
    await wait(900)
    await click('chat:plus')
    await pick(context, [{ label: 'Attach Files…' }, { label: 'Attach Tabs…' }, { label: 'Capture Area…' }], 'Capture Area…', { leftward: true })
    world.capture = { rect: pad(rect('figure')), picking: true, menu: false }
    await move('paragraph:lead')
    world.capture.rect = pad(rect('paragraph:lead'))
    await wait(700)
    await click('paragraph:lead', { stay: true })
    world.capture = null
    chat.attachments!.push({ id: 'capture', name: 'Capture', kind: 'capture' })
    await wait(900)
    await click('attachment-remove:shot')
    chat.attachments = chat.attachments!.filter(item => item.id !== 'shot')
    await wait(700)
    await type('What do these have in common?', (value) => { chat.draft = value })
    await click('chat:send')
    chat.messages.push({ role: 'user', text: chat.draft!, attachments: chat.attachments })
    chat.title = 'What do these have in common?'
    chat.draft = ''
    chat.attachments = []
    chat.thinking = true
    await wait(1000)
    chat.thinking = false
    chat.messages.push({ role: 'assistant', text: '' })
    const reply = chat.messages[chat.messages.length - 1]!
    for (const word of 'Both show a browser window: the mockup sketches a sidebar of tabs, and the paragraph defines what a web browser does.'.split(/(?<= )/)) {
      reply.text += word
      await wait(34)
    }
    await wait(1600)
  },
})
