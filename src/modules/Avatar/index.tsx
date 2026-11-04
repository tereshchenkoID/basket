import Image from 'next/image'

import { Text } from '@/components/Text'

import type { AvatarProps } from './types'

import styles from './index.module.scss'

export const Avatar = ({ name, url }: AvatarProps) => {
  let source: string | null = null

  if (typeof url === 'string') {
    try {
      const parsed = new URL(url)

      if (
        parsed.protocol === 'https:' &&
        !parsed.username &&
        !parsed.password &&
        (parsed.hostname === 'googleusercontent.com' || parsed.hostname.endsWith('.googleusercontent.com'))
      ) {
        source = parsed.href
      }
    } catch {
      /* Invalid avatars fall back to an initial. */
    }
  }

  if (source) return (
    <Image
      className={styles.block}
      src={source}
      alt=""
      width={40}
      height={40}
      unoptimized
      referrerPolicy="no-referrer"
    />
  )

  return (
    <Text
      as="span"
      className={styles.text}
      aria-hidden="true"
    >
      {name.slice(0, 1)}
    </Text>
  )
}
