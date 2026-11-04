'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Pencil, X } from 'lucide-react'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Checkbox } from '@/components/Checkbox'
import { Grid } from '@/components/Grid'
import { Text } from '@/components/Text'
import { Mutation } from '@/modules/Mutation'
import { deleteItem, purchaseItem } from '@/modules/Shopping/action'

import { ItemForm } from './ItemForm'

import styles from '../index.module.scss'

import type { ItemRowProps } from '@/types/components'

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
      <Box
        display="flex"
        align="center"
        gap={2}
        p={2}
      >
        <Checkbox
          className={styles.purchase}
          checked={item.is_purchased}
          disabled={pending || archived}
          aria-busy={pending}
          onChange={toggle}
          label={
            <Box
              as="span"
              display="block"
            >
              <Text
                as="span"
                className={item.is_purchased ? styles.purchased : undefined}
                color={item.is_purchased ? 'muted' : 'default'}
              >
                {item.name}
              </Text>
              <Text
                as="small"
                size="sm"
                color="muted"
                className={styles.detail}
              >
                {t('amount', { quantity: item.quantity, unit: t(`units.${item.unit}`) })}
              </Text>
            </Box>
          }
        />
        {
          !archived &&
          <Action
            variant="ghost"
            iconOnly
            aria-expanded={editing}
            onClick={() => setEditing(!editing)}
            aria-label={t('editNamedItem', { name: item.name })}
          >
            {
              editing
                ?
                <X
                  size={18}
                  aria-hidden="true"
                />
                :
                <Pencil
                  size={18}
                  aria-hidden="true"
                />
            }
          </Action>
        }
      </Box>
      {
        error &&
        <Text
          role="alert"
          tone="error"
          size="sm"
          px={3}
          pb={2}
        >
          {error}
        </Text>
      }
      {
        editing && !archived &&
        <Grid
          gap={3}
          p={3}
          className={styles.edit}
        >
          <ItemForm
            item={item}
            onSuccess={() => {
              setEditing(false)
              refresh()
            }}
          />
          <Mutation
            compact
            label={t('deleteItem')}
            confirmation={t('confirmDeleteItem', { name: item.name })}
            operation={() => deleteItem({ itemId: item.id })}
            onSuccess={refresh}
          />
        </Grid>
      }
    </li>
  )
}
