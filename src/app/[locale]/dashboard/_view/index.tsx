'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import type { Locale } from '@/i18n/locales'
import { Link, useRouter } from '@/i18n/navigation'

import { validationLimits } from '@/constant/validation'

import { useWorkspaceRealtime } from '@/hooks/useWorkspaceRealtime'

import { ActionForm } from '@/components/ActionForm'
import { createGroup } from '@/modules/Groups/action'

import styles from '@/modules/Groups/index.module.scss'

import type { GroupSummary } from '@/types/database'

type DashboardViewProps = {
  groups: GroupSummary[]
  userId: string
  locale: Locale
}

const DashboardView = ({ groups, userId, locale }: DashboardViewProps) => {
  const t = useTranslations('Workspace')
  const router = useRouter()
  useWorkspaceRealtime({ userId })

  return (
    <div className={styles.workspace}>
      {groups.length === 0 ? (
        <div className={styles.empty}>
          <Image src="/basket.svg" alt="" width={180} height={180} />
          <h2>{t('startFamily')}</h2>
          <p>{t('startDescription')}</p>
        </div>
      ) : (
        <div className={styles.cards}>
          {groups.map(group => (
            <Link href={`/groups/${group.id}`} key={group.id} className={styles.card}>
              <span className={styles['card-icon']} aria-hidden="true">
                ⌂
              </span>
              <h2>{group.name}</h2>
              <p>{t('memberCount', { count: group.member_count })}</p>
              <p>{t('remainingCount', { count: group.remaining_count })}</p>
              <span className={styles['card-link']}>{t('openGroup')} ↗</span>
            </Link>
          ))}
        </div>
      )}
      <section className={styles.panel}>
        <h2>{t('createGroup')}</h2>
        <ActionForm
          label={t('createGroup')}
          operation={(form, id) => createGroup({ id, name: form.get('name'), locale })}
          onSuccess={id => router.push(`/groups/${id}`)}
        >
          <label>
            {t('groupName')}
            <input
              name="name"
              required
              maxLength={validationLimits.groupName}
              autoComplete="off"
              placeholder={t('groupPlaceholder')}
            />
          </label>
        </ActionForm>
      </section>
    </div>
  )
}

export default DashboardView
