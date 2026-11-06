import type { IconProps } from '@/components/Icon/types'

import type { ActionVariant } from '@/types/ui'

export type ConfirmProps = {
  title?: string
  label: string
  confirmLabel?: string
  ariaLabel?: string
  description: string
  onConfirm: () => void
  disabled?: boolean
  variant?: ActionVariant
  icon?: IconProps['name']
  iconOnly?: boolean
  isLoading?: boolean
}
