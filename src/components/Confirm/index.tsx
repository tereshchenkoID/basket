import { useId, useRef } from 'react'
import { useTranslations } from 'next-intl'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'

import styles from './index.module.scss'

import type { ConfirmProps } from '@/types/ui'

export const Confirm = ({
  label,
  description,
  onConfirm,
  disabled,
}: ConfirmProps) => {
  const t = useTranslations('Workspace')
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <Action
        variant="secondary"
        disabled={disabled}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </Action>
      <dialog
        ref={dialogRef}
        className={styles.block}
        aria-labelledby={id}
      >
        <Heading id={id}>{label}</Heading>
        <Text
          color="muted"
          my={3}
        >
          {description}
        </Text>
        <Box
          display="flex"
          justify="end"
          gap={2}
          wrap="wrap"
        >
          <Action
            variant="secondary"
            onClick={() => dialogRef.current?.close()}
          >
            {t('cancel')}
          </Action>
          <Action
            variant="danger"
            onClick={() => {
              dialogRef.current?.close()
              onConfirm()
            }}
          >
            {label}
          </Action>
        </Box>
      </dialog>
    </>
  )
}
