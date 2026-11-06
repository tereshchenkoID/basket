import clsx from 'clsx'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Text } from '@/components/Text'

import type { FieldProps } from './types'

import styles from './index.module.scss'

export const Field = ({
  id,
  label,
  hint,
  error,
  className,
  children,
}: FieldProps) => (
  <Grid
    gap={1}
    full
    className={
      clsx(
        styles.block,
        className
      )
    }
  >
    <Box className={styles.wrapper}>
    {
      label &&
      <Text
        as="label"
        id={`${id}-label`}
        htmlFor={id}
        color="muted"
        weight="medium"
        className={styles.label}
      >
        {label}
      </Text>
    }
    {children}
    </Box>
    {
      (error || hint) &&
      <Text
        id={`${id}-message`}
        size={2}
        color={error ? 'error' : 'muted'}
        role={error ? 'alert' : undefined}
      >
        {error || hint}
      </Text>
    }
  </Grid>
)
