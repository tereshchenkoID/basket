import { cookies } from 'next/headers'

import { themeCookie } from '@/constant/theme'

import { isTheme } from '@/helpers/theme'

import 'server-only'

export const getTheme = async () => {
  const value = (await cookies()).get(themeCookie)?.value

  return isTheme(value) ? value : 'system'
}
