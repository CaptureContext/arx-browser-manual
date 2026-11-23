import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      // .navigation.yml files carry each sidebar group's title, description and icon.
      source: '**/*.{md,yml}',
      schema: z.object({
        description: z.string(),
        // A Raycast icon name (i-raycast-*) for navigation and home page cards.
        icon: z.string().optional(),
        // `draft` pages show a note that the page is still being written. `planned` pages describe
        // something Arx doesn't do yet: they get a Planned badge here and in the sidebar.
        status: z.enum(['ready', 'draft', 'planned']).default('draft')
      })
    })
  }
})
