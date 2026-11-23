import type { ArxWorld } from '~/utils/arxModel'
import { openTab, removeTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { pick, SUMMARY } from './helpers'

const CHAT_MENU = [
  { label: 'Copy Answer' },
  { label: 'Pin Chat' },
  { label: 'Rename Chat…' },
  { label: 'Delete Chat…', danger: true },
  { separator: true },
  { label: 'New Chat' },
  { label: 'Your Chats' },
  { label: 'Pin to This Tab' },
  { label: 'Open in Tab' },
  { label: 'Hide Chat' },
]

const summary = (): NonNullable<ArxWorld['chat']> => ({
  width: 360,
  title: 'Summarize this page',
  model: 'Claude Opus',
  thinking: false,
  suggestions: [],
  messages: [{ role: 'user', text: 'Summarize this page' }, { role: 'assistant', text: SUMMARY }],
})

export default defineArxScene({
  caption: 'Widen the chat panel, pin the chat to this tab (another tab gets a new chat, and the pinned one comes back), open it in a tab, split it with the page, then move it back to the side.',
  setup(world) {
    world.chat = summary()
    const page = world.tabs['chat-tab']!.page
    if (page.kind === 'chat') page.answer = SUMMARY
  },
  async run(context) {
    const { world, move, click, wait, drag } = context
    const space = world.spaces[0]!
    await wait(500)
    await drag('chat-edge', [790, 420], { hold: 200, onMove: (x) => { if (world.chat) world.chat.width = Math.min(480, Math.max(360, 1272 - x)) } })
    await wait(900)

    await click('chat:more')
    await pick(context, CHAT_MENU, 'Pin to This Tab', { leftward: true })
    world.chat!.pinned = true
    const pinned = world.chat!
    await wait(1100)
    await click('tab:apple-dev')
    world.selected = 'apple-dev'
    world.chat = {
      width: pinned.width, title: 'New Chat', model: 'Claude Opus', thinking: false, messages: [],
      suggestions: ['Summarize “Apple Developer” in a few points', 'What are the key takeaways from developer.apple.com?', 'Explain “Apple Developer” in simple terms'],
    }
    await wait(1600)
    await click('tab:arx')
    world.selected = 'arx'
    world.chat = pinned
    await wait(1400)

    await click('chat:more')
    await pick(context, CHAT_MENU, 'Open in Tab', { leftward: true })
    world.chat = null
    openTab(world, 'chat-tab')
    await wait(1400)
    await click('tab:arx')
    world.selected = 'arx'
    await wait(500)
    await drag('tab:chat-tab', [1200, 420], {
      hold: 700,
      onMove: (x, y) => {
        world.drag = { id: 'chat-tab', x, y }
        world.dropZone = x > 900 ? 'right' : null
      },
    })
    world.drag = null
    world.dropZone = null
    world.split = { panes: ['arx', 'chat-tab'], focused: 1, ratio: .58, vertical: false }
    await wait(1500)

    await click('chat-page:more')
    await pick(context, [...CHAT_MENU.slice(0, 7), { label: 'Move to Sidebar' }, { label: 'Close Chat' }], 'Move to Sidebar', { leftward: true })
    world.split = null
    removeTab(space, 'chat-tab')
    world.selected = 'arx'
    world.chat = pinned
    await move([600, 430])
    await wait(1800)
  },
})
