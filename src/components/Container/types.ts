import type { ElementType } from 'react'

import type { BoxProps } from '@/components/Box/types'

export type ContainerProps<Tag extends ElementType = 'div'> = BoxProps<Tag>
