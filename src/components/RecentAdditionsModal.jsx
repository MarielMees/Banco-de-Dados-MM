import React, { useEffect } from 'react'
import {
  Clock,
  X,
  User,
  Shield,
  ShieldAlert,
  ShieldHalf,
  ArrowRightCircle,
  ArrowLeftCircle,
  Compass,
  Sparkles,
  Zap,
  Target,
  Search,
  ClipboardList,
  FileText
} from 'lucide-react'

const ICON_BY_POS = {
  goleiro: Shield,
  zagueiro: ShieldAlert,
  'zag-canhoto': ShieldHalf,
  'lat-direito': ArrowRightCircle,
  'lat-esquerdo': ArrowLeftCircle,
  medio: Compass,
  'meia-ofensivo': Sparkles,
  extremo: Zap,
  centroavante: Target,
  monitoramento: Search
}

const LABEL_BY_POS = {
  goleiro: 'Goleiro',
  zagueiro: 'Zag. Destro',
  'zag-destro': 'Zag. Destro',
  Zagueiro: 'Zag. Destro',
  'zag-canhoto': 'Zag. Canhoto',
  'lat-direito': 'Lat. Direito',
  'lat-esquerdo': 'Lat. Esquerdo',
  medio: 'Médio',
  'meia-ofensivo': 'Meia Ofensivo',
  extremo: 'Extremo',
  centroavante: 'Centroavante',
  monitoramento: 'Monitoramento'
}

export default function RecentAdditionsModal({
  isOpen,
  onClose,
  recentAdditions = [],
  onSelectPlayer,
  onSelectCoach,
  onSelectReport
}) {
  // ESC shortcut to close drawer
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getNivelStyle = (nivel) => {
    switch (nivel) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500 text-slate-950 font-black border-emerald-400'
      case 'B+':
      case 'B':
        return 'bg-blue-600 text-white font-black border-blue-500'
      case 'C+':
      case 'C':
        return 'bg-amber-500 text-slate-950 font-black border-amber-400'
      default:
        return 'bg-slate-600 text-slate-100 font-bold border-slate-500'
    }
  }

  const getBorderAccent = (item) => {
    if (item.tipo === 'treinador') return 'border-l-violet-500'
    if (item.tipo === 'relatorio') return 'border-l-emerald-500'
    if (item.monitoramento) return 'border-l-cyan-400'
    if (item.posicao === 'extremo' || item.nivel?.startsWith('C')) return 'border-l-amber-500'
    if (item.nivel?.startsWith('A')) return 'border-l-emerald-500'
    if (item.nivel?.startsWith('B')) return 'border-l-blue-500'
    return 'border-l-purple-500'
  }

  return (
    <div className="fixed inset-0 z-[110] flex justify-end font-sans select-none">
      {/* Backdrop transparente / escurecido com clique para fechar */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Painel lateral Drawer */}
      <div className="relative w-full max-w-md bg-[#0b111c] border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* 1. CABEÇALHO SUPERIOR */}
        <header className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-[#080d16]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Últimas Adições
              </h2>
              <p className="text-[11px] text-slate-400">
                Histórico recente de cadastros do sistema
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* 2. LISTA DE CARDS COM SCROLL */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {recentAdditions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
              <Clock className="w-8 h-8 text-slate-600 mb-2" />
              <span>Nenhum registro nas últimas adições.</span>
            </div>
          ) : (
            recentAdditions.map((item) => {
              const isCoach = item.tipo === 'treinador'
              const isReport = item.tipo === 'relatorio'

              const posKey = item.posicao || 'goleiro'
              const PosIcon = item.monitoramento ? Search : (ICON_BY_POS[posKey] || Shield)
              const posLabel = item.posicaoLabel || LABEL_BY_POS[posKey] || posKey
              const borderAccent = getBorderAccent(item)

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isCoach) {
                      if (onSelectCoach) onSelectCoach()
                      onClose()
                    } else if (isReport) {
                      if (onSelectReport) onSelectReport()
                      onClose()
                    } else if (onSelectPlayer && item.posicao) {
                      onSelectPlayer(item.posicao)
                      onClose()
                    }
                  }}
                  className={`bg-[#0f172a] border border-slate-800/90 rounded-xl p-3.5 border-l-4 ${borderAccent} hover:border-slate-700 transition-all hover:translate-x-[-2px] group cursor-pointer shadow-md`}
                >
                  {/* Linha 1: Nome + Badge Nível */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm tracking-wide group-hover:text-emerald-300 transition-colors">
                      {item.nome}
                    </span>
                    {item.nivel && (
                      <span className={`w-5 h-5 rounded text-[10px] flex items-center justify-center border ${getNivelStyle(item.nivel)}`}>
                        {item.nivel}
                      </span>
                    )}
                  </div>

                  {/* Linha 2: Badge de Categoria/Posição */}
                  <div className="flex items-center gap-2 mb-2">
                    {isCoach ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-violet-500/20 border border-violet-500/40 text-[10px] font-bold text-violet-300">
                        <ClipboardList className="w-3 h-3 text-violet-400" />
                        <span>Treinador</span>
                      </div>
                    ) : isReport ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span>Relatório de Jogo</span>
                      </div>
                    ) : (
                      <>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700/60 text-[10px] font-semibold text-slate-300">
                          <PosIcon className="w-3 h-3 text-emerald-400" />
                          <span>{item.monitoramento ? 'Monitoramento' : posLabel}</span>
                        </div>
                        {item.monitoramento && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {posLabel}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Linha 3: Detalhe / Clube Atual / Competição */}
                  <div className="text-xs text-slate-300 mb-2 font-medium">
                    {isCoach || isReport ? (item.detalhe || '—') : (item.ca || '—')}
                  </div>

                  {/* Linha 4: Ícone roxo + E-mail do autor */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400">
                      <User className="w-2.5 h-2.5" />
                    </div>
                    <span>{item.autor || 'dudu@admin.com'}</span>
                  </div>

                  {/* Linha 5: Ícone relógio + Data/Hora estilizada */}
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                    <Clock className="w-3 h-3" />
                    <span>{item.dataHora || 'hoje às 12:52'}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
