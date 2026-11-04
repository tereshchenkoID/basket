import { z } from 'zod'

import { REGEX } from '@/constant/regex'
import { VALIDATION_LIMITS } from '@/constant/validation'

import { UUID } from '@/helpers/validation'

export const INVITE_TOKEN = z
  .string()
  .length(VALIDATION_LIMITS.inviteToken)
  .regex(REGEX.inviteToken)

export const CREATE_INVITE_SCHEMA = z.object({
  groupId: UUID,
  locale: z.enum(['en', 'ro', 'ru', 'uk']),
})

export const ACCEPT_INVITE_SCHEMA = z.object({ token: INVITE_TOKEN })

export const REVOKE_INVITE_SCHEMA = z.object({ inviteId: UUID })
