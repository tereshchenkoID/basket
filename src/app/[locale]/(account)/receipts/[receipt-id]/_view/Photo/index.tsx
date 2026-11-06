import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { RECEIPT_STORAGE } from '@/constant/receipts'

import { thumbnailImage } from '@/lib/receipts/ocr'
import { createClient } from '@/lib/supabase/client'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Dropdown } from '@/components/Dropdown'
import { Grid } from '@/components/Grid'
import Icon from '@/components/Icon'
import { Input } from '@/components/Input'
import { Text } from '@/components/Text'
import { Confirm } from '@/widgets/Modals/Confirm'

import type { PhotoProps } from './types'

import styles from '../index.module.scss'

export const Photo = ({ image, confidence, lines, index, count, disabled, onMove, onRemove, onRecognize, onReplace }: PhotoProps) => {
  const t = useTranslations('Receipts')
  const [url, setUrl] = useState('')

  useEffect(() => {
    let disposed = false
    let objectUrl = ''
    const handleLoad = async () => {
      try {
        const { data, error } = await createClient().storage.from(RECEIPT_STORAGE).download(image.storage_path)

        if (error || !data || disposed) return

        const thumbnail = await thumbnailImage(data)
        objectUrl = URL.createObjectURL(thumbnail)

        if (!disposed) setUrl(objectUrl)
        else URL.revokeObjectURL(objectUrl)
      } catch { /* A failed thumbnail does not block a retry or manual input. */ }
    }
    void handleLoad()

    return () => { disposed = true

      if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [image.storage_path])

  const handleMove = (direction: number) => onMove(image, direction)

  const handleRemove = () => onRemove(image)

  const handleRecognize = () => onRecognize(image.id)

  const handleReplace = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''

    if (file) onReplace(image, file)
  }

  return (
    <Grid
      gap={2}
      p={3}
      border
      radius="sm"
      as="li"
    >
      <Text weight="semibold">{t('photo', { number: index + 1 })}</Text>
      {
        url &&
        <Image
          className={styles.image}
          src={url}
          width={640}
          height={180}
          unoptimized
          alt={t('photo', { number: index + 1 })}
          loading="lazy"
        />
      }
      <Text
        size={2}
        color="muted"
      >
        {t(`imageStatus.${image.processing_status}`)}
      </Text>
      {
        confidence !== undefined &&
        <Text
          size={2}
          color={confidence < 75 ? 'error' : 'muted'}
          role="status"
        >
          {t('ocrConfidence', { score: Math.round(confidence) })}
          {confidence < 75 ? ` ${t('ocrQualityHelp')}` : ''}
        </Text>
      }
      {
        lines?.length &&
        <Dropdown label={t('recognizedText')}>
          <Text
            as="div"
            size={1}
            className={styles.source}
          >
            {lines.join('\n')}
          </Text>
        </Dropdown>
      }
      <Box
        display="flex"
        wrap="wrap"
        gap={2}
      >
        <Action
          variant="secondary"
          onClick={() => handleMove(-1)}
          disabled={disabled || index === 0}
          aria-label={t('moveUp')}
        >
          <Icon
            name="arrow-up"
            size={18}
            aria-hidden="true"
          />
        </Action>
        <Action
          variant="secondary"
          onClick={() => handleMove(1)}
          disabled={disabled || index === count - 1}
          aria-label={t('moveDown')}
        >
          <Icon
            name="arrow-down"
            size={18}
            aria-hidden="true"
          />
        </Action>
        <Action
          variant="danger"
          onClick={handleRemove}
          disabled={disabled}
        >
          {t('remove')}
        </Action>
      </Box>
      <Confirm
        label={t('recognizeAgain')}
        description={t('replaceWarning')}
        onConfirm={handleRecognize}
        disabled={disabled}
      />
      <Input
        label={t('replacePhoto')}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleReplace}
        disabled={disabled}
      />
    </Grid>
  )
}
