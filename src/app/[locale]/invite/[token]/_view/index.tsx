'use client'

import { useTranslations } from 'next-intl'
import { ArrowUpRight } from 'lucide-react'

import { Link, useRouter } from '@/i18n/navigation'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'
import { acceptInvite } from '@/modules/Invites/action'
import { Mutation } from '@/modules/Mutation'

import styles from '@/modules/Groups/index.module.scss'

import type { InviteViewProps } from '@/types/views'

const InviteView = ({ preview, token }: InviteViewProps) => {
  const t = useTranslations('Workspace')
  const router = useRouter()

  return (
    <Grid
      as="section"
      gap={4}
      my={5}
      p={{ initial: 4, tabS: 5 }}
      border
      radius="large"
      surface="paper"
    >
      <Text
        className={styles.eyebrow}
        size="xs"
        weight={700}
        color="accent"
      >
        {t('invited')}
      </Text>
      <Heading
        as="h1"
        size="title"
      >
        {preview.group_name}
      </Heading>
      <Text color="muted">{t(preview.already_member ? 'alreadyMember' : 'joinDescription')}</Text>
      {
        preview.already_member
          ?
          <Action href={`/groups/${preview.group_id}`}>{t('openGroup')}
            <ArrowUpRight
              size={16}
              aria-hidden="true"
            /></Action>
          :
          <Mutation
            label={t('joinGroup')}
            operation={() => acceptInvite({ token })}
            onSuccess={groupId => router.replace(`/groups/${groupId}`)}
          />
      }
      <Link
        className={styles.back}
        href="/dashboard"
      >
        {t('backDashboard')}
      </Link>
    </Grid>
  )
}

export default InviteView
