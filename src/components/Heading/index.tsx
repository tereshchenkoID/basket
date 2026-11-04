import { createElement } from 'react'

import { primitiveProps, typographyProps } from '@/helpers/primitives'

import styles from './index.module.scss'

import type { HeadingProps } from '@/types/ui'

const sizes = {
  h1: 'title',
  h2: 'xl',
  h3: 'lg',
  h4: 'md',
  h5: 'md',
  h6: 'md',
} as const

export const Heading = ({
  as = 'h2',
  size,
  weight = 650,
  ...props
}: HeadingProps) => createElement(as, primitiveProps({
  ...props,
  size: size ?? sizes[as],
  weight,
}, typographyProps, styles.block))
