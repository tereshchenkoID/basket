import type { ActionError } from '@/types/action'

export const VALIDATION_ERRORS = {
  required: 'textRequired',
  maxLength: 'textTooLong',
  quantity: 'invalidQuantity',
  unit: 'invalidUnit',
} as const

export const DATABASE_ERROR_MESSAGES = {
  group_unavailable: 'groupUnavailable',
  restore_expired: 'restoreExpired',
  invalid_invite: 'inviteInvalid',
  owner_cannot_leave: 'ownerCannotLeave',
} as const satisfies Record<string, ActionError>

export const DATABASE_ERROR_CODES = {
  PGRST202: 'setupRequired',
  PGRST205: 'setupRequired',
  '42P01': 'setupRequired',
  '42883': 'setupRequired',
  '42501': 'forbidden',
  '23514': 'invalid',
  '22003': 'invalid',
  '22P02': 'invalid',
  '23502': 'invalid',
} as const satisfies Record<string, ActionError>
