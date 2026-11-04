'use client'

import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'

import { acceptInvite } from '@/lib/invites/action'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'
import { Empty } from '@/modules/Empty'
import { Mutation } from '@/modules/Mutation'

import type { InviteViewProps } from './types'

import styles from './index.module.scss'

const Section = ({ result, token }: InviteViewProps) => {
  const t = useTranslations('Invite')
  const workspace = useTranslations('Workspace')
  const router = useRouter()

  if (!result.ok) return (
    <Empty
      heading="h1"
      error={result.error}
    />
  )

  const preview = result.data

  return (
    <Grid
      as="section"
      gap={4}
      my={5}
      p={{ initial: 4, tabS: 5 }}
      border
      radius="lg"
      surface="default"
    >
      <Text
        className={styles.eyebrow}
        transform="uppercase"
        mb={2}
        size={1}
        weight="bold"
        color="accent"
      >
        {t('invited')}
      </Text>
      <Heading
        as="h1"
        size={6}
      >
        {preview.group_name}
      </Heading>
      <Text color="muted">{t(preview.already_member ? 'alreadyMember' : 'joinDescription')}</Text>
      {
        preview.already_member
          ?
          <Action href={`/groups/${preview.group_id}`}>{workspace('openGroup')}
            <Icon
              name="arrow-up-right"
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
        {workspace('backDashboard')}
      </Link>
    </Grid>
  )
}

export default Section
