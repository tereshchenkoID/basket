import { useTranslations } from 'next-intl'

import { useModalStore } from '@/store/modal'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Text } from '@/components/Text'

import type { ConfirmationProps } from '@/types/modal'

export const Confirmation = ({ label, description, onConfirm }: ConfirmationProps) => {
  const t = useTranslations('Workspace')
  const close = useModalStore(state => state.close)

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
          onClick={close}
        >
          {t('cancel')}
        </Action>
        <Action
          variant="danger"
          onClick={() => {
          close()
          onConfirm()
        }}
        >
          {label}
        </Action>
      </Box>
    </>
  )
}
