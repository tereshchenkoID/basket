import { getAccount } from '@/app/actions/account'

import Section from './_view'

const UIKit = async () => {
  await getAccount()

  return <Section />
}

export default UIKit
