import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { contextMenu } from './helpers'

const TAB_MENU = [
  { label: 'Copy', submenu: true }, { label: 'Peek' }, { separator: true },
  { label: 'Change Icon…' }, { label: 'Rename…' }, { label: 'Unmute Tab' }, { label: 'Volume…' }, { label: 'Picture in Picture', submenu: true }, { label: 'Unread Badges', submenu: true }, { separator: true },
  { label: 'Add a pane' }, { label: 'Duplicate Tab' }, { label: 'Add Tab to New Group' }, { label: 'Move Items…' }, { label: 'Open in New Window' }, { label: 'Move to Window', submenu: true }, { separator: true },
  { label: 'Close Swift concurrency, explained' }, { label: 'Close Other Tabs' }, { label: 'Close Tabs Below' },
]

export default defineArxScene({
  caption: 'A tab that\'s playing shows a speaker. Click it for the tab\'s volume: drag the slider down, or click the speaker there to mute. Unmute Tab in the tab\'s menu turns the sound back on.',
  setup(world) {
    openTab(world, 'talk')
  },
  async run(context) {
    const { world, wait, click, drag, rect, zoom, move } = context
    const page = world.tabs.talk!.page
    if (page.kind !== 'video') return
    await click('video:play')
    page.playing = true
    world.audio.talk = { level: 1, muted: false }
    await wait(1200)
    zoom([330, 560], 1.6)
    await click('speaker:talk')
    world.volume = 'talk'
    await wait(1300)
    const [x, y, w] = rect('volume:slider')
    await drag('volume:handle', [x + w * .3, y + 2], { hold: 250, onMove: (px) => { world.audio.talk!.level = Math.min(1, Math.max(0, (px - x) / w)) } })
    world.audio.talk.level = .3
    await wait(1200)
    await click('volume:mute')
    world.audio.talk.muted = true
    await wait(1400)
    await move([560, 700])
    world.volume = null
    await wait(600)
    zoom([330, 480], 1.4)
    await contextMenu(context, 'tab:talk', TAB_MENU, 'Unmute Tab')
    world.audio.talk.muted = false
    await wait(2000)
    zoom(null)
  },
})
