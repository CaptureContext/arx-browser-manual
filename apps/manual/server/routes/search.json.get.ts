import { queryCollection, queryCollectionSearchSections } from '@nuxt/content/server'

// Every heading section of every page, prerendered to /search.json so the
// static site can search without a server.
export default defineEventHandler(async (event) => {
  const [sections, pages] = await Promise.all([
    queryCollectionSearchSections(event, 'docs', { ignoredTags: ['style'] }),
    queryCollection(event, 'docs').select('path', 'title', 'description').all()
  ])
  const pageTitles = new Map(pages.map(page => [page.path, page.title]))
  return sections.map(section => ({
    id: section.id,
    path: section.id,
    page: pageTitles.get(section.id.split('#')[0]!) ?? section.title,
    title: section.title,
    trail: section.titles,
    level: section.level,
    content: section.content
  }))
})
