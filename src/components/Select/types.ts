import type { IconProps } from '@/components/Icon/types'

import type { FieldMeta } from '@/types/ui'

export type SelectOption<Value extends string> = {
  value: Value
  label: string
  shortLabel?: string
  icon?: IconProps['name']
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
