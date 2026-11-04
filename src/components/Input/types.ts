import type { ComponentPropsWithRef } from 'react'

import type { FieldMeta } from '@/types/ui'

export type InputProps = ComponentPropsWithRef<'input'> & FieldMeta & {
  isLoading?: boolean
}
