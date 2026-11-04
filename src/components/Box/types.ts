import type { ElementType } from 'react'

import type { LayoutProps, PrimitiveProps } from '@/types/primitives'

export type BoxProps<Tag extends ElementType = 'div'> = PrimitiveProps<Tag, LayoutProps>
