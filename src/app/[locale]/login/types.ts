export type LoginProps = {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    error?: string | string[]
    next?: string | string[]
  }>
}
