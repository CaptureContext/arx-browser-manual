import { defineArxScene } from '~/utils/arxScene'
import { removeTab } from '~/utils/arxModel'

export default defineArxScene({
  caption: 'With no Favorites, dragging a tab up shows the dashed area; drop it in. A second tile halves the first, a drag reorders them, and dragging a tile down into the list turns it back into a tab.',
  setup(world) {
    world.space = 1
    const shops = world.spaces[1]!
    shops.pinned.forEach((item) => { if (item.type === 'folder') item.open = false })
    shops.open = ['snowboard', 'w-repos']
    world.selected = 'snowboard'
  },
  async run({ world, move, wait, drag, zoom }) {
    const shops = world.spaces[1]!
    zoom([150, 260], 1.75)
    await wait(700)
    await drag('tab:snowboard', [140, 128], { hold: 900, onMove: (x, y) => { world.drag = { id: 'snowboard', x, y } } })
    world.drag = null
    removeTab(shops, 'snowboard')
    shops.favorites = ['snowboard']
    await move([520, 360])
    await wait(900)

    await drag('tab:w-repos', [212, 104], { hold: 700, onMove: (x, y) => { world.drag = { id: 'w-repos', x, y } } })
    world.drag = null
    removeTab(shops, 'w-repos')
    shops.favorites = ['snowboard', 'w-repos']
    await move([520, 360])
    await wait(900)

    world.tileDrag = { index: 1 }
    await drag('fav:w-repos', [72, 104], { hold: 500, onMove: (x, y) => { world.drag = { id: 'w-repos', x, y } } })
    world.drag = null
    world.tileDrag = null
    shops.favorites = ['w-repos', 'snowboard']
    await move([520, 360])
    await wait(900)

    world.tileDrag = { index: 0 }
    await drag('fav:w-repos', [140, 300], {
      hold: 500,
      onMove: (x, y) => {
        world.drag = { id: 'w-repos', x, y }
        // Below the grid the tile turns back into a row.
        if (y > 150) world.tileDrag = null
      },
    })
    world.drag = null
    world.tileDrag = null
    shops.favorites = ['snowboard']
    shops.open.push('w-repos')
    await move([520, 360])
    await wait(1600)
  },
})
