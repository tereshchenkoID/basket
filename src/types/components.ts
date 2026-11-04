import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/locales'

import type { ActionError, ActionResult } from './action'

import type { ShoppingItem } from './database'
import type { Theme } from './theme'

export type HeaderProps = {
  theme: Theme
}

export type EmptyProps = {
  error?: ActionError
  title?: string
  description?: string
  heading?: 'h1' | 'h2' | 'h3'
  children?: ReactNode
}

export type ThemeSwitcherProps = {
  initialTheme: Theme
}

export type QuickAddProps = {
  listId: string
  onSuccess: () => void
}

export type ItemRowProps = {
  item: ShoppingItem
  archived: boolean
}

export type LogoutButtonProps = {
  locale: Locale
}

export type GoogleLoginButtonProps = {
  locale: Locale
  configured: boolean
  next?: string
}

export type AvatarProps = {
  name: string
  url: unknown
}

export type MutationProps<T> = {
  label: string
  operation: (id: string) => Promise<ActionResult<T>>
  onSuccess?: (data: T) => void
  confirmation?: string
  compact?: boolean
  className?: string
}

export type GroupFormProps = {
  group?: { id: string; name: string }
  locale: Locale
  onSuccess: (id: string) => void
}

export type ListFormProps = {
  groupId: string
  list?: { id: string; title: string }
  onSuccess: (id: string) => void
}

export type ItemFormProps = {
  item: ShoppingItem
  onSuccess: () => void
}

export type AccountInfo = {
  name: string
  email: string | null
  avatar: string | null
}

export type PreferencesProps = {
  theme: Theme
  account: AccountInfo | null
  locale: Locale
}

export type FooterProps = {
  className?: string
}
