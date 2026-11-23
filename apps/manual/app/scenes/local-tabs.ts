import { defineArxScene } from '~/utils/arxScene'

export default defineArxScene({
  caption: 'A tab on your own computer has a yellow and black border in the sidebar and its host and port under the title, selected or not.',
  setup(world) {
    world.spaces[0]!.open.splice(1, 0, 'local')
  },
  async run({ world, move, click, wait, zoom }) {
    zoom([150, 560], 1.9)
    await wait(1000)
    await move('tab:local')
    world.hovered = 'tab:local'
    await wait(900)
    await click('tab:local', { stay: true })
    world.hovered = null
    world.selected = 'local'
    await wait(1800)
    await click('tab:arx')
    world.selected = 'arx'
    await move([700, 430])
    await wait(1600)
  },
})
