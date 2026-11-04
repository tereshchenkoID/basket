import type { ComponentPropsWithRef, ReactNode } from 'react'

export type DropdownProps = Omit<ComponentPropsWithRef<'details'>, 'title'> & {
  label: ReactNode
  plain?: boolean
}
