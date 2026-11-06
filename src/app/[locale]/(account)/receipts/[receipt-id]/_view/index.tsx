'use client'

import type { ChangeEvent } from 'react'
import {
  useCallback, useEffect, useRef, useState
} from 'react'
import { useFormatter, useTranslations } from 'next-intl'

import { useRouter } from '@/i18n/navigation'

import { NAVIGATION, ROUTES_USER } from '@/constant/navigation'
import {
  RECEIPT_CURRENCIES, RECEIPT_LIMITS, RECEIPT_STORAGE, RECEIPT_TIME_ZONE
} from '@/constant/receipts'

import {
  completeReceiptUpload, loadReceipt, prepareReceiptImage, removeReceiptImage, saveReceipt, saveReceiptSegment
} from '@/lib/receipts/action'
import { receiptInstant, receiptLocalDate } from '@/lib/receipts/date'
import { mergeSegments } from '@/lib/receipts/merge'
import { receiptDifference } from '@/lib/receipts/money'
import { compressImage, createOcr } from '@/lib/receipts/ocr'
import { emptyDocument, emptyItem, parseReceipt } from '@/lib/receipts/parser'
import type {
  OcrAdapter, ReceiptData, ReceiptDocument, ReceiptImage, ReceiptItem
} from '@/lib/receipts/types'
import { createClient } from '@/lib/supabase/client'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Checkbox } from '@/components/Checkbox'
import { Dropdown } from '@/components/Dropdown'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'
import { Textarea } from '@/components/Textarea'
import { Breadcrumbs } from '@/modules/Breadcrumbs'
import { Empty } from '@/modules/Empty'
import { Confirm } from '@/widgets/Modals/Confirm'

import { Item } from './Item'
import { Photo } from './Photo'
import type { EditorDocument, ReceiptViewProps } from './types'

import styles from './index.module.scss'

const withKeys = (document: ReceiptDocument): EditorDocument => ({ ...document, items: document.items.map(item => ({ ...item, key: crypto.randomUUID() })), adjustments: document.adjustments.map(row => ({ ...row, key: crypto.randomUUID() })) })
const fromReceipt = (data: ReceiptData): EditorDocument => withKeys({
  ...emptyDocument(),
  ...data.receipt,
  store_name: data.receipt.store_name_snapshot,
  receipt_total: data.receipt.receipt_total ?? '',
})

const Section = ({ result, userId, groups, stores }: ReceiptViewProps) => {
  const initial = result.ok ? result.data : null
  const t = useTranslations('Receipts')
  const workspace = useTranslations('Workspace')
  const formatter = useFormatter()
  const router = useRouter()

  const [receipt, setReceipt] = useState(initial?.receipt ?? null)
  const [document, setDocument] = useState<EditorDocument>(() => initial ? fromReceipt(initial) : withKeys(emptyDocument()))
  const [images, setImages] = useState(initial?.images ?? [])
  const [segments, setSegments] = useState(initial?.segments ?? [])
  const [pending, setPending] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [raw, setRaw] = useState('')
  const lockRef = useRef(false)
  const lastAttemptRef = useRef<EditorDocument | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const busy = pending || processing
  const readOnly = receipt?.status === 'confirmed' && !editing
  const difference = receiptDifference(document.items, document.adjustments, document.receipt_total)

  useEffect(() => () => controllerRef.current?.abort(), [])

  const handleItemChange = useCallback((key: string, item: ReceiptItem) => {
    setDocument(current => ({ ...current, accept_mismatch: false, items: current.items.map(row => row.key === key ? { ...item, key } : row) }))
    setDirty(true)
  }, [])

  const handleItemRemove = useCallback((key: string) => {
    setDocument(current => ({ ...current, accept_mismatch: false, items: current.items.filter(item => item.key !== key) }))
    setDirty(true)
  }, [])

  const handleItemMove = useCallback((key: string, direction: number) => {
    setDocument(current => {
      const items = [...current.items]
      const index = items.findIndex(item => item.key === key)
      const next = index + direction

      if (index < 0 || next < 0 || next >= items.length) return current

      const moved = items.splice(index, 1)[0]
      items.splice(next, 0, moved)

      return { ...current, items }
    })
    setDirty(true)
  }, [])

  const handleSave = async (confirm = false, automatic = false) => {
    if (!receipt || lockRef.current) return
    if (confirm && (!document.purchased_at || (!document.store_id && !document.store_name.trim()) || !document.receipt_total || !document.items.length)) {
      setError(t('warnings.incomplete'))

      return
    }

    if (automatic) lastAttemptRef.current = document

    lockRef.current = true
    setPending(true)
    setError('')
    setSaved(false)

    try {
      const payload: ReceiptDocument = {
        group_id: document.group_id,
        store_id: document.store_id,
        store_name: document.store_name,
        purchased_at: document.purchased_at,
        currency: document.currency,
        receipt_total: document.receipt_total,
        items: document.items.map(({ key: _key, ...item }) => item),
        adjustments: document.adjustments.map(({ key: _key, ...row }) => row),
        accept_mismatch: document.accept_mismatch,
        warnings: document.warnings,
        status: confirm ? 'confirmed' : document.status,
      }
      const response = await saveReceipt({ id: receipt.id, document: payload, revision: receipt.version, confirm, correction: receipt.status === 'confirmed' })

      if (!response.ok) { setError(workspace(`errors.${response.error}`))

        return }

      setReceipt(response.data.receipt)
      setDirty(false)
      setSaved(!automatic)

      if (confirm) {
        setDocument(fromReceipt(response.data))
        setImages([])
        setSegments([])
        setRaw('')
        setEditing(false)
      }
    } catch {
      setError(workspace('errors.unavailable'))
    } finally {
      lockRef.current = false
      setPending(false)
    }
  }

  useEffect(() => {
    if (!dirty || busy || readOnly || receipt?.status === 'confirmed' || lastAttemptRef.current === document) return

    const timer = setTimeout(() => { void handleSave(false, true) }, 15000)

    return () => clearTimeout(timer)
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget
    setDocument(current => ({ ...current, [name]: name === 'purchased_at' ? receiptInstant(value) : value, accept_mismatch: false }))
    setDirty(true)
  }

  const handleCurrency = (value: string) => {
    setDocument(current => ({ ...current, currency: value }))
    setDirty(true)
  }

  const handleLeave = () => router.push(ROUTES_USER.scan.url)

  const handleStore = (value: string) => {
    const store = stores.find(store => store.id === value)
    setDocument(current => ({ ...current, store_id: value === 'other' ? null : value, store_name: store?.name ?? '' }))
    setDirty(true)
  }

  const handleGroup = (value: string) => {
    setDocument(current => ({ ...current, group_id: value === 'personal' ? null : value }))
    setDirty(true)
  }

  const handleMismatch = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked
    setDocument(current => ({ ...current, accept_mismatch: checked }))
    setDirty(true)
  }

  const handleAdd = () => {
    setDocument(current => ({ ...current, accept_mismatch: false, items: [...current.items, { ...emptyItem(), key: crypto.randomUUID() }] }))
    setDirty(true)
  }

  const handleEdit = () => setEditing(true)

  const handleDiscard = () => {
    if (!receipt) return

    setDocument(fromReceipt({ receipt, images: [], segments: [] }))
    setEditing(false)
    setDirty(false)
    setError('')
  }

  const handleCancel = () => controllerRef.current?.abort()

  const handleRaw = (event: ChangeEvent<HTMLTextAreaElement>) => setRaw(event.currentTarget.value)

  const handleParse = () => {
    const parsed = parseReceipt(raw.split('\n'))
    setDocument(current => ({ ...withKeys(parsed), group_id: current.group_id, store_id: stores.find(store => store.name.toLocaleLowerCase() === parsed.store_name.toLocaleLowerCase())?.id ?? null }))
    setDirty(true)
  }

  const handleAdjustment = (event: ChangeEvent<HTMLInputElement>, index: number, field: 'name' | 'amount') => {
    const value = event.currentTarget.value
    setDocument(current => ({ ...current, accept_mismatch: false, adjustments: current.adjustments.map((row, position) => position === index ? { ...row, [field]: value } : row) }))
    setDirty(true)
  }

  const handleAdjustmentAdd = () => {
    setDocument(current => ({ ...current, adjustments: [...current.adjustments, { name: '', amount: '', key: crypto.randomUUID() }] }))
    setDirty(true)
  }

  const handleAdjustmentRemove = (index: number) => {
    setDocument(current => ({ ...current, adjustments: current.adjustments.filter((_, position) => position !== index), accept_mismatch: false }))
    setDirty(true)
  }

  const handleReloadPhotos = async () => {
    if (!receipt) return

    const response = await loadReceipt(receipt.id)

    if (!response.ok) throw new Error(response.error)

    setImages(response.data.images)
    setSegments(response.data.segments)
  }

  const handleUpload = async (files: File[], replace?: ReceiptImage) => {
    if (!receipt || lockRef.current || !files.length) return
    if (images.length + files.length - (replace ? 1 : 0) > RECEIPT_LIMITS.images) { setError(t('imageLimit', { count: RECEIPT_LIMITS.images }))

      return }

    lockRef.current = true
    setPending(true)
    setError('')

    try {
      const client = createClient()

      for (const [index, file] of files.entries()) {
        const blob = await compressImage(file)
        const imageId = crypto.randomUUID()
        const prepared = await prepareReceiptImage({ receiptId: receipt.id, imageId, position: replace?.position ?? images.length + index, replaceId: replace?.id })

        if (!prepared.ok) throw new Error(prepared.error)

        const uploaded = await client.storage.from(RECEIPT_STORAGE).upload(prepared.data, blob, { contentType: 'image/jpeg', upsert: false })

        if (uploaded.error) {
          await removeReceiptImage({ receiptId: receipt.id, imageId })
          throw new Error('uploadFailed')
        }

        const completed = await completeReceiptUpload({ receiptId: receipt.id, imageId })

        if (!completed.ok) throw new Error(completed.error)

        if (replace) {
          const removed = await removeReceiptImage({ receiptId: receipt.id, imageId: replace.id })

          if (!removed.ok) throw new Error(removed.error)
        }

        setProgress((index + 1) / files.length)
      }
      await handleReloadPhotos()
    } catch (failure) {
      setError(t(failure instanceof Error && failure.message === 'imageInvalid' ? 'imageInvalid' : 'uploadFailed'))
      await handleReloadPhotos().catch(() => {})
    } finally {
      lockRef.current = false
      setPending(false)
    }
  }

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    void handleUpload(files)
  }

  const handleReplace = (image: ReceiptImage, file: File) => { void handleUpload([file], image) }

  const handlePhotoRemove = async (image: ReceiptImage) => {
    if (!receipt || lockRef.current) return

    lockRef.current = true
    setPending(true)
    setError('')

    try {
      const response = await removeReceiptImage({ receiptId: receipt.id, imageId: image.id })

      if (!response.ok) throw new Error(response.error)

      await handleReloadPhotos()
    } catch { setError(workspace('errors.unavailable')) }
    finally { lockRef.current = false; setPending(false) }
  }

  const handlePhotoMove = async (image: ReceiptImage, direction: number) => {
    if (!receipt || lockRef.current) return

    const next = [...images]
    const index = next.findIndex(row => row.id === image.id)
    const target = index + direction

    if (target < 0 || target >= next.length) return

    const moved = next.splice(index, 1)[0]
    next.splice(target, 0, moved)
    lockRef.current = true
    setPending(true)
    setError('')

    try {
      for (const [position, row] of next.entries()) {
        const response = await prepareReceiptImage({ receiptId: receipt.id, imageId: row.id, position })

        if (!response.ok) throw new Error(response.error)
      }
      await handleReloadPhotos()
    } catch { setError(workspace('errors.unavailable')) }
    finally { lockRef.current = false; setPending(false) }
  }

  const handleRecognize = async (onlyId?: string, force = false) => {
    if (!receipt || lockRef.current) return

    lockRef.current = true
    const abort = new AbortController()
    controllerRef.current = abort
    setProcessing(true)
    setError('')
    setProgress(0)
    let worker: OcrAdapter | undefined
    let activeImage: string | undefined
    const recognized = new Map(segments.map(segment => [segment.image_id, { lines: segment.lines, confidence: segment.confidence }]))
    const targets = images.filter(image => onlyId ? image.id === onlyId : force || image.processing_status !== 'ready' || !recognized.has(image.id))

    try {
      worker = await createOcr(value => { if (!abort.signal.aborted) setProgress(value) }, abort.signal)
      const client = createClient()

      for (const image of targets) {
        if (abort.signal.aborted) break

        activeImage = image.id

        try {
          await saveReceiptSegment({ receiptId: receipt.id, imageId: image.id, lines: [], confidence: 0, status: 'processing' })
          setImages(current => current.map(row => row.id === image.id ? { ...row, processing_status: 'processing' } : row))
          const { data, error: downloadError } = await client.storage.from(RECEIPT_STORAGE).download(image.storage_path)

          if (!data || downloadError) throw new Error('download')

          const segment = await worker.recognize(data)

          if (abort.signal.aborted) break

          const stored = await saveReceiptSegment({ receiptId: receipt.id, imageId: image.id, ...segment, status: 'ready' })

          if (!stored.ok) throw new Error(stored.error)

          activeImage = undefined
          recognized.set(image.id, segment)
          setImages(current => current.map(row => row.id === image.id ? { ...row, processing_status: 'ready' } : row))
        } catch {
          if (abort.signal.aborted) break

          const previous = recognized.get(image.id)
          await saveReceiptSegment({ receiptId: receipt.id, imageId: image.id, lines: previous?.lines ?? [], confidence: previous?.confidence ?? 0, status: 'failed' })
          setImages(current => current.map(row => row.id === image.id ? { ...row, processing_status: 'failed' } : row))
          activeImage = undefined
          setError(t('ocrFailed'))
        }
      }

      if (!abort.signal.aborted) {
        const merged = mergeSegments(images.flatMap(image => recognized.has(image.id) ? [recognized.get(image.id)!] : []))
        const parsed = parseReceipt(merged.lines)
        parsed.warnings = [...new Set([...parsed.warnings, ...merged.warnings, ...(recognized.size < images.length ? ['incomplete'] : [])])]
        setRaw(merged.lines.join('\n'))
        setDocument(current => ({ ...withKeys(parsed), group_id: current.group_id, store_id: stores.find(store => store.name.toLocaleLowerCase() === parsed.store_name.toLocaleLowerCase())?.id ?? null }))
        setDirty(true)
      }
    } catch {
      if (!abort.signal.aborted) setError(t('ocrUnavailable'))
    } finally {
      await worker?.terminate().catch(() => {})

      if (abort.signal.aborted && activeImage) {
        await saveReceiptSegment({ receiptId: receipt.id, imageId: activeImage, lines: [], confidence: 0, status: 'pending' }).catch(() => {})
      }

      await handleReloadPhotos().catch(() => {})
      controllerRef.current = null
      lockRef.current = false
      setProcessing(false)
    }
  }

  const handleRecognizeAll = () => { void handleRecognize() }
  const handleRecognizeAgain = () => { void handleRecognize(undefined, true) }

  const handleSaveDraft = () => { void handleSave() }

  const handleConfirm = () => { void handleSave(true) }

  if (!result.ok || !receipt) return (
    <Empty
      heading="h1"
      error={result.ok ? 'unavailable' : result.error}
    />
  )

  const storeOptions = stores.map(store => ({ value: store.id, label: store.name }))

  if (document.store_id && !storeOptions.some(store => store.value === document.store_id)) storeOptions.push({ value: document.store_id, label: document.store_name })

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
          { label: t(readOnly ? 'history' : 'scan'), href: readOnly ? ROUTES_USER.history.url : ROUTES_USER.scan.url },
          { label: t(readOnly ? 'purchase' : 'receipt') },
        ]}
      />
      <Box
        display="flex"
        wrap="wrap"
        justify="between"
        align="center"
        gap={2}
      >
        <Heading
          as="h1"
          size={6}
        >
          {t(readOnly ? 'purchase' : 'receipt')}
        </Heading>
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
          role="alert"
          color="error"
        >
          {error}
        </Text>
      }
      {
        saved &&
        <Text
          role="status"
          color="success"
        >
          {t(receipt.status === 'confirmed' ? 'confirmed' : 'saved')}
        </Text>
      }
      {
        readOnly
          ?
          <Grid gap={3}>
            <Heading
              as="h2"
              size={5}
            >
              {receipt.store_name_snapshot}
            </Heading>
            <Text>{receipt.purchased_at && formatter.dateTime(new Date(receipt.purchased_at), { dateStyle: 'medium', timeStyle: 'short', timeZone: RECEIPT_TIME_ZONE })}</Text>
            <Text>{t('author', { name: receipt.author_name ?? t('unknown') })}</Text>
            <Text>{groups.find(group => group.id === receipt.group_id)?.name ?? t('personal')}</Text>
            <Grid
              as="ul"
              gap={2}
            >
              {
                document.items.map(item =>
                  <Box
                    as="li"
                    key={item.key}
                    className={styles.item}
                    display="flex"
                    wrap="wrap"
                    justify="between"
                    align="start"
                    gap={3}
                    p={3}
                    border
                    radius="sm"
                  >
                    <Grid gap={1}>
                      <Text
                        weight="semibold"
                        title={t('original', { name: item.original_name })}
                      >
                        {item.display_name}
                      </Text>
                      <Text
                        size={2}
                        color="muted"
                      >
                        {item.quantity ? Number(item.quantity) : t('unknown')} {item.unit ? t(`units.${item.unit}`) : ''}
                        {item.unit_price && ` × ${item.unit_price} ${receipt.currency}`}
                        {Number(item.discount_amount) > 0 && ` · ${t('discount')}: ${item.discount_amount}`}
                      </Text>
                    </Grid>
                    <Text
                      className={styles.price}
                      weight="semibold"
                    >
                      {item.line_total} {receipt.currency}
                    </Text>
                  </Box>
                )
              }
            </Grid>
            {
              document.adjustments.map(adjustment =>
                <Text key={adjustment.key}>{adjustment.name}: {adjustment.amount} {receipt.currency}</Text>
              )
            }
            <Heading
              as="h2"
              size={5}
            >
              {t('total')}: {receipt.receipt_total} {receipt.currency}
            </Heading>
            {
              receipt.has_mismatch &&
              <Text color="error">{t('difference', { amount: receipt.discrepancy, currency: receipt.currency })}</Text>
            }
            <Text
              size={2}
              color="muted"
            >
              {t('cleanup')}
            </Text>
            {
              receipt.owner_id === userId &&
              <Action onClick={handleEdit}>{t('correct')}</Action>
            }
          </Grid>
          :
          <>
            {
              receipt.status !== 'confirmed' &&
              <Grid gap={3}>
                <Heading
                  as="h2"
                  size={5}
                >
                  {t('photos')}
                </Heading>
                <Text color="muted">{t('overlap')}</Text>
                <Grid
                  columns={{ initial: 1, tabS: 2 }}
                  gap={3}
                >
                  <Input
                    label={t('camera')}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={handleFiles}
                    disabled={busy || images.length >= RECEIPT_LIMITS.images}
                  />
                  <Input
                    label={t('gallery')}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFiles}
                    disabled={busy || images.length >= RECEIPT_LIMITS.images}
                  />
                </Grid>
                <Text
                  size={2}
                  color="muted"
                >
                  {t('imageHelp', { count: RECEIPT_LIMITS.images, size: 20 })}
                </Text>
                <Grid
                  as="ul"
                  columns={{ initial: 1, mobM: 2, tabM: 3 }}
                  gap={3}
                >
                  {
                    images.map((image, index) =>
                      <Photo
                        key={image.id}
                        image={image}
                        confidence={segments.find(segment => segment.image_id === image.id)?.confidence}
                        lines={segments.find(segment => segment.image_id === image.id)?.lines}
                        index={index}
                        count={images.length}
                        disabled={busy}
                        onMove={handlePhotoMove}
                        onRemove={handlePhotoRemove}
                        onReplace={handleReplace}
                        onRecognize={handleRecognize}
                      />
                    )
                  }
                </Grid>
                <Box
                  display="flex"
                  wrap="wrap"
                  gap={2}
                >
                  <Confirm
                    label={t('recognize')}
                    description={t('replaceWarning')}
                    onConfirm={handleRecognizeAll}
                    disabled={busy || !images.length}
                  />
                  {
                    segments.some(segment => segment.lines.length > 0) &&
                    <Confirm
                      label={t('recognizeAllAgain')}
                      description={t('replaceWarning')}
                      onConfirm={handleRecognizeAgain}
                      disabled={busy || !images.length}
                    />
                  }
                  {
                    processing &&
                    <Action
                      onClick={handleCancel}
                      variant="danger"
                    >
                      {t('cancel')}
                    </Action>
                  }
                </Box>
                {
                  busy &&
                  <Grid gap={1}>
                    <Text role="status">
                      {t(processing ? 'recognizing' : 'uploading')} · {Math.round(progress * 100)}%
                    </Text>
                    <progress
                      className={styles.progress}
                      value={progress}
                      max={1}
                      aria-label={t(processing ? 'recognizing' : 'uploading')}
                    />
                  </Grid>
                }
                <Dropdown label={t('manualText')}>
                  <Grid gap={3}>
                    <Textarea
                      label={t('manualText')}
                      value={raw}
                      maxLength={100000}
                      rows={8}
                      onChange={handleRaw}
                      disabled={busy}
                    />
                    <Confirm
                      label={t('parseText')}
                      description={t('replaceWarning')}
                      onConfirm={handleParse}
                      disabled={busy || !raw.trim()}
                    />
                  </Grid>
                </Dropdown>
              </Grid>
            }
            <Heading
              as="h2"
              size={5}
            >
              {t('review')}
            </Heading>
            <Text color="muted">{t('reviewHelp')}</Text>
            {
              document.warnings.map(warning =>
                <Text
                  key={warning}
                  role="status"
                  color="error"
                >
                  {t(`warnings.${warning}`)}
                </Text>
              )
            }
            <Grid
              columns={{ initial: 1, tabS: 2 }}
              gap={3}
            >
              <Select
                label={t('store')}
                value={document.store_id ?? 'other'}
                options={[...storeOptions, { value: 'other', label: t('otherStore') }]}
                onChange={handleStore}
                disabled={busy}
              />
              {
                !document.store_id &&
                <Input
                  label={t('storeName')}
                  name="store_name"
                  value={document.store_name}
                  maxLength={120}
                  onChange={handleChange}
                  disabled={busy}
                />
              }
              <Input
                label={t('date')}
                type="datetime-local"
                step={1}
                name="purchased_at"
                value={receiptLocalDate(document.purchased_at)}
                onChange={handleChange}
                disabled={busy}
              />
              <Select
                label={t('group')}
                value={document.group_id ?? 'personal'}
                options={[{ value: 'personal', label: t('personal') }, ...groups.map(group => ({ value: group.id, label: group.name }))]}
                onChange={handleGroup}
                disabled={busy || receipt.status === 'confirmed'}
              />
              <Select
                label={t('currency')}
                name="currency"
                value={document.currency}
                options={[...new Set<string>([...RECEIPT_CURRENCIES, document.currency])].map(value => ({ value, label: value }))}
                onChange={handleCurrency}
                disabled={busy}
              />
              <Input
                label={t('total')}
                name="receipt_total"
                value={document.receipt_total}
                inputMode="decimal"
                onChange={handleChange}
                disabled={busy}
              />
            </Grid>
            <Action
              variant="secondary"
              onClick={handleAdd}
              disabled={busy || document.items.length >= RECEIPT_LIMITS.items}
            >
              {t('addItem')}
            </Action>
            <Text
              size={2}
              color="muted"
            >
              {t('netTotal')}
            </Text>
            <Grid
              as="ol"
              gap={3}
            >
              {
                document.items.map((item, index) =>
                  <Item
                    key={item.key}
                    item={item}
                    index={index}
                    count={document.items.length}
                    disabled={busy}
                    onChange={handleItemChange}
                    onMove={handleItemMove}
                    onRemove={handleItemRemove}
                  />
                )
              }
            </Grid>
            <Dropdown label={t('adjustments')}>
              <Grid gap={3}>
                {
                  document.adjustments.map((adjustment, index) =>
                    <Grid
                      key={adjustment.key}
                      columns={{ initial: 1, tabS: '1fr 1fr auto' }}
                      align="end"
                      gap={2}
                    >
                    <Input
                      label={t('name')}
                      value={adjustment.name}
                      maxLength={120}
                      onChange={event => handleAdjustment(event, index, 'name')}
                      disabled={busy}
                    />
                    <Input
                      label={t('amount')}
                      value={adjustment.amount}
                      inputMode="decimal"
                      onChange={event => handleAdjustment(event, index, 'amount')}
                      disabled={busy}
                    />
                    <Action
                      variant="danger"
                      onClick={() => handleAdjustmentRemove(index)}
                      disabled={busy}
                    >
                      {t('remove')}
                    </Action>
                    </Grid>
                  )
                }
                <Action
                  variant="secondary"
                  onClick={handleAdjustmentAdd}
                  disabled={busy || document.adjustments.length >= 50}
                >
                  {t('addAdjustment')}
                </Action>
              </Grid>
            </Dropdown>
            {
              difference !== null && difference !== '0.00' &&
              <>
              <Text
                role="status"
                color="error"
              >
                {t('difference', { amount: difference, currency: document.currency })}
              </Text>
              <Checkbox
                label={t('acceptMismatch')}
                checked={document.accept_mismatch}
                onChange={handleMismatch}
                disabled={busy}
              />
              </>
            }
            <Box
              className={styles.actions}
              display="flex"
              gap={2}
              p={2}
              border
              radius="sm"
              wrap="wrap"
            >
              {
                receipt.status !== 'confirmed' &&
                <Confirm
                  label={workspace('cancel')}
                  confirmLabel={t('leaveEditor')}
                  description={t('cancelDraftHelp')}
                  onConfirm={handleLeave}
                  disabled={busy}
                />
              }
              {
                receipt.status !== 'confirmed' &&
                <Action
                  variant="secondary"
                  onClick={handleSaveDraft}
                  disabled={busy}
                >
                  {t('saveDraft')}
                </Action>
              }
              {
                receipt.status === 'confirmed' &&
                <Action
                  variant="secondary"
                  onClick={handleDiscard}
                  disabled={busy}
                >
                  {t('cancelCorrection')}
                </Action>
              }
              <Action
                onClick={handleConfirm}
                isLoading={pending}
                disabled={busy || (difference !== null && difference !== '0.00' && !document.accept_mismatch)}
              >
                {t(receipt.status === 'confirmed' ? 'saveCorrection' : 'confirm')}
              </Action>
            </Box>
            <Text
              size={2}
              color="muted"
            >
              {t(receipt.status === 'confirmed' ? 'correctionHelp' : 'autosave')}
            </Text>
          </>
      }
    </Grid>
  )
}

export default Section
