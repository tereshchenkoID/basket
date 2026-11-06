import { z } from 'zod'

import { RECEIPT_LIMITS, RECEIPT_UNITS } from '@/constant/receipts'

import { UUID } from '@/helpers/validation'

import { decimal } from './money'

const MONEY = z.string().trim().regex(/^-?\d{1,10}(?:[.,]\d{1,2})?$/).transform(value => decimal(value)!)
const OPTIONAL_MONEY = z.union([z.literal(''), MONEY])
const ITEM = z.object({
  original_name: z.string().max(240),
  display_name: z.string().max(240),
  quantity: z.union([z.literal(''), z.string().regex(/^\d{1,7}(?:[.,]\d{1,3})?$/).refine(value => Number(value.replace(',', '.')) > 0 && Number(value.replace(',', '.')) <= 1000000).transform(value => decimal(value, 3)!)]),
  unit: z.union([z.literal(''), z.enum(RECEIPT_UNITS)]),
  unit_price: OPTIONAL_MONEY.refine(value => !value || !value.startsWith('-')),
  line_total: OPTIONAL_MONEY,
  discount_amount: MONEY.refine(value => !value.startsWith('-')),
  needs_review: z.boolean(),
}).strict()

export const DOCUMENT_SCHEMA = z.object({
  group_id: UUID.nullable(),
  store_id: UUID.nullable(),
  store_name: z.string().trim().max(120),
  purchased_at: z.iso.datetime({ offset: true }).nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  receipt_total: OPTIONAL_MONEY,
  items: z.array(ITEM).max(RECEIPT_LIMITS.items),
  adjustments: z.array(z.object({ name: z.string().trim().min(1).max(120), amount: MONEY }).strict()).max(50),
  accept_mismatch: z.boolean(),
  warnings: z.array(z.enum(['lowQuality', 'ambiguous', 'order', 'gap', 'limit', 'incomplete'])).max(10),
  status: z.enum(['draft', 'processing', 'review', 'confirmed', 'failed']),
}).strict()

export const SAVE_RECEIPT_SCHEMA = z.object({ id: UUID, document: DOCUMENT_SCHEMA, revision: z.number().int().nonnegative(), confirm: z.boolean().default(false), correction: z.boolean().default(false) }).strict()

export const IMAGE_SCHEMA = z.object({ receiptId: UUID, imageId: UUID, position: z.number().int().min(0).max(RECEIPT_LIMITS.images - 1), replaceId: UUID.optional() }).strict()

export const SEGMENT_SCHEMA = z.object({ receiptId: UUID, imageId: UUID, lines: z.array(z.string().max(500)).max(RECEIPT_LIMITS.lines), confidence: z.number().min(0).max(100), status: z.enum(['pending', 'processing', 'ready', 'failed']) }).strict()

export const REMOVE_IMAGE_SCHEMA = z.object({ receiptId: UUID, imageId: UUID }).strict()

export const DELETE_DRAFT_SCHEMA = z.object({ id: UUID }).strict()
