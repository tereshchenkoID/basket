import { THEME_COOKIE } from '@/constant/theme'

import type { Theme } from '@/types/theme'

export const saveTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
}
