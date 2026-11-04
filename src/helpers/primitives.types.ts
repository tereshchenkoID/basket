import type { CSSProperties } from 'react'

export type PrimitiveKind = 'space' | 'raw' | 'columns' | 'size' | 'color' | 'justify' | 'textalign' | 'family' | 'weight'

export type PrimitiveDefinitions = Record<string, PrimitiveKind>

export type PrimitiveAttributes = Record<string, unknown> & {
  className?: string
  style?: CSSProperties
}
