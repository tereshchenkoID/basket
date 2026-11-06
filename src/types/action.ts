import type { VALIDATION_ERRORS } from '@/constant/errors'

export type ActionError =
  | (typeof VALIDATION_ERRORS)[keyof typeof VALIDATION_ERRORS]
  | 'invalid'
  | 'unauthorized'
  | 'forbidden'
  | 'unavailable'
  | 'setupRequired'
  | 'inviteInvalid'
  | 'ownerCannotLeave'
  | 'groupUnavailable'
  | 'restoreExpired'
  | 'receiptConflict'

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: ActionError }
