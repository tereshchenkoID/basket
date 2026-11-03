import { z } from 'zod'

import { regex } from '@/constant/regex'
import { validationLimits } from '@/constant/validation'

import { uuid } from '@/helpers/validation'

export const inviteToken = z
  .string()
  .length(validationLimits.inviteToken)
  .regex(regex.inviteToken)

export const createInviteSchema = z.object({
  groupId: uuid,
  locale: z.enum(['en', 'ro', 'ru', 'uk']),
})

export const acceptInviteSchema = z.object({ token: inviteToken })

export const revokeInviteSchema = z.object({ inviteId: uuid })
