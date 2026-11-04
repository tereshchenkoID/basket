import { useEffect } from 'react'

import type { DismissOptions } from '@/types/ui'

export const useDismiss = ({ refs, enabled, onDismiss }: DismissOptions) => {
  useEffect(() => {
    if (!enabled) return

    const outside = (event: MouseEvent | FocusEvent) => {
      if (event.target instanceof Node && !refs.some(ref => ref.current?.contains(event.target as Node))) {
        onDismiss('outside')
      }
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) onDismiss('escape')
    }
    document.addEventListener('click', outside)
    document.addEventListener('focusin', outside)
    document.addEventListener('keydown', escape)

    return () => {
      document.removeEventListener('click', outside)
      document.removeEventListener('focusin', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [enabled, onDismiss, refs])
}
