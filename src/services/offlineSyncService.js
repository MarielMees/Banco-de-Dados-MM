import { upsertMatchReportToSupabase, upsertPlayerToSupabase } from './supabaseService'
import { useState, useEffect, useCallback } from 'react'

const QUEUE_STORAGE_KEY = 'offline_scout_queue'

/**
 * Lê a fila de sincronização off-line do localStorage
 */
export function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[OfflineQueue] Erro ao ler fila off-line:', err)
    return []
  }
}

/**
 * Salva a fila de sincronização no localStorage e notifica a aplicação
 */
export function saveOfflineQueue(queue) {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('offline_queue_changed', {
          detail: { count: queue.length, queue }
        })
      )
    }
  } catch (err) {
    console.error('[OfflineQueue] Erro ao salvar fila off-line:', err)
  }
}

/**
 * Adiciona um registro na fila off-line
 * @param {'match_report' | 'player_update' | 'scout_note'} type 
 * @param {object} data 
 */
export function addToOfflineQueue(type, data) {
  const queue = getOfflineQueue()
  const newItem = {
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    data,
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    retries: 0
  }

  queue.push(newItem)
  saveOfflineQueue(queue)
  return newItem
}

/**
 * Remove um item específico da fila após envio com sucesso
 */
export function removeFromOfflineQueue(id) {
  const queue = getOfflineQueue()
  const filtered = queue.filter(item => item.id !== id)
  saveOfflineQueue(filtered)
}

/**
 * Limpa toda a fila off-line
 */
export function clearOfflineQueue() {
  saveOfflineQueue([])
}

/**
 * Processa e envia todos os itens da fila para o Supabase
 */
export async function syncOfflineQueue() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, reason: 'offline', synced: 0, pending: getOfflineQueue().length }
  }

  const queue = getOfflineQueue()
  if (queue.length === 0) {
    return { success: true, synced: 0, pending: 0 }
  }

  let syncedCount = 0
  const remainingItems = []

  for (const item of queue) {
    try {
      let result = { success: false }

      if (item.type === 'match_report') {
        result = await upsertMatchReportToSupabase(item.data)
      } else if (item.type === 'player_update') {
        result = await upsertPlayerToSupabase(item.data)
      } else {
        // Fallback genérico para relatórios
        result = await upsertMatchReportToSupabase(item.data)
      }

      if (result && result.success) {
        syncedCount++
      } else {
        item.retries = (item.retries || 0) + 1
        item.lastError = result?.error || 'Erro desconhecido'
        remainingItems.push(item)
      }
    } catch (err) {
      item.retries = (item.retries || 0) + 1
      item.lastError = err?.message || String(err)
      remainingItems.push(item)
    }
  }

  saveOfflineQueue(remainingItems)

  return {
    success: remainingItems.length === 0,
    synced: syncedCount,
    pending: remainingItems.length
  }
}

// Ouvinte global para sincronização automática ao restabelecer internet
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineQueue] Conexão restabelecida! Iniciando envio da fila...')
    syncOfflineQueue().then((res) => {
      if (res.synced > 0) {
        console.log(`[OfflineQueue] Sincronização concluída: ${res.synced} itens enviados.`)
      }
    })
  })
}

/**
 * Hook React para monitorar status da conexão e pendências da fila
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  })
  const [queueCount, setQueueCount] = useState(() => getOfflineQueue().length)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleQueueChange = useCallback(() => {
    setQueueCount(getOfflineQueue().length)
  }, [])

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return
    setIsSyncing(true)
    try {
      const res = await syncOfflineQueue()
      return res
    } finally {
      setIsSyncing(false)
      setQueueCount(getOfflineQueue().length)
    }
  }, [isSyncing])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      triggerSync()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('offline_queue_changed', handleQueueChange)

    // Tenta sincronizar se já estiver online e houver pendências
    if (navigator.onLine && getOfflineQueue().length > 0) {
      triggerSync()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('offline_queue_changed', handleQueueChange)
    }
  }, [handleQueueChange, triggerSync])

  return {
    isOnline,
    queueCount,
    isSyncing,
    syncNow: triggerSync,
    offlineQueue: getOfflineQueue()
  }
}
