import type { OcrResult } from './types'

export type OcrWorkerRequest = { type: 'init'; origin: string } | { type: 'recognize'; image: Blob }

export type OcrWorkerResponse = { type: 'diagnostic'; message: string } | { type: 'ready' } | { type: 'progress'; value: number } | { type: 'result'; result: OcrResult } | { type: 'error'; message: string }
