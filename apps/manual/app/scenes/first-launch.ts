import { defineArxScene } from '~/utils/arxScene'

export default defineArxScene({
  caption: 'The first launch: choose Import from Another Browser…, pick Arc, and review what comes over before importing.',
  setup(world) {
    world.overlays.push({ kind: 'onboarding', step: 'welcome' })
  },
  async run(context) {
    const { world, wait, click } = context
    const screen = world.overlays[0]
    if (screen?.kind !== 'onboarding') return
    await wait(1400)
    await click('onboarding:import')
    screen.step = 'browsers'
    await wait(900)
    await click('onboarding:Arc')
    screen.selected = 'Arc'
    await wait(600)
    await click('onboarding:continue')
    screen.step = 'review'
    await wait(2400)
    await click('onboarding:import-now')
    screen.step = 'done'
    await wait(2000)
  },
})
