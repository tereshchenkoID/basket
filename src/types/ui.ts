import type {
  ComponentProps,
  ComponentPropsWithRef,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  RefObject,
} from 'react'
import type { LucideIcon } from 'lucide-react'

import type { Link } from '@/i18n/navigation'

import type { TypographyProps } from './primitives'

export type HeadingProps = TypographyProps & Omit<HTMLAttributes<HTMLHeadingElement>, keyof TypographyProps> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export type TextProps = TypographyProps & Omit<HTMLAttributes<HTMLElement>, keyof TypographyProps> & {
  as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em' | 'label'
  htmlFor?: string
  tone?: 'default' | 'muted' | 'error' | 'success'
}

export type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export type ActionStyleProps = {
  variant?: ActionVariant
  isLoading?: boolean
  iconOnly?: boolean
}

export type ActionProps = ActionStyleProps & (
  | (ComponentPropsWithRef<'button'> & { href?: never })
  | (Omit<ComponentProps<typeof Link>, 'className'> & { className?: string; href: ComponentProps<typeof Link>['href'] })
)

export type FieldProps = {
  id: string
  label?: ReactNode
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

export type FieldMeta = Pick<FieldProps, 'label' | 'hint' | 'error'>

export type InputProps = ComponentPropsWithRef<'input'> & FieldMeta & {
  isLoading?: boolean
}

export type TextareaProps = ComponentPropsWithRef<'textarea'> & FieldMeta & {
  isLoading?: boolean
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> & {
  label?: ReactNode
  error?: string
}

export type ToggleProps = CheckboxProps

export type SelectOption<Value extends string> = {
  value: Value
  label: string
  shortLabel?: string
  icon?: LucideIcon
  disabled?: boolean
}

export type SelectProps<Value extends string> = FieldMeta & {
  id?: string
  name?: string
  options: readonly SelectOption<Value>[]
  value?: Value
  defaultValue?: Value
  onChange?: (value: Value) => void
  placeholder?: string
  ariaLabel?: string
  disabled?: boolean
  required?: boolean
  isLoading?: boolean
  className?: string
}

export type SelectPosition = {
  top: number
  left: number
  width: number
  maxHeight: number
}

export type DismissOptions = {
  refs: readonly RefObject<HTMLElement | null>[]
  enabled: boolean
  onDismiss: (reason: 'outside' | 'escape') => void
}

export type ConfirmProps = {
  label: string
  description: string
  onConfirm: () => void
  disabled?: boolean
}
