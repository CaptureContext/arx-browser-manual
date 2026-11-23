import { defineArxScene } from '~/utils/arxScene'
import { swipe } from './helpers'

export default defineArxScene({
  caption: 'The same site in two profiles: GitHub in the Work space is signed in to the work account, and in Personal to your own.',
  setup(world) {
    world.space = 2
    world.selected = 'w-github'
    world.tabs['w-github']!.page = { kind: 'account', site: 'GitHub', account: 'max-capturecontext', color: '#8250df' }
    world.tabs['fav-github']!.page = { kind: 'account', site: 'GitHub', account: 'max-krouk', color: '#2da44e' }
  },
  async run(context) {
    const { world, wait, click, zoom } = context
    zoom([640, 200], 1.3)
    await wait(1800)
    zoom(null)
    await swipe(context, 1)
    await swipe(context, 0)
    await click('fav:fav-github')
    world.selected = 'fav-github'
    zoom([640, 200], 1.3)
    await wait(2400)
    zoom(null)
    await wait(600)
  },
})
