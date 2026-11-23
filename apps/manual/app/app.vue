<script setup lang="ts">
// Share previews for every page. URLs are absolute and built from the
// environment's own site address, so staging and PR previews point at
// themselves. Pages set their own titles and descriptions.
const config = useRuntimeConfig()
const route = useRoute()
const site = String(config.public.siteUrl).replace(/\/$/, '')

useSeoMeta({
  ogSiteName: 'Arx Manual',
  ogType: 'website',
  ogUrl: () => `${site}${route.path}`,
  ogImage: `${site}/opengraph/arx-manual-og.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Arx Manual by CaptureContext',
  twitterCard: 'summary_large_image',
  twitterImage: `${site}/opengraph/arx-manual-og.png`
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
