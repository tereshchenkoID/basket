export const formatCode = (value: string) => {
  const lines = value.replace(/^\n|\n\s*$/g, '').split('\n')
  const indent = Math.min(...lines.filter(line => line.trim()).map(line => line.match(/^\s*/)?.[0].length ?? 0))

  return lines.map(line => line.slice(indent)).join('\n')
}
