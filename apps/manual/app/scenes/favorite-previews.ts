import { withPreviews } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { endPreview } from './helpers'

export default defineArxScene({
  caption: 'Rest on a Gmail Favorite for its unread mail, with senders and times, then on Linear for its recent issues and projects.',
  setup(world) {
    world.space = 2
    world.selected = 'w-repos'
    withPreviews(world)
  },
  async run(context) {
    const { world, move, wait, zoom } = context
    zoom([300, 200], 1.6)
    await wait(700)
    await move('fav:w-gmail')
    await wait(450)
    world.card = { kind: 'tab', id: 'w-gmail' }
    await wait(2300)
    world.card = null
    await move('fav:w-linear')
    await wait(400)
    world.card = { kind: 'tab', id: 'w-linear' }
    await wait(2300)
    endPreview(context)
    await move([700, 430])
    await wait(800)
  },
})
