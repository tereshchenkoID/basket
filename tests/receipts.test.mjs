import { parse } from '@formatjs/icu-messageformat-parser'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

// Run the actual pure TypeScript modules without adding a second test toolchain.
const require = createRequire(import.meta.url)
const MODULES = new Map()
const load = file => {
  const path = resolve(file)

  if (MODULES.has(path)) return MODULES.get(path).exports

  const module = { exports: {} }
  MODULES.set(path, module)
  const source = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(source, { module, exports: module.exports, require: name => name.startsWith('.') || name.startsWith('@/') ? load((name.startsWith('@/') ? resolve('src', name.slice(2)) : resolve(dirname(path), name)) + '.ts') : name === 'server-only' ? {} : require(name), Date, URL, Set, Map, BigInt, Number, Math })

  return module.exports
}
const { decimal, receiptDifference } = load('src/lib/receipts/money.ts')
const { mergeSegments } = load('src/lib/receipts/merge.ts')
const { parseReceipt, safeOcrLines } = load('src/lib/receipts/parser.ts')
const { nextTab } = load('src/components/Tabs/helpers.ts')
const segment = lines => ({ lines, confidence: 95 })

test('Money uses exact cents, comma input and explicit rounding', () => {
  assert.equal(decimal('0,10'), '0.10')
  assert.equal(decimal('18.745'), '18.75')
  assert.equal(decimal('-1.005'), '-1.01')
  assert.equal(decimal('0.750', 3), '0.750')
  assert.equal(decimal('NaN'), null)
  assert.equal(receiptDifference([{ line_total: '0.10' }, { line_total: '0.20' }], [], '0.30'), '0.00')
})
test('Discounts, refunds, missing prices and mismatches remain explicit', () => {
  assert.equal(receiptDifference([{ line_total: '18.74' }], [{ amount: '-1.00' }], '17.74'), '0.00')
  assert.equal(receiptDifference([{ line_total: '-3.99' }], [], '-3.99'), '0.00')
  assert.equal(receiptDifference([{ line_total: '18.74' }], [], '19.00'), '-0.26')
  assert.equal(receiptDifference([{ line_total: '' }], [], '19.00'), null)
})
test('A unique two-line overlap merges adjacent photos', () => {
  const result = mergeSegments([segment(['MILK 5.00', 'BREAD 3.00', 'APPLE 2.00']), segment(['BREAD 3.00', 'APPLE 2.00', 'TOTAL 10.00'])])
  assert.equal(result.lines.join('|'), 'MILK 5.00|BREAD 3.00|APPLE 2.00|TOTAL 10.00')
  assert.equal(result.warnings.length, 0)
})
test('Five ordered photos preserve genuine repeat purchases', () => {
  const result = mergeSegments([
    segment(['LIDL', 'MILK 5.00', 'BREAD 3.00']),
    segment(['MILK 5.00', 'BREAD 3.00', 'APPLE 2.00', 'JUICE 4.00']),
    segment(['APPLE 2.00', 'JUICE 4.00', 'MILK 5.00', 'CHEESE 8.00']),
    segment(['MILK 5.00', 'CHEESE 8.00', 'RICE 4.00', 'TEA 3.00']),
    segment(['RICE 4.00', 'TEA 3.00', 'TOTAL 34.00']),
  ])
  assert.equal(result.lines.filter(line => line === 'MILK 5.00').length, 2)
  assert.equal(result.lines.filter(line => line === 'BREAD 3.00').length, 1)
})
test('Repeated identical boundary products are kept when overlap is ambiguous', () => {
  const result = mergeSegments([segment(['MILK 5.00', 'MILK 5.00']), segment(['MILK 5.00', 'MILK 5.00', 'TOTAL 20.00'])])
  assert.equal(result.lines.filter(line => line === 'MILK 5.00').length, 4)
  assert.ok(result.warnings.includes('ambiguous'))
})
test('Partial overlap is not silently discarded', () => {
  const result = mergeSegments([segment(['MILK 5.00', 'BREAD 3.00']), segment(['BREAD 3.00', 'APPLE 2.00'])])
  assert.equal(result.lines.length, 4)
  assert.ok(result.warnings.includes('gap'))
})
test('Missing section and wrong order are reported', () => {
  assert.ok(mergeSegments([segment(['A 1.00', 'B 2.00']), segment(['X 3.00', 'Y 4.00'])]).warnings.includes('gap'))
  assert.ok(mergeSegments([segment(['B 2.00', 'C 3.00', 'D 4.00']), segment(['A 1.00', 'B 2.00', 'C 3.00'])]).warnings.includes('order'))
})
test('Small OCR errors match context, different prices never match', () => {
  const result = mergeSegments([segment(['LAPTE PILOS 5.00', 'PAINE ALBA 3.00']), segment(['LAPTE P1LOS 5.00', 'PAINE ALBA 3.00', 'TOTAL 8.00'])])
  assert.equal(result.lines.length, 3)
  assert.ok(mergeSegments([segment(['A 1.00', 'B 2.00']), segment(['A 1.01', 'B 2.00'])]).warnings.includes('gap'))
  assert.ok(mergeSegments([{ lines: ['BAD TEXT'], confidence: 20 }]).warnings.includes('lowQuality'))
})
test('Romanian parser separates unit price, weighted quantity and net totals', () => {
  const receipt = parseReceipt(['LIDL', '04.11.2026 14:25:00', '0,750 kg x 24,99', 'MERE GOLDEN 18,74 A', 'REDUCERE -1,00', 'TVA 9% 1,55', 'SUBTOTAL 17,74', 'TOTAL 17,74'])
  assert.equal(receipt.items.length, 1)
  assert.equal(receipt.items[0].quantity, '0.750')
  assert.equal(receipt.items[0].unit_price, '24.99')
  assert.equal(receipt.items[0].line_total, '17.74')
  assert.equal(receipt.items[0].discount_amount, '1.00')
  assert.equal(receiptDifference(receipt.items, receipt.adjustments, receipt.receipt_total), '0.00')
})
test('Unknown store/date/quantity are not invented; payment identifiers are removed', () => {
  const receipt = parseReceipt(['MAGAZIN NECUNOSCUT', 'LAPTE 5,00 A', 'VISA 1234567890123456', 'CUI 12345678', 'NUMERAR 5,00'])
  assert.equal(receipt.store_name, '')
  assert.equal(receipt.purchased_at, null)
  assert.equal(receipt.items[0].quantity, '')
  assert.equal(receipt.items[0].unit_price, '')
  assert.equal(safeOcrLines(['VISA 1234567890123456', 'CARDAMOM 3,00']).join(), 'CARDAMOM 3,00')
  assert.ok(receipt.warnings.includes('incomplete'))
})
test('Refund and whole-receipt adjustment remain negative', () => {
  const receipt = parseReceipt(['REDUCERE -1,00', 'RETUR LAPTE -5,00', 'TOTAL -6,00'])
  assert.equal(receipt.adjustments[0].amount, '-1.00')
  assert.equal(receipt.items[0].line_total, '-5.00')
})
test('Tabs keyboard behavior remains unchanged', () => {
  const items = [{ value: 'active' }, { value: 'disabled', disabled: true }, { value: 'archived' }]
  assert.equal(nextTab(items, 'active', 'ArrowRight'), 'archived')
  assert.equal(nextTab(items, 'archived', 'ArrowRight'), 'active')
})
test('All translations retain the same keys and valid ICU messages', () => {
  const flatten = (data, prefix = '') => Object.entries(data).flatMap(([key, value]) => typeof value === 'string' ? [prefix + key] : flatten(value, prefix + key + '.')).sort()
  const messages = ['en', 'ro', 'ru', 'uk'].map(locale => JSON.parse(readFileSync(`src/messages/${locale}.json`, 'utf8')))

  for (const message of messages.slice(1)) assert.deepEqual(flatten(message), flatten(messages[0]))

  const verify = value => {
    for (const message of Object.values(value)) {
      if (typeof message === 'string') parse(message)
      else verify(message)
    }
  }

  messages.forEach(verify)
})

test('Weighted items printed across rows retain explicit quantities and prices', () => {
  const before = parseReceipt(['Lidl', 'MERE GOLDEN', '0,750 kg x 24,99 18,74', 'TOTAL 18,74'])
  assert.equal(before.items.length, 1)
  assert.equal(before.items[0].display_name, 'MERE GOLDEN')
  assert.equal(before.items[0].quantity, '0.750')
  assert.equal(before.items[0].unit_price, '24.99')
  assert.equal(before.items[0].line_total, '18.74')
  const after = parseReceipt(['Kaufland', 'MERE GOLDEN 18.74', '0.750 kg x 24.99', 'TOTAL 18.74'])
  assert.equal(after.items[0].quantity, '0.750')
  assert.equal(after.items[0].unit_price, '24.99')
})

test('Storage errors leave durable cleanup pending and a later retry completes it', async () => {
  const { removeReceiptFiles } = load('src/lib/receipts/cleanup.ts')
  const finishes = []
  let fail = true
  const client = {
    storage: { from: () => ({ remove: async () => ({ error: fail ? new Error('offline') : null }) }) },
    rpc: async (_name, value) => { finishes.push(value.p_success)

      return { error: null } },
  }
  const jobs = [{ id: 'job', paths: ['private/photo.jpg'] }]
  assert.equal(await removeReceiptFiles(client, jobs), 0)
  assert.equal(finishes[0], false)
  fail = false
  assert.equal(await removeReceiptFiles(client, jobs), 1)
  assert.equal(finishes[1], true)
})

test('Romanian receipt dates use a stable timezone across SSR/browser and DST', () => {
  const { receiptInstant, receiptLocalDate } = load('src/lib/receipts/date.ts')
  assert.equal(receiptInstant('2026-11-04T14:25:00'), '2026-11-04T12:25:00.000Z')
  assert.equal(receiptInstant('2026-07-04T14:25:00'), '2026-07-04T11:25:00.000Z')
  assert.equal(receiptLocalDate('2026-11-04T12:25:00Z'), '2026-11-04T14:25:00')
  assert.equal(receiptInstant('2026-02-31T12:00:00'), null)
  assert.equal(receiptInstant('2026-03-29T03:30:00'), null)
})

test('Image headers are checked before a potentially expensive bitmap decode', () => {
  const { imageDimensions } = load('src/lib/receipts/ocr.ts')
  const image = Buffer.from('89504e470d0a1a0a0000000d49484452000003e8000003e8', 'hex')
  const dimensions = imageDimensions(image)
  assert.equal(dimensions.width, 1000)
  assert.equal(dimensions.height, 1000)
  assert.equal(imageDimensions(new Uint8Array([1, 2, 3])), null)
})

test('Receipt-wide coupons stay separate from item discounts', () => {
  const receipt = parseReceipt(['Lidl', 'PAINE 5.00', 'LAPTE 6.00', 'CUPON TOTAL -2.00', 'TOTAL 9.00'])
  assert.equal(receipt.items[1].line_total, '6.00')
  assert.equal(receipt.adjustments[0].amount, '-2.00')
  assert.equal(receipt.receipt_total, '9.00')
  assert.equal(receiptDifference(receipt.items, receipt.adjustments, receipt.receipt_total), '0.00')
})
test('Receipt input rejects owner spoofing, non-decimal amounts and oversized batches', () => {
  const { SAVE_RECEIPT_SCHEMA } = load('src/lib/receipts/schema.ts')
  const document = { group_id: null, store_id: null, store_name: 'Lidl', purchased_at: null, currency: 'RON', receipt_total: '18,74', items: [], adjustments: [], accept_mismatch: false, warnings: [], status: 'draft' }
  const input = { id: '11111111-1111-4111-8111-111111111111', document, revision: 0 }
  assert.ok(SAVE_RECEIPT_SCHEMA.safeParse(input).success)
  assert.equal(SAVE_RECEIPT_SCHEMA.safeParse({ ...input, document: { ...document, owner_id: 'another-user' } }).success, false)
  assert.equal(SAVE_RECEIPT_SCHEMA.safeParse({ ...input, document: { ...document, receipt_total: 'NaN' } }).success, false)
  assert.equal(SAVE_RECEIPT_SCHEMA.safeParse({ ...input, document: { ...document, receipt_total: '1.001' } }).success, false)
  assert.equal(SAVE_RECEIPT_SCHEMA.safeParse({ ...input, document: { ...document, items: Array(501).fill({}) } }).success, false)
})
test('OAuth destinations and locales remain unchanged', () => {
  const { safeNext, callbackUrl } = load('src/lib/auth/redirect.ts')

  for (const locale of ['en', 'ro', 'ru', 'uk']) {
    const url = new URL(callbackUrl('http://localhost:3000', locale))
    assert.equal(url.pathname, '/auth/callback')
    assert.equal(url.searchParams.get('next'), `/${locale}/dashboard`)
  }
  assert.equal(safeNext('https://evil.example'), '/en/dashboard')
  assert.equal(safeNext('//evil.example'), '/en/dashboard')
})
test('Realtime refreshes only for changes or unavailable connections, not healthy focus events', () => {
  let subscribe, interval, timeout, cleanup, refreshes = 0
  const events = new Map()
  const changes = []
  const channel = { on: (_type, _filter, callback) => { changes.push(callback)

    return channel }, subscribe: callback => { subscribe = callback } }
  const window = { navigator: { onLine: true }, addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) }
  const document = { visibilityState: 'visible', addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) }
  const module = { exports: {} }
  const source = ts.transpileModule(readFileSync('src/hooks/useWorkspaceRealtime.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  vm.runInNewContext(source, {
    module, exports: module.exports,
    require: name => name === 'react' ? { useState: () => ['connecting', () => {}], useEffect: fn => { cleanup = fn() } } : name === 'next/navigation' ? { useRouter: () => ({ refresh: () => refreshes++ }) } : { createClient: () => ({ channel: () => channel, removeChannel: () => {} }) },
    window, document,
    setInterval: callback => { interval = callback

      return 1 }, clearInterval: () => {},
    clearTimeout: () => { timeout = undefined }, setTimeout: callback => { timeout = callback

      return 1 },
  })
  const flush = () => { const callback = timeout; timeout = undefined; callback?.() }
  module.exports.useWorkspaceRealtime({ userId: 'user' })
  subscribe('SUBSCRIBED')
  interval(); events.get('focus')(); events.get('online')(); events.get('visibilitychange')(); flush()
  assert.equal(refreshes, 0, 'healthy focus, online and visibility must not rerender')
  changes[0](); changes[0](); flush()
  assert.equal(refreshes, 1, 'database changes still refresh once')
  document.visibilityState = 'hidden'
  changes[0](); flush()
  assert.equal(refreshes, 1, 'hidden changes are deferred')
  document.visibilityState = 'visible'
  events.get('visibilitychange')(); events.get('focus')(); flush()
  assert.equal(refreshes, 2, 'pending changes refresh on return once')
  events.get('offline')(); window.navigator.onLine = false; interval(); flush()
  assert.equal(refreshes, 2, 'offline polling does not request a refresh')
  window.navigator.onLine = true
  events.get('online')(); subscribe('SUBSCRIBED'); flush()
  assert.equal(refreshes, 3, 'reconnection refreshes once')
  subscribe('CHANNEL_ERROR'); interval(); flush()
  assert.equal(refreshes, 4, 'visible fallback polling remains active on failure')
  changes[0](); cleanup(); flush(); subscribe('SUBSCRIBED')
  assert.equal(refreshes, 4, 'unmounted hooks cannot refresh')
  assert.equal(events.size, 0, 'all event listeners are removed')
})

test('Group and list sorting uses creation date and localized names with stable ties', () => {
  const { sortRecords } = load('src/helpers/workspace.ts')
  const records = [
    { id: 'b', name: 'Beta', created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', deleted_at: '2026-01-01T00:00:00Z' },
    { id: 'a', name: 'Alpha', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z', deleted_at: '2026-02-01T00:00:00Z' },
    { id: 'c', name: 'Alpha', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z', deleted_at: '2026-03-01T00:00:00Z' },
  ]
  const sorted = value => Array.from(sortRecords(records, value, 'en', row => row.name, row => row.created_at), row => row.id)
  assert.deepEqual(sorted('newest'), ['b', 'a', 'c'])
  assert.deepEqual(sorted('oldest'), ['a', 'c', 'b'])
  assert.deepEqual(sorted('nameAsc'), ['a', 'c', 'b'])
  assert.deepEqual(sorted('nameDesc'), ['b', 'a', 'c'])
  assert.deepEqual(records.map(row => row.id), ['b', 'a', 'c'])
})

test('Lidl photos overlapping beyond the product area retain eleven real purchases, including three identical cheeses', () => {
  const fixture = JSON.parse(readFileSync('tests/fixtures/lidl-overlap.json', 'utf8'))
  const merged = mergeSegments(fixture.segments)
  const receipt = parseReceipt(merged.lines)
  assert.equal(merged.warnings.length, 0)
  assert.equal(receipt.items.length, 11)
  assert.equal(receipt.items.filter(item => item.display_name === 'Branza de vaci').length, 3)
  assert.equal(receipt.items[0].quantity, '1.546')
  assert.equal(receipt.items[0].unit_price, '19.90')
  assert.equal(receipt.items[0].line_total, '30.77')
  assert.equal(receipt.items[4].line_total, '0.50', 'deposit is a real paid line')
  assert.equal(receipt.store_name, 'Lidl')
  assert.equal(receipt.receipt_total, '141.18')
  assert.equal(receipt.purchased_at, '2026-11-01T14:27:50.000Z')
  assert.equal(receiptDifference(receipt.items, receipt.adjustments, receipt.receipt_total), '0.00')
  assert.equal(receipt.adjustments.length, 0, 'SGR voucher is payment, not a discount')
})

test('Lidl quantity rows and footer artefacts do not turn into fake products', () => {
  const receipt = parseReceipt(['LIUL DISCOUNT SRL', '1,000 BUC x 6,99', 'Branza de vaci 6,998', 'ERE 1.000 BUC X 159', '1,000 BUC x 23.49', 'Pizza cu patru 23,49 B', 'TOTAL : 30,48 "i', 'TAB 11,00% 3,02', 'Voucher SGR 18,50', 'CARD 11,98', 'Va multumim', 'DATA:01/11/2026 ORA:16-27-50'])
  assert.equal(receipt.items.length, 2)
  assert.equal(receipt.items[0].quantity, '1.000')
  assert.equal(receipt.items[0].line_total, '6.99')
  assert.equal(receipt.items[1].unit_price, '23.49')
  assert.equal(receipt.receipt_total, '30.48')
  assert.ok(receipt.warnings.includes('incomplete'), 'unreadable quantity row is flagged')
  assert.equal(receipt.items.some(item => /BUC X|TAB|voucher/i.test(item.original_name)), false)
})

test('Uncertain Lidl amounts stay empty or flagged; totals are never forced to balance', () => {
  const receipt = parseReceipt(['LIDL', '1,000 BUC x 6,99', 'Branza de vaci 6.9? B', '1,000 BUC x 6,99', 'Branza de vaci 6,95 B', 'TOTAL 13,98'])
  assert.equal(receipt.items.length, 2)
  assert.equal(receipt.items[0].line_total, '')
  assert.equal(receipt.items[1].line_total, '6.95')
  assert.ok(receipt.warnings.includes('incomplete'))
  assert.equal(receiptDifference(receipt.items, receipt.adjustments, receipt.receipt_total), null)
})

test('Captured PaddleOCR output from the real two-photo receipt preserves eleven paid lines and its date', () => {
  const fixture = JSON.parse(readFileSync('tests/fixtures/lidl-ocr.json', 'utf8'))
  const merged = mergeSegments(fixture.segments)
  const receipt = parseReceipt(merged.lines)
  assert.equal(merged.warnings.length, 0)
  assert.equal(receipt.items.length, 11)
  assert.equal(receipt.receipt_total, '141.18')
  assert.equal(receipt.purchased_at, '2026-11-01T14:27:50.000Z')
  assert.equal(receiptDifference(receipt.items, receipt.adjustments, receipt.receipt_total), '0.00')
  assert.equal(receipt.items.filter(item => item.line_total === '6.99').length, 3)
  assert.equal(receipt.items[1].unit_price, '', 'missing decimal separator is not guessed')
})

test('Unicode multiplication on Lidl quantity lines does not create a duplicate product', () => {
  const receipt = parseReceipt(['LIDL', '1,000BUC× 23.49', 'Pizza cu patru 23,49 B', 'TOTAL 23,49'])
  assert.equal(receipt.items.length, 1)
  assert.equal(receipt.items[0].quantity, '1.000')
  assert.equal(receipt.items[0].unit_price, '23.49')
})

test('Contained overlaps retain extra or conflicting paid lines instead of silently discarding them', () => {
  const source = ['A 1.00', 'B 2.00', 'C 3.00', 'D 4.00', 'TOTAL 10.00']
  const merged = mergeSegments([segment(source), segment(['A 1.00', 'B 2.00', 'NEW PRODUCT 5.00', 'C 3.00', 'D 4.00', 'TOTAL 15.00', 'footer'])])
  assert.ok(merged.lines.includes('NEW PRODUCT 5.00'))
  assert.ok(merged.warnings.includes('gap'))
})

const ocrHarness = () => {
  let timer
  const workers = []
  const module = { exports: {} }
  const source = ts.transpileModule(readFileSync('src/lib/receipts/ocr.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  class LocalWorker {
    messages = []
    terminated = false
    constructor(url) { assert.equal(url.split('?')[0], '/ocr/paddle/worker.js'); workers.push(this) }
    postMessage(message) { this.messages.push(message) }
    terminate() { this.terminated = true }
  }
  vm.runInNewContext(source, {
    module, exports: module.exports,
    require: () => ({ RECEIPT_LIMITS: { initializationMs: 120000 } }),
    Worker: LocalWorker, DOMException,
    window: { location: { origin: 'http://localhost:3000' } },
    setTimeout: callback => { timer = callback

      return 1 }, clearTimeout: () => { timer = undefined },
  })

  return { create: module.exports.createOcr, worker: () => workers.at(-1), timeout: () => timer?.() }
}

test('OCR worker initialization and sequential jobs release memory after termination', async () => {
  const harness = ocrHarness()
  const initializing = harness.create(() => {})
  const worker = harness.worker()
  assert.equal(worker.messages[0].origin, 'http://localhost:3000')
  worker.onmessage({ data: { type: 'ready' } })
  const adapter = await initializing
  const pending = adapter.recognize(new Blob(['fixture']))
  await assert.rejects(adapter.recognize(new Blob(['second'])), /already processing/)
  worker.onmessage({ data: { type: 'result', result: { lines: ['TOTAL 1.00'], confidence: 90 } } })
  assert.equal((await pending).confidence, 90)
  await adapter.terminate()
  assert.equal(worker.terminated, true)
  await assert.rejects(adapter.recognize(new Blob()), /Aborted/)
})

test('Cancelling OCR stops the worker both during initialization and recognition', async () => {
  const harness = ocrHarness()
  const initialization = new AbortController()
  const loading = harness.create(() => {}, initialization.signal)
  initialization.abort()
  await assert.rejects(loading, /Aborted/)
  assert.equal(harness.worker().terminated, true)
  const processing = new AbortController()
  const ready = harness.create(() => {}, processing.signal)
  harness.worker().onmessage({ data: { type: 'ready' } })
  const adapter = await ready
  const pending = adapter.recognize(new Blob())
  processing.abort()
  await assert.rejects(pending, /Aborted/)
  assert.equal(harness.worker().terminated, true)
})

test('A stalled OCR worker times out and can be initialized again', async () => {
  const harness = ocrHarness()
  const loading = harness.create(() => {})
  harness.timeout()
  await assert.rejects(loading, /initialization timeout/)
  assert.equal(harness.worker().terminated, true)
  const retry = harness.create(() => {})
  harness.worker().onmessage({ data: { type: 'ready' } })
  await (await retry).terminate()
})

test('Real dm OCR: five Bucati products, footer-only photo and fiscal time rather than card payment time', () => {
  const fixture = JSON.parse(readFileSync('tests/fixtures/dm-ocr.json', 'utf8'))
  const merged = mergeSegments(fixture.segments)
  const receipt = parseReceipt(merged.lines)
  assert.equal(merged.warnings.length, 0)
  assert.equal(receipt.store_name, 'dm')
  assert.equal(receipt.items.length, 5)
  assert.ok(receipt.items.every(item => item.quantity === '1.000' && item.unit === 'pcs'))
  assert.equal(receipt.receipt_total, '91.75')
  assert.equal(receipt.purchased_at, '2026-10-31T17:48:11.000Z')
  assert.equal(receiptDifference(receipt.items, receipt.adjustments, receipt.receipt_total), '0.00')
  assert.equal(receipt.adjustments.length, 0)
})

test('Temporary OCR removes bank identifiers and never treats TOTAL IVA as the paid total', () => {
  const lines = safeOcrLines(['TID: TEST123 MID: 123456789', 'AID: TEST1234', 'AUTH: 123456', 'BATCH: 001122', 'VANZARE CTLS', 'RRN: 123456789012', 'CARD 91.75', 'LAPTE 7.95'])
  assert.deepEqual(Array.from(lines), ['LAPTE 7.95'])
  const receipt = parseReceipt(['DM DROGHERIE MARKT', 'LAPTE 7.95', 'TOTAL 7.95', 'TOTAL IVA 1.20', 'TVA A 21.00% 1.20'])
  assert.equal(receipt.receipt_total, '7.95')
  assert.equal(receipt.items.length, 1)
})

test('Real Lidl 24-line receipt recovers detached totals and printed weight details without balancing guesses', () => {
  const fixture = JSON.parse(readFileSync('tests/fixtures/lidl-jysk-ocr.json', 'utf8'))
  const merged = mergeSegments([fixture['12'], fixture['09']].map(value => ({ ...value, lines: safeOcrLines(value.lines) })))
  const receipt = parseReceipt(merged.lines)
  assert.equal(merged.warnings.length, 0)
  assert.equal(receipt.items.length, 24)
  assert.equal(receipt.receipt_total, '288.87')
  assert.equal(receiptDifference(receipt.items, receipt.adjustments, receipt.receipt_total), '0.00')
  assert.equal(receipt.items.filter(item => item.line_total === '6.99').length, 4)
  assert.equal(receipt.items[18].quantity, '1.268')
  assert.equal(receipt.items[18].unit_price, '6.99')
  assert.equal(receipt.items[21].quantity, '1.284')
  assert.equal(receipt.items[22].quantity, '0.936')
  assert.equal(receipt.items[22].line_total, '7.48')
})

test('JYSK parses single-digit fiscal day and an explicitly printed split subtotal', () => {
  const fixture = JSON.parse(readFileSync('tests/fixtures/lidl-jysk-ocr.json', 'utf8'))
  const receipt = parseReceipt(fixture['04'].lines)
  assert.equal(receipt.store_name, 'JYSK')
  assert.equal(receipt.purchased_at, '2026-11-04T15:06:00.000Z')
  assert.equal(receipt.receipt_total, '32.50')
  assert.equal(receipt.items.length, 1)
  assert.equal(receipt.items[0].quantity, '1.000')
  assert.equal(receipt.items[0].line_total, '32.50')
})

test('A printed line total can precede a product name, but a unit price alone cannot invent its total', () => {
  const parsed = parseReceipt(['LIDL', '1.000 BUC x 8.49 8.49 B', 'Guacamole', '1.000 BUC x 3.75', '3.75 B', 'Toast clasic', '1.000 BUC x 7.48', 'Grapes', 'TOTAL 19.72'])
  assert.equal(parsed.items[0].line_total, '8.49')
  assert.equal(parsed.items[1].line_total, '3.75')
  assert.equal(parsed.items[2].line_total, '')
  assert.ok(parsed.warnings.includes('incomplete'))
})

test('Targeted OCR recovery accepts a single localized name and rejects ambiguous or numeric rows', () => {
  const { missingNames, recoveredName } = load('src/lib/receipts/recovery.ts')
  const row = (text, y, x = 20) => ({ text, mean: 0.95, box: [[x, y], [x + 100, y], [x + 100, y + 10], [x, y + 10]] })
  const gaps = missingNames([row('1.000 BUC x 7.48', 0), row('7.48 B', 12, 200), row('(0.936 KG x 7.99)', 40)])
  assert.equal(gaps.length, 1)
  assert.equal(recoveredName([row('Struguri albi', 25)], gaps[0].from, gaps[0].to)?.text, 'Struguri albi')
  assert.equal(recoveredName([row('7.48', 25)], 0, 50), null)
  assert.equal(recoveredName([row('Milk', 15), row('Bread', 30)], 0, 50), null)
  assert.equal(missingNames([row('1.000 BUC x 7.48', 0), row('Grapes 7.48 B', 20), row('(0.936 KG x 7.99)', 40)]).length, 0)
})
