import { defineArxScene } from '~/utils/arxScene'
import { removeTab } from '~/utils/arxModel'

export default defineArxScene({
  caption: 'Closed tabs wait in the Tab Archive: search for one and restore it.',
  async run({ world, move, click, wait, type, zoom }) {
    const space = world.spaces[0]!
    zoom([300, 520], 1.35)
    await move('tab:repos')
    world.hovered = 'tab:repos'
    await wait(700)
    await click('close:repos')
    world.hovered = null
    removeTab(space, 'repos')
    await wait(900)
    zoom(null)
    await click('library')
    world.library = {
      section: null,
      query: '',
      restoring: null,
      archive: [
        { id: 'repos', when: 'Just now' },
        { id: 'hiking', when: '2 hours ago' },
        { id: 'chromium', when: '3 hours ago' },
        { id: 'app-software', when: 'Yesterday' },
      ],
    }
    await wait(800)
    zoom([260, 330], 1.5)
    await click('library:archive')
    world.library.section = 'archive'
    await wait(900)
    await click('library:search')
    await type('capture', (value) => { world.library!.query = value })
    await wait(700)
    await move('archived:repos')
    world.hovered = 'archived:repos'
    await wait(700)
    await click('restore:repos')
    world.library.restoring = 'repos'
    await wait(400)
    world.library.archive = world.library.archive.filter(item => item.id !== 'repos')
    world.hovered = null
    space.open.push('repos')
    await wait(900)
    zoom(null)
    await click('library:exit')
    world.library = null
    world.selected = 'repos'
    await move([780, 430])
    await wait(1800)
  },
})
