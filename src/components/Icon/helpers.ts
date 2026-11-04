import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import * as LUCIDE_ICONS from 'lucide-react'

import Google from './Google'

const REGISTRY: typeof LUCIDE_ICONS.icons = LUCIDE_ICONS

export const ICON_COMPONENTS: Readonly<Record<string, ComponentType<LucideProps> | undefined>> = { ...REGISTRY, Google }

export const getIconName = (name: string): string =>
  name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
