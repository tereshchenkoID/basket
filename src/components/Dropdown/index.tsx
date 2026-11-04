import clsx from 'clsx'

import Icon from '@/components/Icon'

import type { DropdownProps } from './types'

import styles from './index.module.scss'

export const Dropdown = ({ label, plain, children, className, ...props }: DropdownProps) => (
  <details
    {...props}
    className={
      clsx(
        styles.block,
        {
          [styles.plain]: plain
        },
        className
      )
    }
  >
    <summary className={styles.summary}>
      <Icon
        name="chevron-right"
        className={styles.icon}
        size={16}
        aria-hidden="true"
      />
      {label}
    </summary>
    <div className={styles.content}>{children}</div>
  </details>
)
