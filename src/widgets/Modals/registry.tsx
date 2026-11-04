import type { ReactNode } from 'react'

import { Confirmation } from './Confirmation'
import { Preferences } from './Preferences'

import type { ModalEntry } from '@/types/modal'

export const MODAL_REGISTRY = {
  confirm: modal => modal.name === 'confirm' && <Confirmation {...modal.props} />,
  menu: modal => modal.name === 'menu' && <Preferences {...modal.props} />,
} satisfies Record<ModalEntry['name'], (modal: ModalEntry) => ReactNode>
