import { useTranslations } from 'next-intl'

import { useMutation } from '@/hooks/useMutation'

import { Action } from '@/components/Action'
import { Confirm } from '@/components/Confirm'
import { Grid } from '@/components/Grid'
import { Text } from '@/components/Text'

import type { MutationProps } from '@/types/components'

export const Mutation = <T,>({
  label,
  operation,
  onSuccess,
  confirmation,
  compact,
  className,
}: MutationProps<T>) => {
  const t = useTranslations('Workspace')
  const { execute, pending, error } = useMutation()
  const run = async () => {
    const result = await execute(operation)

    if (result) onSuccess?.(result.data)
  }

  return (
    <Grid
      gap={2}
      className={className}
    >
      {
        confirmation
          ?
          <Confirm
            label={label}
            description={confirmation}
            disabled={pending}
            onConfirm={() => void run()}
          />
          :
          <Action
            variant={compact ? 'secondary' : 'primary'}
            isLoading={pending}
            onClick={() => void run()}
          >
            {label}
          </Action>
      }
      {
        error &&
        <Text
          size="sm"
          color="error"
          role="alert"
        >
          {t(`errors.${error}`)}
        </Text>
      }
    </Grid>
  )
}
