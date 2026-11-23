import { defineArxScene } from '~/utils/arxScene'
import { endPreview, preview } from './helpers'

export default defineArxScene({
  caption: 'Rest on a tab for its card, glide to the next, then search a closed folder from its card.',
  setup(world) {
    const watch = world.spaces[0]!.pinned.find(item => item.type === 'folder' && item.id === 'watch')
    if (watch?.type === 'folder') watch.open = false
  },
  async run(context) {
    const { world, move, wait, click, type, zoom } = context
    zoom([330, 450], 1.55)
    await wait(700)
    await preview(context, 'tab', 'browser', 1700)
    // The next card opens straight away while gliding along the sidebar.
    await move('tab:repos')
    world.hovered = 'tab:repos'
    world.card = { kind: 'tab', id: 'repos' }
    await wait(1500)
    world.card = null
    world.hovered = null
    await move([700, 430])
    await wait(400)
    await preview(context, 'folder', 'watch', 1000)
    await click('card-search')
    await type('trai', (value) => { if (world.card) world.card.query = value })
    await wait(2200)
    endPreview(context)
  },
})
