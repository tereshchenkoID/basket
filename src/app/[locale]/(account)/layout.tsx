import { getAccount } from '@/app/actions/account'

import type { AccountLayoutProps } from './types'

const AccountLayout = async ({ children }: AccountLayoutProps) => {
  await getAccount()

  return children
}

export default AccountLayout
