'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFormatter, useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'

import { ROUTES_USER } from '@/constant/navigation'
import { SORT_OPTIONS } from '@/constant/workspace'

import { restoreGroup } from '@/lib/groups/action'
import { useWorkspaceRealtime } from '@/hooks/useWorkspaceRealtime'
import {
  daysRemaining, readTab, sortRecords, tabQuery
} from '@/helpers/workspace'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'
import { Select } from '@/components/Select'
import { Tabs } from '@/components/Tabs'
import { Text } from '@/components/Text'
import { Empty } from '@/modules/Empty'
import { GroupForm } from '@/modules/GroupForm'
import { Mutation } from '@/modules/Mutation'

import type { DashboardViewProps } from './types'

import styles from './index.module.scss'

const Section = ({ result, userId, locale, now }: DashboardViewProps) => {
  const t = useTranslations('Dashboard')
  const workspace = useTranslations('Workspace')
  const formatter = useFormatter()
  const router = useRouter()
  const search = useSearchParams()
  const tab = readTab(search.toString(), 'deleted')
  const [sort, setSort] = useState({ active: 'newest', deleted: 'newest' })

  useWorkspaceRealtime({ userId })

  if (!result.ok) return <Empty
    heading="h1"
    error={result.error}
                         />

  const active = result.data.filter(group => !group.deleted_at)
  const deleted = result.data.filter(group => group.deleted_at)
  const groups = sortRecords(tab === 'active' ? active : deleted, sort[tab], locale,
    group => group.name, group => group.deleted_at ?? group.created_at)

  const handleCreate = (id: string) => router.push(ROUTES_USER.group.url(id))

  const handleTabChange = (value: string) => window.history.pushState(null, '', tabQuery(search.toString(), value))

  const handleSort = (value: string) => setSort(current => ({ ...current, [tab]: value }))

  const handleRestore = (groupId: string) => restoreGroup({ groupId })

  const handleRefresh = () => router.refresh()

  return (
    <Box
      as="section"
      full
      py={4}
    >
      <Text
        className={styles.eyebrow}
        transform="uppercase"
        mb={2}
        size={1}
        weight="bold"
        color="accent"
      >
        {t('eyebrow')}
      </Text>
      <Heading
        as="h1"
        size={6}
        mb={4}
      >
        {workspace('dashboard')}
      </Heading>
      <Grid
        as="section"
        gap={3}
        mb={4}
        p={{ initial: 3, tabS: 5 }}
        radius="lg"
        surface="default"
      >
        <Heading
          as="h2"
          size={5}
        >
          {workspace('createGroup')}
        </Heading>
        <GroupForm
          locale={locale}
          onSuccess={handleCreate}
        />
      </Grid>
      <Tabs
        label={workspace('backDashboard')}
        value={tab}
        onValueChange={handleTabChange}
        items={[
          { value: 'active', label: workspace('tabs.active'), count: active.length },
          { value: 'deleted', label: workspace('tabs.deleted'), count: deleted.length },
        ]}
      >
        <Grid gap={3}>
          <Box
            display="flex"
            justify="end"
          >
            <Select
              className={styles.sort}
              ariaLabel={workspace('sort.label')}
              value={sort[tab]}
              options={SORT_OPTIONS.filter(value => tab === 'active' || value !== 'nameDesc').map(value => ({
                value,
                label: workspace(`sort.${value === 'newest' && tab === 'deleted' ? 'deletedNewest' : value === 'oldest' && tab === 'deleted' ? 'deletedOldest' : value}`),
              }))}
              onChange={handleSort}
            />
          </Box>
          {
            groups.length === 0
              ?
              <Empty
                title={t(tab === 'deleted' ? 'emptyDeleted' : 'startFamily')}
                description={tab === 'active' ? t('startDescription') : ''}
              />
              :
              <Grid
                columns={{ initial: 1, mobM: 2, tabM: 3 }}
                gap={3}
                mb={5}
                align="start"
              >
                {
                  groups.map(group =>
                    group.deleted_at
                      ?
                      <Grid
                        key={group.id}
                        as="article"
                        gap={3}
                        p={4}
                        border
                        radius="sm"
                        surface="default"
                      >
                        <Heading
                          as="h2"
                          size={5}
                        >
                          {group.name}
                        </Heading>
                        <Text
                          size={2}
                          color="muted"
                        >
                          {t('deletedOn', { date: formatter.dateTime(new Date(group.deleted_at), { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) })}
                        </Text>
                        <Text
                          size={2}
                          color="muted"
                        >
                          {t('daysLeft', { count: daysRemaining(group.deleted_at, now) })}
                        </Text>
                        <Mutation
                          label={t('restore')}
                          disabled={daysRemaining(group.deleted_at, now) === 0}
                          operation={() => handleRestore(group.id)}
                          onSuccess={handleRefresh}
                        />
                      </Grid>
                      :
                      <Box
                        as={Link}
                        p={4}
                        border
                        radius="sm"
                        surface="default"
                        href={ROUTES_USER.group.url(group.id)}
                        key={group.id}
                        className={styles.card}
                      >
                        <Text
                          as="span"
                          className={styles.icon}
                          aria-hidden="true"
                        >
                          <Icon
                            name="users"
                            size={24}
                            aria-hidden="true"
                          />
                        </Text>
                        <Heading
                          as="h2"
                          size={5}
                        >
                          {group.name}
                        </Heading>
                        {
                          group.role &&
                          <Text
                            size={2}
                            color="accent"
                          >
                            {workspace(`roles.${group.role}`)}
                          </Text>
                        }
                        <Text color="muted">{t('memberCount', { count: group.member_count })}</Text>
                        <Text color="muted">{t('remainingCount', { count: group.remaining_count })}</Text>
                        <Text
                          as="span"
                          className={styles.link}
                          size={2}
                          color="accent"
                          mt={4}
                        >
                          {workspace(ROUTES_USER.group.text)}
                          <Icon
                            name="arrow-up-right"
                            size={16}
                            aria-hidden="true"
                          />
                        </Text>
                      </Box>
                  )
                }
              </Grid>
          }
        </Grid>
      </Tabs>
    </Box>
  )
}

export default Section
