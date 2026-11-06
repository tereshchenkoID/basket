import { RECEIPT_TIME_ZONE } from '@/constant/receipts'

const FORMAT = new Intl.DateTimeFormat('en-GB', { timeZone: RECEIPT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })

const parts = (value: number) => Object.fromEntries(FORMAT.formatToParts(new Date(value)).map(part => [part.type, part.value]))

export const receiptLocalDate = (iso: string | null): string => {
  if (!iso || Number.isNaN(Date.parse(iso))) return ''

  const value = parts(Date.parse(iso))

  return `${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}:${value.second}`
}

export const receiptInstant = (value: string): string | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)

  if (!match) return null

  const [year, month, day, hour, minute, second] = match.slice(1).map(value => Number(value ?? 0))
  const guess = Date.UTC(year, month - 1, day, hour, minute, second)
  const current = parts(guess)
  const local = Date.UTC(+current.year, +current.month - 1, +current.day, +current.hour, +current.minute, +current.second)
  const iso = new Date(guess - (local - guess)).toISOString()

  return receiptLocalDate(iso).slice(0, value.length) === value ? iso : null
}
