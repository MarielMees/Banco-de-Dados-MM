import React from 'react'
import {
  X,
  Zap,
  User,
  LogOut,
  Search,
  Clock,
  Shield,
  ShieldAlert,
  ShieldHalf,
  ArrowRightCircle,
  ArrowLeftCircle,
  Compass,
  Sparkles,
  Target,
  Telescope,
  Flame,
  Layers,
  FileText,
  UserCheck,
  Calendar,
  Trophy,
  GraduationCap,
  AlertTriangle
} from 'lucide-react'
import { SCOUT_CONFIG } from '../constants/scoutConfig'
import { getContractStatus } from '../utils/contractUtils'

const iconMap = {
  Shield,
  ShieldAlert,
  ShieldHalf,
  ArrowRightCircle,
  ArrowLeftCircle,
  Compass,
  Sparkles,
  Zap,
  Target,
  Telescope,
  Search,
  Flame,
  Layers,
  FileText,
  UserCheck,
  Calendar,
  Trophy,
  GraduationCap,
  AlertTriangle
}

export default function Sidebar({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  players = [],
  user,
  onSignOut,
  onOpenGlobalSearch,
  onOpenRecentAdditions
}) {
  // Função para computar estatísticas e contadores por item
  const getItemStats = (itemId) => {
    let count = 0
    let alertCount = 0

    if (itemId === 'radar-contratos' || itemId === 'vencendo') {
      const list = players.filter(p => {
        const s = getContractStatus(p)
        return s.isPreContract || s.isExpired
      })
      count = list.length
      alertCount = players.filter(p => {
        const s = getContractStatus(p)
        return s.isCritical || s.isExpired
      }).length
    } else if (itemId === 'radar-sub23') {
      const list = players.filter(p => p.radarSub23)
      count = list.length
      alertCount = list.filter(p => p.alerta === 'VENCENDO').length
    } else if (itemId === 'monitoramento') {
      const list = players.filter(p => p.monitoramento)
      count = list.length
      alertCount = list.filter(p => p.alerta === 'VENCENDO').length
    } else if (itemId === 'hot-list') {
      const list = players.filter(p => p.hotList)
      count = list.length
      alertCount = list.filter(p => p.alerta === 'VENCENDO').length
    } else if (itemId === 'copa-sp') {
      try {
        const saved = localStorage.getItem('copa_sp_players') || localStorage.getItem('radar_copa_sp_players')
        const list = saved ? JSON.parse(saved) : []
        count = list.length
      } catch (_) {
        count = 0
      }
      alertCount = 0
    } else if (['goleiro', 'zagueiro', 'zag-canhoto', 'lat-direito', 'lat-esquerdo', 'medio', 'meia-ofensivo', 'extremo', 'centroavante'].includes(itemId)) {
      const list = players.filter(p => {
        const pos = (p.posicao || '').toLowerCase()
        const pe = (p.pe || '').toLowerCase()
        if (itemId === 'zag-canhoto') {
          return pos.includes('canhot') || (pos.includes('zag') && pe.includes('canhot'))
        }
        if (itemId === 'zagueiro') {
          return (pos.includes('zag') || pos.includes('cb')) && !pos.includes('canhot') && !pe.includes('canhot')
        }
        if (itemId === 'lat-direito') return pos.includes('lat') && (pos.includes('dir') || pos.includes('d'))
        if (itemId === 'lat-esquerdo') return pos.includes('lat') && (pos.includes('esq') || pos.includes('e'))
        if (itemId === 'medio') return pos.includes('medio') || pos.includes('volante') || pos.includes('central')
        if (itemId === 'meia-ofensivo') return pos.includes('meia') || pos.includes('ofensivo')
        if (itemId === 'extremo') return pos.includes('extremo') || pos.includes('ponta')
        if (itemId === 'centroavante') return pos.includes('centroavante') || pos.includes('ca') || pos.includes('ata')
        if (itemId === 'goleiro') return pos.includes('gol') || pos.includes('gk')
        return false
      })
      count = list.length
      alertCount = list.filter(p => p.alerta === 'VENCENDO').length
    } else {
      const foundInConfig = SCOUT_CONFIG.positionCards?.find(c => c.id === itemId)
      count = foundInConfig ? foundInConfig.count : 0
      alertCount = foundInConfig ? foundInConfig.alertCount : 0
    }

    return { count, alertCount }
  }

  const username = user?.email
    ? (user.email.endsWith('@radarmec.com') ? user.email.replace('@radarmec.com', '') : user.email.split('@')[0])
    : 'Equipe'

  return (
    <>
      {/* 1. DRAWER MOBILE (SOBREPOSTO) - Exibido apenas em < 768px (md:) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop escuro com fecho ao tocar fora */}
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity cursor-pointer"
          onClick={onClose}
          aria-label="Fechar menu"
        />

        {/* Drawer Lateral Sobreposto */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out select-none ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Topo do Drawer com Logo e Botão de Fechar (✕) */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Zap className="w-4 h-4 fill-emerald-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white tracking-wide truncate">
                  Radar de Mercado
                </h2>
                <p className="text-[10px] text-slate-400 truncate">
                  Scout & Inteligência Esportiva
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              title="Fechar menu (✕)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Atalhos Rápidos no Mobile */}
          <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40">
            {onOpenGlobalSearch && (
              <button
                onClick={() => {
                  onClose()
                  onOpenGlobalSearch()
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>Busca</span>
              </button>
            )}
            {onOpenRecentAdditions && (
              <button
                onClick={() => {
                  onClose()
                  onOpenRecentAdditions()
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Adições</span>
              </button>
            )}
          </div>

          {/* Navegação de Seções com Scroll Suave */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
            {SCOUT_CONFIG.menuSections.map((section) => (
              <div key={section.id}>
                <div className="px-2 mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {section.label}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null
                    const isActive = currentTab === item.id
                    const { count, alertCount } = getItemStats(item.id)

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id)
                          onClose()
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {Icon && (
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                          )}
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          {count > 0 && section.id !== 'gestao' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700/60">
                              {count}
                            </span>
                          )}
                          {alertCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                              {alertCount}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé do Menu com Usuário e Logout */}
          {user && (
            <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {username}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Conectado</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose()
                  if (onSignOut) onSignOut()
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 transition text-xs font-semibold cursor-pointer shrink-0"
                title="Encerrar sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
