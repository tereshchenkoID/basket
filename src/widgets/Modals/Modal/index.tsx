import type { PointerEvent, SyntheticEvent } from 'react'
import { useEffect, useId, useRef } from 'react'
import { useTranslations } from 'next-intl'
import clsx from 'clsx'

import { useModalStore } from '@/store/modal'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'

import type { ModalProps } from './types'

import styles from './index.module.scss'

export const Modal = ({ title, drawer, children }: ModalProps) => {
  const t = useTranslations('Workspace')
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const handleClose = useModalStore(state => state.close)

  useEffect(() => {
    const dialog = dialogRef.current
    const trigger = document.activeElement
    const previous = document.body.style.overflow

    dialog?.showModal()
    document.body.style.overflow = 'hidden'

    return () => {
      dialog?.close()
      document.body.style.overflow = previous

      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [])

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault()
    handleClose()
  }

  const handlePointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return

    const rect = event.currentTarget.getBoundingClientRect()

    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      event.preventDefault()
      handleClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={
        clsx(
          styles.block,
          {
            [styles.drawer]: drawer
          }
        )
      }
      aria-labelledby={id}
      onCancel={handleCancel}
      onPointerDown={handlePointerDown}
    >
      <Box
        display="flex"
        justify="between"
        align="center"
        gap={3}
      >
        <Heading
          id={id}
          size={5}
        >
          {title}
        </Heading>
        <Action
          className={styles.close}
          variant="secondary"
          iconOnly
          aria-label={t('close')}
          onClick={handleClose}
        >
          <Icon
            name="x"
            size={20}
            aria-hidden="true"
          />
        </Action>
      </Box>
      {children}
    </dialog>
  )
}
