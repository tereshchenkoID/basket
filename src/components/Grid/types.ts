import type { ElementType } from 'react'

import type { LayoutProps, PrimitiveProps, Responsive } from '@/types/primitives'

export type GridProps<Tag extends ElementType = 'div'> = PrimitiveProps<Tag, LayoutProps & {
  columns?: Responsive<number | string>
}>
