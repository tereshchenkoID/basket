import { useTranslations } from 'next-intl'

import { useModalStore } from '@/store/modal'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Text } from '@/components/Text'

import type { ConfirmationProps } from '@/types/modal'

export const Confirmation = ({ label, description, onConfirm }: ConfirmationProps) => {
  const t = useTranslations('Workspace')
  const handleClose = useModalStore(state => state.close)

  const handleClick = () => {
    handleClose()
    onConfirm()
  }

  return (
    <>
      <Text color="muted">{description}</Text>
      <Box
        display="flex"
        justify="end"
        gap={2}
        wrap="wrap"
      >
        <Action
          variant="secondary"
          onClick={handleClose}
        >
          {t('cancel')}
        </Action>
        <Action
          variant="danger"
          onClick={handleClick}
        >
          {label}
        </Action>
      </Box>
    </>
  )
}
