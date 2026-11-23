# Nuxt Raycast Icons

A local [Raycast icon](https://ray.so/icon) collection for Nuxt UI and
`@nuxt/icon`.

## Setup

Add the module before or alongside Nuxt UI:

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-raycast-icons',
    '@nuxt/ui'
  ]
})
```

Use any icon with the `i-raycast-<name>` convention:

```vue
<UIcon name="i-raycast-add-person" />
<UButton icon="i-raycast-wand">Create</UButton>
```

The module registers the local SVG directory as an `@nuxt/icon` custom
collection. Static icon names are scanned into the client bundle, while
dynamically selected names can still be fetched from Nuxt's icon endpoint.
`includeCustomCollections` remains disabled, so installing this module does not
put the entire Raycast collection into the client bundle.

## Refresh the source icons

The checked-in SVGs are copied from the gallery element whose class token ends
in `__iconsWrapper`; this remains stable if the generated CSS hash changes.
From the browser console at <https://ray.so/icon>, extract its radio values and
SVGs as JSON:

```js
const wrapper = [...document.querySelectorAll('div')].find(element => (
  [...element.classList].some(className => className.endsWith('__iconsWrapper'))
))
const icons = [...wrapper.querySelectorAll('label')].map(label => ({
  name: label.querySelector('input[type="radio"][value]').value,
  svg: label.querySelector('svg').outerHTML
}))

copy(JSON.stringify({
  source: location.href,
  extractedAt: new Date().toISOString(),
  icons
}, null, 2))
```

Save that JSON and run:

```sh
pnpm sync:icons ./raycast-icons.json
```

The expected JSON shape is:

```json
{
  "source": "https://ray.so/icon",
  "extractedAt": "2026-08-13T00:00:00.000Z",
  "icons": [
    {
      "name": "add-person",
      "svg": "<svg>...</svg>"
    }
  ]
}
```

The sync script validates names and SVG markup, removes stale generated SVGs,
and updates `icon-names.json`.
