import type { HTMLAttributes } from 'react'

import type { TypographyProps } from '@/types/primitives'

export type HeadingProps = TypographyProps & Omit<HTMLAttributes<HTMLHeadingElement>, keyof TypographyProps> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}
