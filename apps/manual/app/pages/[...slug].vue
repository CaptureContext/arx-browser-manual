<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(`page-${route.path}`, () => queryCollection('docs').path(route.path).first())

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: navigation } = await useManualNavigation()
const order = computed(() => flattenNavigation(navigation.value))
const index = computed(() => order.value.findIndex(entry => entry.page.path === route.path))
const group = computed(() => order.value[index.value]?.group)
const previous = computed(() => order.value[index.value - 1])
const next = computed(() => order.value[index.value + 1])

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: `${page.value.title} · Arx Manual`,
  ogDescription: page.value.description
})
</script>

<template>
  <div v-if="page" class="doc">
    <article class="doc__article">
      <p class="doc__eyebrow">{{ group?.title }}</p>
      <h1>{{ page.title }}<PlannedBadge v-if="page.status === 'planned'" class="doc__badge" /></h1>
      <p class="doc__lede">{{ page.description }}</p>

      <p v-if="page.status === 'draft'" class="doc__draft">
        <Icon name="raycast:hammer" />This page is a first draft and may change.
      </p>
      <p v-else-if="page.status === 'planned'" class="doc__draft">
        <Icon name="raycast:calendar" />Arx doesn't do this yet. This page describes the plan, which may change.
      </p>

      <ContentRenderer :value="page" class="prose" />

      <nav class="doc__pager" aria-label="Previous and next page">
        <NuxtLink v-if="previous" :to="previous.page.path" class="doc__pager-link">
          <small><Icon name="raycast:arrow-left" />Previous</small>
          <span>{{ previous.page.title }}</span>
        </NuxtLink>
        <span v-else />
        <NuxtLink v-if="next" :to="next.page.path" class="doc__pager-link is-next">
          <small>Next<Icon name="raycast:arrow-right" /></small>
          <span>{{ next.page.title }}</span>
        </NuxtLink>
      </nav>
    </article>

    <aside class="doc__aside">
      <DocToc :links="page.body?.toc?.links ?? []" />
    </aside>
  </div>
</template>

<style scoped>
.doc {
  display: grid;
  grid-template-columns: minmax(0, var(--content-max-width)) var(--toc-width);
  gap: 56px;
  justify-content: center;
  padding: 40px 32px 96px;
}

.doc__eyebrow {
  margin: 0 0 6px;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

h1 {
  margin: 0 0 4px;
  color: var(--text-primary);
  font-size: var(--font-size-h1);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -.02em;
}

.doc__lede {
  margin: 8px 0 0;
  color: var(--text-body);
  font-size: var(--font-size-base);
  line-height: 1.8;
}

.doc__badge {
  margin-left: 12px;
  vertical-align: .35em;
}

.doc__draft {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 20px 0 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--surface-hover);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.doc__pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 48px;
}

.doc__pager-link {
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid var(--border-separator);
  border-radius: var(--radius-lg);
  transition: border-color .15s ease, background-color .15s ease, transform .15s ease;
}

.doc__pager-link:hover {
  border-color: var(--text-tertiary);
  background: var(--fg-100);
}

.doc__pager-link:active {
  transform: scale(.99);
}

.doc__pager-link small {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

.doc__pager-link span {
  overflow: hidden;
  color: var(--accent-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc__pager-link.is-next {
  text-align: right;
}

.doc__pager-link.is-next small {
  justify-content: flex-end;
}

@media (max-width: 1279px) {
  .doc {
    grid-template-columns: minmax(0, var(--content-max-width));
  }

  .doc__aside {
    display: none;
  }
}

@media (max-width: 640px) {
  .doc {
    padding: 28px 16px 72px;
  }

  h1 {
    font-size: 1.875rem;
  }

  .doc__pager {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
/* Markdown body. Sizes, spacing and colours follow manual.raycast.com. */
.prose {
  margin-top: 24px;
  font-size: var(--font-size-base);
  line-height: 1.8;
}

.prose > :first-child {
  margin-top: 0;
}

.prose p {
  margin: 0 0 8px;
}

.prose ul,
.prose ol {
  margin: 0 0 8px;
  padding-left: 24px;
}

.prose li {
  margin-bottom: 8px;
}

.prose li > ul,
.prose li > ol {
  margin-top: 8px;
}

.prose li::marker {
  color: var(--accent);
}

.prose strong {
  color: var(--text-primary);
  font-weight: 600;
}

.prose h2,
.prose h3 {
  position: relative;
  color: var(--text-primary);
  line-height: 1.25;
  scroll-margin-top: 24px;
}

.prose h2 {
  margin: 32px 0 8px;
  font-size: var(--font-size-h2);
  font-weight: 600;
  letter-spacing: -.015em;
}

.prose h3 {
  margin: 24px 0 8px;
  font-size: var(--font-size-h3);
  font-weight: 600;
  letter-spacing: -.01em;
}

.prose h2 a,
.prose h3 a {
  color: inherit;
}

.prose h2 a::after,
.prose h3 a::after {
  content: "#";
  margin-left: 8px;
  color: var(--text-tertiary);
  font-weight: 400;
  opacity: 0;
  transition: opacity .15s;
}

.prose h2:hover a::after,
.prose h3:hover a::after {
  opacity: 1;
}

.prose p a,
.prose li a,
.prose td a {
  color: var(--text-link);
  text-decoration: none;
  transition: opacity .15s;
}

.prose p a:hover,
.prose li a:hover,
.prose td a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose a[target="_blank"]::after {
  content: "↗";
  margin-left: 2px;
  font-size: .8em;
}

.prose code:not(pre code) {
  padding: .18em .4em;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent-text);
  font-family: var(--font-mono);
  font-size: .9em;
}

.prose h2 code,
.prose h3 code {
  padding: 0;
  background: none;
  color: inherit;
  font-size: .92em;
  font-weight: 500;
}

.prose pre {
  overflow-x: auto;
  margin: 12px 0;
  padding: 16px;
  border: 1px solid var(--fg-100);
  border-radius: var(--radius-md);
  background: var(--fg-100) !important;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.5;
}

:root[data-theme="dark"] .prose pre span {
  color: var(--shiki-dark, inherit) !important;
}

:root[data-theme="light"] .prose pre span {
  color: var(--shiki-light, inherit) !important;
}

.prose table {
  width: 100%;
  margin: 12px 0 16px;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.prose th,
.prose td {
  padding: 8px 12px 8px 0;
  border-bottom: 1px solid var(--border-separator);
  text-align: left;
  vertical-align: top;
}

.prose th {
  color: var(--text-primary);
  font-weight: 600;
}

.prose blockquote {
  margin: 12px 0;
  padding: 2px 0 2px 16px;
  border-left: 2px solid var(--border-field);
  color: var(--text-secondary);
}

.prose hr {
  margin: 32px 0;
  border: 0;
  border-top: 1px solid var(--border-separator);
}

.prose details {
  margin: 0 0 8px;
  border: 1px solid var(--border-separator);
  border-radius: var(--radius-lg);
}

.prose summary {
  padding: 10px 14px;
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
}

.prose details > :not(summary) {
  margin: 0 14px 12px;
}
</style>
