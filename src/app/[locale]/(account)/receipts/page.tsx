import { getTranslations } from 'next-intl/server'

import { getAccount } from '@/app/actions/account'

import { getReceiptDrafts } from '@/lib/receipts/query'
import { getStores } from '@/lib/stores/query'

import Section from './_view'

export const generateMetadata = async () => {
  const t = await getTranslations('Receipts')

  return { title: t('scan'), robots: { index: false, follow: false } }
}

const Receipts = async () => {
  await getAccount()
  const [drafts, stores] = await Promise.all([getReceiptDrafts(), getStores()])

  return <Section
    drafts={drafts}
    available={stores.available}
         />
}

export default Receipts
