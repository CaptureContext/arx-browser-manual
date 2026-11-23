import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { closeSheet, endPreview, pick, sheet } from './helpers'

const CHOICES = [{ label: 'Use the site’s preview image', checked: true }, { label: 'Load the page' }, { label: 'Show no picture' }]

export default defineArxScene({
  caption: 'After Arx restarts, a tab that hasn\'t loaded yet still shows the picture saved of its page. A Favorite you never opened shows the site\'s own preview image, and a site that publishes none shows its title and description. Preview Settings… chooses what such tabs show.',
  setup(world) {
    world.tabs['apple-dev']!.unloaded = { picture: 'saved', when: 'yesterday', description: 'There’s never been a better time to develop for Apple platforms.' }
    world.tabs['fav-github']!.unloaded = { picture: 'site', when: '3 days ago', description: 'Swift enthusiasts. capturecontext has 59 repositories available. Follow their code on GitHub.' }
    world.tabs['fav-github']!.title = 'capturecontext · GitHub'
    world.tabs.forums!.unloaded = { picture: 'none', when: 'last week', description: 'Discussion about the Swift language, its evolution and the projects around it.' }
  },
  async run(context) {
    const { world, move, wait, click, key, zoom } = context
    zoom([330, 380], 1.3)
    await wait(600)
    for (const [target, id] of [['tab:apple-dev', 'apple-dev'], ['fav:fav-github', 'fav-github'], ['tab:forums', 'forums']] as const) {
      await move(target)
      world.hovered = target
      await wait(450)
      world.card = { kind: 'tab', id }
      await wait(2300)
      world.card = null
    }
    endPreview(context)
    zoom(null)
    await key('⌘ ,')
    world.settings = demoSettings()
    world.settings.pane = 'custom'
    world.settings.custom = {
      pane: 'General', title: 'General', scroll: 0,
      sections: [{
        header: 'Tabs',
        rows: [
          { label: 'Previews on hover', detail: 'A tab shows a picture of its page; a folder lists its tabs.', toggle: true },
          { label: 'Previews', button: 'Preview Settings…' },
          { label: 'When a link opens in a new tab, switch to it', toggle: false },
        ],
      }],
    }
    await wait(900)
    await click('act:Preview Settings…')
    sheet(world, {
      id: 'previews', title: 'Previews', subtitle: 'General', close: true,
      sections: [
        { caption: 'Preview folders and favorite sites when you hover over them.', rows: [{ label: 'Folder previews', toggle: true }, { label: 'Unread mail in Gmail', toggle: true }, { label: 'Recent pages in Linear, Notion and Figma', toggle: true }] },
        {
          header: 'Pages that aren’t loaded', caption: 'A tab whose page isn’t loaded shows the last picture Arx took of it while it was open.',
          rows: [{ label: 'Without a saved picture', popup: 'Use the site’s preview image' }, { label: 'Shift + hover loads the page instantly', toggle: false }],
        },
      ],
    }, { width: 620, dim: true })
    await wait(1200)
    await click('popup:Without a saved picture')
    await pick(context, CHOICES, 'Use the site’s preview image', { leftward: true })
    await wait(1600)
    closeSheet(world, 'previews')
  },
})
