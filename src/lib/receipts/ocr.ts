import { RECEIPT_LIMITS } from '@/constant/receipts'

import type { OcrAdapter, OcrResult } from './types'
import type { OcrWorkerResponse } from './worker.types'

let activeWorker = false

export const createOcr = async (onProgress: (progress: number) => void, signal?: AbortSignal): Promise<OcrAdapter> => {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  if (activeWorker) throw new Error('OCR worker is still active')

  activeWorker = true
  let worker: Worker

  try { worker = new Worker('/ocr/paddle/worker.js?v=4') } catch (error) { activeWorker = false; throw error }

  let terminated = false
  let ready: () => void = () => {}
  let failReady: (error: Error) => void = () => {}
  let result: ((value: OcrResult) => void) | undefined
  let failResult: ((error: Error) => void) | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  const stop = (error: Error = new DOMException('Aborted', 'AbortError')) => {
    if (terminated) return

    terminated = true
    clearTimeout(timer)
    signal?.removeEventListener('abort', handleAbort)
    worker.terminate()
    activeWorker = false
    failReady(error)
    failResult?.(error)
  }
  const handleAbort = () => stop()
  const initialized = new Promise<void>((resolve, reject) => { ready = resolve; failReady = reject })
  worker.onmessage = ({ data }: MessageEvent<OcrWorkerResponse>) => {
    if (terminated) return
    if (data.type === 'ready') { clearTimeout(timer); ready() }
    else if (data.type === 'diagnostic') console.info(data.message)
    else if (data.type === 'progress') onProgress(data.value)
    else if (data.type === 'result') { clearTimeout(timer); const resolve = result; result = undefined; failResult = undefined; resolve?.(data.result) }
    else if (data.type === 'error') stop(new Error(data.message))
  }
  worker.onerror = () => stop(new Error('Local OCR worker failed'))
  signal?.addEventListener('abort', handleAbort, { once: true })
  timer = setTimeout(() => stop(new Error('OCR initialization timeout')), RECEIPT_LIMITS.initializationMs)
  worker.postMessage({ type: 'init', origin: window.location.origin })

  if (signal?.aborted) stop()

  await initialized

  return {
    recognize: image => new Promise<OcrResult>((resolve, reject) => {
      if (terminated) { reject(new DOMException('Aborted', 'AbortError'))

        return }
      if (result) { reject(new Error('OCR is already processing a photo'))

        return }

      result = resolve
      failResult = reject
      timer = setTimeout(() => stop(new Error('OCR processing timeout')), RECEIPT_LIMITS.initializationMs)
      worker.postMessage({ type: 'recognize', image })
    }),
    terminate: async () => stop(),
  }
}

export const imageDimensions = (bytes: Uint8Array): { width: number; height: number } | null => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  if (bytes.length >= 24 && view.getUint32(0) === 0x89504e47) return { width: view.getUint32(16), height: view.getUint32(20) }
  if (bytes.length >= 30 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') {
    const type = String.fromCharCode(...bytes.slice(12, 16))

    if (type === 'VP8X') return { width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16), height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16) }
    if (type === 'VP8 ') return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff }
    if (type === 'VP8L' && bytes[20] === 0x2f) {
      const bits = view.getUint32(21, true)

      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) }
    }
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2

    while (offset + 4 < bytes.length) {
      if (bytes[offset] !== 0xff) return null

      const marker = bytes[offset + 1]
      const length = view.getUint16(offset + 2)

      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker) && offset + 9 <= bytes.length)
        return { width: view.getUint16(offset + 7), height: view.getUint16(offset + 5) }
      if (length < 2) return null

      offset += length + 2
    }
  }

  return null
}

let thumbnailQueue: Promise<void> = Promise.resolve()

export const thumbnailImage = (image: Blob): Promise<Blob> => {
  const result = thumbnailQueue.then(async () => {
    const bitmap = await createImageBitmap(image, { resizeWidth: 320, imageOrientation: 'from-image' })

    try {
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8))
      canvas.width = 0
      canvas.height = 0

      if (!blob) throw new Error('imageInvalid')

      return blob
    } finally { bitmap.close() }
  })
  thumbnailQueue = result.then(() => {}, () => {})

  return result
}

export const compressImage = async (file: File): Promise<Blob> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > RECEIPT_LIMITS.sourceBytes) throw new Error('imageInvalid')

  const dimensions = imageDimensions(new Uint8Array(await file.slice(0, 262144).arrayBuffer()))

  if (!dimensions || !dimensions.width || !dimensions.height || dimensions.width * dimensions.height > RECEIPT_LIMITS.pixels) throw new Error('imageInvalid')

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

  try {
    if (bitmap.width * bitmap.height > RECEIPT_LIMITS.pixels) throw new Error('imageInvalid')

    const scale = Math.min(1, RECEIPT_LIMITS.edge / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')

    if (!context) throw new Error('imageInvalid')

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    let blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.96))

    if (blob && blob.size > RECEIPT_LIMITS.imageBytes) blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.88))
    canvas.width = 0
    canvas.height = 0

    if (!blob || blob.size > RECEIPT_LIMITS.imageBytes) throw new Error('imageInvalid')

    return blob
  } finally {
    bitmap.close()
  }
}
