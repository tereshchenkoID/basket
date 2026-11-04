export type ListFormProps = {
  groupId: string
  list?: { id: string; title: string }
  onSuccess: (id: string) => void
}
