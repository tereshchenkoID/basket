import { SYSTEM_STORES } from '@/constant/receipts'

import { receiptInstant } from './date'
import { decimal, formatDecimal, minor } from './money'
import type { ReceiptDocument, ReceiptItem } from './types'

export const safeOcrLines = (lines: string[]) => lines.slice(0, 1500).map(line => line.slice(0, 500).trim()).filter(line =>
  line && !/\b(card|visa|mastercard|iban|rrn|stan|cui|cif|numerar|cash|tranzactie|tid|mid|aid|auth|batch|ctls|pin)\b|\d{12,}/i.test(line)
)

const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase()

// Store-specific tokens remain outside the editor. Add adapters here, not UI branches.
const STORE_ADAPTERS = {
  Lidl: { discount: /reducere|discount|cupon|lidl plus/i },
  Kaufland: { discount: /reducere|discount|cupon|kaufland card/i },
} as const

export const emptyDocument = (): ReceiptDocument => ({
  group_id: null,
  store_id: null,
  store_name: '',
  purchased_at: null,
  currency: 'RON',
  receipt_total: '',
  items: [],
  adjustments: [],
  accept_mismatch: false,
  warnings: [],
  status: 'draft',
})

export const emptyItem = (): ReceiptItem => ({ original_name: '', display_name: '', quantity: '', unit: '', unit_price: '', line_total: '', discount_amount: '0.00', needs_review: true })

export const parseReceipt = (source: string[]): ReceiptDocument => {
  const sourceLines = safeOcrLines(source)
  const lines = sourceLines.map(line => line
    .replace(/^[^\p{L}\d-]+/u, '')
    .replace(/[×✕]/g, 'x')
    .replace(/\bTOTA[IL1]\b/g, 'TOTAL')
    .replace(/0RA(?=[:.])/g, 'ORA')
    .replace(/(\d):(?=\d{3}\s*(?:BUC|KG))/i, '$1,')
    .replace(/[|"'\s]+$/, '')
    .trim())
  const result = emptyDocument()
  result.status = 'review'
  result.store_name = SYSTEM_STORES.find(store => lines.slice(0, 25).some(line => normalize(line).includes(store.toUpperCase()))) ?? ''

  if (!result.store_name && lines.some(line => /L[Il1][DU][Ll1]\s+DISCOUNT|(?:la|facute)\s+Lid[l1)]/i.test(line))) result.store_name = 'Lidl'

  if (!result.store_name && lines.some(line => /\bJYSK\b/i.test(line))) result.store_name = 'JYSK'

  if (!result.store_name && lines.some(line => /DM\s+DROGHERIE\s+MARKT|dm[-.]drogeriemarkt[.]ro/i.test(line))) result.store_name = 'dm'

  const adapter = STORE_ADAPTERS[result.store_name as keyof typeof STORE_ADAPTERS]
  const discount = adapter?.discount ?? /reducere|discount|cupon/i
  const currency = lines.join(' ').match(/\b(EUR|USD|RON|LEI)\b/i)?.[1]?.toUpperCase()

  if (currency) result.currency = currency === 'LEI' ? 'RON' : currency

  let totalsStarted = false
  let subtotal = ''
  let pendingName = ''
  let lastItemLine = -2
  let pending: { quantity: string; unit: string; unit_price: string; line_total?: string } | null = null

  for (const [lineIndex, line] of lines.entries()) {
    const date = /(?<!\d)(\d{1,2})[./-](\d{1,2})[./-](20\d{2})(?:\s*(?:[O0]RA\s*[:.]?\s*)?)(\d{2})[:.-](\d{2})(?:[:.\s-]?(\d{2}))?\b/i.exec(line)

    if (date) {
      const value = `${date[3]}-${date[2].padStart(2, '0')}-${date[1].padStart(2, '0')}T${date[4]}:${date[5]}:${date[6] ?? '00'}`
      result.purchased_at = receiptInstant(value)

      continue
    }

    const amount = /(-?\d{1,10}[.,]\d{2})\s*(?:RON|LEI|[A-F08])?[\s|"'.,]*$/i.exec(line)

    if (amount && discount.test(line.slice(0, amount.index))) {
      const name = line.slice(0, amount.index).trim()
      const value = decimal(amount[1])

      if (value) {
        const reduction = minor(value) < 0n ? -minor(value) : minor(value)
        const previous = result.items.at(-1)

        if (previous?.line_total && lastItemLine === lineIndex - 1 && !/total|bon|cupon|voucher/i.test(name)) {
          previous.discount_amount = formatDecimal(minor(previous.discount_amount) + reduction)
          previous.line_total = formatDecimal(minor(previous.line_total) - reduction)
        } else result.adjustments.push({ name, amount: formatDecimal(-reduction) })
      }

      continue
    }

    if (/^(?:[A-Z]\s+)?(?:TOTAL(?:\s+(?:DE\s+PLATA|PLATA|RON|LEI))?|DE\s+PLATA)\b/i.test(line) && !/subtotal|sub total|[ti]va|tax/i.test(line)) {
      const total = line.match(/-?\d{1,10}[.,]\d{2}(?=[^\d]*$)/)?.[0]

      if (total) {
        const value = decimal(total) ?? ''

        if (result.receipt_total && result.receipt_total !== value) result.warnings.push('ambiguous')

        result.receipt_total = value
      }

      totalsStarted = true

      continue
    }

    if (/^SUB\s*TOTAL\b/i.test(line)) {
      const nearby = [line, lines[lineIndex - 1] ?? '', lines[lineIndex + 1] ?? '']
      const value = nearby.find(value => /^(?:SUB\s*TOTAL(?:\s+LEI)?\s*)?-?\d+[.,]\d{2}\s*$/i.test(value))?.match(/-?\d+[.,]\d{2}/)?.[0]

      if (value) subtotal = decimal(value) ?? ''

      continue
    }

    if (totalsStarted) continue

    if (/^(?:TV[AAD]|TAB|TAX)\b/i.test(line) && /%/.test(line)) continue

    if (/voucher\s+s[gc]r|voucher\s+sr\b|cod\s+ident|\bjud[.,]|\bstrada\b|\bcasier\b|\bdata[: ]|\bora[: ]|\bid\s+unic|multum|cumparatur|\bmg\s+|\bnr[., ]/i.test(line)) { pendingName = ''; pending = null; continue }

    if (/subtotal|sub total|\btva\b|\btax[ae]?\b|\brest\b|\bbon\b|\bfiscal\b|\boperator\b|\bcasa\b|\bterminal\b|\bpos\b|\bplata\b|\bachitat\b|\btotal\b|\btelefon\b|\btel\b|\badresa\b/i.test(line)) continue

    const weighted = /^(?:[^\p{L}\d]*)(\d+[.,]\d+|\d+)\s*(kg|g|l|ml|bu[c]?(?:at[i1]|ăți)?|pcs)?\s*[xX*]\s*(\d+[.,]\d{2})(?:\s*(?:RON|LEI)?\s*\/?(?:kg|buc))?/iu.exec(line)

    if (weighted) {
      const values = { quantity: decimal(weighted[1], 3) ?? '', unit: weighted[2]?.toLowerCase().replace(/^bu[c]?(?:at[i1]|ăți)?$/, 'pcs') ?? '', unit_price: decimal(weighted[3]) ?? '' }
      const previous = result.items.at(-1)

      const expected = values.quantity && values.unit_price
        ? formatDecimal((BigInt(values.quantity.replace('.', '')) * minor(values.unit_price) + 500n) / 1000n)
        : null
      const nextLine = lines[lineIndex + 1] ?? ''
      const nextAmount = nextLine.match(/(-?\d+[.,]\d{2})\s*[A-F]?\s*$/)?.[1]
      const previousMatches = previous && lastItemLine === lineIndex - 1 && previous.line_total === expected
      const nextMatches = !/total|tva|reducere|discount/i.test(nextLine) && nextAmount && decimal(nextAmount) === expected
      const lidlNext = result.store_name === 'Lidl' && /[\p{L}]/u.test(nextLine) && !/total|tva|reducere|discount|\b(?:BUC|KG)\s*[x*]/i.test(nextLine)

      const trailing = amount && amount.index >= weighted[0].length ? decimal(amount[1]) : null
      const detail = /^[（(]/.test(sourceLines[lineIndex] ?? '')

      if (detail && previousMatches) Object.assign(previous, values)
      else if (lidlNext) pending = { ...values, ...(trailing ? { line_total: trailing } : {}) }
      else if (previousMatches && nextMatches) {
        result.warnings.push('ambiguous')
        pending = null
      } else if (previousMatches && !pendingName) Object.assign(previous, values)
      else if (pendingName && amount && amount.index >= weighted[0].length) {
        result.items.push({ ...emptyItem(), ...values, original_name: pendingName, display_name: pendingName, line_total: decimal(amount[1]) ?? '' })
        pendingName = ''
        pending = null
        lastItemLine = lineIndex
      } else if (trailing || nextMatches || !previous) pending = { ...values, ...(trailing ? { line_total: trailing } : {}) }
      else result.warnings.push('incomplete')

      continue
    }

    // Unreadable quantity/price lines must never become product names.
    if (/\b(?:BUC|BC|BEX|KG)\s*[x*]/i.test(line)) { pending = null; result.warnings.push('incomplete'); continue }

    if (amount && !line.slice(0, amount.index).trim() && pending) {
      pending.line_total = decimal(amount[1]) ?? ''

      continue
    }

    if (!amount) {
      if (pending && /[\p{L}]{3}/u.test(line) && !/^[\d\s.,%/-]+$/.test(line)) {
        const name = line.split(/\s{2,}/)[0].replace(/[^\p{L}\d\s.,%-]+/gu, '').trim().slice(0, 240)
        result.items.push({ ...emptyItem(), ...pending, original_name: name, display_name: name, line_total: pending.line_total ?? '' })

        if (!pending.line_total) result.warnings.push('incomplete')

        pending = null
        pendingName = ''
        lastItemLine = lineIndex
      } else if (/[\p{L}]/u.test(line) && !SYSTEM_STORES.some(store => normalize(line).includes(store.toUpperCase()))) pendingName = line.slice(0, 240)

      continue
    }

    const total = decimal(amount[1])
    const name = line.slice(0, amount.index).replace(/[|"'_*]+/g, '').trim().replace(/\s+[A-F]$/, '').trim()

    if (!total || !/[\p{L}]/u.test(name)) continue

    if (result.items.length >= 500) { result.warnings.push('limit'); break }

    const item = { ...emptyItem(), original_name: name, display_name: name, line_total: total, ...pending }

    if (pending?.quantity && pending.unit_price && total !== formatDecimal((BigInt(pending.quantity.replace('.', '')) * minor(pending.unit_price) + 500n) / 1000n)) result.warnings.push('incomplete')

    result.items.push(item)
    pending = null
    pendingName = ''
    lastItemLine = lineIndex
  }

  if (!result.receipt_total && subtotal) result.receipt_total = subtotal

  if (!result.store_name || !result.purchased_at || !result.receipt_total || !result.items.length) result.warnings.push('incomplete')

  result.warnings = [...new Set(result.warnings)]

  return result
}
