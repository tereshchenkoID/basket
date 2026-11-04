import { createElement, type ElementType } from 'react'

import { primitiveProps, styles } from '@/helpers/primitives'

import { Box } from '@/components/Box'

import type { GridProps } from '@/types/primitives'

export const Grid = <Tag extends ElementType = 'div'>({
  as,
  columns,
  className,
  ...props
}: GridProps<Tag>) => createElement(Box, {
  ...props,
  as,
  ...primitiveProps({ columns, className, style: props.style }, { columns: 'columns' }, styles.grid),
})
