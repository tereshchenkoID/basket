'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, ArrowUpRight, ChevronRight } from 'lucide-react'

import { Link, useRouter } from '@/i18n/navigation'

import { copyText } from '@/lib/platform/clipboard'
import { useWorkspaceRealtime } from '@/hooks/useWorkspaceRealtime'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Input } from '@/components/Input'
import { Text } from '@/components/Text'
import { Avatar } from '@/modules/Avatar'
import { removeMember } from '@/modules/Groups/action'
import { GroupForm } from '@/modules/Groups/GroupForm'
import { createInvite, revokeInvite } from '@/modules/Invites/action'
import { Mutation } from '@/modules/Mutation'
import { ListForm } from '@/modules/Shopping/ListForm'

import styles from '@/modules/Groups/index.module.scss'

import type { GroupViewProps } from '@/types/views'
import type { InvitationLink } from '@/types/workspace'

const GroupView = ({ data, userId, locale }: GroupViewProps) => {
  const t = useTranslations('Workspace')
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationLink | null>(null)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const status = useWorkspaceRealtime({ userId, groupId: data.group.id })
  const owner = data.members.find(member => member.user_id === userId)?.role === 'owner'
  const refresh = () => router.refresh()
  const active = data.lists.filter(list => list.status === 'active')
  const archived = data.lists.filter(list => list.status === 'archived')
  const liveInvites = data.invites.filter(
    invite =>
      !invite.revoked_at && invite.use_count === 0 && new Date(invite.expires_at) > new Date(),
  )

  const copy = async () => {
    if (!invitation) return

    setCopyError(false)

    try {
      await copyText(invitation.url)
      setCopied(true)
    } catch {
      setCopyError(true)
      setCopied(false)
    }
  }

  return (
    <Box
      as="section"
      full
      py={4}
    >
      <Link
        className={styles.back}
        href="/dashboard"
      >
        <ArrowLeft
          size={16}
          aria-hidden="true"
        />
        {t('backDashboard')}
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
            {t(owner ? 'owner' : 'member')}
          </Text>
          <Heading
            as="h1"
            size="title"
          >
            {data.group.name}
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
          {t('lists')}
        </Heading>
        <ListForm
          groupId={data.group.id}
          onSuccess={id => router.push(`/groups/${data.group.id}/lists/${id}`)}
        />
        {
          active.length
            ?
            <Grid
              columns={{ initial: 1, mobM: 2, tabM: 3 }}
              gap={3}
            >
              {
                active.map(list =>
                  <Box
                    as={Link}
                    p={4}
                    border
                    radius="small"
                    surface="paper"
                    key={list.id}
                    className={styles.card}
                    href={`/groups/${data.group.id}/lists/${list.id}`}
                  >
                    <Heading
                      as="h3"
                      size="lg"
                      mb={2}
                    >
                      {list.title}
                    </Heading>
                    <Box
                      as="span"
                      display="inline-flex"
                      align="center"
                      gap={2}
                    >
                      <Text as="span">{t('openList')}</Text>
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                      />
                    </Box>
                  </Box>
                )
              }
            </Grid>
            :
            <Text color="muted">{t('noLists')}</Text>
        }

        {
          archived.length > 0 &&
          <details className={styles.details}>
            <summary className={styles.summary}>
              <ChevronRight
                className={styles.chevron}
                size={16}
                aria-hidden="true"
              />
              {t('archivedLists')}
            </summary>
            <Grid
              columns={{ initial: 1, mobM: 2, tabM: 3 }}
              gap={3}
            >
              {
                archived.map(list =>
                  <Box
                    as={Link}
                    p={4}
                    border
                    radius="small"
                    surface="paper"
                    key={list.id}
                    className={styles.card}
                    href={`/groups/${data.group.id}/lists/${list.id}`}
                  >
                    {list.title}
                  </Box>
                )
              }
            </Grid>
          </details>
        }
      </Grid>
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
          {t('members')}
        </Heading>
        <ul className={styles.members}>
          {
            data.members.map(member =>
              <li
                className={styles.member}
                key={member.user_id}
              >
                <Avatar
                  name={member.display_name || t('unnamed')}
                  url={member.avatar_url}
                />
                <Box
                  grow
                >
                  <Text as="strong">{member.display_name || t('unnamed')}</Text>
                  <Text
                    as="small"
                    size="sm"
                    color="muted"
                    mt={1}
                    className={styles.detail}
                  >
                    {t(member.role)}
                    {member.user_id === userId ? ` · ${t('you')}` : ''}
                  </Text>
                </Box>
                {
                  owner && member.role !== 'owner' &&
                  <Mutation
                    compact
                    label={t('removeMember')}
                    confirmation={t('confirmRemoveMember', { name: member.display_name || t('unnamed') })}
                    operation={() =>
                      removeMember({ groupId: data.group.id, memberId: member.user_id })
                    }
                    onSuccess={refresh}
                  />
                }
              </li>
            )
          }
        </ul>
      </Grid>
      {
        owner &&
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
            {t('inviteTitle')}
          </Heading>
          <Text color="muted">{t('inviteDescription')}</Text>
          <Mutation
            label={t('createInvite')}
            operation={() => createInvite({ groupId: data.group.id, locale })}
            onSuccess={value => {
              setInvitation(value)
              setCopied(false)
              refresh()
            }}
          />
          {
            invitation &&
            <Grid
              gap={3}
              mt={4}
            >
              <Input
                label={t('inviteLink')}
                readOnly
                value={invitation.url}
                onFocus={event => event.currentTarget.select()}
              />
              <Action
                type="button"
                onClick={copy}
              >
                {t(copied ? 'copied' : 'copy')}
              </Action>
              {
                copyError &&
                <Text
                  color="muted"
                  role="alert"
                >
                  {t('copyError')}
                </Text>
              }
              <Text color="muted">{t('inviteOnce')}</Text>
            </Grid>
          }
          {
            liveInvites.length > 0 &&
            <details className={styles.details}>
              <summary className={styles.summary}>
                <ChevronRight
                  className={styles.chevron}
                  size={16}
                  aria-hidden="true"
                />
                {t('activeInvites', { count: liveInvites.length })}
              </summary>
              <ul className={styles.members}>
                {
                  liveInvites.map((invite, index) =>
                    <li
                      className={styles.member}
                      key={invite.id}
                    >
                      <Text as="span">{t('invitationNumber', { number: index + 1 })}</Text>
                      <Mutation
                        className={styles.setting}
                        compact
                        label={t('revoke')}
                        confirmation={t('confirmRevoke')}
                        operation={() => revokeInvite({ inviteId: invite.id })}
                        onSuccess={() => {
                          if (invitation?.id === invite.id) setInvitation(null)

                          refresh()
                        }}
                      />
                    </li>
                  )
                }
              </ul>
            </details>
          }
        </Grid>
      }
      <details className={styles.details}>
        <summary className={styles.summary}>
          <ChevronRight
            className={styles.chevron}
            size={16}
            aria-hidden="true"
          />
          {t('groupSettings')}
        </summary>
        {
          owner
            ?
            <GroupForm
              group={data.group}
              locale={locale}
              onSuccess={refresh}
            />
            :
            <>
              <Text color="muted">{t('leaveDescription')}</Text>
              <Mutation
                className={styles.setting}
                label={t('leaveGroup')}
                confirmation={t('leaveDescription')}
                operation={() => removeMember({ groupId: data.group.id, memberId: userId })}
                onSuccess={() => router.replace('/dashboard')}
              />
            </>
        }
        {
          owner &&
          <Text color="muted">{t('ownerStays')}</Text>
        }
      </details>
    </Box>
  )
}

export default GroupView
