import type { CatalogEntry } from '@/app/[locale]/(account)/ui-kit/catalog'

export type CatalogGroupViewProps = {
  group: string
  entries: readonly CatalogEntry[]
}
