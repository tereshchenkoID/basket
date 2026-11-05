'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { ROUTES_USER } from '@/constant/navigation'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'
import { Google } from '@/modules/Providers/Google'

import type { HomeViewProps } from './types'

import styles from './index.module.scss'

const Section = ({ locale, authenticated, configured }: HomeViewProps) => {
  const t = useTranslations('Home')

  return (
    <Grid
      as="section"
      full
      columns={{ initial: 1, tabS: '1.05fr 1fr' }}
      align="center"
      gap={{ initial: 5, tabS: 6 }}
      py={{ initial: 5, tabS: 6 }}
    >
      <Box>
        <Text
          className={styles.eyebrow}
          transform="uppercase"
          size={1}
          weight="bold"
          color="accent"
        >
          <Text
            as="span"
            className={styles.dot}
            aria-hidden="true"
          />
          {t('eyebrow')}
        </Text>
        <Heading
          as="h1"
          size={7}
          weight="medium"
          className={styles.title}
        >
          {t('title')}{' '}
          <Text
            as="em"
            family="accent"
            weight="regular"
            color="accent"
          >
            {t('accent')}
          </Text>
        </Heading>
        <Text
          color="muted"
          my={4}
        >
          {t('description')}
        </Text>
        <Box>
          {
            authenticated
              ?
              <Action
                href={ROUTES_USER.dashboard.url}
                variant="secondary"
                className={styles.dashboard}
              >
                <Text as="span">{t('dashboard')}</Text>
                <Icon
                  name="arrow-up-right"
                  size={18}
                  aria-hidden="true"
                />
              </Action>
              :
              <>
                <Google
                  locale={locale}
                  configured={configured}
                />
                <Text
                  size={2}
                  color="muted"
                  align="center"
                  mt={3}
                >
                  {t('note')}
                </Text>
              </>
          }
        </Box>
        <Box
          display="flex"
          align="center"
          gap={3}
          mt={{ initial: 5, tabS: 6 }}
          pt={4}
          className={styles.caption}
        >
          <Icon
            name="leaf"
            className={styles.leaf}
            size={24}
            aria-hidden="true"
          />
          {t('caption')}
        </Box>
      </Box>
      <Box
        className={styles.art}
      >
        <Image
          src="/basket.svg"
          width={560}
          height={560}
          alt="Basket"
          priority
        />
        <Text
          size={2}
          color="accent"
          align="center"
          px={4}
          pb={5}
        >
          {t('artCaption')}
        </Text>
      </Box>
    </Grid>
  )
}

export default Section
