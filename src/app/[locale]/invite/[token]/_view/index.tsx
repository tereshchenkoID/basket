'use client'

import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'

import { ActionForm } from '@/components/ActionForm'
import { acceptInvite } from '@/modules/Invites/action'

import styles from '@/modules/Groups/index.module.scss'

import type { InvitePreview } from '@/types/database'

export default function InviteView({ preview, token }: { preview: InvitePreview; token: string }) {
  const t = useTranslations('Workspace')
  const router = useRouter()
  return (
    <section className={styles['invite-card']}>
      <p className={styles.eyebrow}>{t('invited')}</p>
      <h1>{preview.group_name}</h1>
      <p>{t(preview.already_member ? 'alreadyMember' : 'joinDescription')}</p>
      {preview.already_member ? (
        <Link href={`/groups/${preview.group_id}`}>{t('openGroup')} ↗</Link>
      ) : (
        <ActionForm
          label={t('joinGroup')}
          operation={() => acceptInvite({ token })}
          onSuccess={(groupId) => router.replace(`/groups/${groupId}`)}
        />
      )}
      <Link className={styles.back} href="/dashboard">
        {t('backDashboard')}
      </Link>
    </section>
  )
}
