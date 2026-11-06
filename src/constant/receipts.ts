export const RECEIPT_LIMITS = {
  images: 12,
  initializationMs: 120000,
  sourceBytes: 20 * 1024 * 1024,
  imageBytes: 3 * 1024 * 1024,
  edge: 2400,
  pixels: 40_000_000,
  items: 500,
  lines: 1500,
  page: 25,
} as const

export const RECEIPT_STORAGE = 'receipt-images'

export const SYSTEM_STORES = ['Lidl', 'Kaufland', 'Carrefour', 'Auchan', 'Penny', 'Profi', 'Mega Image'] as const

export const RECEIPT_UNITS = ['pcs', 'kg', 'g', 'l', 'ml', 'pack'] as const

export const RECEIPT_TIME_ZONE = 'Europe/Bucharest'

export const RECEIPT_CURRENCIES = ['RON', 'EUR', 'UAH', 'USD'] as const
