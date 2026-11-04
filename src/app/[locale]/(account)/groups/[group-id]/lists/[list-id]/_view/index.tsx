'use client'

import { useTranslations } from 'next-intl'

import { useRouter } from '@/i18n/navigation'

import { updateList } from '@/lib/shopping/action'
import { useWorkspaceRealtime } from '@/hooks/useWorkspaceRealtime'

import { Box } from '@/components/Box'
import { Dropdown } from '@/components/Dropdown'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'
import { Breadcrumbs } from '@/modules/Breadcrumbs'
import { Connection } from '@/modules/Connection'
import { Empty } from '@/modules/Empty'
import { ListForm } from '@/modules/ListForm'
import { Mutation } from '@/modules/Mutation'

import { Add } from './Add'
import { Item } from './Item'
import type { ListViewProps } from './types'

import styles from './index.module.scss'

const Section = ({ result, userId }: ListViewProps) => {
  const t = useTranslations('List')
  const workspace = useTranslations('Workspace')
  
  const router = useRouter()
  const status = useWorkspaceRealtime({ userId, groupId: result.ok ? result.data.list.group_id : undefined, listId: result.ok ? result.data.list.id : undefined })

  if (!result.ok) return (
    <Empty
      heading="h1"
      error={result.error}
    />
  )

  const data = result.data

  const refresh = () => router.refresh()
  const purchased = data.items.filter(item => item.is_purchased).length
  const archived = data.list.status === 'archived'

  return (
    <Box
      as="section"
      full
      py={4}
    >
      <Breadcrumbs
        items={[
          { label: workspace('home'), href: '/' },
          { label: workspace('backDashboard'), href: '/dashboard' },
          { label: data.group.name, href: `/groups/${data.group.id}` },
          { label: data.list.title },
        ]}
      />
      <Box
        display="flex"
        justify="between"
        align="center"
        wrap="wrap"
        gap={3}
        mt={2}
        mb={3}
      >
        <div>
          <Text
            className={styles.eyebrow}
            transform="uppercase"
            mb={2}
            size={1}
            weight="bold"
            color="accent"
          >
            {t(archived ? 'archived' : 'shoppingList')}
          </Text>
          <Heading
            as="h1"
            size={6}
          >
            {data.list.title}
          </Heading>
        </div>
        <Connection status={status} />
      </Box>
      <Grid
        gap={2}
        my={4}
      >
        <Text
          as="label"
          size={2}
          color="muted"
          htmlFor="shopping-progress"
        >
          {t('progress', { done: purchased, total: data.items.length })}
        </Text>
        <progress
          className={styles.bar}
          id="shopping-progress"
          value={purchased}
          max={Math.max(data.items.length, 1)}
        />
      </Grid>
      {
        !archived &&
        <Add
          listId={data.list.id}
          onSuccess={refresh}
        />
      }
      {
        data.items.length === 0
          ?
          <Empty
            title={t('emptyList')}
            description={t('emptyListDescription')}
          />
          :
          <ul className={styles.items}>
            {
              data.items.map(item =>
                <Item
                  key={item.id}
                  item={item}
                  archived={archived}
                />
              )
            }
          </ul>
      }
      <Dropdown label={t('listSettings')}>
        <ListForm
          groupId={data.list.group_id}
          list={data.list}
          onSuccess={refresh}
        />
        <Mutation
          className={styles.setting}
          label={t(archived ? 'restoreList' : 'archiveList')}
          variant={archived ? 'secondary' : 'danger'}
          confirmation={archived ? undefined : t('confirmArchive')}
          operation={() =>
            updateList({ listId: data.list.id, status: archived ? 'active' : 'archived' })
          }
          onSuccess={refresh}
        />
      </Dropdown>
    </Box>
  )
}

export default Section
