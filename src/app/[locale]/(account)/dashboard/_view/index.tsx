'use client'

import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'

import { useWorkspaceRealtime } from '@/hooks/useWorkspaceRealtime'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'
import { Empty } from '@/modules/Empty'
import { GroupForm } from '@/modules/GroupForm'

import type { DashboardViewProps } from './types'

import styles from './index.module.scss'

const Section = ({ result, userId, locale }: DashboardViewProps) => {
  const t = useTranslations('Dashboard')
  const workspace = useTranslations('Workspace')
  const router = useRouter()

  useWorkspaceRealtime({ userId })

  if (!result.ok) return (
    <Empty
      heading="h1"
      error={result.error}
    />
  )

  const groups = result.data

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
          onSuccess={id => router.push(`/groups/${id}`)}
        />
      </Grid>
      {
        groups.length === 0
          ?
          <Empty
            title={t('startFamily')}
            description={t('startDescription')}
          />
          :
          <Grid
            columns={{ initial: 1, mobM: 2, tabM: 3 }}
            gap={3}
            mb={5}
          >
            {
              groups.map(group =>
                <Box
                  as={Link}
                  p={4}
                  border
                  radius="sm"
                  surface="default"
                  href={`/groups/${group.id}`}
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
                  <Text color="muted">{t('memberCount', { count: group.member_count })}</Text>
                  <Text color="muted">{t('remainingCount', { count: group.remaining_count })}</Text>
                  <Text
                    as="span"
                    className={styles.link}
                    size={2}
                    color="accent"
                    mt={4}
                  >
                    {workspace('openGroup')}
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
    </Box>
  )
}

export default Section
