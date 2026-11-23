import { defineArxScene } from '~/utils/arxScene'

export default defineArxScene({
  caption: 'In the migration assistant, pick Arc, look over its profiles, spaces and pinned tabs, then import them into new profiles.',
  setup(world) {
    world.overlays.push({ kind: 'onboarding', step: 'browsers', title: 'Migration Assistant' })
  },
  async run(context) {
    const { world, wait, click } = context
    const screen = world.overlays[0]
    if (screen?.kind !== 'onboarding') return
    await wait(900)
    await click('onboarding:Arc')
    screen.selected = 'Arc'
    await wait(600)
    await click('onboarding:continue')
    screen.step = 'review'
    await wait(2600)
    await click('onboarding:import-now')
    screen.step = 'done'
    await wait(2000)
  },
})
