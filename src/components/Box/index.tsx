import { createElement, type ElementType } from 'react'
import clsx from 'clsx'

import { layoutProps, primitiveProps, styles } from '@/helpers/primitives'

import type { BoxProps } from '@/types/primitives'

export const Box = <Tag extends ElementType = 'div'>({
  as,
  grow,
  full,
  container,
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
      [styles.container]: container,
      [styles.paper]: surface === 'paper',
      [styles.soft]: surface === 'soft',
      [styles.small]: radius === 'small',
      [styles.large]: radius === 'large',
      [styles.border]: border
    },
    className
  ),
}, layoutProps))
