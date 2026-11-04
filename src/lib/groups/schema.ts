import { z } from 'zod'

import { VALIDATION_LIMITS } from '@/constant/validation'

import { normalizedText, UUID } from '@/helpers/validation'

export const CREATE_GROUP_SCHEMA = z.object({
  id: UUID,
  name: normalizedText(VALIDATION_LIMITS.groupName),
  locale: z.enum(['en', 'ro', 'ru', 'uk']),
})

export const RENAME_GROUP_SCHEMA = z.object({ groupId: UUID, name: normalizedText(VALIDATION_LIMITS.groupName) })

export const REMOVE_MEMBER_SCHEMA = z.object({ groupId: UUID, memberId: UUID })
