import type { PreferencesProps } from '@/types/components'

export type ConfirmationProps = {
  label: string
  description: string
  onConfirm: () => void
}

export type ModalEntry =
  | { name: 'confirm'; title: string; props: ConfirmationProps }
  | { name: 'menu'; title: string; props: PreferencesProps }
