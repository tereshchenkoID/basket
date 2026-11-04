import type { ModalEntry } from '@/types/modal'

export type ModalStore = {
  modal: ModalEntry | null
  open: (modal: ModalEntry) => void
  close: () => void
}
