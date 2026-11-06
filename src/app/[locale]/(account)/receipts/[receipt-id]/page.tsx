import { getAccount } from '@/app/actions/account'

import { getGroups } from '@/lib/groups/query'
import { getReceipt } from '@/lib/receipts/query'
import { getStores } from '@/lib/stores/query'

import Section from './_view'
import type { ReceiptPageProps } from './types'

const Receipt = async ({ params }: ReceiptPageProps) => {
  const [user, { 'receipt-id': id }] = await Promise.all([getAccount(), params])
  const [
    result,
    groups,
    stores
  ] = await Promise.all([
    getReceipt(id),
    getGroups(),
    getStores()
  ])

  return (
    <Section
      result={result}
      userId={user.id}
      groups={groups.ok ? groups.data.filter(group => !group.deleted_at) : []}
      stores={stores.stores}
    />
  )
}

export default Receipt
