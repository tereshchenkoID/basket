'use client'

import { useTranslations } from 'next-intl'
import { ArrowUpRight, Users } from 'lucide-react'

import { Link, useRouter } from '@/i18n/navigation'

import { useWorkspaceRealtime } from '@/hooks/useWorkspaceRealtime'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'
import { Empty } from '@/modules/Empty'
import { GroupForm } from '@/modules/Groups/GroupForm'

import styles from '@/modules/Groups/index.module.scss'

import type { DashboardViewProps } from '@/types/views'

const DashboardView = ({ groups, userId, locale }: DashboardViewProps) => {
  const t = useTranslations('Workspace')
  const router = useRouter()
  useWorkspaceRealtime({ userId })

  return (
    <Box
      full
      py={4}
    >
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
                  radius="small"
                  surface="paper"
                  href={`/groups/${group.id}`}
                  key={group.id}
                  className={styles.card}
                >
                  <Text
                    as="span"
                    className={styles.icon}
                    aria-hidden="true"
                  >
                    <Users
                      size={24}
                      aria-hidden="true"
                    />
                  </Text>
                  <Heading
                    as="h2"
                    size="xl"
                  >
                    {group.name}
                  </Heading>
                  <Text color="muted">{t('memberCount', { count: group.member_count })}</Text>
                  <Text color="muted">{t('remainingCount', { count: group.remaining_count })}</Text>
                  <Text
                    as="span"
                    className={styles.link}
                    size="sm"
                    color="accent"
                    mt={4}
                  >
                    {t('openGroup')}
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                    />
                  </Text>
                </Box>
              )
            }
          </Grid>
      }
      <Grid
        as="section"
        gap={3}
        mt={4}
        p={{ initial: 3, tabS: 5 }}
        radius="large"
        surface="paper"
      >
        <Heading
          as="h2"
          size="xl"
        >
          {t('createGroup')}
        </Heading>
        <GroupForm
          locale={locale}
          onSuccess={id => router.push(`/groups/${id}`)}
        />
      </Grid>
    </Box>
  )
}

export default DashboardView
