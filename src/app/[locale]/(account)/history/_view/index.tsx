'use client'

import type { SubmitEvent } from 'react'
import { useFormatter, useTranslations } from 'next-intl'

import { useRouter } from '@/i18n/navigation'

import { NAVIGATION, ROUTES_USER } from '@/constant/navigation'
import { RECEIPT_TIME_ZONE } from '@/constant/receipts'
import { RECEIPT_LIMITS } from '@/constant/receipts'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'
import { Breadcrumbs } from '@/modules/Breadcrumbs'
import { Empty } from '@/modules/Empty'

import type { HistoryViewProps } from './types'

const Section = ({ filters, result, stores, groups }: HistoryViewProps) => {
  const t = useTranslations('Receipts')
  const workspace = useTranslations('Workspace')
  const formatter = useFormatter()
  const router = useRouter()
  const page = Math.max(1, Math.min(10000, Number.parseInt(filters.page ?? '', 10) || 1))

  const handleFilter = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const query = new URLSearchParams()

    for (const key of ['store', 'group', 'from', 'until', 'sort']) {
      const value = form.get(key)

      if (typeof value === 'string' && value && value !== 'all') query.set(key, value)
    }
    router.push(`${ROUTES_USER.history.url}?${query}`)
  }

  const handlePage = (value: number) => {
    const query = new URLSearchParams()

    for (const key of ['store', 'group', 'from', 'until', 'sort'] as const) {
      if (filters[key]) query.set(key, filters[key])
    }
    query.set('page', String(value))
    router.push(`${ROUTES_USER.history.url}?${query}`)
  }

  const handlePrevious = () => handlePage(page - 1)

  const handleNext = () => handlePage(page + 1)

  if (!result.ok) return (
    <Empty
      error={result.error}
      heading="h1"
    />
  )

  const total = result.data[0]?.total_count ?? 0

  return (
    <Grid
      as="section"
      full
      py={4}
      gap={4}
    >
      <Breadcrumbs
        items={[
          { label: workspace(NAVIGATION.home.text), href: NAVIGATION.home.url },
          { label: t('history') },
        ]}
      />
      <Box
        display="flex"
        wrap="wrap"
        align="center"
        justify="between"
        gap={2}
      >
        <Heading
          as="h1"
          size={6}
        >
          {t('history')}
        </Heading>
        <Action href={ROUTES_USER.scan.url}>{t('scan')}</Action>
      </Box>
      <Grid
        as="form"
        gap={3}
        onSubmit={handleFilter}
      >
        <Grid
          columns={{ initial: 1, tabS: 2, tabM: 3 }}
          gap={3}
          align="end"
        >
          <Select
            label={t('store')}
            name="store"
            defaultValue={filters.store ?? 'all'}
            options={[{ value: 'all', label: t('allStores') }, ...stores.map(store => ({ value: store.id, label: store.name }))]}
          />
          <Select
            label={t('group')}
            name="group"
            defaultValue={filters.group ?? 'all'}
            options={[{ value: 'all', label: t('allGroups') }, { value: 'personal', label: t('personal') }, ...groups.map(group => ({ value: group.id, label: group.name }))]}
          />
          <Select
            label={t('sort')}
            name="sort"
            defaultValue={filters.sort === 'oldest' ? 'oldest' : 'newest'}
            options={[{ value: 'newest', label: t('newest') }, { value: 'oldest', label: t('oldest') }]}
          />
          <Input
            type="date"
            name="from"
            label={t('from')}
            defaultValue={filters.from}
          />
          <Input
            type="date"
            name="until"
            label={t('until')}
            defaultValue={filters.until}
          />
          <Action type="submit">{t('filter')}</Action>
        </Grid>
        {/*<Box display="flex"><Action type="submit">{t('filter')}</Action></Box>*/}
      </Grid>
      {
        result.data.length
          ?
          <Grid
            columns={{ initial: 1, tabS: 2 }}
            gap={3}
          >
            {
              result.data.map(receipt =>
                <Grid
                  as="article"
                  key={receipt.id}
                  gap={2}
                  p={3}
                  border
                  radius="sm"
                  surface="default"
                >
                  <Heading
                    as="h2"
                    size={5}
                  >
                    {receipt.store_name_snapshot}
                  </Heading>
                  <Text>{receipt.purchased_at && formatter.dateTime(new Date(receipt.purchased_at), { dateStyle: 'medium', timeStyle: 'short', timeZone: RECEIPT_TIME_ZONE })}</Text>
                  <Text weight="semibold">{receipt.receipt_total} {receipt.currency}</Text>
                  <Text color="muted">{t('itemCount', { count: receipt.item_count })}</Text>
                  <Text>{receipt.group_name ?? t('personal')}</Text>
                  {
                    receipt.group_id &&
                    <Text
                      size={2}
                      color="muted"
                    >
                      {t('author', { name: receipt.author_name ?? t('unknown') })}
                    </Text>
                  }
                  <Action
                    href={ROUTES_USER.receipt.url(receipt.id)}
                    variant="secondary"
                  >
                    {t('details')}
                  </Action>
                </Grid>
              )
            }
          </Grid>
          :
          <Empty
            full
            title={t('noPurchases')}
            description={t('noPurchasesHelp')}
          />
      }
      <Box
        display="flex"
        gap={2}
        wrap="wrap"
        align="center"
        justify="center"
        as="nav"
        aria-label={t('pagination')}
      >
        <Action
          variant="secondary"
          iconOnly
          aria-label={t('previous')}
          onClick={handlePrevious}
          disabled={page === 1}
        >
          <Icon
            name="chevron-left"
            size={20}
            aria-hidden="true"
          />
        </Action>
        <Text>{t('page', { number: page })}</Text>
        <Action
          variant="secondary"
          iconOnly
          aria-label={t('next')}
          onClick={handleNext}
          disabled={page * RECEIPT_LIMITS.page >= total}
        >
          <Icon
            name="chevron-right"
            size={20}
            aria-hidden="true"
          />
        </Action>
      </Box>
    </Grid>
  )
}

export default Section
