import { createElement } from 'react'

import { primitiveProps, typographyProps } from '@/helpers/primitives'

import styles from './index.module.scss'

import type { TextProps } from '@/types/ui'

export const Text = ({
  as = 'p',
  tone,
  color,
  ...props
}: TextProps) => createElement(as, primitiveProps({
  ...props,
  color: color ?? tone,
}, typographyProps, styles.block))
