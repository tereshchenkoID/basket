import type { ComponentPropsWithRef } from 'react'

import type { FieldMeta } from '@/types/ui'

export type TextareaProps = ComponentPropsWithRef<'textarea'> & FieldMeta & {
  isLoading?: boolean
}
