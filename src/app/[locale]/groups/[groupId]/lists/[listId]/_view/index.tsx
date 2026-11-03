'use client'

import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'

import { useWorkspaceRealtime } from '@/hooks/useWorkspaceRealtime'

import { ActionForm } from '@/components/ActionForm'
import { addItem, updateList } from '@/modules/Shopping/action'
import { ItemRow } from '@/modules/Shopping/ItemRow'
import type { ListData } from '@/modules/Shopping/query'
import { units } from '@/modules/Shopping/schema'

import styles from '@/modules/Shopping/index.module.scss'

export default function ListView({ data, userId }: { data: ListData; userId: string }) {
  const t = useTranslations('Workspace')
  const router = useRouter()
  const status = useWorkspaceRealtime({ userId, groupId: data.list.group_id, listId: data.list.id })
  const refresh = () => router.refresh()
  const purchased = data.items.filter((item) => item.is_purchased).length
  const archived = data.list.status === 'archived'

  return (
    <section className={styles.workspace}>
      <Link className={styles.back} href={`/groups/${data.list.group_id}`}>
        ← {t('backGroup')}
      </Link>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>{t(archived ? 'archived' : 'shoppingList')}</p>
          <h1>{data.list.title}</h1>
        </div>
        <p className={styles.connection} role="status">
          {t(`connection.${status}`)}
        </p>
      </div>
      <div className={styles.progress}>
        <label htmlFor="shopping-progress">
          {t('progress', { done: purchased, total: data.items.length })}
        </label>
        <progress id="shopping-progress" value={purchased} max={Math.max(data.items.length, 1)} />
      </div>
      {!archived && (
        <section className={styles.panel}>
          <h2>{t('addItem')}</h2>
          <ActionForm
            label={t('add')}
            reset
            operation={(form, id) =>
              addItem({
                id,
                listId: data.list.id,
                name: form.get('name'),
                quantity: Number(form.get('quantity')),
                unit: form.get('unit'),
              })
            }
            onSuccess={refresh}
          >
            <label>
              {t('itemName')}
              <input
                name="name"
                placeholder={t('itemPlaceholder')}
                required
                maxLength={120}
                autoComplete="off"
                enterKeyHint="done"
              />
            </label>
            <div className={styles['quantity-fields']}>
              <label>
                {t('quantity')}
                <input
                  name="quantity"
                  type="number"
                  inputMode="decimal"
                  min="0.001"
                  max="1000000"
                  step="any"
                  defaultValue="1"
                  required
                />
              </label>
              <label>
                {t('unit')}
                <select name="unit" defaultValue="pcs">
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {t(`units.${unit}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </ActionForm>
        </section>
      )}
      {data.items.length === 0 ? (
        <div className={styles.empty}>
          <h2>{t('emptyList')}</h2>
          <p>{t('emptyListDescription')}</p>
        </div>
      ) : (
        <ul className={styles.items}>
          {data.items.map((item) => (
            <ItemRow key={item.id} item={item} archived={archived} />
          ))}
        </ul>
      )}
      <details className={`${styles.panel} ${styles.details}`}>
        <summary>{t('listSettings')}</summary>
        <ActionForm
          label={t('save')}
          operation={(form) => updateList({ listId: data.list.id, title: form.get('name') })}
          onSuccess={refresh}
        >
          <label>
            {t('listTitle')}
            <input name="name" required maxLength={100} defaultValue={data.list.title} />
          </label>
        </ActionForm>
        <ActionForm
          label={t(archived ? 'restoreList' : 'archiveList')}
          operation={() =>
            updateList({ listId: data.list.id, status: archived ? 'active' : 'archived' })
          }
          onSuccess={refresh}
        />
      </details>
    </section>
  )
}
