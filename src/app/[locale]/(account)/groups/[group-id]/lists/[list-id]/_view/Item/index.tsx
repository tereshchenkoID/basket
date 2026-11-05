'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { deleteItem, purchaseItem } from '@/lib/shopping/action'
import { useMutation } from '@/hooks/useMutation'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Checkbox } from '@/components/Checkbox'
import { Grid } from '@/components/Grid'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'
import { Mutation } from '@/modules/Mutation'

import { Form } from './Form'
import type { ItemProps } from './types'

import styles from '../index.module.scss'

export const Item = ({ item, archived }: ItemProps) => {
  const t = useTranslations('List')
  const workspace = useTranslations('Workspace')

  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const { execute, pending, error } = useMutation(t('purchaseUpdated'))
  const handleRefresh = () => router.refresh()

  const handleToggle = async () => {
    const result = await execute(() =>
      purchaseItem({
        itemId: item.id,
        purchased: !item.is_purchased,
      })
    )

    if (result?.ok) handleRefresh()
  }

  const handleEdit = () => setEditing(!editing)

  const handleDelete = () => deleteItem({ itemId: item.id })

  const handleSave = () => {
    setEditing(false)
    handleRefresh()
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
          onChange={handleToggle}
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
                size={2}
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
          <Box
            display="flex"
            align="center"
            gap={2}
          >
            <Action
              variant="primary"
              iconOnly
              aria-expanded={editing}
              onClick={handleEdit}
              aria-label={t('editNamedItem', { name: item.name })}
            >
              {
                editing
                  ?
                  <Icon
                    name="x"
                    size={18}
                    aria-hidden="true"
                  />
                  :
                  <Icon
                    name="pencil"
                    size={18}
                    aria-hidden="true"
                  />
              }
            </Action>
            <Mutation
              label={t('deleteItem')}
              ariaLabel={t('deleteNamedItem', { name: item.name })}
              confirmation={t('confirmDeleteItem', { name: item.name })}
              variant="danger"
              icon="trash-2"
              iconOnly
              disabled={pending}
              operation={handleDelete}
              onSuccess={handleRefresh}
            />
          </Box>
        }
      </Box>
      {
        error &&
        <Text
          role="alert"
          color="error"
          size={2}
          px={3}
          pb={2}
        >
          {workspace(`errors.${error}`)}
        </Text>
      }
      {
        editing && !archived &&
        <Grid
          gap={3}
          p={3}
          className={styles.edit}
        >
          <Form
            item={item}
            onSuccess={handleSave}
          />
        </Grid>
      }
    </li>
  )
}
