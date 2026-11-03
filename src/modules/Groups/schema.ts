import { z } from 'zod'

import { validationLimits } from '@/constant/validation'

import { normalizedText, uuid } from '@/helpers/validation'

export const createGroupSchema = z.object({
  id: uuid,
  name: normalizedText(validationLimits.groupName),
  locale: z.enum(['en', 'ro', 'ru', 'uk']),
})

export const renameGroupSchema = z.object({ groupId: uuid, name: normalizedText(validationLimits.groupName) })

export const removeMemberSchema = z.object({ groupId: uuid, memberId: uuid })
