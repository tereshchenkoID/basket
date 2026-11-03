import assert from 'node:assert/strict'
const base = process.env.TEST_BASE_URL || 'http://localhost:3000'
const authOrigin = process.env.TEST_AUTH_ORIGIN || base
const request = (path) => fetch(new URL(path, base), { redirect: 'manual' })
for (const locale of ['en', 'ro', 'ru', 'uk']) {
  for (const path of [`/${locale}`, `/${locale}/login`]) {
    const response = await request(path)
    assert.equal(response.status, 200, path)
    const html = await response.text()
    assert.ok(html.includes(`<html lang="${locale}"`), `${path}: language`)
    assert.ok(!html.includes('access_token'), `${path}: no token in HTML`)
  }
  const groupId = '11111111-1111-4111-8111-111111111111'
  const listId = '22222222-2222-4222-8222-222222222222'
  for (const path of [
    `/${locale}/dashboard`,
    `/${locale}/groups/${groupId}`,
    `/${locale}/groups/${groupId}/lists/${listId}`,
  ]) {
    const response = await request(path)
    assert.equal(response.status, 307, path)
    assert.equal(new URL(response.headers.get('location'), base).pathname, `/${locale}/login`)
    assert.match(response.headers.get('cache-control'), /no-store/)
  }
  const token = 'a'.repeat(43)
  const invite = await request(`/${locale}/invite/${token}`)
  assert.equal(invite.status, 307)
  const login = new URL(invite.headers.get('location'), base)
  assert.equal(login.pathname, `/${locale}/login`)
  assert.equal(login.searchParams.get('next'), `/${locale}/invite/${token}`)
  assert.equal(invite.headers.get('referrer-policy'), 'no-referrer')
  const callback = await request(
    `/auth/callback?${new URLSearchParams({ next: `/${locale}/invite/${token}`, error: 'denied' })}`,
  )
  const failedLogin = new URL(callback.headers.get('location'), base)
  assert.equal(failedLogin.pathname, `/${locale}/login`)
  assert.equal(failedLogin.searchParams.get('next'), `/${locale}/invite/${token}`)
  console.log(`${locale}: home/login, private dashboard/group/list, invitation OAuth return OK`)
}
const root = await request('/')
assert.equal(new URL(root.headers.get('location'), base).pathname, '/ru')
assert.equal((await fetch(new URL('/de/login', base))).status, 404)
assert.equal((await request('/basket.svg')).status, 200)
for (const next of [
  '/uk/dashboard',
  '//evil.example',
  '/ru/dashboard\n',
  '/en/dashboard?next=evil',
]) {
  const params = new URLSearchParams({ next, error: 'attacker-controlled-message' })
  const response = await request(`/auth/callback?${params}`)
  assert.equal(response.status, 307)
  const destination = new URL(response.headers.get('location'), base)
  assert.equal(destination.origin, authOrigin)
  assert.equal(destination.pathname, next === '/uk/dashboard' ? '/uk/login' : '/ru/login')
  assert.equal(destination.searchParams.get('error'), 'oauth')
  assert.match(response.headers.get('cache-control'), /no-store/)
}
console.log('Default locale, invalid locale, local artwork and safe OAuth failures OK')
