import { useEffect } from 'react'

import type { DismissOptions } from './types'

export const useDismiss = ({ refs, enabled, onDismiss }: DismissOptions) => {
  useEffect(() => {
    if (!enabled) return

    const handleOutside = (event: MouseEvent | FocusEvent) => {
      if (event.target instanceof Node && !refs.some(ref => ref.current?.contains(event.target as Node))) {
        onDismiss('outside')
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) onDismiss('escape')
    }
    document.addEventListener('click', handleOutside)
    document.addEventListener('focusin', handleOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('click', handleOutside)
      document.removeEventListener('focusin', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [enabled, onDismiss, refs])
}
