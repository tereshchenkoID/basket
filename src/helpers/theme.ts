import { THEMES } from '@/constant/theme'

import type { Theme } from '@/types/theme'

export const isTheme = (value: unknown): value is Theme => THEMES.some(theme => theme === value)
