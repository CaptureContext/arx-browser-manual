import { defineArxScene } from '~/utils/arxScene'
import { closeSheet, pick, sheet, SPACE_MENU } from './helpers'
import { appearanceSettings, panel, PANEL } from './appearance-parts'

// The chrome's color for each page: the site's own color, softened. Pages without one use the space's tint.
const SITES = {
  repos: { tint: 'rgb(52 58 72)', ink: 'light' },
  browser: { tint: 'rgb(236 236 238)', ink: 'dark' },
  talk: { tint: 'rgb(244 214 212)', ink: 'dark' },
} as const

export default defineArxScene({
  caption: 'With Match site on, the sidebar and the frame take the color of the page they show, softened, with text that stays readable. A space can turn it off for itself, and Inherit hands the choice back. Switching tabs eases from one site\'s color to the next.',
  setup(world) {
    world.selected = 'repos'
    world.spaces[0]!.open.push('talk')
    world.settings = appearanceSettings({ level: 'global', dots: [{ x: .3, y: .62, color: '#7a8cf5' }], intensity: .4, matchSite: { on: false, inherited: null } })
  },
  async run(context) {
    const { world, wait, click, key, move } = context
    const follow = (id: keyof typeof SITES | null) => Object.assign(world.look, id ? SITES[id] : { tint: null, ink: null })
    await wait(900)
    await click('theme:match')
    world.settings!.custom!.sections[0]!.editor!.matchSite!.on = true
    follow('repos')
    await move([140, 430])
    await wait(2000)
    await key('esc')
    world.settings = null
    await wait(600)
    await context.rightClick('space-header:personal')
    await pick(context, SPACE_MENU, 'Appearance…')
    const form = sheet(world, panel({ level: 'space', dots: [], intensity: .4, matchSite: { on: true, inherited: true } }), PANEL)
    const match = form.sections[0]!.editor!.matchSite!
    await wait(1200)
    await click('theme:match')
    Object.assign(match, { on: false, inherited: false })
    follow(null)
    await wait(1900)
    await click('theme:inherit-match')
    Object.assign(match, { on: true, inherited: true })
    follow('repos')
    await wait(1700)
    await key('esc')
    closeSheet(world, 'appearance')
    for (const id of ['browser', 'talk', 'repos'] as const) {
      await click(`tab:${id}`)
      world.selected = id
      follow(id)
      await wait(1900)
    }
  },
})
