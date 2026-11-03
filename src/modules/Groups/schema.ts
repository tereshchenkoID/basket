import { z } from 'zod'

import { normalizedText, uuid } from '@/helpers/validation'
export const createGroupSchema = z.object({
  id: uuid,
  name: normalizedText(80),
  locale: z.enum(['en', 'ro', 'ru', 'uk']),
})
export const renameGroupSchema = z.object({ groupId: uuid, name: normalizedText(80) })
export const removeMemberSchema = z.object({ groupId: uuid, memberId: uuid })
