import { build } from 'esbuild'
import { copyFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'

const require = createRequire(import.meta.url)
const target = 'public/ocr/paddle'
const models = resolve(dirname(require.resolve('@gutenye/ocr-models/node')), 'assets')
const runtime = resolve(dirname(require.resolve('onnxruntime-web')), '.')
mkdirSync(target, { recursive: true })
copyFileSync('scripts/ocr-notice.txt', `${target}/NOTICE.txt`)
for (const name of ['ch_PP-OCRv4_det_infer.onnx', 'ch_PP-OCRv4_rec_infer.onnx', 'ppocr_keys_v1.txt']) copyFileSync(resolve(models, name), `${target}/${name}`)
for (const name of ['ort-wasm-simd-threaded.wasm', 'ort-wasm-simd-threaded.mjs']) copyFileSync(resolve(runtime, name), `${target}/${name}`)
await build({
  entryPoints: ['src/lib/receipts/worker.ts'],
  outfile: `${target}/worker.js`,
  bundle: true,
  platform: 'browser',
  alias: { 'onnxruntime-web': 'onnxruntime-web/wasm' },
  format: 'iife',
  target: 'es2020',
  minify: true,
  banner: { js: 'Object.defineProperty(self,"document",{value:{createElement:()=>new OffscreenCanvas(1,1)}});' },
  external: ['fs', 'path', 'crypto'],
  define: { 'process.env.NODE_ENV': '"production"' },
})
