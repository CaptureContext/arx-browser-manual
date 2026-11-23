import { defineArxScene } from '~/utils/arxScene'

export default defineArxScene({
  caption: '⌘+ zooms the whole site and shows its level for a moment; ⌘− steps back and ⌘0 resets.',
  setup(world) {
    world.selected = 'browser'
  },
  async run({ world, key, wait, move }) {
    await move([760, 520])
    const step = async (label: string, zoom: number, badge: string) => {
      await key(label)
      world.pageZoom = zoom
      world.zoomBadge = badge
      await wait(1300)
    }
    await step('⌘ +', 1.1, '110%')
    await step('⌘ +', 1.25, '125%')
    world.zoomBadge = null
    await wait(1000)
    await step('⌘ −', 1.1, '110%')
    await step('⌘ 0', 1, '100%')
    world.zoomBadge = null
    await wait(1200)
  },
})
