'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'

import { removeMember } from '@/lib/groups/action'
import { createInvite, revokeInvite } from '@/lib/invites/action'
import { copyText } from '@/lib/platform/clipboard'
import { useWorkspaceRealtime } from '@/hooks/useWorkspaceRealtime'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Dropdown } from '@/components/Dropdown'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'
import { Input } from '@/components/Input'
import { Text } from '@/components/Text'
import { Avatar } from '@/modules/Avatar'
import { Breadcrumbs } from '@/modules/Breadcrumbs'
import { Connection } from '@/modules/Connection'
import { Empty } from '@/modules/Empty'
import { GroupForm } from '@/modules/GroupForm'
import { ListForm } from '@/modules/ListForm'
import { Mutation } from '@/modules/Mutation'

import type { GroupViewProps } from './types'

import styles from './index.module.scss'

import type { InvitationLink } from '@/types/workspace'

const Section = ({ result, userId, locale }: GroupViewProps) => {
  const t = useTranslations('Group')
  const workspace = useTranslations('Workspace')

  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationLink | null>(null)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const status = useWorkspaceRealtime({ userId, groupId: result.ok ? result.data.group.id : undefined })

  if (!result.ok) return (
    <Empty
      heading="h1"
      error={result.error}
    />
  )

  const data = result.data
  const owner = data.members.find(member => member.user_id === userId)?.role === 'owner'
  const refresh = () => router.refresh()
  const active = data.lists.filter(list => list.status === 'active')
  const archived = data.lists.filter(list => list.status === 'archived')
  const liveInvites = data.invites.filter(
    invite =>
      !invite.revoked_at && invite.use_count === 0 && new Date(invite.expires_at) > new Date(),
  )

  const handleCopy = async () => {
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
      full
      py={4}
    >
      <Breadcrumbs
        items={[
          { label: workspace('home'), href: '/' },
          { label: workspace('backDashboard'), href: '/dashboard' },
          { label: data.group.name },
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
            {t(owner ? 'owner' : 'member')}
          </Text>
          <Heading
            as="h1"
            size={6}
          >
            {data.group.name}
          </Heading>
        </div>
        <Connection status={status} />
      </Box>
      <Grid
        as="section"
        gap={3}
        mt={4}
        p={{ initial: 3, tabS: 5 }}
        radius="lg"
        surface="default"
      >
        <Heading
          as="h2"
          size={5}
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
                    radius="sm"
                    surface="default"
                    key={list.id}
                    className={styles.card}
                    href={`/groups/${data.group.id}/lists/${list.id}`}
                  >
                    <Heading
                      as="h3"
                      size={4}
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
                      <Icon
                        name="arrow-up-right"
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
          <Dropdown
            label={t('archivedLists')}
            plain
          >
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
                    radius="sm"
                    surface="default"
                    key={list.id}
                    className={styles.card}
                    href={`/groups/${data.group.id}/lists/${list.id}`}
                  >
                    {list.title}
                  </Box>
                )
              }
            </Grid>
          </Dropdown>
        }
      </Grid>
      <Grid
        as="section"
        gap={3}
        mt={4}
        p={{ initial: 3, tabS: 5 }}
        radius="lg"
        surface="default"
      >
        <Heading
          as="h2"
          size={5}
        >
          {t('members')}
        </Heading>
        <ul>
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
                    size={2}
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
                    variant="danger"
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
          radius="lg"
          surface="default"
        >
          <Heading
            as="h2"
            size={5}
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
            <Grid gap={3}>
              <Input
                label={t('inviteLink')}
                readOnly
                value={invitation.url}
                onFocus={event => event.currentTarget.select()}
              />
              <Action
                type="button"
                onClick={handleCopy}
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
            <Dropdown
              label={t('activeInvites', { count: liveInvites.length })}
              plain
            >
              <ul>
                {
                  liveInvites.map((invite, index) =>
                    <Box
                      as="li"
                      display="flex"
                      align="center"
                      wrap="wrap"
                      gap={3}
                      py={2}
                      key={invite.id}
                    >
                      <Text as="span">{t('invitationNumber', { number: index + 1 })}</Text>
                      <Mutation
                        compact
                        label={t('revoke')}
                        variant="danger"
                        confirmation={t('confirmRevoke')}
                        operation={() => revokeInvite({ inviteId: invite.id })}
                        onSuccess={() => {
                          if (invitation?.id === invite.id) setInvitation(null)

                          refresh()
                        }}
                      />
                    </Box>
                  )
                }
              </ul>
            </Dropdown>
          }
        </Grid>
      }
      <Dropdown label={t('groupSettings')}>
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
                variant="danger"
                confirmation={t('leaveDescription')}
                operation={() => removeMember({ groupId: data.group.id, memberId: userId })}
                onSuccess={() => router.replace('/dashboard')}
              />
            </>
        }
        {
          owner &&
          <Text
            color="muted"
            mt={3}
          >
            {t('ownerStays')}
          </Text>
        }
      </Dropdown>
    </Box>
  )
}

export default Section
