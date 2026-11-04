import { createElement } from 'react'

import { primitiveProps, TYPOGRAPHY_PROPS } from '@/helpers/primitives'

import type { HeadingProps } from './types'

import styles from './index.module.scss'

const SIZES = {
  h1: 6,
  h2: 5,
  h3: 4,
  h4: 3,
  h5: 3,
  h6: 3,
} as const

export const Heading = ({
  as = 'h2',
  size,
  weight = 'semibold',
  ...props
}: HeadingProps) => createElement(as, primitiveProps({
  ...props,
  size: size ?? SIZES[as],
  weight,
}, TYPOGRAPHY_PROPS, styles.block))
