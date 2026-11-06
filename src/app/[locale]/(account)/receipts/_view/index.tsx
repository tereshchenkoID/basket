'use client'

import { useRef, useState } from 'react'
import { useFormatter, useTranslations } from 'next-intl'

import { useRouter } from '@/i18n/navigation'

import { NAVIGATION, ROUTES_USER } from '@/constant/navigation'
import { RECEIPT_TIME_ZONE } from '@/constant/receipts'

import { deleteReceiptDraft, loadReceipt, saveReceipt } from '@/lib/receipts/action'
import { emptyDocument } from '@/lib/receipts/parser'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'
import { Breadcrumbs } from '@/modules/Breadcrumbs'
import { Empty } from '@/modules/Empty'
import { Mutation } from '@/modules/Mutation'

import type { ReceiptsViewProps } from './types'

const Section = ({ drafts, available }: ReceiptsViewProps) => {
  const t = useTranslations('Receipts')
  const workspace = useTranslations('Workspace')
  const formatter = useFormatter()
  const router = useRouter()
  const idRef = useRef<string | null>(null)
  const lockRef = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const handleCreate = async () => {
    if (lockRef.current) return

    lockRef.current = true
    setPending(true)
    setError('')
    idRef.current ??= crypto.randomUUID()

    try {
      const result = await saveReceipt({ id: idRef.current, document: emptyDocument(), revision: 0 })

      if (result.ok) router.push(ROUTES_USER.receipt.url(result.data.receipt.id))
      else {
        const existing = await loadReceipt(idRef.current)

        if (existing.ok) router.push(ROUTES_USER.receipt.url(existing.data.receipt.id))
        else setError(workspace(`errors.${result.error}`))
      }
    } catch {
      setError(workspace('errors.unavailable'))
    } finally {
      lockRef.current = false
      setPending(false)
    }
  }

  const handleDelete = (id: string) => deleteReceiptDraft({ id })
  const handleRefresh = () => router.refresh()

  if (!available) return <Empty
    heading="h1"
    error="setupRequired"
                         />

  return (
    <Grid
      as="section"
      full
      gap={4}
      py={4}
    >
      <Breadcrumbs
        items={[
          { label: workspace(NAVIGATION.home.text), href: NAVIGATION.home.url },
          { label: t('scan') },
        ]}
      />
      <Heading
        as="h1"
        size={6}
      >
        {t('scan')}
      </Heading>
      <Text color="muted">{t('intro')}</Text>
      <Box
        display="flex"
        wrap="wrap"
        gap={2}
      >
        <Action
          onClick={handleCreate}
          isLoading={pending}
        >
          {t('new')}
        </Action>
        <Action
          href={ROUTES_USER.history.url}
          variant="secondary"
        >
          {t('history')}
        </Action>
      </Box>
      {
        error &&
        <Text
          color="error"
          role="alert"
        >
          {error}
        </Text>
      }
      <Heading
        as="h2"
        size={5}
      >
        {t('drafts')}
      </Heading>
      {
        drafts.length
          ?
          <Grid
            gap={3}
          >
            {
              drafts.map(draft =>
                <Grid
                  key={draft.id}
                  gap={2}
                  p={3}
                  border
                  radius="sm"
                >
                  <Text>{formatter.dateTime(new Date(draft.updated_at), { dateStyle: 'medium', timeStyle: 'short', timeZone: RECEIPT_TIME_ZONE })}</Text>
                  <Text color="muted">{t(`status.${draft.status}`)}</Text>
                  <Grid
                    columns={2}
                    gap={2}
                    align="start"
                  >
                    <Action
                      href={ROUTES_USER.receipt.url(draft.id)}
                      variant="secondary"
                    >
                      {t('resume')}
                    </Action>
                    <Mutation
                      label={t('deleteDraft')}
                      confirmation={t('confirmDeleteDraft')}
                      variant="danger"
                      icon="trash-2"
                      operation={() => handleDelete(draft.id)}
                      onSuccess={handleRefresh}
                    />
                  </Grid>
                </Grid>
              )
            }
          </Grid>
          :
          <Text color="muted">{t('noDrafts')}</Text>
      }
    </Grid>
  )
}

export default Section
