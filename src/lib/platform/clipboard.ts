export const copyText = async (value: string) => {
  await navigator.clipboard.writeText(value)
}
