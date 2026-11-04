import { getTranslations } from 'next-intl/server'
import clsx from 'clsx'
import { ArrowUpRight } from 'lucide-react'

import { creator } from '@/constant/brand'

import { Box } from '@/components/Box'
import { Text } from '@/components/Text'

import styles from './index.module.scss'

import type { FooterProps } from '@/types/components'

export const Footer = async ({ className }: FooterProps) => {
  const t = await getTranslations('Common')

  return (
    <Box
      as="footer"
      container
      display="flex"
      direction={{ initial: 'column', tabS: 'row' }}
      justify="between"
      align={{ initial: 'start', tabS: 'center' }}
      gap={2}
      className={
        clsx(
          styles.block,
          className
        )
      }
    >
      <Text
        size="sm"
        color="muted"
      >
        {t('copyright', { year: new Date().getFullYear() })}
      </Text>
      <Box
        display="flex"
        align="center"
        wrap="wrap"
        gap={2}
      >
        <Text
          as="span"
          size="sm"
          color="muted"
        >
          {t('creator')}
        </Text>
        <a
          className={styles.link}
          href={creator.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Text
            as="span"
            size="sm"
            weight={600}
          >
            {creator.name}
          </Text>
          <ArrowUpRight
            className={styles.icon}
            size={16}
            aria-hidden="true"
          />
        </a>
      </Box>
    </Box>
  )
}
