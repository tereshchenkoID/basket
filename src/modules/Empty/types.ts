import type { ReactNode } from 'react'

import type { ActionError } from '@/types/action'

export type EmptyProps = {
  full?: boolean
  error?: ActionError
  title?: string
  description?: string
  heading?: 'h1' | 'h2' | 'h3'
  children?: ReactNode
}
