import { notFound } from 'next/navigation'

import { getAccount } from '@/app/actions/account'

import { CATALOG } from '../catalog'

import Section from './_view'
import type { CatalogGroupPageProps } from './types'

const Group = async ({ params }: CatalogGroupPageProps) => {
  const [
    { group }
  ] = await Promise.all([
    params,
    getAccount(),
  ])
  const entries = CATALOG.filter(entry => entry.group === group)

  if (!entries.length) notFound()

  return (
    <Section
      group={group}
      entries={entries}
    />
  )
}

export default Group
