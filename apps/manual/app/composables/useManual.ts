import type { ContentNavigationItem } from '@nuxt/content'

// The sidebar tree: one group per content folder, pages inside it, in file order.
export function useManualNavigation() {
  return useAsyncData('manual-navigation', () => queryCollectionNavigation('docs', ['description', 'icon', 'status']), {
    default: () => [] as ContentNavigationItem[]
  })
}

/** Pages in reading order, for the previous and next links. */
export function flattenNavigation(items: ContentNavigationItem[], group?: ContentNavigationItem): { page: ContentNavigationItem, group?: ContentNavigationItem }[] {
  return items.flatMap(item => item.children?.length
    ? flattenNavigation(item.children, item)
    : [{ page: item, group }])
}

export const useSearchOpen = () => useState('search-open', () => false)
export const useSidebarOpen = () => useState('sidebar-open', () => false)
