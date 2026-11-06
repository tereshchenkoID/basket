import Ocr from '@gutenye/ocr-browser'
import cv from '@techstark/opencv-js'
import { env } from 'onnxruntime-web'

import { safeOcrLines } from './parser'
import { missingNames, recoveredName } from './recovery'
import type { OcrWorkerRequest, OcrWorkerResponse } from './worker.types'

const scope = self as unknown as {
  onmessage: (event: MessageEvent<OcrWorkerRequest>) => void
  postMessage: (message: OcrWorkerResponse) => void
}

// The library's canvas backend needs only createElement('canvas') for raw ImageData.
// OffscreenCanvas keeps detection, perspective correction and recognition off the UI thread.

let engine: Awaited<ReturnType<typeof import('@gutenye/ocr-browser').default.create>> | undefined
let running = false

scope.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      scope.postMessage({ type: 'progress', value: 0.01 })
      scope.postMessage({ type: 'progress', value: 0.03 })
      env.wasm.wasmPaths = `${data.origin}/ocr/paddle/`
      env.wasm.numThreads = 1
      env.wasm.proxy = false

      if (!cv.Mat) await new Promise<void>(resolve => { cv.onRuntimeInitialized = resolve })

      scope.postMessage({ type: 'progress', value: 0.05 })
      engine = await Ocr.create({
        models: {
          detectionPath: `${data.origin}/ocr/paddle/ch_PP-OCRv4_det_infer.onnx`,
          recognitionPath: `${data.origin}/ocr/paddle/ch_PP-OCRv4_rec_infer.onnx`,
          dictionaryPath: `${data.origin}/ocr/paddle/ppocr_keys_v1.txt`,
        },
        onnxOptions: { executionProviders: ['wasm'], enableCpuMemArena: false },
      })
      scope.postMessage({ type: 'ready' })

      return
    }
    if (!engine || running) throw new Error('OCR worker unavailable')

    running = true
    scope.postMessage({ type: 'progress', value: 0.1 })
    const bitmap = await createImageBitmap(data.image, { imageOrientation: 'from-image' })
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
    const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale))

    try {
      const context = canvas.getContext('2d', { willReadFrequently: true })

      if (!context) throw new Error('OCR canvas unavailable')

      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
      scope.postMessage({ type: 'progress', value: 0.25 })
      const result = await engine.detect(pixels)
      const lines = result.texts.filter(line => line.text.trim())

      scope.postMessage({ type: 'diagnostic', message: 'GAPS ' + JSON.stringify({gaps: missingNames(lines), rows: lines.flatMap((line,index)=> /7[.,]48/.test(line.text) ? lines.slice(Math.max(0,index-1),index+4) : [])}) })
      for (const gap of missingNames(lines).slice(0, 6).reverse()) {
        const ratioX = canvas.width / result.resizedImageWidth
        const ratioY = canvas.height / result.resizedImageHeight
        const left = Math.max(0, gap.left * ratioX)
        const top = Math.max(0, gap.top * ratioY)
        const width = Math.min(canvas.width - left, (gap.right - gap.left) * ratioX)
        const height = Math.min(canvas.height - top, (gap.bottom - gap.top) * ratioY)
        const crop = new OffscreenCanvas(Math.round(width * 2), Math.round(height * 2))

        try {
          const cropped = crop.getContext('2d', { willReadFrequently: true })

          if (!cropped) continue

          cropped.drawImage(canvas, left, top, width, height, 0, 0, crop.width, crop.height)
          const retry = await engine.detect(cropped.getImageData(0, 0, crop.width, crop.height))
          const mapped = retry.texts.map(line => ({ ...line, box: line.box?.map(point => [point[0], point[1] / retry.resizedImageHeight * height / ratioY + top / ratioY]) }))
          const name = recoveredName(mapped, gap.from, gap.to)
          scope.postMessage({ type: 'diagnostic', message: JSON.stringify({ mapped, from: gap.from, to: gap.to }) })

          if (name) lines.splice(gap.index, 0, name)
        } catch { /* A failed local retry keeps the first pass available for review. */ } finally { crop.width = crop.height = 0 }
      }
      const confidence = lines.length
        ? Math.round(lines.reduce((sum, line) => sum + line.mean, 0) / lines.length * 100)
        : 0
      scope.postMessage({ type: 'progress', value: 1 })
      scope.postMessage({ type: 'result', result: { lines: safeOcrLines(lines.map(line => line.text)), confidence } })
    } finally {
      bitmap.close()
      canvas.width = canvas.height = 0
      running = false
    }
  } catch {
    running = false
    scope.postMessage({ type: 'error', message: 'Local OCR failed' })
  }
}
