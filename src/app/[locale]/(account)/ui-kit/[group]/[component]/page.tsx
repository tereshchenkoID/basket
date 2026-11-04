import { notFound } from 'next/navigation'

import { getAccount } from '@/app/actions/account'

import { CATALOG } from '../../catalog'
import { EXAMPLES } from '../../examples'

import Section from './_view'
import type { CatalogComponentPageProps } from './types'

const ComponentPage = async ({ params }: CatalogComponentPageProps) => {
  const [
    { group, component }
  ] = await Promise.all([
    params,
    getAccount(),
  ])
  const entry = CATALOG.find(value => value.group === group && value.slug === component)

  if (!entry) notFound()

  return (
    <Section
      key={entry.name}
      entry={entry}
      example={EXAMPLES[entry.name]}
    />
  )
}

export default ComponentPage
