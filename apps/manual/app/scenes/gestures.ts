import type { ArxPage } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'

// Earlier pages of the tab, newest first, as the history list shows them.
const history: { title: string, url: string, page: ArxPage }[] = [
  { title: 'Web page - Wikipedia', url: 'en.wikipedia.org/wiki/Web_page', page: { kind: 'article', title: 'Web page', lead: 'A web page is a document on the World Wide Web, delivered by a web server and displayed in a browser.' } },
  { title: 'Hypertext - Wikipedia', url: 'en.wikipedia.org/wiki/Hypertext', page: { kind: 'article', title: 'Hypertext', lead: 'Hypertext is text shown on a display with references to other text that the reader can immediately follow.' } },
  { title: 'World Wide Web - Wikipedia', url: 'en.wikipedia.org/wiki/World_Wide_Web', page: { kind: 'article', title: 'World Wide Web', lead: 'The World Wide Web is an information system that lets documents and other resources be accessed over the Internet.' } },
  { title: 'Tim Berners-Lee - Wikipedia', url: 'en.wikipedia.org/wiki/Tim_Berners-Lee', page: { kind: 'article', title: 'Tim Berners-Lee', lead: 'Sir Tim Berners-Lee is an English computer scientist best known as the inventor of the World Wide Web.' } },
]

export default defineArxScene({
  caption: 'Swipe right with two fingers to go back a page. Keep pushing and hold: a list of the tab\'s history opens beside the arrow. Move down to an earlier page and let go.',
  setup(world) {
    world.selected = 'browser'
  },
  async run({ world, move, wait, swipe, zoom }) {
    const tab = world.tabs.browser!
    const go = (index: number) => {
      tab.title = history[index]!.title
      tab.url = history[index]!.url
      tab.page = history[index]!.page
    }
    const push = async (ms: number) => {
      world.backSwipe = { progress: 0, list: null }
      const start = performance.now()
      const finger = swipe([110, 0], { ms })
      while (performance.now() - start < ms) {
        world.backSwipe.progress = Math.min(1, (performance.now() - start) / (ms * .85))
        await wait(30)
      }
      await finger
    }

    await move([700, 430])
    await wait(500)
    zoom([520, 430], 1.3)
    // Back one page.
    await push(700)
    world.backSwipe = null
    go(0)
    await wait(1500)

    // Keep pushing and hold: the list of earlier pages.
    await push(700)
    await wait(500)
    world.backSwipe = { progress: 1, list: { rows: history.slice(1).map(item => ({ title: item.title, host: item.url.split('/')[0]! })), selected: 0 } }
    await wait(1000)
    const fingers = swipe([0, 70], { ms: 1100 })
    for (let index = 1; index <= 2; index++) {
      await wait(420)
      world.backSwipe.list!.selected = index
    }
    await fingers
    await wait(700)
    world.backSwipe = null
    go(3)
    zoom(null)
    await wait(2000)
  },
})
