// Decimal strings at every transport boundary; BigInt for exact arithmetic.
export const decimal = (value: string, scale = 2): string | null => {
  const match = /^(-?)(\d{1,10})(?:[.,](\d{1,6}))?$/.exec(value.trim())

  if (!match) return null

  const fraction = (match[3] ?? '').padEnd(scale + 1, '0')
  let units = BigInt(match[2]) * 10n ** BigInt(scale) + BigInt(fraction.slice(0, scale) || '0')

  if (Number(fraction[scale]) >= 5) units += 1n
  if (match[1]) units = -units

  return formatDecimal(units, scale)
}

export const formatDecimal = (units: bigint, scale = 2): string => {
  const sign = units < 0n ? '-' : ''
  const digits = (units < 0n ? -units : units).toString().padStart(scale + 1, '0')

  return `${sign}${digits.slice(0, -scale)}.${digits.slice(-scale)}`
}

export const minor = (value: string): bigint => {
  const normalized = decimal(value)

  if (normalized === null) throw new Error('invalid')

  return BigInt(normalized.replace('.', ''))
}

export const receiptDifference = (items: { line_total: string }[], adjustments: { amount: string }[], total: string): string | null => {
  if (!total || items.some(item => !item.line_total) || adjustments.some(item => !item.amount)) return null

  try {
    const sum = items.reduce((value, item) => value + minor(item.line_total), 0n)
      + adjustments.reduce((value, adjustment) => value + minor(adjustment.amount), 0n)

    return formatDecimal(sum - minor(total))
  } catch {
    return null
  }
}
