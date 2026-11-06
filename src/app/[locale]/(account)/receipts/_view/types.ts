export type ReceiptsViewProps = {
  available: boolean
  drafts: { id: string; updated_at: string; status: string }[]
}
