import Image from 'next/image'

import styles from './index.module.scss'

export function Avatar({ name, url }: { name: string; url: unknown }) {
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
    <span className={styles.initial} aria-hidden="true">
      {name.slice(0, 1)}
    </span>
  )
}
