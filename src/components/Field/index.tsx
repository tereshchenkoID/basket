import { Grid } from '@/components/Grid'
import { Text } from '@/components/Text'

import type { FieldProps } from './types'

export const Field = ({
  id,
  label,
  hint,
  error,
  className,
  children,
}: FieldProps) => (
  <Grid
    gap={2}
    full
    className={className}
  >
    {
      label &&
      <Text
        as="label"
        id={`${id}-label`}
        htmlFor={id}
        size={2}
        color="muted"
        weight="medium"
      >
        {label}
      </Text>
    }
    {children}
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
