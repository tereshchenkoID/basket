
import { getAccount } from '@/app/actions/account'

import { getGroups } from '@/lib/groups/query'
import { getReceiptHistory } from '@/lib/receipts/query'
import { getStores } from '@/lib/stores/query'

import Section from './_view'
import type { HistoryPageProps } from './types'

const History = async ({ searchParams }: HistoryPageProps) => {
  await getAccount()
  const filters = await searchParams
  const [
    result,
    groups,
    stores
  ] = await Promise.all([
    getReceiptHistory(filters),
    getGroups(),
    getStores()
  ])

  return (
    <Section
      filters={filters}
      result={result}
      groups={groups.ok ? groups.data.filter(group => !group.deleted_at) : []}
      stores={stores.stores}
    />
  )
}

export default History
