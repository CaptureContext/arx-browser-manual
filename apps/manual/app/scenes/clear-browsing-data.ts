import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { pick } from './helpers'

const allTime = ['Pages: 128', 'Downloads: 6', 'Sites: 42', '310 MB', 'Entries: 12', 'Sites: 2']

export default defineArxScene({
  caption: 'Clear browsing data for a profile: switch the range to All time and the counts update, check Download history, uncheck Cached images and files, then Clear Data.',
  setup(world) {
    world.settings = demoSettings()
  },
  async run(context) {
    const { world, click, wait, zoom, move } = context
    const settings = world.settings!
    zoom([640, 400], 1.15)
    await wait(600)
    await click('settings:clear')
    settings.sheet = 'clear'
    await wait(1100)
    await click('range')
    await pick(context, ['Last hour', 'Last 24 hours', 'Last 7 days', 'Last 4 weeks', 'All time'].map(label => ({ label, checked: label === 'Last hour' })), 'All time')
    settings.range = 'All time'
    settings.rows.forEach((row, index) => { row.count = allTime[index]! })
    await wait(1400)
    await click('clear:Download history')
    settings.rows[1]!.checked = true
    await wait(600)
    await click('clear:Cached images and files')
    settings.rows[3]!.checked = false
    await wait(800)
    await click('clear-data')
    settings.sheet = null
    await move([900, 600])
    await wait(1800)
  },
})
