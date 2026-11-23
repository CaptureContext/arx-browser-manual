import { defineArxScene } from '~/utils/arxScene'
import { ask, command, searchRow } from './helpers'

export default defineArxScene({
  caption: 'Type a question in the command bar and press Tab: the chat panel opens beside the page and the answer streams in. ⇧ Esc hides it.',
  async run(context) {
    const { world, key, wait, move, zoom } = context
    await move([150, 740])
    await command(context, 'What is this page about?', [searchRow('What is this page about?')], { agent: true })
    zoom([1050, 430], 1.35)
    await ask(context, 'What is this page about?')
    await wait(2200)
    await key('⇧ Esc')
    world.chat = null
    zoom(null)
    await wait(1400)
  },
})
