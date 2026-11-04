import { cookies } from 'next/headers'

import { THEME_COOKIE } from '@/constant/theme'

import { isTheme } from '@/helpers/theme'

import 'server-only'

export const getTheme = async () => {
  const value = (await cookies()).get(THEME_COOKIE)?.value

  return isTheme(value) ? value : 'system'
}
