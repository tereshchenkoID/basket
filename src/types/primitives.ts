import type { ComponentPropsWithRef, ElementType } from 'react'

export type Breakpoint = 'initial' | 'mobS' | 'mobM' | 'tabS' | 'tabM' | 'tabL' | 'deskS' | 'deskM'

export type Responsive<Value> = Value | Partial<Record<Breakpoint, Value>>

export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type TextSize = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold'

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'

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
  surface?: 'default' | 'soft'
  radius?: 'sm' | 'lg'
  border?: boolean
}

export type TypographyProps = SpacingProps & {
  size?: Responsive<TextSize>
  weight?: Responsive<TextWeight>
  transform?: Responsive<TextTransform>
  color?: TextColor
  align?: Responsive<'start' | 'center' | 'end'>
  family?: 'base' | 'accent'
}

export type PrimitiveProps<Tag extends ElementType, OwnProps> = OwnProps & {
  as?: Tag
} & Omit<ComponentPropsWithRef<NoInfer<Tag>>, keyof OwnProps | 'as'>
