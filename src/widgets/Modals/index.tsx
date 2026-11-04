'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { useModalStore } from '@/store/modal'

import { Modal } from './Modal'
import { MODAL_REGISTRY } from './registry'

export const Modals = () => {
  const modal = useModalStore(state => state.modal)
  const close = useModalStore(state => state.close)
  const pathname = usePathname()

  useEffect(() => {
    close()
  }, [pathname, close])

  if (!modal) return null

  return (
    <Modal
      key={modal.name}
      title={modal.title}
      drawer={modal.name === 'menu'}
    >
      {MODAL_REGISTRY[modal.name](modal)}
    </Modal>
  )
}
