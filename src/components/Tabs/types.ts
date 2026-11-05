import type { ReactNode } from 'react'

export type TabItem = {
  value: string
  label: ReactNode
  count?: number
  disabled?: boolean
  content?: ReactNode
}

export type TabsProps = {
  items: readonly TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label: string
  disabled?: boolean
  children?: ReactNode | ((value: string) => ReactNode)
  className?: string
}
