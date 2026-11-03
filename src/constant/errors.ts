import type { ActionError } from '@/types/action'

export const validationErrors = {
  required: 'textRequired',
  maxLength: 'textTooLong',
  quantity: 'invalidQuantity',
  unit: 'invalidUnit',
} as const

export const databaseErrorMessages = {
  invalid_invite: 'inviteInvalid',
  owner_cannot_leave: 'ownerCannotLeave',
} as const satisfies Record<string, ActionError>

export const databaseErrorCodes = {
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
