import { themes } from '@/constant/theme'

import type { Theme } from '@/types/theme'

export const isTheme = (value: unknown): value is Theme => themes.some(theme => theme === value)
