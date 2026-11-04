import type { ComponentProps, ComponentPropsWithRef } from 'react'

import type { Link } from '@/i18n/navigation'

import type { ActionVariant } from '@/types/ui'

export type ActionStyleProps = {
  variant?: ActionVariant
  isLoading?: boolean
  iconOnly?: boolean
}

export type ActionProps = ActionStyleProps & (
  | (ComponentPropsWithRef<'button'> & { href?: never })
  | (Omit<ComponentProps<typeof Link>, 'className'> & { className?: string; href: ComponentProps<typeof Link>['href'] })
)
