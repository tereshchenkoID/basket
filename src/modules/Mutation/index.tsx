import { useTranslations } from 'next-intl'

import { useMutation } from '@/hooks/useMutation'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'
import { Confirm } from '@/widgets/Modals/Confirm'

import type { MutationProps } from './types'

export const Mutation = <T,>({
  label,
  ariaLabel,
  operation,
  onSuccess,
  confirmation,
  confirmationTitle,
  compact,
  variant,
  icon,
  iconOnly,
  disabled,
  className,
}: MutationProps<T>) => {
  const t = useTranslations('Workspace')
  const { execute, pending, error } = useMutation()
  const handleSubmit = async () => {
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
            title={confirmationTitle}
            ariaLabel={ariaLabel}
            variant={variant ?? (compact ? 'secondary' : 'primary')}
            icon={icon}
            iconOnly={iconOnly}
            isLoading={pending}
            disabled={disabled || pending}
            onConfirm={handleSubmit}
          />
          :
          <Action
            variant={variant ?? (compact ? 'secondary' : 'primary')}
            iconOnly={iconOnly}
            aria-label={ariaLabel ?? (iconOnly ? label : undefined)}
            disabled={disabled}
            isLoading={pending}
            onClick={handleSubmit}
          >
            {
              icon &&
              <Icon
                name={icon}
                size={18}
                aria-hidden="true"
              />
            }
            {!iconOnly && label}
          </Action>
      }
      {
        error &&
        <Text
          size={2}
          color="error"
          role="alert"
        >
          {t(`errors.${error}`)}
        </Text>
      }
    </Grid>
  )
}
