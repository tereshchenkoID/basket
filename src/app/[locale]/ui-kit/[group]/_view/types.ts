import type { CatalogEntry } from '@/app/[locale]/ui-kit/catalog'

export type CatalogGroupViewProps = {
  group: string
  entries: readonly CatalogEntry[]
}
