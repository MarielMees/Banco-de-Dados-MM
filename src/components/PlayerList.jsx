import React, { useState, useMemo } from 'react'
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
  Pencil,
  Trash2,
  Plus,
  Play,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  CheckCircle2,
  ClipboardList,
  Star,
  Eye,
  X,
  Trophy,
  GraduationCap,
  Menu
} from 'lucide-react'
import { SCOUT_CONFIG } from '../constants/scoutConfig'
import CharacteristicsModal from './CharacteristicsModal'
import PlayerModal from './PlayerModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
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

const ALL_POSITIONS_LIST = [
  { id: 'goleiro', label: 'Goleiro' },
  { id: 'zagueiro', label: 'Zag. Destro' },
  { id: 'zag-canhoto', label: 'Zag. Canhoto' },
  { id: 'lat-direito', label: 'Lat. Direito' },
  { id: 'lat-esquerdo', label: 'Lat. Esquerdo' },
  { id: 'medio', label: 'Volante (1º Médio)' },
  { id: 'medio-central', label: 'Médio Central' },
  { id: 'meia-ofensivo', label: 'Meia Ofensivo' },
  { id: 'extremo', label: 'Extremo' },
  { id: 'centroavante', label: 'Centroavante' }
]

export const normalizePosId = (pos, pe) => {
  if (!pos) return 'medio'
  const p = String(pos).toLowerCase().trim()
  if (p === 'goleiro' || p === 'gol' || p === 'gk') return 'goleiro'
  if (p === 'zag-canhoto' || (p.includes('zag') && p.includes('canhoto'))) return 'zag-canhoto'
  if (p === 'zagueiro' || p === 'zag-destro' || p.includes('destro') || p === 'zag') {
    if (String(pe || '').toLowerCase().includes('canhoto')) return 'zag-canhoto'
    return 'zagueiro'
  }
  if (p === 'lat-direito' || p === 'ld' || p.includes('lateral direito') || p.includes('lat. direito') || p === 'lat d') return 'lat-direito'
  if (p === 'lat-esquerdo' || p === 'le' || p.includes('lateral esquerdo') || p.includes('lat. esquerdo') || p === 'lat e') return 'lat-esquerdo'
  if (p.includes('volante') || p.includes('1º médio') || p.includes('1o medio') || p === 'vol') return 'medio'
  if (p.includes('médio central') || p.includes('medio central') || p === 'medio-central' || p === 'mc') return 'medio-central'
  if (p === 'medio' || p === 'médio') return 'medio'
  if (p.includes('meia ofensivo') || p === 'meia-ofensivo' || p === 'meia' || p === 'mei' || p === 'moc') return 'meia-ofensivo'
  if (p.includes('extremo') || p.includes('ponta') || p.startsWith('ext')) return 'extremo'
  if (p.includes('centroavante') || p === 'ca' || p.includes('ata') || p === 'cf') return 'centroavante'
  return p
}

const formatListPosLabel = (pos) => {
  if (!pos) return 'Meia Ofensivo'
  const p = String(pos).toLowerCase().trim()
  if (p === 'goleiro' || p === 'gol' || p === 'gk') return 'Goleiro'
  if (p === 'zag-canhoto' || (p.includes('zag') && p.includes('canhoto'))) return 'Zag. Canhoto'
  if (p === 'zagueiro' || p === 'zag-destro' || p.includes('destro') || p === 'zag') return 'Zag. Destro'
  if (p === 'lat-direito' || p === 'ld' || p.includes('lateral direito')) return 'Lat. Direito'
  if (p === 'lat-esquerdo' || p === 'le' || p.includes('lateral esquerdo')) return 'Lat. Esquerdo'
  if (p === 'medio' || p === 'volante' || p.includes('volante') || p.includes('1º médio')) return 'Volante (1º Médio)'
  if (p === 'medio-central' || p.includes('médio central') || p.includes('medio central')) return 'Médio Central'
  if (p === 'meia-ofensivo' || p === 'meia' || p.includes('ofensivo')) return 'Meia Ofensivo'
  if (p === 'extremo' || p.includes('extremo') || p.includes('ponta') || p.startsWith('ext')) return 'Extremo'
  if (p === 'centroavante' || p === 'ca' || p.includes('ata') || p === 'cf') return 'Centroavante'
  return pos
}

export default function PlayerList({
  activePosition = 'goleiro',
  onSelectTab,
  players = [],
  onSavePlayer,
  onDeletePlayer,
  onOpenGlobalSearch,
  onOpenRecentAdditions,
  matchReports = [],
  user,
  onSignOut,
  onOpenMobileMenu
}) {
  const [search, setSearch] = useState('')
  const [filterOnlyProvisorio, setFilterOnlyProvisorio] = useState(false)
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [projecaoFilter, setProjecaoFilter] = useState('ALL')
  const [alertFilter, setAlertFilter] = useState('ALL')
  const [altMin, setAltMin] = useState('')
  const [altMax, setAltMax] = useState('')
  const [anoDe, setAnoDe] = useState('')
  const [anoAte, setAnoAte] = useState('')
  const [sortOrder, setSortOrder] = useState('name-asc')
  const [showLegend, setShowLegend] = useState(false)
  const [isCharacteristicsModalOpen, setIsCharacteristicsModalOpen] = useState(false)
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)
  const [playerToEdit, setPlayerToEdit] = useState(null)
  const [expandedPlayerId, setExpandedPlayerId] = useState(null)
  const [showReportsPlayerIds, setShowReportsPlayerIds] = useState(new Set())
  const [previewReport, setPreviewReport] = useState(null)

  const [playerToDelete, setPlayerToDelete] = useState(null)
  const [openPositionMenuPlayerId, setOpenPositionMenuPlayerId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const handleQuickChangePosition = (player, newPosId, newPosLabel) => {
    const newPe = newPosId === 'zag-canhoto' ? 'Canhoto' : (player.pe || 'Destro')
    const updatedPlayer = {
      ...player,
      posicao: newPosId,
      pe: newPe
    }
    handleSave(updatedPlayer)
    setOpenPositionMenuPlayerId(null)
    setToastMessage(`Posição de ${player.nome} alterada para ${newPosLabel}`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fechar dropdown de posições ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = () => setOpenPositionMenuPlayerId(null)
    if (openPositionMenuPlayerId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openPositionMenuPlayerId])

  const toggleExpandPlayer = (id) => {
    setExpandedPlayerId(prev => (prev === id ? null : id))
  }

  const toggleReportsPlayer = (id) => {
    setShowReportsPlayerIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleOpenAddModal = () => {
    setPlayerToEdit(null)
    setIsPlayerModalOpen(true)
  }

  const handleOpenEditModal = (player) => {
    setPlayerToEdit(player)
    setIsPlayerModalOpen(true)
  }

  const handleSave = (playerData) => {
    if (onSavePlayer) {
      onSavePlayer(playerData)
    }
  }

  const handleDeleteClick = (player) => {
    setPlayerToDelete(player)
  }

  const handleConfirmDelete = () => {
    if (playerToDelete && onDeletePlayer) {
      onDeletePlayer(playerToDelete.id)
    }
    setPlayerToDelete(null)
  }

  // Dynamic statistics
  const totalAthletes = players.length

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
    } else if (['goleiro', 'zagueiro', 'zag-canhoto', 'lat-direito', 'lat-esquerdo', 'medio', 'medio-central', 'meia-ofensivo', 'extremo', 'centroavante'].includes(itemId)) {
      const list = players.filter(p => {
        const norm = normalizePosId(p.posicao, p.pe)
        if (itemId === 'medio') return norm === 'medio' || norm === 'medio-central'
        return norm === itemId
      })
      count = list.length
      alertCount = list.filter(p => p.alerta === 'VENCENDO').length
    } else {
      const foundInConfig = SCOUT_CONFIG.positionCards.find(c => c.id === itemId)
      count = foundInConfig ? foundInConfig.count : 0
      alertCount = foundInConfig ? foundInConfig.alertCount : 0
    }

    return { count, alertCount }
  }

  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => {
        const isProv = Boolean(p.isProvisorio || p.is_provisorio)

        // Se o filtro de provisórios estiver ativado (via banner amarelo):
        // Exibe exclusivamente os atletas provisórios/pendentes, independentemente da aba de posição ativa
        if (filterOnlyProvisorio) {
          if (!isProv) return false

          // Permite buscar por texto dentro dos provisórios
          if (search.trim()) {
            const s = search.toLowerCase()
            const matchNome = (p.nome || '').toLowerCase().includes(s)
            const matchClube = (p.ca || p.clubeAtual || p.clube || '').toLowerCase().includes(s)
            const matchAgente = (p.agente || '').toLowerCase().includes(s)
            if (!matchNome && !matchClube && !matchAgente) return false
          }
          return true
        }

        // Filtro por aba ativa
        if (activePosition === 'radar-sub23') {
          if (!p.radarSub23) return false
        } else if (activePosition === 'monitoramento') {
          if (!p.monitoramento) return false
        } else if (activePosition === 'hot-list') {
          if (!p.hotList) return false
        } else if (activePosition === 'vencendo') {
          if (p.alerta !== 'VENCENDO') return false
        } else if (['goleiro', 'zagueiro', 'zag-canhoto', 'lat-direito', 'lat-esquerdo', 'medio', 'medio-central', 'meia-ofensivo', 'extremo', 'centroavante'].includes(activePosition)) {
          const normPos = normalizePosId(p.posicao, p.pe)
          // Se for provisório sem posição definida ou não reconhecida, mantém visível para não se perder
          if (isProv && (!p.posicao || p.posicao === '—' || !normPos)) {
            // mantém visível
          } else {
            if (activePosition === 'zagueiro') {
              if (normPos !== 'zagueiro') return false
            } else if (activePosition === 'zag-canhoto') {
              if (normPos !== 'zag-canhoto') return false
            } else if (activePosition === 'medio') {
              if (normPos !== 'medio' && normPos !== 'medio-central') return false
            } else {
              if (normPos !== activePosition) return false
            }
          }
        }

        // Busca textual
        if (search.trim()) {
          const s = search.toLowerCase()
          const matchNome = (p.nome || '').toLowerCase().includes(s)
          const matchClube = (p.ca || p.clubeAtual || p.clube || '').toLowerCase().includes(s)
          const matchAgente = (p.agente || '').toLowerCase().includes(s)
          if (!matchNome && !matchClube && !matchAgente) return false
        }

        // Filtros secundários: Não filtrar nem ocultar atletas provisórios com campos em branco
        if (levelFilter !== 'ALL') {
          if (p.nivel !== levelFilter) {
            if (!isProv || (p.nivel && p.nivel !== '—' && p.nivel !== 'A Avaliar')) {
              return false
            }
          }
        }
        if (projecaoFilter !== 'ALL') {
          if (!isProv) {
            if (Array.isArray(p.projecao)) {
              if (!p.projecao.includes(projecaoFilter)) return false
            } else if (typeof p.projecao === 'string') {
              if (p.projecao !== projecaoFilter) return false
            } else {
              return false
            }
          }
        }
        if (alertFilter !== 'ALL') {
          if (!isProv && p.alerta !== alertFilter) return false
        }
        if (altMin && p.alt && p.alt !== '—') {
          if (p.alt < parseInt(altMin, 10)) return false
        }
        if (altMax && p.alt && p.alt !== '—') {
          if (p.alt > parseInt(altMax, 10)) return false
        }
        if (anoDe && p.an && p.an !== '—') {
          if (p.an < parseInt(anoDe, 10)) return false
        }
        if (anoAte && p.an && p.an !== '—') {
          if (p.an > parseInt(anoAte, 10)) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortOrder === 'name-asc') return (a.nome || '').localeCompare(b.nome || '')
        if (sortOrder === 'name-desc') return (b.nome || '').localeCompare(a.nome || '')
        if (sortOrder === 'alt-desc') return (b.alt || 0) - (a.alt || 0)
        if (sortOrder === 'an-desc') return (b.an || 0) - (a.an || 0)
        return 0
      })
  }, [players, activePosition, filterOnlyProvisorio, search, levelFilter, projecaoFilter, alertFilter, altMin, altMax, anoDe, anoAte, sortOrder])

  const getNivelStyle = (nivel) => {
    switch (nivel) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500 text-slate-950 font-bold'
      case 'B+':
      case 'B':
        return 'bg-blue-600 text-white font-bold'
      case 'C+':
      case 'C':
        return 'bg-amber-500 text-slate-950 font-bold'
      default:
        return 'bg-slate-600 text-slate-100 font-bold'
    }
  }

  const getNivelFisicoStyle = (nivelFisico) => {
    switch (nivelFisico) {
      case 'Excelente':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      case 'Muito Bom':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40'
      case 'Bom':
        return 'bg-slate-700/40 text-slate-300 border-slate-600'
      case 'Fraco':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      case 'Muito Ruim':
        return 'bg-red-500/20 text-red-400 border-red-500/40'
      default:
        return 'bg-slate-800/60 text-slate-400 border-slate-700/50'
    }
  }

  const renderProjecaoBadges = (projecaoData) => {
    if (!projecaoData || projecaoData === '—') {
      return <span className="text-slate-500 font-medium">—</span>
    }

    const items = Array.isArray(projecaoData)
      ? projecaoData.filter(Boolean)
      : typeof projecaoData === 'string' && projecaoData.trim() && projecaoData !== '—'
      ? [projecaoData.trim()]
      : []

    if (items.length === 0) {
      return <span className="text-slate-500 font-medium">—</span>
    }

    // Ordenação consistente: Nacional (BR1..BR4) primeiro, Internacional (E1, E2, E3, EXT...) depois
    const isNacional = (code) => code && code.startsWith('BR')
    const sorted = [...items].sort((a, b) => {
      const aNac = isNacional(a)
      const bNac = isNacional(b)
      if (aNac && !bNac) return -1
      if (!aNac && bNac) return 1
      return a.localeCompare(b)
    })

    return (
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {sorted.map((code, idx) => {
          const nac = isNacional(code)
          return (
            <span
              key={idx}
              className={
                nac
                  ? 'bg-slate-800 text-slate-200 border border-slate-600/80 px-2 py-0.5 rounded text-xs font-semibold'
                  : 'border border-emerald-500/40 text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded text-xs font-semibold'
              }
            >
              {code}
            </span>
          )
        })}
      </div>
    )
  }

  // Calcula dias até a data do contrato (formato DD/MM/YYYY)
  const getDaysToContractExpiry = (contratoStr) => {
    if (!contratoStr || contratoStr === '—') return null
    const parts = contratoStr.split('/')
    if (parts.length !== 3) return null
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null
    const contractDate = new Date(year, month, day)
    // Usar data atual
    const today = new Date()
    const diffTime = contractDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getContratoStyle = (contratoStr) => {
    const days = getDaysToContractExpiry(contratoStr)
    if (days === null) return 'text-slate-500 font-normal'
    if (days < 180) return 'text-rose-500 font-semibold'
    if (days <= 365) return 'text-amber-400 font-semibold'
    return 'text-emerald-400 font-semibold'
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 font-sans pb-12 select-none">
      {/* 1. TOPO / HEADER */}
      <header className="bg-[#0b111c] border-b border-slate-800/80 px-3 md:px-6 py-3 sticky top-0 z-50">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            {onOpenMobileMenu && (
              <button
                type="button"
                onClick={onOpenMobileMenu}
                className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-700 transition cursor-pointer"
                title="Abrir menu de navegação (☰)"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="w-4 h-4 text-emerald-400" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
                  {SCOUT_CONFIG.header.title}
                </h1>
                <span className="hidden sm:inline-flex text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {SCOUT_CONFIG.header.lastSync}
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-400 line-clamp-1">
                {SCOUT_CONFIG.header.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
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
                console.log("Clicou em Últimas Adições")
                if (onOpenRecentAdditions) onOpenRecentAdditions()
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs transition-colors font-medium cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Últimas Adições</span>
            </button>

            <div className="bg-[#121c2d] border border-slate-700/80 rounded-lg px-2.5 md:px-3 py-1 text-center min-w-[65px] md:min-w-[75px]">
              <div className="text-sm md:text-base font-extrabold text-white leading-tight">
                {totalAthletes}
              </div>
              <div className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-wider">
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

      {/* 2. MENU DE NAVEGAÇÃO MULTI-LINHAS */}
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
                  const isActive = activePosition === item.id
                  const { count: dynamicCount, alertCount: dynamicAlertCount } = getItemStats(item.id)

                  return (
                    <button
                      key={item.id}
                      onClick={() => { setFilterOnlyProvisorio(false); onSelectTab && onSelectTab(item.id); }}
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

      {/* 3. BARRA SUPERIOR DE FILTROS E AÇÕES */}
      <div className="max-w-[1720px] mx-auto px-3 py-3 md:px-6 md:pt-5 md:pb-3">
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
          {/* Lado Esquerdo: Filtros */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Busca textual */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nome, clube, agente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            {/* Select Nível */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500/60 cursor-pointer"
            >
              <option value="ALL">Todos os Níveis</option>
              <option value="A+">Nível A+</option>
              <option value="A">Nível A</option>
              <option value="B+">Nível B+</option>
              <option value="B">Nível B</option>
              <option value="C+">Nível C+</option>
              <option value="C">Nível C</option>
              <option value="D">Nível D</option>
            </select>

            {/* Select Projeção */}
            <select
              value={projecaoFilter}
              onChange={(e) => setProjecaoFilter(e.target.value)}
              className="bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500/60 cursor-pointer"
            >
              <option value="ALL">Todas as Projeções</option>
              <option value="BR1">BR1 (Série A)</option>
              <option value="BR2">BR2 (Série B)</option>
              <option value="BR3">BR3 (Série C / Estaduais)</option>
              <option value="BR4">BR4 (Série D / Regionais)</option>
              <option value="E1">E1 (Top 5 Ligas)</option>
              <option value="E2">E2 (Europa Média)</option>
              <option value="E3">E3 (Europa Periférica)</option>
              <option value="EXT">EXT (Mundo Árabe/MLS/Ásia)</option>
            </select>

            {/* Select Alertas */}
            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
              className="bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500/60 cursor-pointer"
            >
              <option value="ALL">Todos os Alertas</option>
              <option value="VENCENDO">Vencendo</option>
              <option value="OK">OK</option>
            </select>

            {/* Inputs Altura (ALT) */}
            <div className="flex items-center gap-1 bg-[#131d2e] border border-slate-700/80 rounded-lg px-2 py-1">
              <span className="text-[10px] font-bold text-emerald-400 mr-1">ALT</span>
              <input
                type="number"
                placeholder="Min"
                value={altMin}
                onChange={(e) => setAltMin(e.target.value)}
                className="w-12 bg-transparent text-slate-200 text-xs focus:outline-none text-center"
              />
              <span className="text-slate-600">-</span>
              <input
                type="number"
                placeholder="Max"
                value={altMax}
                onChange={(e) => setAltMax(e.target.value)}
                className="w-12 bg-transparent text-slate-200 text-xs focus:outline-none text-center"
              />
            </div>

            {/* Inputs Ano de Nascimento (ANO) */}
            <div className="flex items-center gap-1 bg-[#131d2e] border border-slate-700/80 rounded-lg px-2 py-1">
              <span className="text-[10px] font-bold text-emerald-400 mr-1">ANO</span>
              <input
                type="number"
                placeholder="De"
                value={anoDe}
                onChange={(e) => setAnoDe(e.target.value)}
                className="w-12 bg-transparent text-slate-200 text-xs focus:outline-none text-center"
              />
              <span className="text-slate-600">-</span>
              <input
                type="number"
                placeholder="Até"
                value={anoAte}
                onChange={(e) => setAnoAte(e.target.value)}
                className="w-12 bg-transparent text-slate-200 text-xs focus:outline-none text-center"
              />
            </div>

            {/* Ordenação */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500/60 cursor-pointer"
            >
              <option value="name-asc">Nome (A-Z)</option>
              <option value="name-desc">Nome (Z-A)</option>
              <option value="alt-desc">Maior Altura</option>
              <option value="an-desc">Mais Jovens</option>
            </select>
          </div>

          {/* Lado Direito: Contador, Legenda e Botão Adicionar */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 font-medium">
              <strong className="text-white font-bold">{filteredPlayers.length}</strong> atletas
            </div>

            {/* Botão Switch Legenda */}
            <button
              onClick={() => setIsCharacteristicsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer bg-[#131d2e] hover:bg-[#1a273d] text-slate-300 border-slate-700 hover:border-slate-600"
            >
              <span className="w-2 h-2 rounded-sm bg-emerald-400"></span>
              <span>Legenda</span>
            </button>

            {/* Botão Verde Neon de Adicionar */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        {/* Bloco de Legenda retrátil */}
        {showLegend && (
          <div className="mt-2 p-3 bg-[#0d1424] border border-slate-800 rounded-lg flex flex-wrap items-center gap-4 text-xs text-slate-400 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">A</span>
              <span>Nível Titular / Destaque</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">B</span>
              <span>Nível Composição / Potencial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">C</span>
              <span>Nível Observação</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">VENCENDO</span>
              <span>Contrato até 180 dias</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. TABELA DE ATLETAS */}
      <main className="w-full min-h-screen max-w-[1720px] mx-auto px-3 py-4 md:px-6">
        {players.some((p) => p.isProvisorio || p.is_provisorio) && (() => {
          const provisionalCount = players.filter((p) => p.isProvisorio || p.is_provisorio).length
          return (
            <div
              onClick={() => setFilterOnlyProvisorio((prev) => !prev)}
              className={`mb-3 px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm cursor-pointer transition-all duration-200 select-none ${
                filterOnlyProvisorio
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 shadow-lg shadow-amber-950/40'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/15 hover:border-amber-500/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-base ${filterOnlyProvisorio ? 'animate-bounce' : 'animate-pulse'}`}>
                  {filterOnlyProvisorio ? '⚡' : '⚠️'}
                </span>
                <span>
                  {filterOnlyProvisorio
                    ? `Exibindo ${provisionalCount} atleta(s) provisório(s) aguardando preenchimento completo.`
                    : 'Existem atletas cadastrados via Relatório de Campo aguardando dados completos.'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFilterOnlyProvisorio((prev) => !prev)
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                  filterOnlyProvisorio
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                }`}
              >
                {filterOnlyProvisorio ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Limpar Filtro / Ver Todos</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Filtrar Apenas Pendentes</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold ml-0.5">
                      {provisionalCount}
                    </span>
                  </>
                )}
              </button>
            </div>
          )
        })()}
        <div className="bg-[#0b111c] border border-slate-800/90 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#080d16] text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="py-3 px-4">ATLETA</th>
                  <th className="py-3 px-3 text-center">AN</th>
                  <th className="py-3 px-3 text-center">ALT</th>
                  <th className="py-3 px-3 text-center">PÉ</th>
                  <th className="py-3 px-3 text-center">NÍVEL</th>
                  <th className="py-3 px-3 text-center">PROJEÇÃO</th>
                  <th className="py-3 px-3 text-center">FÍSICO</th>
                  <th className="py-3 px-4">CA (CC)</th>
                  <th className="py-3 px-4">CLUBE FORM.</th>
                  <th className="py-3 px-3 text-center">POS. SEC.</th>
                  <th className="py-3 px-4">CARACTERÍSTICAS</th>
                  <th className="py-3 px-3 text-center">AGENTE</th>
                  <th className="py-3 px-4 text-center">CONTRATO</th>
                  <th className="py-3 px-4 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-10 text-center text-slate-500 text-xs">
                      {filterOnlyProvisorio
                        ? 'Nenhum atleta provisório pendente encontrado.'
                        : 'Nenhum atleta encontrado para os filtros selecionados.'}
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((rawPlayer) => {
                    // Retroativo: Se o atleta for provisório e mantiver campos padrões automáticos anteriores, tratá-los como vazios para renderizar "—"
                    const isProv = Boolean(rawPlayer.isProvisorio || rawPlayer.is_provisorio)
                    const player = isProv
                      ? {
                          ...rawPlayer,
                          pe: rawPlayer.pe === 'Destro' && rawPlayer.an === null && rawPlayer.alt === null ? null : rawPlayer.pe,
                          nivel: rawPlayer.nivel === 'C' && rawPlayer.nivelFisico === 'Bom' && Array.isArray(rawPlayer.projecao) && rawPlayer.projecao.length === 1 && rawPlayer.projecao[0] === 'BR3' ? null : rawPlayer.nivel,
                          projecao: rawPlayer.nivel === 'C' && rawPlayer.nivelFisico === 'Bom' && Array.isArray(rawPlayer.projecao) && rawPlayer.projecao.length === 1 && rawPlayer.projecao[0] === 'BR3' ? [] : rawPlayer.projecao,
                          nivelFisico: rawPlayer.nivel === 'C' && rawPlayer.nivelFisico === 'Bom' && Array.isArray(rawPlayer.projecao) && rawPlayer.projecao.length === 1 && rawPlayer.projecao[0] === 'BR3' ? null : rawPlayer.nivelFisico,
                        }
                      : rawPlayer

                    const isExpiring = player.alerta === 'VENCENDO'
                    const isExpanded = expandedPlayerId === player.id
                    const daysToExpiry = getDaysToContractExpiry(player.contrato)

                    return (
                      <React.Fragment key={player.id}>
                        <tr
                          onClick={() => toggleExpandPlayer(player.id)}
                          className={`transition-colors group cursor-pointer ${
                            isExpanded
                              ? 'bg-slate-900/90 border-b-2 border-teal-500/50 shadow-sm'
                              : 'hover:bg-[#101929]/80'
                          }`}
                        >
                          {/* ATLETA */}
                          <td className="py-3.5 px-4 font-bold text-white tracking-wide text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-180 text-teal-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </span>
                              <span>{player.nome}</span>
                              {(player.isProvisorio || player.is_provisorio) && (
                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/50 uppercase tracking-tight flex items-center gap-1 shadow-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  Pendente &bull; Provisório
                                </span>
                              )}
                              {(player.alerta === 'Base' || player.origem === 'Copa SP') && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-tight flex items-center gap-1">
                                  <GraduationCap className="w-2.5 h-2.5 text-emerald-400" />
                                  Base &bull; Copa SP
                                </span>
                              )}
                            </div>
                          </td>

                          {/* AN */}
                          <td className="py-3.5 px-3 text-center font-bold text-slate-200">
                            {player.an || player.anoNascimento || '—'}
                          </td>

                          {/* ALT */}
                          <td className="py-3.5 px-3 text-center font-bold text-slate-200">
                            {player.alt || player.altura || '—'}
                          </td>

                          {/* PÉ */}
                          <td className="py-3.5 px-3 text-center">
                            {player.pe && player.pe !== '—' ? (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                player.pe === 'Destro'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                  : 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40'
                              }`}>
                                {player.pe}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">—</span>
                            )}
                          </td>

                          {/* NÍVEL */}
                          <td className="py-3.5 px-3 text-center">
                            {player.nivel && player.nivel !== '—' && player.nivel !== 'A Avaliar' ? (
                              <span className={`inline-flex items-center justify-center w-6 h-5 rounded text-[10px] leading-none ${getNivelStyle(player.nivel)}`}>
                                {player.nivel}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">—</span>
                            )}
                          </td>

                          {/* PROJEÇÃO */}
                          <td className="py-3.5 px-3 text-center">
                            {renderProjecaoBadges(player.projecao)}
                          </td>

                          {/* FÍSICO */}
                          <td className="py-3.5 px-3 text-center">
                            {player.nivelFisico && player.nivelFisico !== '—' && player.nivelFisico !== 'A Avaliar' ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold leading-none tracking-tight ${getNivelFisicoStyle(player.nivelFisico)}`}>
                                {player.nivelFisico}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">—</span>
                            )}
                          </td>

                          {/* CA (CC) */}
                          <td className="py-3.5 px-4 text-slate-300 font-medium">
                            {player.ca || player.clubeAtual || player.clube || '—'}
                          </td>

                          {/* CLUBE FORM. */}
                          <td className="py-3.5 px-4 text-slate-400">
                            {player.clubeFormador || '—'}
                          </td>

                          {/* POS. SEC. */}
                          <td className="py-3.5 px-3 text-center text-slate-500 font-mono">
                            {player.posSecundaria === 'Zagueiro' ? 'Zag. Destro' : (player.posSecundaria || '—')}
                          </td>

                          {/* CARACTERÍSTICAS */}
                          <td className="py-3.5 px-4">
                            {player.caracteristicas && player.caracteristicas.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {player.caracteristicas.map((c, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] px-2 py-0.5 rounded bg-[#13233a] text-sky-400 border border-sky-800/40 font-medium"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500 font-medium">—</span>
                            )}
                          </td>

                          {/* AGENTE */}
                          <td className="py-3.5 px-3 text-center text-slate-500 font-mono">
                            {player.agente || '—'}
                          </td>

                          {/* CONTRATO */}
                          <td className="py-3.5 px-4 text-center tracking-tight">
                            <span className={getContratoStyle(player.contrato)}>
                              {player.contrato || '—'}
                            </span>
                          </td>

                          {/* AÇÕES */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {(player.isProvisorio || player.is_provisorio) && (
                                <button
                                  type="button"
                                  title="Completar Ficha do Atleta"
                                  onClick={() => handleOpenEditModal(player)}
                                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <span>⚡</span> Completar Ficha
                                </button>
                              )}
                              <button
                                title="Editar Atleta"
                                onClick={() => handleOpenEditModal(player)}
                                className="p-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                title="Excluir Atleta"
                                onClick={() => handleDeleteClick(player)}
                                className="p-1.5 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* PAINEL EXPANDIDO (ACCORDION INLINE) */}
                        {isExpanded && (
                          <tr className="bg-[#080e1a] border-b-2 border-slate-800 animate-in fade-in duration-200">
                            <td colSpan={14} className="p-0">
                              <div className="p-5 bg-[#0b1322] border-l-4 border-l-teal-500 shadow-inner">
                                <div className="max-w-6xl space-y-4">
                                  {/* Linha 1: Métricas e Tags rápidas */}
                                  <div className="flex flex-wrap items-center gap-4 text-xs pb-3 border-b border-slate-800">
                                    {/* Nível Físico */}
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                        Nível Físico:
                                      </span>
                                      {player.nivelFisico && player.nivelFisico !== '—' && player.nivelFisico !== 'A Avaliar' ? (
                                        <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold border tracking-wide ${getNivelFisicoStyle(player.nivelFisico)}`}>
                                          {player.nivelFisico}
                                        </span>
                                      ) : (
                                        <span className="text-slate-500 font-medium">—</span>
                                      )}
                                    </div>

                                    {/* Características */}
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                                        Características:
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {player.caracteristicas && player.caracteristicas.length > 0 ? (
                                          player.caracteristicas.map((c, i) => (
                                            <span
                                              key={i}
                                              className="text-[11px] px-2.5 py-0.5 rounded-md bg-blue-950/80 text-cyan-300 border border-cyan-800/60 font-semibold"
                                            >
                                              {c}
                                            </span>
                                          ))
                                        ) : (
                                          <span className="text-slate-500 text-xs">—</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Dias p/ Vencimento */}
                                    {daysToExpiry !== null && (
                                      <div className="flex items-center gap-1.5 ml-auto sm:ml-0 bg-[#111c30] px-3 py-1 rounded-lg border border-slate-700/60 shadow-sm">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                          Dias p/ Vencimento:
                                        </span>
                                        <span
                                          className={`text-xs font-black ${
                                            daysToExpiry <= 180
                                              ? 'text-rose-400'
                                              : daysToExpiry <= 365
                                              ? 'text-amber-400'
                                              : 'text-emerald-400'
                                          }`}
                                        >
                                          {daysToExpiry > 0 ? `${daysToExpiry} dias` : 'Vencido'}
                                        </span>
                                      </div>
                                    )}

                                    {/* Vídeo / Link */}
                                    {player.videoYoutube ? (
                                      <a
                                        href={player.videoYoutube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                                      >
                                        <Play className="w-3 h-3 fill-teal-400 text-teal-400" />
                                        <span>Assistir Vídeo</span>
                                        <ExternalLink className="w-2.5 h-2.5 text-teal-300/80 ml-0.5" />
                                      </a>
                                    ) : (
                                      <span className="text-[11px] text-slate-500 italic">
                                        Sem vídeo cadastrado
                                      </span>
                                    )}
                                  </div>

                                  {/* Linha 2: Observações do Scout */}
                                  <div>
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300 mb-1.5 flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                                      <span>OBSERVAÇÕES DO SCOUT</span>
                                    </div>
                                    <div className="text-xs text-slate-100 bg-[#111c30] p-3.5 rounded-lg border border-slate-700/60 leading-relaxed shadow-sm">
                                      {player.observacao && player.observacao.trim() ? (
                                        <span>{player.observacao}</span>
                                      ) : (
                                        <span className="text-slate-400 italic">
                                          Nenhuma observação registrada.
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                   {/* Linha 3: Histórico / Relatórios de Jogos */}
                                   {(() => {
                                     const athleteReports = matchReports
                                       .map(r => {
                                         const matchEntry = (r.atletasAvaliados || []).find(
                                           a => a.idAtleta === player.id || (a.nome && a.nome.toLowerCase() === player.nome.toLowerCase())
                                         )
                                         return matchEntry ? { ...matchEntry, report: r } : null
                                       })
                                       .filter(Boolean)

                                     const hasReports = athleteReports.length > 0
                                     const totalJogos = athleteReports.length
                                     const somaNotas = athleteReports.reduce((acc, curr) => acc + (curr.nota || 0), 0)
                                     const mediaNota = hasReports ? (somaNotas / totalJogos).toFixed(1) : null
                                     const totalDestaques = athleteReports.filter(a => a.destaque).length
                                     const isReportsOpen = showReportsPlayerIds.has(player.id)

                                     return (
                                       <div className="pt-3 border-t border-dashed border-slate-800/90 space-y-3">
                                         <div className="flex flex-wrap items-center justify-between gap-2">
                                           <div className="flex flex-wrap items-center gap-2.5">
                                             <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                                               <ClipboardList className="w-3.5 h-3.5 text-teal-400" />
                                               <span>RELATÓRIOS DE JOGOS & AVALIAÇÕES EM CAMPO</span>
                                             </div>

                                             {hasReports && (
                                               <div className="flex flex-wrap items-center gap-2 text-xs">
                                                 <span className="px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/50 font-extrabold text-[11px]">
                                                   Média: {mediaNota}
                                                 </span>
                                                 <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold text-[11px]">
                                                   {totalJogos} {totalJogos === 1 ? 'jogo observado' : 'jogos observados'}
                                                 </span>
                                                 {totalDestaques > 0 && (
                                                   <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold text-[11px]">
                                                     <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                     {totalDestaques}x Destaque ★
                                                   </span>
                                                 )}
                                               </div>
                                             )}
                                           </div>

                                           {hasReports && (
                                             <button
                                               type="button"
                                               onClick={(e) => {
                                                 e.stopPropagation()
                                                 toggleReportsPlayer(player.id)
                                               }}
                                               className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto sm:ml-0"
                                             >
                                               {isReportsOpen ? (
                                                 <>
                                                   <span>Ocultar Avaliações</span>
                                                   <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                                 </>
                                               ) : (
                                                 <>
                                                   <span>Ver Avaliações em Campo ({totalJogos})</span>
                                                   <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                 </>
                                               )}
                                             </button>
                                           )}
                                         </div>

                                         {!hasReports ? (
                                           <p className="text-xs text-slate-400 italic bg-[#111c30] p-3.5 rounded-lg border border-slate-700/60 shadow-sm">
                                             Nenhum relatório de jogo vinculado a este atleta até o momento.
                                           </p>
                                         ) : (
                                           isReportsOpen && (
                                             <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar animate-in fade-in duration-150">
                                               {athleteReports.map((entry, idx) => (
                                                 <div
                                                   key={idx}
                                                   className="p-3.5 bg-[#111c30] border border-slate-700/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm hover:border-slate-600 transition-colors"
                                                 >
                                                   <div className="space-y-1.5">
                                                     <div className="flex flex-wrap items-center gap-2">
                                                       <span className="text-[10px] text-slate-400 font-mono">
                                                         {entry.report.data}
                                                       </span>
                                                       <span className="font-bold text-white text-xs">
                                                         {entry.report.partida}
                                                       </span>
                                                       <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/70 font-semibold">
                                                         {entry.report.competicao}
                                                       </span>
                                                       <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/50">
                                                         Nota {entry.nota?.toFixed(1)}
                                                       </span>
                                                       {entry.destaque && (
                                                         <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50">
                                                           <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                                           Destaque
                                                         </span>
                                                       )}
                                                       {entry.sub20 && (
                                                         <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/50">
                                                           Sub-20
                                                         </span>
                                                       )}
                                                     </div>

                                                     {entry.comentario && (
                                                       <p className="text-slate-200 text-xs italic bg-[#0a111e] p-2.5 rounded-md border border-slate-800">
                                                         "{entry.comentario}"
                                                       </p>
                                                     )}
                                                   </div>

                                                   <button
                                                     type="button"
                                                     onClick={(e) => {
                                                       e.stopPropagation()
                                                       setPreviewReport(entry.report)
                                                     }}
                                                     className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18263e] hover:bg-[#203252] text-slate-200 border border-slate-600/70 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                                                   >
                                                     <Eye className="w-3.5 h-3.5 text-teal-400" />
                                                     <span>Ver Relatório Completo</span>
                                                   </button>
                                                 </div>
                                               ))}
                                             </div>
                                           )
                                         )}
                                       </div>
                                     )
                                   })()}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="max-w-[1720px] mx-auto px-6 mt-12 pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400">
        <div>Goiás Esporte Clube &bull; Departamento de Inteligência e Scouting</div>
        <div>Radar v2.6.4</div>
      </footer>

      {/* MODAL DE CARACTERÍSTICAS */}
      <CharacteristicsModal
        isOpen={isCharacteristicsModalOpen}
        onClose={() => setIsCharacteristicsModalOpen(false)}
        positionKey={activePosition}
      />

      {/* MODAL DE JOGADOR (CRIAR / EDITAR) */}
      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onSave={handleSave}
        activePosition={activePosition}
        playerToEdit={playerToEdit}
      />

      {/* MODAL DE PRÉVIA / VISUALIZAÇÃO DO RELATÓRIO COMPLETO */}
      {previewReport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#090f1c]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">
                  {previewReport.partida} ({previewReport.competicao})
                </span>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-400 pb-2 border-b border-slate-800">
                <span><strong>Data:</strong> {previewReport.data}</span>
                <span><strong>Local:</strong> {previewReport.local}</span>
                {previewReport.treinadoresAvaliados && previewReport.treinadoresAvaliados.length > 0 ? (
                  previewReport.treinadoresAvaliados.map((t, tIdx) => (
                    <span key={tIdx}>
                      <strong>Técnico ({t.time === 'mandante' ? 'Mandante' : 'Visitante'}):</strong> {t.nome} (Nota {t.nota})
                    </span>
                  ))
                ) : previewReport.treinadorAvaliado ? (
                  <span>
                    <strong>Técnico:</strong> {previewReport.treinadorAvaliado.nome} (Nota {previewReport.treinadorAvaliado.nota})
                  </span>
                ) : null}
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                  Resumo Tático da Partida
                </h4>
                <p className="bg-[#070c16] p-3 rounded-lg border border-slate-800/80 text-slate-200 leading-relaxed">
                  {previewReport.analiseGeral || 'Nenhum resumo tático informado.'}
                </p>
              </div>

              {previewReport.atletasAvaliados && previewReport.atletasAvaliados.length > 0 && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-cyan-400 mb-2">
                    Atletas Observados na Partida ({previewReport.atletasAvaliados.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {previewReport.atletasAvaliados.map((a, aIdx) => (
                      <div key={aIdx} className="bg-[#070c16] p-2 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-5 h-5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono font-bold flex items-center justify-center shrink-0">
                            {a.numero || a.number || aIdx + 1}
                          </span>
                          <span className="font-bold text-white text-xs truncate">{a.nome}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase font-semibold">
                            {a.posicao}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {a.notaApi && a.notaApi !== '—' && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              API {a.notaApi}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            Scout {Number(a.notaScout || a.nota || 7).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-[#090f1c] flex justify-end">
              <button
                onClick={() => setPreviewReport(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE ATLETA */}
      <ConfirmDeleteModal
        isOpen={!!playerToDelete}
        onClose={() => setPlayerToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={
          playerToDelete ? (
            <>
              Tem certeza que deseja excluir o atleta{' '}
              <strong className="text-white font-bold">{playerToDelete.nome}</strong>?{' '}
              Esta ação não poderá ser desfeita.
            </>
          ) : null
        }
      />
    </div>
  )
}

