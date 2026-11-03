import type { validationErrors } from '@/constant/errors'

export type ActionError =
  | (typeof validationErrors)[keyof typeof validationErrors]
  | 'invalid'
  | 'unauthorized'
  | 'forbidden'
  | 'unavailable'
  | 'setupRequired'
  | 'inviteInvalid'
  | 'ownerCannotLeave'

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: ActionError }
