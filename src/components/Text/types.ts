import type { HTMLAttributes } from 'react'

import type { TypographyProps } from '@/types/primitives'

export type TextProps = TypographyProps & Omit<HTMLAttributes<HTMLElement>, keyof TypographyProps> & {
  as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em' | 'label'
  htmlFor?: string
}
