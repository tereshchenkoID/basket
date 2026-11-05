'use client'

import { useTranslations } from 'next-intl'

import { NAVIGATION } from '@/constant/navigation'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'

const NotFound = () => {
  const t = useTranslations('NotFound')

  return (
    <Grid
      as="section"
      full
      gap={3}
      py={6}
    >
      <Text
        size={7}
        weight="bold"
        color="accent"
        align="center"
      >
        404
      </Text>
      <Heading
        as="h1"
        size={6}
        align="center"
      >
        {t('title')}
      </Heading>
      <Text
        color="muted"
        align="center"
      >
        {t('description')}
      </Text>
      <Box
        display="flex"
        justify="center"
        mt={3}
      >
        <Action
          href={NAVIGATION.home.url}
          variant="secondary"
        >
          <Icon
            name="arrow-left"
            size={18}
            aria-hidden="true"
          />
          {t('home')}
        </Action>
      </Box>
    </Grid>
  )
}

export default NotFound
