import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import Icon from '@/components/Icon'
import { Text } from '@/components/Text'

import type { BreadcrumbsProps } from './types'

import styles from './index.module.scss'

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const t = useTranslations('Workspace')

  if (!items.length) return null

  return (
    <nav aria-label={t('breadcrumbs')}>
      <ol className={styles.list}>
        {
          items.map((item, index) =>
            <li
              key={item.href ?? item.label}
              className={styles.item}
            >
              {
                index > 0 &&
                <Icon
                  name="chevron-right"
                  className={styles.icon}
                  size={16}
                  aria-hidden="true"
                />
              }
              {
                item.href && index < items.length - 1
                  ?
                  <Link
                    href={item.href}
                    className={styles.link}
                  >
                    <Text
                      as="span"
                      size={2}
                    >
                      {item.label}
                    </Text>
                  </Link>
                  :
                  <Text
                    as="span"
                    size={2}
                    weight={index === items.length - 1 ? 'semibold' : 'regular'}
                    aria-current={index === items.length - 1 ? 'page' : undefined}
                  >
                    {item.label}
                  </Text>
              }
            </li>
          )
        }
      </ol>
    </nav>
  )
}
