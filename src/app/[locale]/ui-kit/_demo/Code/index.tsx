'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { copyText } from '@/lib/platform/clipboard'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'

import { formatCode } from './helpers'
import type { CodeProps, CopyStatus } from './types'

import styles from './index.module.scss'

export const Code = ({ children }: CodeProps) => {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const code = formatCode(children)

  return (
    <Box
      border
      radius="small"
      className={styles.block}
    >
      <Box
        display="flex"
        justify="end"
        p={2}
      >
        <Action
          variant="ghost"
          aria-label="Copy code"
          onClick={async () => {
            try {
              await copyText(code)
              setStatus('copied')
            } catch {
              setStatus('error')
            }
          }}
        >
          {
            status === 'copied'
              ?
              <Check
                size={16}
                aria-hidden="true"
              />
              :
              <Copy
                size={16}
                aria-hidden="true"
              />
          }
          <span aria-live="polite">{status === 'copied' ? 'Copied' : status === 'error' ? 'Copy failed' : 'Copy'}</span>
        </Action>
      </Box>
      <pre className={styles.code}>
        <code>{code}</code></pre>
    </Box>
  )
}
