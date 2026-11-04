import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowUpRight, Leaf } from 'lucide-react'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'
import { GoogleLoginButton } from '@/modules/Providers/Google'

import styles from '../page.module.scss'

import type { HomeViewProps } from '@/types/views'

const HomeView = ({ locale, authenticated, configured }: HomeViewProps) => {
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
          size="xs"
          weight={700}
          color="accent"
        >
          <Text
            as="span"
            className={styles.dot}
            aria-hidden="true"
          /> {t('eyebrow')}
        </Text>
        <Heading
          as="h1"
          size="hero"
          weight={500}
          className={styles.title}
        >
          {t('title')}{' '}
          <Text
            as="em"
            family="accent"
            weight={400}
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
                href="/dashboard"
                variant="secondary"
                className={styles.dashboard}
              >
                <Text as="span">{t('dashboard')}</Text>
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                />
              </Action>
              :
              <>
                <GoogleLoginButton
                  locale={locale}
                  configured={configured}
                />
                <Text
                  size="sm"
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
          <Leaf
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
          className={styles.image}
          src="/basket.svg"
          width={560}
          height={560}
          alt=""
          priority
        />
        <Text
          size="sm"
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

export default HomeView
