import type { TabItem } from './types'

export const nextTab = (items: readonly Pick<TabItem, 'value' | 'disabled'>[], current: string, key: string) => {
  const enabled = items.filter(item => !item.disabled)
  const index = enabled.findIndex(item => item.value === current)

  if (!enabled.length) return undefined
  if (key === 'Home') return enabled[0].value
  if (key === 'End') return enabled.at(-1)?.value
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return undefined

  return enabled[(index + (key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length]?.value
}
