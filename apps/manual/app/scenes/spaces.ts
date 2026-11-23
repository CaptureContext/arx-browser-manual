import { defineArxScene } from '~/utils/arxScene'
import { swipe } from './helpers'

export default defineArxScene({
  caption: 'Swipe across the sidebar from Personal to Shops and Work, and back: the sidebar changes with the space. Each demo space has its own profile, so its Favorites change too.',
  async run(context) {
    context.zoom([190, 400], 1.45)
    await context.wait(800)
    await swipe(context, 1)
    await swipe(context, 2)
    await swipe(context, 1)
    await swipe(context, 0)
  },
})
