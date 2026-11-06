import type { OcrResult } from './types'

const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase().replace(/[^A-Z0-9.,-]/g, '')

const similarity = (first: string, second: string) => {
  if (first === second) return 1

  const prices = [first, second].map(value => value.match(/-?\d+[.,]\d{2}$/)?.[0]?.replace(',', '.'))

  if (prices[0] !== prices[1]) return 0

  let row = Array.from({ length: second.length + 1 }, (_, index) => index)

  for (let left = 1; left <= first.length; left++) {
    const next = [left]

    for (let right = 1; right <= second.length; right++)
      next[right] = Math.min(next[right - 1] + 1, row[right] + 1, row[right - 1] + (first[left - 1] === second[right - 1] ? 0 : 1))

    row = next
  }

  return 1 - row[second.length] / Math.max(first.length, second.length, 1)
}

const overlaps = (first: string[], second: string[]) => {
  const candidates: number[] = []

  for (let size = 2; size <= Math.min(50, first.length, second.length); size++) {
    const suffix = first.slice(-size).map(normalize)
    const prefix = second.slice(0, size).map(normalize)

    if (suffix.every((line, index) => similarity(line, prefix[index]) >= 0.88)
      && suffix.some(line => /\d+[.,]\d{2}/.test(line))) candidates.push(size)
  }

  return candidates
}

// A second photo can repeat a section *inside* the first photo, including its total.
// Require several ordered, differently-priced anchors before replacing the shared tail.
const containedOverlap = (first: string[], second: string[]) => {
  const canonical = (line: string) => {
    const amount = /(-?\d+[.,]\d{2})\s*(?:[A-F08])?[\s|"'.,]*$/i.exec(line)
    const value = amount ? `${line.slice(0, amount.index)}${amount[1]}` : line

    return normalize(value).replace(/,/g, '.')
  }
  const left = first.slice(-100).map(canonical)
  const right = second.slice(0, 100).map(canonical)
  const width = right.length + 1
  const matrix = new Uint16Array((left.length + 1) * width)
  const matches = (a: string, b: string) => /\d+[.]\d{2}$/.test(a) && similarity(a, b) >= 0.8

  for (let a = left.length - 1; a >= 0; a--) for (let b = right.length - 1; b >= 0; b--)
    matrix[a * width + b] = matches(left[a], right[b])
      ? 1 + matrix[(a + 1) * width + b + 1]
      : Math.max(matrix[(a + 1) * width + b], matrix[a * width + b + 1])

  const anchors: { left: number; right: number; line: string }[] = []
  let a = 0, b = 0

  while (a < left.length && b < right.length) {
    if (matches(left[a], right[b])) { anchors.push({ left: a + first.length - left.length, right: b, line: right[b] }); a++; b++ }
    else if (matrix[(a + 1) * width + b] >= matrix[a * width + b + 1]) a++
    else b++
  }
  const start = anchors[0]
  const end = anchors.at(-1)
  const prices = new Set(anchors.map(anchor => anchor.line.match(/\d+[.]\d{2}$/)?.[0]))
  const names = anchors.filter(anchor => !/BUC|KG|PCS/.test(anchor.line))

  if (!start || !end || anchors.length < 4 || prices.size < 3 || names.length < 1 || start.right > 6) return null
  if (first.length - end.left > 8 || second.length - end.right <= first.length - end.left) return null
  if (anchors.length / (end.right - start.right + 1) < 0.3) return null

  const matched = new Set(anchors.map(anchor => anchor.right))
  const service = /total|tva|tax|voucher|card|fiscal/i

  // A damaged/extra product cannot be discarded merely because its neighbours match.
  for (let index = 0; index <= end.right; index++) {
    if (!matched.has(index) && /[A-Z].*\d+[.]\d{2}$/.test(right[index]) && !service.test(second[index]) && !/BUC|KG|PCS/.test(right[index])) return null
  }

  if (first.slice(end.left + 1).some(line => /[\p{L}].*\d+[.,]\d{2}/u.test(line) && !service.test(line))) return null

  return [...first.slice(0, end.left + 1), ...second.slice(end.right + 1)]
}

export const mergeSegments = (segments: OcrResult[]) => {
  const warnings = new Set<string>()
  let lines: string[] = []

  for (const [index, segment] of segments.entries()) {
    const current = segment.lines.map(line => line.trim()).filter(Boolean)

    if (segment.confidence < 65) warnings.add('lowQuality')
    if (!index) { lines = current; continue }

    // A later photo may contain only the tax/payment/footer area of an already complete receipt.
    // Append it without dropping anything; the parser still needs its fiscal timestamp.
    if (lines.some(line => /^TOTA[LI1]\b/i.test(line.trim()) && !/TVA|IVA|TAX/i.test(line))
      && /^TOTAL\b/i.test(current[0] ?? '') && !current.some(line => /\b(?:BUC|Bucati|KG)\s*[x×*]/i.test(line))) {
      lines.push(...current)
      continue
    }

    const candidates = overlaps(lines, current)
    const size = candidates[0]

    if (candidates.length === 1 && new Set(current.slice(0, size).map(normalize)).size >= 2) lines.push(...current.slice(size))
    else {
      const contained = !candidates.length ? containedOverlap(lines, current) : null

      if (contained) { lines = contained; continue }

      if (candidates.length) warnings.add('ambiguous')
      else if (overlaps(current, lines).length) warnings.add('order')
      else warnings.add('gap')

      lines.push(...current)
    }
  }

  return { lines, warnings: [...warnings] }
}
