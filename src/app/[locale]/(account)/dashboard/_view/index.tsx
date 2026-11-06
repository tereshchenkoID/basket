'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFormatter, useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'

import { NAVIGATION, ROUTES_USER } from '@/constant/navigation'
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
import { Breadcrumbs } from '@/modules/Breadcrumbs'
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
    group => group.name, group => group.created_at)

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
      <Breadcrumbs
        items={[
          { label: workspace(NAVIGATION.home.text), href: NAVIGATION.home.url },
          { label: workspace('dashboard') },
        ]}
      />
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
              options={SORT_OPTIONS.map(value => ({
                value,
                label: workspace(`sort.${value}`),
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
                          {workspace('createdOn', { date: formatter.dateTime(new Date(group.created_at), { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) })}
                        </Text>
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
                      <Grid
                        as={Link}
                        p={4}
                        gap={3}
                        border
                        radius="sm"
                        surface="default"
                        href={ROUTES_USER.group.url(group.id)}
                        key={group.id}
                        className={styles.card}
                      >
                        <Box
                          display="flex"
                          align="start"
                          gap={3}
                        >
                          <Box
                            className={styles.icon}
                            aria-hidden="true"
                          >
                            <Icon
                              name="users"
                              size={24}
                              aria-hidden="true"
                            />
                          </Box>
                          <Grid gap={1}>
                            <Heading
                              as="h2"
                              size={5}
                            >
                              {group.name}
                            </Heading>
                            {
                              group.role &&
                              <Text
                                size={1}
                                color="accent"
                              >
                                {workspace(`roles.${group.role}`)}
                              </Text>
                            }
                          </Grid>
                        </Box>
                        <Grid
                          gap={1}
                          p={3}
                          surface="soft"
                          radius="sm"
                        >
                          <Text size={2}>{t('memberCount', { count: group.member_count })}</Text>
                          <Text size={2}>{t('remainingCount', { count: group.remaining_count })}</Text>
                        </Grid>
                        <Text
                          size={1}
                          color="muted"
                        >
                          {workspace('createdOn', { date: formatter.dateTime(new Date(group.created_at), { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) })}
                        </Text>
                        <Text
                          as="span"
                          className={styles.link}
                          size={2}
                          weight="semibold"
                          color="accent"
                        >
                          {workspace(ROUTES_USER.group.text)}
                          <Icon
                            name="arrow-up-right"
                            size={16}
                            aria-hidden="true"
                          />
                        </Text>
                      </Grid>
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
