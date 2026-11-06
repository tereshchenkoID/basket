import { getTranslations } from 'next-intl/server'
import clsx from 'clsx'

// import { CREATOR } from '@/constant/brand'
// import { Box } from '@/components/Box'
// import Icon from '@/components/Icon'
import { Container } from '@/components/Container'
import { Text } from '@/components/Text'

import type { FooterProps } from './types'

import styles from './index.module.scss'

export const Footer = async ({ className }: FooterProps) => {
  const t = await getTranslations('Workspace')

  return (
    <Container
      as="footer"
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
        size={2}
        color="muted"
      >
        {t('copyright', { year: new Date().getFullYear() })}
      </Text>
      {/*<Box*/}
      {/*  display="flex"*/}
      {/*  align="center"*/}
      {/*  wrap="wrap"*/}
      {/*  gap={2}*/}
      {/*>*/}
      {/*  <Text*/}
      {/*    as="span"*/}
      {/*    size={2}*/}
      {/*    color="muted"*/}
      {/*  >*/}
      {/*    {t('creator')}*/}
      {/*  </Text>*/}
      {/*  <a*/}
      {/*    className={styles.link}*/}
      {/*    href={CREATOR.url}*/}
      {/*    target="_blank"*/}
      {/*    rel="noopener noreferrer"*/}
      {/*  >*/}
      {/*    <Text*/}
      {/*      as="span"*/}
      {/*      size={2}*/}
      {/*      weight="semibold"*/}
      {/*    >*/}
      {/*      {CREATOR.name}*/}
      {/*    </Text>*/}
      {/*    <Icon*/}
      {/*      name="arrow-up-right"*/}
      {/*      className={styles.icon}*/}
      {/*      size={16}*/}
      {/*      aria-hidden="true"*/}
      {/*    />*/}
      {/*  </a>*/}
      {/*</Box>*/}
    </Container>
  )
}
