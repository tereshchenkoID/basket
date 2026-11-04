import clsx from 'clsx'

import type { PrimitiveAttributes, PrimitiveDefinitions, PrimitiveKind } from './primitives.types'

import styles from '@/scss/utilities.module.scss'

const SPACING = {
  m: 'space',
  mx: 'space',
  my: 'space',
  mt: 'space',
  mb: 'space',
  p: 'space',
  px: 'space',
  py: 'space',
  pt: 'space',
  pb: 'space',
  gap: 'space',
} as const

export const LAYOUT_PROPS: PrimitiveDefinitions = {
  ...SPACING,
  display: 'raw',
  direction: 'raw',
  wrap: 'raw',
  align: 'raw',
  justify: 'justify',
  columns: 'columns',
}

export const TYPOGRAPHY_PROPS: PrimitiveDefinitions = {
  ...SPACING,
  size: 'size',
  weight: 'weight',
  transform: 'raw',
  color: 'color',
  align: 'textalign',
  family: 'family',
}

const WEIGHTS = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const

const COLORS = {
  default: 'text',
  muted: 'text-muted',
  error: 'danger',
  success: 'primary',
  accent: 'primary',
} as const

const cssValue = (value: string | number, kind: PrimitiveKind) => {
  if (kind === 'space') return value === 'auto' || value === 0 ? value : `var(--space-${value})`
  if (kind === 'weight') return WEIGHTS[value as keyof typeof WEIGHTS]
  if (kind === 'size') return `var(--text-${value})`
  if (kind === 'family') return `var(--font-${value})`
  if (kind === 'color') return `var(--${COLORS[value as keyof typeof COLORS]})`
  if (kind === 'columns' && /^\d+$/.test(String(value))) return `repeat(${value}, 1fr)`
  if (kind === 'justify' && value === 'between') return 'space-between'

  return value
}

export const primitiveProps = (
  props: PrimitiveAttributes,
  definitions: PrimitiveDefinitions,
  base?: string,
) => {
  const { className, style, ...rest } = props
  const names = [base]
  const variables: Record<string, string | number> = {}

  for (const [name, value] of Object.entries(rest)) {
    const kind = definitions[name]

    if (!kind) continue

    delete rest[name]

    if (value == null) continue

    const entries: [string, unknown][] = typeof value === 'object' ? Object.entries(value) : [['initial', value]]

    for (const [breakpoint, entry] of entries) {
      if (typeof entry !== 'string' && typeof entry !== 'number') continue

      const property = kind === 'textalign' ? 'textalign' : name
      names.push(styles[`${property}${breakpoint === 'initial' ? '' : breakpoint.toLowerCase()}`])
      variables[`--ui-${property}-${breakpoint.toLowerCase()}`] = cssValue(entry, kind)
    }
  }

  return {
    ...rest,
    className: clsx(
      names,
      className
    ) || undefined,
    style: Object.keys(variables).length ? { ...variables, ...style } : style,
  }
}

export { styles }
