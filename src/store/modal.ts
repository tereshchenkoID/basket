'use client'

import { create } from 'zustand'

import type { ModalStore } from './types'

export const useModalStore = create<ModalStore>()(set => ({
  modal: null,
  open: modal => set({ modal }),
  close: () => set({ modal: null }),
}))
