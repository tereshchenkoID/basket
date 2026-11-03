export type ActionError =
  | 'invalid'
  | 'unauthorized'
  | 'forbidden'
  | 'unavailable'
  | 'setupRequired'
  | 'inviteInvalid'
  | 'ownerCannotLeave'
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: ActionError }
