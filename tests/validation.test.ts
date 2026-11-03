import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

import { createGroupSchema } from '../src/modules/Groups/schema'
import { inviteToken } from '../src/modules/Invites/schema'
import { addItemSchema, createListSchema, purchaseItemSchema } from '../src/modules/Shopping/schema'

test('group/list names normalize whitespace before length checks', () => {
  const value = createGroupSchema.parse({
    id: randomUUID(),
    name: '  Our\n family\t ',
    locale: 'ru',
  })
  assert.equal(value.name, 'Our family')
  for (const name of ['', '  \n ', 'a'.repeat(81)])
    assert.equal(
      createGroupSchema.safeParse({ id: randomUUID(), name, locale: 'ru' }).success,
      false,
    )
  assert.equal(
    createListSchema.safeParse({ id: randomUUID(), groupId: randomUUID(), title: 'a'.repeat(101) })
      .success,
    false,
  )
})

test('items reject blank names, invalid units, forged ids and unsafe quantities', () => {
  const value = {
    id: randomUUID(),
    listId: randomUUID(),
    name: '  Oat   milk ',
    quantity: 1.5,
    unit: 'l',
  }
  assert.equal(addItemSchema.parse(value).name, 'Oat milk')
  for (const quantity of [0, -1, NaN, Infinity, 1000001, '1'])
    assert.equal(addItemSchema.safeParse({ ...value, quantity }).success, false)
  for (const fields of [
    { name: '' },
    { name: 'a'.repeat(121) },
    { unit: 'usd' },
    { id: 'not-an-id' },
  ])
    assert.equal(addItemSchema.safeParse({ ...value, ...fields }).success, false)
  assert.equal(
    purchaseItemSchema.safeParse({ itemId: randomUUID(), purchased: 'true' }).success,
    false,
  )
})

test('invitation tokens require exactly 256-bit base64url token shape', () => {
  assert.equal(inviteToken.safeParse('a'.repeat(43)).success, true)
  for (const token of [
    '',
    'a'.repeat(42),
    'a'.repeat(44),
    'a'.repeat(42) + '\n',
    'a'.repeat(42) + '/',
  ])
    assert.equal(inviteToken.safeParse(token).success, false)
})

test('all four dictionaries contain the same nonempty translation keys', async () => {
  function keys(value: unknown, prefix = ''): string[] {
    assert.equal(typeof value, 'object')
    return Object.entries(value as Record<string, unknown>)
      .flatMap(([key, entry]) => {
        if (typeof entry === 'string') {
          assert.ok(entry.trim())
          return [`${prefix}${key}`]
        }
        return keys(entry, `${prefix}${key}.`)
      })
      .sort()
  }
  const dictionaries = await Promise.all(
    ['en', 'ro', 'ru', 'uk'].map(
      async (locale) =>
        JSON.parse(
          await readFile(new URL(`../src/messages/${locale}.json`, import.meta.url), 'utf8'),
        ) as unknown,
    ),
  )
  const expected = keys(dictionaries[0])
  for (const dictionary of dictionaries) assert.deepEqual(keys(dictionary), expected)
})
