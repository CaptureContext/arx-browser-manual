import { defineArxScene } from '~/utils/arxScene'
import { closeSheet, pick, sheet, SPACE_MENU, swipe } from './helpers'
import { appearanceSettings, panel, PANEL } from './appearance-parts'

export default defineArxScene({
  caption: 'At low intensity the sidebar and the frame around the page let the blurred desktop show through; drag the wave slider up and they turn solid, while the page stays solid throughout. A dot dragged in Settings → Appearance & Sound recolors every space without colors of its own, when you let go.',
  setup(world) {
    world.look.wallpaper = true
    world.look.opacity = .7
  },
  async run(context) {
    const { world, wait, drag, key, move, rect } = context
    await wait(800)
    await context.rightClick('space-header:personal')
    await pick(context, SPACE_MENU, 'Appearance…')
    const editor = { level: 'space' as const, dots: [{ x: .62, y: .34, color: '#8f7cf7' }], intensity: 0 }
    const form = sheet(world, panel(editor), PANEL)
    const live = form.sections[0]!.editor!
    await wait(1300)
    const [x, y, w, h] = rect('theme:wave')
    await drag('theme:wave-handle', [x + w * .6, y + h / 2], {
      hold: 400,
      onMove: (px) => {
        live.intensity = Math.min(1, Math.max(0, (px - x - w * .04) / (w * .92)))
        // Solid from 60% up: opacity = 0.7 + 0.3 × min(intensity / 0.6, 1).
        world.look.opacity = .7 + .3 * Math.min(live.intensity / .6, 1)
      },
    })
    await wait(1400)
    await key('esc')
    closeSheet(world, 'appearance')
    await swipe(context, 1)
    await key('⌘ ,')
    world.settings = appearanceSettings({ level: 'global', dots: [{ x: .3, y: .62, color: '#7a8cf5' }], intensity: 1 })
    const global = world.settings.custom!.sections[0]!.editor!
    await wait(1300)
    const [fx, fy, fw, fh] = rect('theme:field')
    await drag('theme:dot:0', [fx + fw * .72, fy + fh * .3], { hold: 500, onMove: (px, py) => { Object.assign(global.dots[0]!, { x: (px - fx) / fw, y: (py - fy) / fh }) } })
    global.dots[0]!.color = '#f2a65a'
    // Windows take the new color when the drag ends.
    Object.assign(world.look, { tint: 'rgb(243 226 208)', ink: 'dark' })
    await move([140, 430])
    await wait(2600)
  },
})
