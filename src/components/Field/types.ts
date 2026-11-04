import type { ReactNode } from 'react'

import type { FieldMeta } from '@/types/ui'

export type FieldProps = FieldMeta & {
  id: string
  className?: string
  children: ReactNode
}
