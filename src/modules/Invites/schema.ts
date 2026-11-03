import { z } from 'zod'

import { uuid } from '@/helpers/validation'
export const inviteToken = z
  .string()
  .length(43)
  .regex(/^[A-Za-z0-9_-]{43}$/u)
export const createInviteSchema = z.object({
  groupId: uuid,
  locale: z.enum(['en', 'ro', 'ru', 'uk']),
})
export const acceptInviteSchema = z.object({ token: inviteToken })
export const revokeInviteSchema = z.object({ inviteId: uuid })
