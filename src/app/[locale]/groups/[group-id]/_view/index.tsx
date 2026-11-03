'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import type { Locale } from '@/i18n/locales'
import { Link, useRouter } from '@/i18n/navigation'

import { validationLimits } from '@/constant/validation'

import { useWorkspaceRealtime } from '@/hooks/useWorkspaceRealtime'

import { ActionForm } from '@/components/ActionForm'
import { Avatar } from '@/modules/Avatar'
import { removeMember, renameGroup } from '@/modules/Groups/action'
import type { GroupData } from '@/modules/Groups/query'
import { createInvite, revokeInvite } from '@/modules/Invites/action'
import { createList } from '@/modules/Shopping/action'

import styles from '@/modules/Groups/index.module.scss'

type GroupViewProps = {
  data: GroupData
  userId: string
  locale: Locale
}

const GroupView = ({ data, userId, locale }: GroupViewProps) => {
  const t = useTranslations('Workspace')
  const router = useRouter()
  const [invitation, setInvitation] = useState<{ url: string; id: string } | null>(null)
  const [copied, setCopied] = useState(false)
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

    try {
      await navigator.clipboard.writeText(invitation.url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className={styles.workspace}>
      <Link className={styles.back} href="/dashboard">
        ← {t('backDashboard')}
      </Link>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>{t(owner ? 'owner' : 'member')}</p>
          <h1>{data.group.name}</h1>
        </div>
        <p className={styles.connection} role="status">
          {t(`connection.${status}`)}
        </p>
      </div>
      <section className={styles.panel}>
        <h2>{t('lists')}</h2>
        {active.length ? (
          <div className={styles.cards}>
            {active.map(list => (
              <Link
                key={list.id}
                className={styles.card}
                href={`/groups/${data.group.id}/lists/${list.id}`}
              >
                <h3>{list.title}</h3>
                <span>{t('openList')} ↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <p>{t('noLists')}</p>
        )}
        <ActionForm
          label={t('createList')}
          operation={(form, id) =>
            createList({ id, groupId: data.group.id, title: form.get('name') })
          }
          onSuccess={id => router.push(`/groups/${data.group.id}/lists/${id}`)}
        >
          <label>
            {t('listTitle')}
            <input name="name" required maxLength={validationLimits.listTitle} placeholder={t('defaultList')} />
          </label>
        </ActionForm>
        {archived.length > 0 && (
          <details className={styles.details}>
            <summary>{t('archivedLists')}</summary>
            <div className={styles.cards}>
              {archived.map(list => (
                <Link
                  key={list.id}
                  className={styles.card}
                  href={`/groups/${data.group.id}/lists/${list.id}`}
                >
                  {list.title}
                </Link>
              ))}
            </div>
          </details>
        )}
      </section>
      <section className={styles.panel}>
        <h2>{t('members')}</h2>
        <ul className={styles.members}>
          {data.members.map(member => (
            <li key={member.user_id}>
              <Avatar name={member.display_name || t('unnamed')} url={member.avatar_url} />
              <div className={styles['member-name']}>
                <strong>{member.display_name || t('unnamed')}</strong>
                <small>
                  {t(member.role)}
                  {member.user_id === userId ? ` · ${t('you')}` : ''}
                </small>
              </div>
              {owner && member.role !== 'owner' && (
                <ActionForm
                  compact
                  label={t('removeMember')}
                  operation={() =>
                    removeMember({ groupId: data.group.id, memberId: member.user_id })
                  }
                  onSuccess={refresh}
                />
              )}
            </li>
          ))}
        </ul>
      </section>
      {owner && (
        <section className={styles.panel}>
          <h2>{t('inviteTitle')}</h2>
          <p>{t('inviteDescription')}</p>
          <ActionForm
            label={t('createInvite')}
            operation={() => createInvite({ groupId: data.group.id, locale })}
            onSuccess={value => {
              setInvitation(value)
              setCopied(false)
              refresh()
            }}
          />
          {invitation && (
            <div className={styles['invite-output']}>
              <label>
                {t('inviteLink')}
                <input
                  readOnly
                  value={invitation.url}
                  onFocus={event => event.currentTarget.select()}
                />
              </label>
              <button type="button" onClick={copy}>
                {t(copied ? 'copied' : 'copy')}
              </button>
              <p>{t('inviteOnce')}</p>
            </div>
          )}
          {liveInvites.length > 0 && (
            <details className={styles.details}>
              <summary>{t('activeInvites', { count: liveInvites.length })}</summary>
              <ul className={styles.members}>
                {liveInvites.map((invite, index) => (
                  <li key={invite.id}>
                    <span>{t('invitationNumber', { number: index + 1 })}</span>
                    <ActionForm
                      compact
                      label={t('revoke')}
                      operation={() => revokeInvite({ inviteId: invite.id })}
                      onSuccess={() => {
                        if (invitation?.id === invite.id) setInvitation(null)

                        refresh()
                      }}
                    />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}
      <details className={`${styles.panel} ${styles.details}`}>
        <summary>{t('groupSettings')}</summary>
        {owner ? (
          <ActionForm
            label={t('renameGroup')}
            operation={form => renameGroup({ groupId: data.group.id, name: form.get('name') })}
            onSuccess={refresh}
          >
            <label>
              {t('groupName')}
              <input name="name" required maxLength={validationLimits.groupName} defaultValue={data.group.name} />
            </label>
          </ActionForm>
        ) : (
          <>
            <p>{t('leaveDescription')}</p>
            <ActionForm
              label={t('leaveGroup')}
              operation={() => removeMember({ groupId: data.group.id, memberId: userId })}
              onSuccess={() => router.replace('/dashboard')}
            />
          </>
        )}
        {owner && <p>{t('ownerStays')}</p>}
      </details>
    </section>
  )
}

export default GroupView
