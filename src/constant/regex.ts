export const regex = {
  whitespace: /\s+/gu,
  inviteToken: /^[A-Za-z0-9_-]{43}$/u,
  authDestination: /^\/(en|ro|ru|uk)\/(?:dashboard|invite\/[A-Za-z0-9_-]{43})$/,
} as const
