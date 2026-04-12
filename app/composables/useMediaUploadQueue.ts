/**
 * File d'attente client pour le téléversement direct de fichiers dans la médiathèque.
 * Feature : 016-mediatheque-direct-upload
 *
 * Invariants :
 *  - count(status === 'uploading') <= MAX_CONCURRENT
 *  - Chaque item a un AbortController unique
 *  - Liste et items mis à jour de façon immuable (spread + map, jamais de mutation)
 *  - mediaId !== null ⇔ status === 'done'
 */

import type { ComputedRef, Ref } from 'vue'
import { computed, readonly, ref } from 'vue'

export type UploadStatus =
  | 'queued'
  | 'uploading'
  | 'done'
  | 'error'
  | 'rejected'
  | 'cancelled'

export interface UploadItem {
  readonly id: string
  readonly file: File
  readonly name: string
  readonly size: number
  readonly mimeType: string
  readonly status: UploadStatus
  readonly progress: 0 | 50 | 100
  readonly error: string | null
  readonly mediaId: string | null
  readonly abortController: AbortController
  readonly attempts: number
}

export interface UploadQueueStats {
  total: number
  queued: number
  uploading: number
  done: number
  error: number
  rejected: number
  cancelled: number
}

export interface UseMediaUploadQueue {
  readonly items: Readonly<Ref<readonly UploadItem[]>>
  readonly stats: ComputedRef<UploadQueueStats>
  readonly hasActiveUploads: ComputedRef<boolean>
  addFiles: (files: File[]) => void
  retryItem: (id: string) => void
  removeItem: (id: string) => void
  cancelAll: () => void
  clearDone: () => void
  reset: () => void
}

export const MAX_CONCURRENT = 5

const DEFAULT_VALIDATION = {
  maxSizeMB: 50,
  allowedTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
} as const

function makeId(): string {
  // crypto.randomUUID n'est pas toujours typé dans SSR — fallback défensif
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function useMediaUploadQueue(): UseMediaUploadQueue {
  const { uploadMedia, validateFile } = useMediaApi()

  const internal = ref<UploadItem[]>([])
  // `inflight` vit hors du state réactif car il n'est qu'un compteur interne
  // servant à garantir l'invariant `uploading <= MAX_CONCURRENT`.
  let inflight = 0

  const stats = computed<UploadQueueStats>(() => {
    const base: UploadQueueStats = {
      total: internal.value.length,
      queued: 0,
      uploading: 0,
      done: 0,
      error: 0,
      rejected: 0,
      cancelled: 0,
    }
    for (const item of internal.value) {
      base[item.status] += 1
    }
    return base
  })

  const hasActiveUploads = computed<boolean>(() => {
    return stats.value.queued > 0 || stats.value.uploading > 0
  })

  function patchItem(id: string, patch: Partial<UploadItem>): void {
    internal.value = internal.value.map((it) => (it.id === id ? { ...it, ...patch } : it))
  }

  function addFiles(files: File[]): void {
    if (!files || files.length === 0) return

    const next: UploadItem[] = files.map((file): UploadItem => {
      const validation = validateFile(file, {
        maxSizeMB: DEFAULT_VALIDATION.maxSizeMB,
        allowedTypes: [...DEFAULT_VALIDATION.allowedTypes],
      })

      const base: UploadItem = {
        id: makeId(),
        file,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        status: validation.valid ? 'queued' : 'rejected',
        progress: 0,
        error: validation.valid ? null : (validation.error ?? 'Fichier invalide'),
        mediaId: null,
        abortController: new AbortController(),
        attempts: 0,
      }

      return base
    })

    internal.value = [...internal.value, ...next]
    processQueue()
  }

  async function processItem(id: string): Promise<void> {
    const current = internal.value.find((it) => it.id === id)
    if (!current || current.status !== 'queued') return

    patchItem(id, {
      status: 'uploading',
      progress: 50,
      error: null,
    })

    try {
      const response = await uploadMedia(current.file, {
        folder: 'general',
        signal: current.abortController.signal,
      })

      patchItem(id, {
        status: 'done',
        progress: 100,
        mediaId: response.id,
        error: null,
      })
    }
    catch (error: unknown) {
      // Si l'abort a été déclenché, ne pas écraser un état déjà `cancelled`
      const still = internal.value.find((it) => it.id === id)
      if (still && still.status === 'cancelled') {
        return
      }

      const isAbort
        = (error instanceof DOMException && error.name === 'AbortError')
          || (typeof error === 'object' && error !== null && 'name' in error
            && (error as { name?: string }).name === 'AbortError')

      if (isAbort) {
        patchItem(id, { status: 'cancelled', progress: 0 })
      }
      else {
        const message
          = error instanceof Error && error.message
            ? error.message
            : 'errorNetwork'
        patchItem(id, {
          status: 'error',
          progress: 0,
          error: message,
        })
      }
    }
    finally {
      inflight = Math.max(0, inflight - 1)
      processQueue()
    }
  }

  function processQueue(): void {
    while (inflight < MAX_CONCURRENT) {
      const nextItem = internal.value.find((it) => it.status === 'queued')
      if (!nextItem) return
      inflight += 1
      // On marque le passage à `uploading` à l'intérieur de processItem.
      // Ici on lance la coroutine sans await pour libérer la boucle.
      void processItem(nextItem.id)
    }
  }

  function retryItem(id: string): void {
    const item = internal.value.find((it) => it.id === id)
    if (!item || item.status !== 'error') return

    // Nouveau AbortController à chaque retry (un abort est one-shot)
    patchItem(id, {
      status: 'queued',
      progress: 0,
      error: null,
      attempts: item.attempts + 1,
      abortController: new AbortController(),
    })
    processQueue()
  }

  function removeItem(id: string): void {
    const item = internal.value.find((it) => it.id === id)
    if (!item) return
    // Un item en cours ne peut pas être retiré sans cancel explicite
    if (item.status === 'uploading') return
    internal.value = internal.value.filter((it) => it.id !== id)
  }

  function cancelAll(): void {
    for (const item of internal.value) {
      if (item.status === 'uploading' || item.status === 'queued') {
        try {
          item.abortController.abort()
        }
        catch {
          // no-op : un abort déjà déclenché n'a pas besoin d'être relancé
        }
      }
    }
    internal.value = internal.value.map((it) => {
      if (it.status === 'uploading' || it.status === 'queued') {
        return { ...it, status: 'cancelled', progress: 0 }
      }
      return it
    })
    // Les `processItem` en vol décrémenteront `inflight` dans leur finally.
  }

  function clearDone(): void {
    internal.value = internal.value.filter(
      (it) => it.status !== 'done' && it.status !== 'rejected',
    )
  }

  function reset(): void {
    cancelAll()
    internal.value = []
    inflight = 0
  }

  return {
    items: readonly(internal) as Readonly<Ref<readonly UploadItem[]>>,
    stats,
    hasActiveUploads,
    addFiles,
    retryItem,
    removeItem,
    cancelAll,
    clearDone,
    reset,
  }
}
