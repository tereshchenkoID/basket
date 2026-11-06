export type RecognizedLine = { text: string; mean: number; box?: number[][] }

const quantity = (text: string) => /^\s*[（(]?\s*\d+[.,]\d+\s*(?:bu[c]?|kg|pcs)\s*[x×*]/i.test(text)
const amount = (text: string) => /^\s*\d+[.,]\d{2}\s*[A-F08]?\s*$/i.test(text)
const center = (line: RecognizedLine) => line.box ? line.box.reduce((sum, point) => sum + point[1], 0) / line.box.length : 0

// Recover only a bounded, visibly missing product row, never a name from a catalogue.
export const missingNames = (lines: RecognizedLine[]) => lines.flatMap((line, index) => {
  if (!quantity(line.text) || /^[（(]/.test(line.text.trim()) || !line.box) return []

  const price = lines[index + 1]
  const detail = lines[index + 2]

  if (!price?.box || !amount(price.text) || !detail?.box || !/^[（(]/.test(detail.text.trim()) || !quantity(detail.text)) return []

  const height = Math.max(...price.box.map(point => point[1])) - Math.min(...price.box.map(point => point[1]))
  const left = Math.min(...line.box.map(point => point[0]), ...price.box.map(point => point[0])) - height * 3
  const right = Math.max(...price.box.map(point => point[0]))
  const top = center(line) - height
  const bottom = center(detail) + height / 2

  if (height <= 0 || right <= left || bottom <= top) return []

  return [{ index: index + 2, left, top, right, bottom, from: center(line), to: center(detail) }]
})

export const recoveredName = (lines: RecognizedLine[], from: number, to: number) => {
  const candidates = lines.filter(line => line.mean >= 0.75 && center(line) > from && center(line) < to
    && /[\p{L}]{3}/u.test(line.text) && !quantity(line.text) && !/total|tva|discount|voucher/i.test(line.text))

  return candidates.length === 1 ? candidates[0] : null
}
