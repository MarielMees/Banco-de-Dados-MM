import React, { useState } from 'react'
import {
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
  Scroll,
  AlertTriangle,
  History,
  Clock,
  Trophy,
  GraduationCap,
  Menu
} from 'lucide-react'
import { SCOUT_CONFIG } from '../constants/scoutConfig'
import UserBadge from './UserBadge'

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
  Scroll,
  AlertTriangle,
  History,
  Trophy,
  GraduationCap
}

export default function Dashboard({
  activeTab: propActiveTab,
  onSelectTab,
  players = [],
  onOpenGlobalSearch,
  onOpenRecentAdditions,
  user,
  onSignOut,
  onOpenMobileMenu
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('visao-geral')
  const activeTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab

  const handleTabChange = (tabId) => {
    if (onSelectTab) {
      onSelectTab(tabId)
    } else {
      setInternalActiveTab(tabId)
    }
  }

  // Dynamic statistics
  const totalAthletes = players.length
  const expiringContractsCount = players.filter(p => p.alerta === 'VENCENDO').length

  // Counts by item id (positions & follow-ups)
  const getItemStats = (itemId) => {
    let count = 0
    let alertCount = 0

    if (itemId === 'radar-sub23') {
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
        const saved = localStorage.getItem('copa_sp_players')
        const list = saved ? JSON.parse(saved) : []
        count = list.length
      } catch (e) {
        count = 0
      }
      alertCount = 0
    } else if (['goleiro', 'zagueiro', 'zag-canhoto', 'lat-direito', 'lat-esquerdo', 'medio', 'meia-ofensivo', 'extremo', 'centroavante'].includes(itemId)) {
      const list = players.filter(p => {
        if (itemId === 'zagueiro') {
          return p.posicao === 'zagueiro' || p.posicao === 'Zag. Destro' || p.posicao === 'zag-destro' || p.posicao === 'Zagueiro'
        }
        if (itemId === 'zag-canhoto') {
          return p.posicao === 'zag-canhoto' || p.posicao === 'Zag. Canhoto'
        }
        return p.posicao === itemId
      })
      count = list.length
      alertCount = list.filter(p => p.alerta === 'VENCENDO').length
    } else {
      // Fallback for gestao items
      const foundInConfig = SCOUT_CONFIG.positionCards.find(c => c.id === itemId)
      count = foundInConfig ? foundInConfig.count : 0
      alertCount = foundInConfig ? foundInConfig.alertCount : 0
    }

    return { count, alertCount }
  }

  // Dynamic level distribution
  const levelDistribution = SCOUT_CONFIG.levelDistribution.map(lvl => {
    const count = players.filter(p => p.nivel === lvl.level).length
    return {
      ...lvl,
      count
    }
  })

  const maxLevelCount = Math.max(...levelDistribution.map(item => item.count), 1)

  return (
    <div className="w-full min-h-screen bg-[#070b12] text-slate-200 font-sans pb-12 select-none overflow-x-hidden">
      {/* 1. TOPO / HEADER RESPONSIVO */}
      <header className="bg-[#0b111c] border-b border-slate-800/80 px-3 md:px-6 py-3 sticky top-0 z-40">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-2">
          {/* Logo, Títulos e Botão Mobile Menu ☰ */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onOpenMobileMenu && (
              <button
                type="button"
                onClick={onOpenMobileMenu}
                className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition cursor-pointer shrink-0"
                title="Abrir navegação (☰)"
              >
                <Menu className="w-5 h-5 text-emerald-400" />
              </button>
            )}

            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                  {SCOUT_CONFIG.header.title}
                </h1>
                <span className="hidden sm:flex text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {SCOUT_CONFIG.header.lastSync}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {SCOUT_CONFIG.header.subtitle}
              </p>
            </div>
          </div>

          {/* Botões do Topo Direito */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenGlobalSearch}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#131d2e] hover:bg-[#19273e] text-slate-300 border border-slate-700/60 text-xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Busca Global</span>
              <kbd className="px-1.5 py-0.2 bg-slate-800 text-[10px] rounded text-slate-400 border border-slate-700">K</kbd>
            </button>

            <button
              onClick={() => {
                if (onOpenRecentAdditions) onOpenRecentAdditions()
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs transition-colors font-medium cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Últimas Adições</span>
            </button>

            {/* Contador Geral de Atletas */}
            <div className="bg-[#121c2d] border border-slate-700/80 rounded-lg px-2.5 py-1 text-center min-w-[60px] sm:min-w-[75px]">
              <div className="text-sm sm:text-base font-extrabold text-white leading-tight">
                {totalAthletes}
              </div>
              <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-wider">
                ATLETAS
              </div>
            </div>

            {/* Indicador de Usuário Conectado e Botão Sair */}
            {user && (
              <UserBadge user={user} onSignOut={onSignOut} />
            )}
          </div>
        </div>
      </header>

      {/* 2. MENU DE NAVEGAÇÃO MULTI-LINHAS (Oculto no mobile, visível md:) */}
      <nav className="hidden md:block bg-[#0d1424] border-b border-slate-800/80 px-6 py-2.5">
        <div className="max-w-[1720px] mx-auto flex flex-col gap-2">
          {SCOUT_CONFIG.menuSections.map((section) => (
            <div key={section.id} className="flex items-center text-xs">
              <span className="w-36 shrink-0 text-[10px] font-bold tracking-wider text-slate-400 flex items-center gap-1">
                {section.label}
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                {section.items
                  .filter((item) => !['elenco-2027', 'historico'].includes(item.id))
                  .map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null
                    const isActive = activeTab === item.id
                    const { count: dynamicCount, alertCount: dynamicAlertCount } = getItemStats(item.id)
                    const showCount = item.count !== undefined || dynamicCount > 0

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all text-xs font-medium cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                            : 'bg-[#131d2e]/90 hover:bg-[#1c2a42] text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{item.label}</span>

                        {item.id !== 'visao-geral' && section.id !== 'gestao' && (
                          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700/60">
                            {dynamicCount}
                          </span>
                        )}

                        {dynamicAlertCount > 0 && section.id !== 'gestao' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                            {dynamicAlertCount}
                          </span>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL DO DASHBOARD */}
      <main className="w-full min-h-screen max-w-[1720px] mx-auto px-3 py-4 md:px-6 md:py-5 space-y-6">
        {/* Título da View */}
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            Visão Geral <span className="text-slate-600">—</span> <span className="text-emerald-400">Radar de Mercado</span>
          </h2>
          <p className="text-xs text-slate-400">
            {SCOUT_CONFIG.header.monitoredDate} &bull; <strong className="text-slate-200 font-semibold">{totalAthletes}</strong> Atletas Monitorados
          </p>
        </div>

        {/* 3. ALERTAS DE CONTRATO */}
        <section>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            ALERTAS DE CONTRATO
          </div>

          <div
            onClick={() => handleTabChange('vencendo')}
            className="bg-[#0f172a] border border-rose-900/40 rounded-xl p-4 flex items-center justify-between max-w-xs relative overflow-hidden group hover:border-rose-700/60 transition-colors shadow-lg shadow-rose-950/20 cursor-pointer"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {SCOUT_CONFIG.contractAlerts.expiringTitle}
              </div>
              <div className="text-3xl font-black text-rose-500 tracking-tight">
                {expiringContractsCount}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                {SCOUT_CONFIG.contractAlerts.filterLabel}
              </span>
            </div>
          </div>
        </section>

        {/* 4. POR POSIÇÃO (GRID DE CARDS) */}
        <section>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            POR POSIÇÃO
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-16 gap-2.5">
            {SCOUT_CONFIG.positionCards
              .filter((card) => !['elenco-2027', 'historico'].includes(card.id))
              .map((card) => {
              const Icon = iconMap[card.icon] || Shield
              const { count: dynamicCount, alertCount: dynamicAlertCount } = getItemStats(card.id)

              return (
                <div
                  key={card.id}
                  onClick={() => handleTabChange(card.id)}
                  className="bg-[#0f172a] border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 flex flex-col justify-between transition-all hover:translate-y-[-2px] group relative cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 rounded bg-slate-800/80 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {dynamicAlertCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40">
                        {dynamicAlertCount}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-medium text-slate-400 truncate mb-1" title={card.label}>
                    {card.label}
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-white tracking-tight">
                      {dynamicCount}
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 tracking-wider">
                      ATLETAS
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 5. DISTRIBUIÇÃO POR NÍVEL (BARRAS HORIZONTAIS) */}
        <section className="bg-[#0f172a] border border-slate-800/90 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              DISTRIBUIÇÃO POR NÍVEL
            </div>
            <span className="text-[11px] text-slate-400">Total por graduação técnica</span>
          </div>

          <div className="space-y-2.5">
            {levelDistribution.map((lvl) => {
              const percentage = Math.round((lvl.count / maxLevelCount) * 100)

              return (
                <div key={lvl.level} className="flex items-center gap-3 text-xs">
                  {/* Badge do Nível */}
                  <div className={`w-8 h-6 rounded flex items-center justify-center font-bold text-[11px] border shrink-0 ${lvl.badgeBg}`}>
                    {lvl.level}
                  </div>

                  {/* Barra de Progresso */}
                  <div className="flex-1 bg-slate-900/90 rounded h-5 p-0.5 overflow-hidden border border-slate-800/80 relative flex items-center">
                    <div
                      className={`h-full rounded-sm transition-all duration-700 ease-out ${lvl.colorClass}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  {/* Quantidade */}
                  <div className="w-8 text-right font-bold text-slate-200 shrink-0 text-xs">
                    {lvl.count}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 6. ATALHOS RÁPIDOS */}
        <section>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            ATALHOS RÁPIDOS
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {SCOUT_CONFIG.quickShortcuts.map((shortcut) => {
              const Icon = iconMap[shortcut.icon] || Flame

              let btnStyle = 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              if (shortcut.variant === 'danger') {
                btnStyle = 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
              } else if (shortcut.variant === 'primary') {
                btnStyle = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              } else if (shortcut.variant === 'warning') {
                btnStyle = 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }

              return (
                <button
                  key={shortcut.id}
                  onClick={() => handleTabChange(shortcut.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${btnStyle}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{shortcut.label}</span>
                </button>
              )
            })}
          </div>
        </section>
      </main>

      {/* RODAPÉ DISCRETO */}
      <footer className="max-w-[1720px] mx-auto px-6 mt-12 pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400">
        <div>Goiás Esporte Clube &bull; Departamento de Inteligência e Scouting</div>
        <div>Radar v2.6.4</div>
      </footer>
    </div>
  )
}