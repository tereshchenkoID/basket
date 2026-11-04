'use client'

import { useTranslations } from 'next-intl'
import { ArrowLeft, ChevronRight } from 'lucide-react'

import { Link, useRouter } from '@/i18n/navigation'

import { useWorkspaceRealtime } from '@/hooks/useWorkspaceRealtime'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'
import { Empty } from '@/modules/Empty'
import { Mutation } from '@/modules/Mutation'
import { updateList } from '@/modules/Shopping/action'
import { ListForm } from '@/modules/Shopping/ListForm'

import { ItemRow } from './ItemRow'
import { QuickAdd } from './QuickAdd'

import styles from './index.module.scss'

import type { ListViewProps } from '@/types/views'

const ListView = ({ data, userId }: ListViewProps) => {
  const t = useTranslations('Workspace')
  const router = useRouter()
  const status = useWorkspaceRealtime({ userId, groupId: data.list.group_id, listId: data.list.id })
  const refresh = () => router.refresh()
  const purchased = data.items.filter(item => item.is_purchased).length
  const archived = data.list.status === 'archived'

  return (
    <Box
      as="section"
      full
      py={4}
    >
      <Link
        className={styles.back}
        href={`/groups/${data.list.group_id}`}
      >
        <ArrowLeft
          size={16}
          aria-hidden="true"
        /> {t('backGroup')}
      </Link>
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
            size="xs"
            weight={700}
            color="accent"
          >
            {t(archived ? 'archived' : 'shoppingList')}
          </Text>
          <Heading
            as="h1"
            size="title"
          >
            {data.list.title}
          </Heading>
        </div>
        <Text
          className={styles.connection}
          size="sm"
          color="muted"
          data-status={status}
          role="status"
        >
          {t(`connection.${status}`)}
        </Text>
      </Box>
      <Grid
        gap={2}
        my={4}
      >
        <Text
          as="label"
          size="sm"
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
        <QuickAdd
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
                <ItemRow
                  key={item.id}
                  item={item}
                  archived={archived}
                />
              )
            }
          </ul>
      }

      <details className={styles.details}>
        <summary className={styles.summary}>
          <ChevronRight
            className={styles.chevron}
            size={16}
            aria-hidden="true"
          />
          {t('listSettings')}
        </summary>
        <ListForm
          groupId={data.list.group_id}
          list={data.list}
          onSuccess={refresh}
        />
        <Mutation
          className={styles.setting}
          label={t(archived ? 'restoreList' : 'archiveList')}
          confirmation={archived ? undefined : t('confirmArchive')}
          operation={() =>
            updateList({ listId: data.list.id, status: archived ? 'active' : 'archived' })
          }
          onSuccess={refresh}
        />
      </details>
    </Box>
  )
}

export default ListView
