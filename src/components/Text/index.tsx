import { createElement } from 'react'

import { primitiveProps, TYPOGRAPHY_PROPS } from '@/helpers/primitives'

import type { TextProps } from './types'

import styles from './index.module.scss'

export const Text = ({
  as = 'p',
  ...props
}: TextProps) => createElement(as, primitiveProps(props, TYPOGRAPHY_PROPS, styles.block))
