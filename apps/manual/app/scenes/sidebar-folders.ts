import { defineArxScene } from '~/utils/arxScene'
import { findFolder, removeTab } from '~/utils/arxModel'
import { FOLDER_MENU, pick } from './helpers'

export default defineArxScene({
  caption: 'Drag a tab into a pinned folder, rename the folder, nest a new folder inside it, then Clear the unpinned tabs.',
  async run(context) {
    const { world, move, click, wait, drag, key, type, zoom } = context
    const space = world.spaces[0]!
    const folder = findFolder(space.pinned, 'watch')!
    zoom([170, 470], 1.6)
    await wait(600)
    await drag('tab:browser', 'folder:watch', {
      hold: 600,
      onMove: (x, y) => { world.drag = { id: 'browser', x, y } },
    })
    world.drag = null
    removeTab(space, 'browser')
    folder.children.push({ type: 'tab', id: 'browser' })
    await move([520, 470])
    await wait(900)

    const rename = async (id: string, text: string) => {
      await context.rightClick(`folder:${id}`)
      await pick(context, FOLDER_MENU, 'Rename…')
      const target = findFolder(space.pinned, id)!
      world.renaming = { id, text: target.name }
      await wait(600)
      await type(text, (value) => { world.renaming!.text = value })
      await wait(400)
      await key('↩ Return')
      target.name = text
      world.renaming = null
      await wait(700)
    }
    await rename('watch', 'Reading')

    await context.rightClick('folder:watch')
    await pick(context, FOLDER_MENU, 'New Subfolder')
    folder.children.push({ type: 'folder', id: 'talks', name: 'New Folder', open: true, children: [] })
    await wait(900)
    await rename('talks', 'Talks')

    await click('clear:personal')
    space.open = []
    await move([520, 470])
    await wait(1800)
  },
})
