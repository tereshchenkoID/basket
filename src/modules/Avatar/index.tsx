import Image from 'next/image'

import { Text } from '@/components/Text'

import styles from './index.module.scss'

import type { AvatarProps } from '@/types/components'

export const Avatar = ({ name, url }: AvatarProps) => {
  let source: string | null = null

  if (typeof url === 'string') {
    try {
      const parsed = new URL(url)

      if (
        parsed.protocol === 'https:' &&
        !parsed.username &&
        !parsed.password &&
        (parsed.hostname === 'googleusercontent.com' ||
          parsed.hostname.endsWith('.googleusercontent.com'))
      ) {
        source = parsed.href
      }
    } catch {
      /* Invalid avatars fall back to an initial. */
    }
  }

  return source ? (
    <Image
      className={styles.avatar}
      src={source}
      alt=""
      width={40}
      height={40}
      unoptimized
      referrerPolicy="no-referrer"
    />
  ) : (
    <Text
      as="span"
      className={styles.initial}
      aria-hidden="true"
    >
      {name.slice(0, 1)}
    </Text>
  )
}
