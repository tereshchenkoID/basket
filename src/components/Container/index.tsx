import { createElement, type ElementType } from 'react'
import clsx from 'clsx'

import { Box } from '@/components/Box'

import type { ContainerProps } from './types'

import styles from './index.module.scss'

export const Container = <Tag extends ElementType = 'div'>({
  as,
  className,
  ...props
}: ContainerProps<Tag>) => createElement(Box, {
  ...props,
  as,
  className: clsx(
    styles.block,
    className
  ),
})
