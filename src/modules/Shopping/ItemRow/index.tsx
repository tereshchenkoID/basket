'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { validationLimits } from '@/constant/validation'

import { ActionForm } from '@/components/ActionForm'

import { deleteItem, editItem, purchaseItem } from '../action'
import { units } from '../schema'

import styles from '../index.module.scss'

import type { ShoppingItem } from '@/types/database'

type ItemRowProps = {
  item: ShoppingItem
  archived: boolean
}

export const ItemRow = ({ item, archived }: ItemRowProps) => {
  const t = useTranslations('Workspace')
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lockRef = useRef(false)
  const refresh = () => router.refresh()

  const toggle = async () => {
    if (lockRef.current) return

    lockRef.current = true
    setPending(true)
    setError(null)

    try {
      const result = await purchaseItem({ itemId: item.id, purchased: !item.is_purchased })

      if (!result.ok) setError(t(`errors.${result.error}`))

      refresh()
    } catch {
      setError(t('errors.unavailable'))
    } finally {
      lockRef.current = false
      setPending(false)
    }
  }

  return (
    <li className={styles.item}>
      <div className={styles['item-row']}>
        <label className={styles['purchase-label']} aria-busy={pending}>
          <input
            type="checkbox"
            checked={item.is_purchased}
            disabled={pending || archived}
            onChange={toggle}
          />
          <span>
            <span className={item.is_purchased ? styles.purchased : styles['item-name']}>
              {item.name}
            </span>
            <small>{t('amount', { quantity: item.quantity, unit: t(`units.${item.unit}`) })}</small>
          </span>
        </label>
        {!archived && (
          <button
            className={styles['edit-button']}
            type="button"
            aria-expanded={editing}
            onClick={() => setEditing(!editing)}
            aria-label={t('editNamedItem', { name: item.name })}
          >
            {t(editing ? 'cancel' : 'edit')}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {editing && !archived && (
        <div className={styles['item-edit']}>
          <ActionForm
            label={t('save')}
            operation={form =>
              editItem({
                itemId: item.id,
                name: form.get('name'),
                quantity: Number(form.get('quantity')),
                unit: form.get('unit'),
              })
            }
            onSuccess={() => {
              setEditing(false)
              refresh()
            }}
          >
            <label>
              {t('itemName')}
              <input name="name" defaultValue={item.name} required maxLength={validationLimits.itemName} />
            </label>
            <div className={styles['quantity-fields']}>
              <label>
                {t('quantity')}
                <input
                  name="quantity"
                  type="number"
                  inputMode="decimal"
                  min="0.001"
                  step="any"
                  max={validationLimits.quantity}
                  defaultValue={item.quantity}
                  required
                />
              </label>
              <label>
                {t('unit')}
                <select name="unit" defaultValue={item.unit}>
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {t(`units.${unit}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </ActionForm>
          <ActionForm
            compact
            label={t('deleteItem')}
            operation={() => deleteItem({ itemId: item.id })}
            onSuccess={refresh}
          />
        </div>
      )}
    </li>
  )
}
