import React from 'react'
import { Wifi, WifiOff, RefreshCw, Radio } from 'lucide-react'
import { useOfflineSync } from '../services/offlineSyncService'

export default function NetworkStatusBadge({ className = '', showDetails = true }) {
  const { isOnline, queueCount, isSyncing, syncNow } = useOfflineSync()

  // 1. Caso Sincronizando
  if (isSyncing) {
    return (
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] sm:text-xs font-bold animate-pulse shadow-sm ${className}`}
        title="Enviando dados gravados off-line para o Supabase..."
      >
        <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
        <span>Sincronizando {queueCount > 0 ? `(${queueCount})` : ''}</span>
      </div>
    )
  }

  // 2. Caso Off-line (Modo Estádio)
  if (!isOnline) {
    return (
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 text-[10px] sm:text-xs font-extrabold shadow-md shadow-amber-950/40 ${className}`}
        title="Você está sem internet. Todas as anotações e relatórios serão salvos localmente e enviados assim que a conexão retornar."
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        <span>
          🟠 Modo Estádio {queueCount > 0 ? `(Off-line: ${queueCount} ${queueCount === 1 ? 'pendente' : 'pendentes'})` : '(Off-line)'}
        </span>
      </div>
    )
  }

  // 3. Caso Online com Itens Pendentes aguardando confirmação
  if (queueCount > 0) {
    return (
      <button
        type="button"
        onClick={syncNow}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/80 hover:bg-blue-900/90 text-blue-300 border border-blue-500/50 text-[10px] sm:text-xs font-bold transition-all cursor-pointer shadow-sm ${className}`}
        title="Clique para sincronizar agora as anotações pendentes com a nuvem"
      >
        <RefreshCw className="w-3 h-3 text-blue-400" />
        <span>🟢 Conectado ({queueCount} pendentes - Sincronizar)</span>
      </button>
    )
  }

  // 4. Caso Normal (Online e 100% Sincronizado)
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[10px] sm:text-xs font-bold ${className}`}
      title="Conectado ao Supabase - Sincronização em tempo real ativa"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <Wifi className="w-3 h-3 text-emerald-400" />
      <span>🟢 Conectado</span>
    </div>
  )
}
