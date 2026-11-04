import { createElement, type ElementType } from 'react'
import clsx from 'clsx'

import { LAYOUT_PROPS, primitiveProps, styles } from '@/helpers/primitives'

import type { BoxProps } from './types'

export const Box = <Tag extends ElementType = 'div'>({
  as,
  grow,
  full,
  surface,
  radius,
  border,
  className,
  ...props
}: BoxProps<Tag>) => createElement(as || 'div', primitiveProps({
  ...props,
  className: clsx(
    {
      [styles.grow]: grow,
      [styles.full]: full,
      [styles.surface]: surface === 'default',
      [styles.soft]: surface === 'soft',
      [styles.sm]: radius === 'sm',
      [styles.lg]: radius === 'lg',
      [styles.border]: border
    },
    className
  ),
}, LAYOUT_PROPS))
