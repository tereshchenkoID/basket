import { DAY_MS, GROUP_RETENTION_DAYS } from '../constant/workspace'

export const daysRemaining = (deletedAt: string, now: number) => Math.max(
  0,
  Math.ceil((Date.parse(deletedAt) + GROUP_RETENTION_DAYS * DAY_MS - now) / DAY_MS),
)

export const sortRecords = <T extends { id: string }>(
  records: readonly T[],
  sort: string,
  locale: string,
  name: (record: T) => string,
  date: (record: T) => string,
) => [...records].sort((left, right) => {
  let result: number

  if (sort === 'nameAsc' || sort === 'nameDesc')
    result = name(left).localeCompare(name(right), locale) * (sort === 'nameDesc' ? -1 : 1)
  else result = (Date.parse(date(left)) - Date.parse(date(right))) * (sort === 'oldest' ? 1 : -1)

  return result || left.id.localeCompare(right.id)
})

export const tabQuery = (search: string, tab: string) => {
  const query = new URLSearchParams(search)
  query.set('tab', tab)

  return `?${query}`
}

export const readTab = <Tab extends string>(search: string, secondary: Tab): 'active' | Tab =>
  new URLSearchParams(search).get('tab') === secondary ? secondary : 'active'
