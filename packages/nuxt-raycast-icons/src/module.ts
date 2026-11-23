import type { ModuleOptions as NuxtIconModuleOptions } from '@nuxt/icon'
import { defineNuxtModule } from '@nuxt/kit'
import { fileURLToPath } from 'node:url'

const collectionPrefix = 'raycast'
const iconsDirectory = fileURLToPath(new URL('../icons', import.meta.url))

export default defineNuxtModule({
  meta: {
    name: 'nuxt-raycast-icons',
    configKey: 'raycastIcons',
    compatibility: {
      nuxt: '>=4.0.0'
    }
  },
  moduleDependencies(nuxt) {
    const iconOptions = (nuxt.options as typeof nuxt.options & {
      icon?: NuxtIconModuleOptions
    }).icon
    const existingCollections = iconOptions?.customCollections ?? []
    const customCollections = existingCollections.filter(collection => (
      collection.prefix !== collectionPrefix
    ))

    return {
      '@nuxt/icon': {
        version: '>=2.2.0',
        overrides: {
          customCollections: [
            ...customCollections,
            {
              prefix: collectionPrefix,
              dir: iconsDirectory,
              normalizeIconName: false
            }
          ]
        },
        defaults: {
          clientBundle: {
            scan: true,
            includeCustomCollections: false
          }
        }
      }
    }
  },
  setup() {}
})
