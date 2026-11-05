import { readFileSync, writeFileSync } from 'node:fs'

const NEXT_VERSION = '16.4.5'
const MARKER = '// Basket: keep deferred and missing RSC suspension in stable child components.'

const patchLayoutRouter = (source, esm) => {
  if (source.includes(MARKER)) return source

  const use = esm ? 'use' : '(0, _react.use)'
  const jsx = esm ? '_jsx' : '(0, _jsxruntime.jsx)'
  const deferred = esm ? 'isDeferredRsc' : '(0, _rendertree.isDeferredRsc)'
  const unresolved = esm ? 'unresolvedThenable' : '_unresolvedthenable.unresolvedThenable'
  const start = source.indexOf('    let resolvedRsc;')
  const end = source.indexOf('    // In dev, we create a NavigationPromisesContext', start)
  const original = source.slice(start, end)

  if (start < 0 || end < 0 || !original.includes(`${use}(rsc)`) || !original.includes(`${use}(${unresolved})`))
    throw new Error('Next layout-router changed. Review the RSC suspension patch before updating Next.')

  const replacement = `    const resolvedRsc = ${deferred}(rsc)
        ? ${jsx}(BasketDeferredRsc, { rsc })
        : rsc === null ? ${jsx}(BasketMissingRsc, {}) : rsc;
`
  const helpers = `
${MARKER}
function BasketMissingRsc() {
    return ${use}(${unresolved});
}
function BasketDeferredRsc({ rsc }) {
    const node = ${use}(rsc);
    return node === null ? ${jsx}(BasketMissingRsc, {}) : node;
}
`

  // The original source map points at unpatched TypeScript. Let the bundler map
  // the actual JS instead, so stack frames continue to show the executed code.
  return (source.slice(0, start) + replacement + source.slice(end))
    .replace(/\n\/\/# sourceMappingURL=.*$/m, '') + helpers
}

const next = JSON.parse(readFileSync('node_modules/next/package.json', 'utf8'))

if (next.version !== NEXT_VERSION)
  throw new Error(`Review or remove the Next ${NEXT_VERSION} RSC patch before using Next ${next.version}.`)

for (const [file, esm] of [
  ['node_modules/next/dist/client/components/layout-router.js', false],
  ['node_modules/next/dist/esm/client/components/layout-router.js', true],
]) {
  const source = readFileSync(file, 'utf8')
  const patched = patchLayoutRouter(source, esm)

  if (patched !== source) writeFileSync(file, patched)
}
