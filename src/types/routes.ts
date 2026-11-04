import type { ReactNode } from 'react'

export type LocalePageProps = {
  params: Promise<{ locale: string }>
}

export type LoginProps = {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    error?: string | string[]
    next?: string | string[]
  }>
}

export type LocaleLayoutProps = {
  children: ReactNode
  params: Promise<{
    locale: string
  }>
}

export type InvitePageProps = {
  params: Promise<{
    locale: string
    token: string
  }>
}

export type GroupPageProps = {
  params: Promise<{
    locale: string
    'group-id': string
  }>
}

export type ListPageProps = {
  params: Promise<{
    locale: string
    'group-id': string
    'list-id': string
  }>
}
