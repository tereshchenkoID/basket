import { z } from 'zod'
export const uuid = z.uuid()
export function normalizedText(max: number) {
  return z
    .string()
    .transform((value) => value.replace(/\s+/gu, ' ').trim())
    .pipe(z.string().min(1).max(max))
}
