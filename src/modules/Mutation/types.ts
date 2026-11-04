import type { IconProps } from '@/components/Icon/types'

import type { ActionResult } from '@/types/action'
import type { ActionVariant } from '@/types/ui'

export type MutationProps<T> = {
  label: string
  ariaLabel?: string
  operation: (id: string) => Promise<ActionResult<T>>
  onSuccess?: (data: T) => void
  confirmation?: string
  variant?: ActionVariant
  icon?: IconProps['name']
  iconOnly?: boolean
  disabled?: boolean
  compact?: boolean
  className?: string
}
