import type { ComponentPropsWithRef, CSSProperties, ElementType } from 'react'

export type Breakpoint = 'initial' | 'mobS' | 'mobM' | 'tabS' | 'tabM' | 'tabL' | 'deskS' | 'deskM'

export type Responsive<Value> = Value | Partial<Record<Breakpoint, Value>>

export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'title' | 'hero'

export type TextColor = 'default' | 'muted' | 'error' | 'success' | 'accent'

export type SpacingProps = {
  [Key in 'm' | 'mx' | 'my' | 'mt' | 'mb']?: Responsive<Space | 'auto'>
} & {
  [Key in 'p' | 'px' | 'py' | 'pt' | 'pb' | 'gap']?: Responsive<Space>
}

export type LayoutProps = SpacingProps & {
  display?: Responsive<'block' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'none'>
  direction?: Responsive<'row' | 'column'>
  wrap?: Responsive<'wrap' | 'nowrap'>
  align?: Responsive<'start' | 'center' | 'end' | 'stretch' | 'baseline'>
  justify?: Responsive<'start' | 'center' | 'end' | 'between'>
  grow?: boolean
  full?: boolean
  container?: boolean
  surface?: 'paper' | 'soft'
  radius?: 'small' | 'large'
  border?: boolean
}

export type TypographyProps = SpacingProps & {
  size?: Responsive<TextSize>
  weight?: 400 | 500 | 600 | 650 | 700
  color?: TextColor
  align?: Responsive<'start' | 'center' | 'end'>
  family?: 'base' | 'accent'
}

export type PrimitiveProps<Tag extends ElementType, OwnProps> = OwnProps & {
  as?: Tag
} & Omit<ComponentPropsWithRef<NoInfer<Tag>>, keyof OwnProps | 'as'>

export type BoxProps<Tag extends ElementType = 'div'> = PrimitiveProps<Tag, LayoutProps>

export type GridProps<Tag extends ElementType = 'div'> = PrimitiveProps<Tag, LayoutProps & {
  columns?: Responsive<number | string>
}>

export type PrimitiveKind = 'space' | 'raw' | 'columns' | 'size' | 'color' | 'justify' | 'textalign' | 'family'

export type PrimitiveDefinitions = Record<string, PrimitiveKind>

export type PrimitiveAttributes = Record<string, unknown> & {
  className?: string
  style?: CSSProperties
}
