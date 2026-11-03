import assert from 'node:assert/strict'
import { test } from 'node:test'

import { isLocale, locales } from '../src/i18n/locales'
import { callbackUrl, localeFromNext, safeNext } from '../src/lib/auth/redirect'
import { getSiteUrl, getSupabaseConfig } from '../src/lib/config'

test('only supported locales pass validation', () => {
  for (const locale of locales) assert.equal(isLocale(locale), true)
  for (const locale of ['RU', 'de', '../ru', 'ru/login', '', null, undefined, {}, ['ru']]) {
    assert.equal(isLocale(locale), false)
  }
})
test('each locale survives the OAuth roundtrip', () => {
  for (const locale of locales) {
    const next = `/${locale}/dashboard`
    assert.equal(safeNext(next), next)
    assert.equal(localeFromNext(next), locale)
    const url = new URL(callbackUrl('https://basket.example', locale))
    assert.equal(url.origin, 'https://basket.example')
    assert.equal(url.pathname, '/auth/callback')
    assert.equal(url.searchParams.get('next'), next)
  }
})
test('redirect allowlist rejects external, encoded and ambiguous routes', () => {
  for (const next of [
    null,
    undefined,
    '',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/ru/dashboard/../../evil',
    '/ru/dashboard?next=https://evil.example',
    '/ru/dashboard#fragment',
    '/ru/dashboard/',
    '/de/dashboard',
    '/RU/dashboard',
    '/ru/login',
    '/%72u/dashboard',
    '%2F%2Fevil.example',
    '/ru/dashboard%0a',
    '/ru/dashboard\n',
    '/ru/dashboard\r\n',
    ['//evil.example'],
    {},
  ]) {
    assert.equal(safeNext(next), '/ru/dashboard', String(next))
  }
})
test('invalid locale cannot enter an OAuth redirect', () => {
  for (const value of ['de', '//evil.example', 'ru/../../', null]) {
    assert.throws(() => callbackUrl('https://basket.example', value))
  }
})
test('trusted site origin rejects credentials, paths, queries and non-HTTPS remote sites', () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL
  try {
    for (const value of ['http://localhost:3000', 'https://basket.example']) {
      process.env.NEXT_PUBLIC_SITE_URL = value
      assert.equal(getSiteUrl(), value)
    }
    for (const value of [
      '',
      'https://user:password@basket.example',
      'http://basket.example',
      'https://basket.example/evil',
      'https://basket.example?next=evil',
      'javascript:alert(1)',
    ]) {
      process.env.NEXT_PUBLIC_SITE_URL = value
      assert.throws(getSiteUrl)
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = previous
  }
})
test('secret API keys are never accepted by public client configuration', () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const previousKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    for (const key of ['YOUR_PUBLISHABLE_KEY', 'sb_secret_fake', 'service_role', '']) {
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key
      assert.equal(getSupabaseConfig(), null)
    }
  } finally {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl
    if (previousKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousKey
  }
})

test('only canonical invitation paths can survive Google OAuth', () => {
  const token = 'a'.repeat(43)
  for (const locale of locales) {
    const next = `/${locale}/invite/${token}`
    assert.equal(safeNext(next), next)
    assert.equal(localeFromNext(next), locale)
    const callback = new URL(callbackUrl('https://basket.example', locale, next))
    assert.equal(callback.searchParams.get('next'), next)
  }
  for (const path of [
    `/en/invite/${token}\n`,
    `/ru/invite/${token}?next=//evil`,
    `/ru/invite/${token}/`,
    '/ru/invite/invalid',
    `/ru/invite/${'a'.repeat(42)}%2F`,
  ])
    assert.equal(safeNext(path), '/ru/dashboard')
})
