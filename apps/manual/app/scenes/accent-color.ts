import { defineArxScene } from '~/utils/arxScene'
import { closeSheet, pick, sheet, SPACE_MENU, swipe } from './helpers'
import { appearanceSettings, panel, PANEL, windowBackground } from './appearance-parts'

export default defineArxScene({
  caption: 'An accent color colors folders, highlights and controls. Choose red for all of Arx, green for one profile, then teal for one space: each level overrides the one above. Inherit in the space\'s Appearance takes it back to the profile\'s green.',
  setup(world) {
    // Two spaces in one profile, so a profile's accent has more than one space to show in.
    world.spaces[1]!.profile = 'Personal'
    world.settings = appearanceSettings({ level: 'global', dots: [{ x: .3, y: .62, color: '#7a8cf5' }], intensity: .4, matchSite: { on: false, inherited: null }, accent: { inherited: null, selected: null } })
  },
  async run(context) {
    const { world, wait, click, key, move } = context
    const custom = world.settings!.custom!
    await wait(900)
    await click('theme:accent:Red')
    custom.sections[0]!.editor!.accent!.selected = 'Red'
    world.look.accent.global = 'Red'
    await move([140, 430])
    await wait(1700)
    // The Personal profile's page has the same panel.
    await click('pane:Profiles')
    Object.assign(custom, { pane: 'Profiles', title: 'Personal', subtitle: 'Profiles', sections: [windowBackground({ level: 'profile', dots: [], intensity: .4, matchSite: { on: false, inherited: true }, accent: { inherited: true, selected: 'Red' } }, 'Colors this profile\'s spaces. A space can choose its own.')] })
    await wait(1300)
    await click('theme:accent:Green')
    Object.assign(custom.sections[0]!.editor!.accent!, { selected: 'Green', inherited: false })
    world.look.accent.profiles.Personal = 'Green'
    await move([140, 430])
    await wait(1700)
    await key('esc')
    world.settings = null
    await wait(500)
    await context.rightClick('space-header:personal')
    await pick(context, SPACE_MENU, 'Appearance…')
    const form = sheet(world, panel({ level: 'space', dots: [], intensity: .4, matchSite: { on: false, inherited: true }, accent: { inherited: true, selected: 'Green' } }), PANEL)
    const accent = form.sections[0]!.editor!.accent!
    await wait(1200)
    await click('theme:accent:Teal')
    Object.assign(accent, { selected: 'Teal', inherited: false })
    world.look.accent.spaces.personal = 'Teal'
    await wait(1700)
    await key('esc')
    closeSheet(world, 'appearance')
    await swipe(context, 1)
    await wait(900)
    await swipe(context, 0)
    await context.rightClick('space-header:personal')
    await pick(context, SPACE_MENU, 'Appearance…')
    const again = sheet(world, panel({ level: 'space', dots: [], intensity: .4, matchSite: { on: false, inherited: true }, accent: { inherited: false, selected: 'Teal' } }), PANEL)
    await wait(1000)
    await click('theme:inherit-accent')
    Object.assign(again.sections[0]!.editor!.accent!, { selected: 'Green', inherited: true })
    delete world.look.accent.spaces.personal
    await move([140, 430])
    await wait(2400)
    closeSheet(world, 'appearance')
  },
})
