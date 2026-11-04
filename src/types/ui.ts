import type { InputHTMLAttributes, ReactNode } from 'react'

export type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export type FieldMeta = {
  label?: ReactNode
  hint?: string
  error?: string
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> & {
  label?: ReactNode
  error?: string
}
