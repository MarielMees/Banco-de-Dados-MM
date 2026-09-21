import React, { useState, useMemo, useEffect } from 'react'
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldAlert,
  ShieldHalf,
  ArrowRightCircle,
  ArrowLeftCircle,
  Compass,
  Sparkles,
  Zap,
  Target,
  UserCheck,
  Trophy,
  Users
} from 'lucide-react'

const POSITION_OPTIONS = [
  { id: 'goleiro', label: 'Goleiro', icon: Shield },
  { id: 'zagueiro', label: 'Zag. Destro', icon: ShieldAlert },
  { id: 'zag-canhoto', label: 'Zag. Canhoto', icon: ShieldHalf },
  { id: 'lat-direito', label: 'Lat. Direito', icon: ArrowRightCircle },
  { id: 'lat-esquerdo', label: 'Lat. Esquerdo', icon: ArrowLeftCircle },
  { id: 'medio', label: 'Médio', icon: Compass },
  { id: 'meia-ofensivo', label: 'Meia Ofensivo', icon: Sparkles },
  { id: 'extremo', label: 'Extremo', icon: Zap },
  { id: 'centroavante', label: 'Centroavante', icon: Target }
]

const LEVEL_OPTIONS = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'Sub-23']
const COACH_LEVEL_OPTIONS = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D']

const ESTILOS_JOGO_OPTIONS = [
  'Jogo Apoiado',
  'Jogo Vertical',
  'Ofensivo',
  'Defensivo',
  'Equilibrado',
  'Bola Parada'
]

const ACESSOS_OPTIONS = ['D para C', 'C para B', 'B para A']

const ALERT_OPTIONS = [
  { id: 'VENCENDO', label: 'Vencendo', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
  { id: 'ATENCAO', label: 'Atenção', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  { id: 'OK', label: 'OK', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  { id: 'EXPIRADO', label: 'Expirado', color: 'bg-red-950 text-red-400 border-red-800/60' },
  { id: 'SEM_DATA', label: 'Sem data', color: 'bg-slate-800 text-slate-400 border-slate-700' }
]

const FOOT_OPTIONS = ['Destro', 'Canhoto']

export default function GlobalSearch({
  isOpen,
  onClose,
  players = [],
  coaches = [],
  onSelectPlayerPosition,
  onSelectCoach
}) {
  const [categoryTab, setCategoryTab] = useState('PLAYERS') // 'PLAYERS' | 'COACHES'
  const [showFilters, setShowFilters] = useState(true)

  // Filtros de Atletas
  const [search, setSearch] = useState('')
  const [selectedPositions, setSelectedPositions] = useState([])
  const [selectedLevels, setSelectedLevels] = useState([])
  const [selectedAlerts, setSelectedAlerts] = useState([])
  const [selectedFeet, setSelectedFeet] = useState([])
  const [anoDe, setAnoDe] = useState('')
  const [anoAte, setAnoAte] = useState('')

  // Filtros de Treinadores
  const [coachSearch, setCoachSearch] = useState('')
  const [selectedCoachLevels, setSelectedCoachLevels] = useState([])
  const [selectedStyles, setSelectedStyles] = useState([])
  const [selectedAcessos, setSelectedAcessos] = useState([])
  const [selectedExAtleta, setSelectedExAtleta] = useState('ALL') // 'ALL' | 'SIM' | 'NAO'
  const [onlyWithTitles, setOnlyWithTitles] = useState(false)
  const [idadeDe, setIdadeDe] = useState('')
  const [idadeAte, setIdadeAte] = useState('')

  // ESC shortcut to close modal
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

  // Check active filters for Atletas
  const hasActivePlayerFilters = useMemo(() => {
    return (
      search.trim() !== '' ||
      selectedPositions.length > 0 ||
      selectedLevels.length > 0 ||
      selectedAlerts.length > 0 ||
      selectedFeet.length > 0 ||
      anoDe.trim() !== '' ||
      anoAte.trim() !== ''
    )
  }, [search, selectedPositions, selectedLevels, selectedAlerts, selectedFeet, anoDe, anoAte])

  // Check active filters for Treinadores
  const hasActiveCoachFilters = useMemo(() => {
    return (
      coachSearch.trim() !== '' ||
      selectedCoachLevels.length > 0 ||
      selectedStyles.length > 0 ||
      selectedAcessos.length > 0 ||
      selectedExAtleta !== 'ALL' ||
      onlyWithTitles ||
      idadeDe.trim() !== '' ||
      idadeAte.trim() !== ''
    )
  }, [coachSearch, selectedCoachLevels, selectedStyles, selectedAcessos, selectedExAtleta, onlyWithTitles, idadeDe, idadeAte])

  // Toggle helper
  const toggleSelection = (item, currentList, setter) => {
    if (currentList.includes(item)) {
      setter(currentList.filter(i => i !== item))
    } else {
      setter([...currentList, item])
    }
  }

  // Filtered players calculation
  const filteredResults = useMemo(() => {
    if (!hasActivePlayerFilters) {
      return []
    }

    return players.filter(p => {
      // Search text
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchNome = (p.nome || '').toLowerCase().includes(q)
        const matchClube = (p.ca || '').toLowerCase().includes(q)
        const matchAgente = (p.agente || '').toLowerCase().includes(q)
        const matchFormador = (p.clubeFormador || '').toLowerCase().includes(q)
        if (!matchNome && !matchClube && !matchAgente && !matchFormador) {
          return false
        }
      }

      // Positions
      if (selectedPositions.length > 0) {
        const matchesPosition = selectedPositions.some(sp => {
          if (sp === 'zagueiro') {
            return p.posicao === 'zagueiro' || p.posicao === 'Zag. Destro' || p.posicao === 'zag-destro' || p.posicao === 'Zagueiro'
          }
          if (sp === 'zag-canhoto') {
            return p.posicao === 'zag-canhoto' || p.posicao === 'Zag. Canhoto'
          }
          return p.posicao === sp
        })
        if (!matchesPosition) return false
      }

      // Levels
      if (selectedLevels.length > 0) {
        const matchesLevel = selectedLevels.includes(p.nivel)
        const matchesSub23 = selectedLevels.includes('Sub-23') && p.radarSub23
        if (!matchesLevel && !matchesSub23) {
          return false
        }
      }

      // Alerts
      if (selectedAlerts.length > 0) {
        const pAlert = (p.alerta || '').toUpperCase()
        const matches = selectedAlerts.some(alertType => {
          if (alertType === 'VENCENDO') return pAlert === 'VENCENDO'
          if (alertType === 'OK') return pAlert === 'OK'
          if (alertType === 'ATENCAO') return pAlert === 'ATENCAO' || pAlert === 'ATENÇÃO'
          if (alertType === 'EXPIRADO') return pAlert === 'EXPIRADO'
          if (alertType === 'SEM_DATA') return !p.contrato || p.contrato === '—'
          return false
        })
        if (!matches) return false
      }

      // Foot
      if (selectedFeet.length > 0 && !selectedFeet.includes(p.pe)) {
        return false
      }

      // Ano
      if (anoDe.trim() && p.an < parseInt(anoDe, 10)) {
        return false
      }
      if (anoAte.trim() && p.an > parseInt(anoAte, 10)) {
        return false
      }

      return true
    })
  }, [players, hasActivePlayerFilters, search, selectedPositions, selectedLevels, selectedAlerts, selectedFeet, anoDe, anoAte])

  // Filtered coaches calculation
  const filteredCoaches = useMemo(() => {
    if (!hasActiveCoachFilters) {
      return []
    }

    return coaches.filter(c => {
      // Search text (nome, clube atual, títulos, experiência)
      if (coachSearch.trim()) {
        const q = coachSearch.toLowerCase()
        const matchNome = (c.nome || '').toLowerCase().includes(q)
        const matchClube = (c.clubeAtual || '').toLowerCase().includes(q)
        const matchTitulos = (c.titulos || '').toLowerCase().includes(q)
        const matchExp = (c.experiencia || '').toLowerCase().includes(q)
        const matchCarac = (c.caracteristicas || []).some(tag => tag.toLowerCase().includes(q))
        if (!matchNome && !matchClube && !matchTitulos && !matchExp && !matchCarac) {
          return false
        }
      }

      // Níveis
      if (selectedCoachLevels.length > 0) {
        if (!selectedCoachLevels.includes(c.nivelAtual)) {
          return false
        }
      }

      // Modelo de jogo / Características (deve conter pelo menos um dos selecionados)
      if (selectedStyles.length > 0) {
        const coachTags = c.caracteristicas || []
        const hasMatchingStyle = selectedStyles.some(style => coachTags.includes(style))
        if (!hasMatchingStyle) {
          return false
        }
      }

      // Acessos Conquistados
      if (selectedAcessos.length > 0) {
        const coachAcessos = c.acessos || []
        const hasMatchingAcesso = selectedAcessos.some(acesso => coachAcessos.includes(acesso))
        if (!hasMatchingAcesso) {
          return false
        }
      }

      // Ex-Atleta
      if (selectedExAtleta === 'SIM' && !c.exAtleta) {
        return false
      }
      if (selectedExAtleta === 'NAO' && c.exAtleta) {
        return false
      }

      // Apenas com títulos
      if (onlyWithTitles) {
        const t = (c.titulos || '').trim()
        if (!t || t === '—' || t === '-') {
          return false
        }
      }

      // Faixa de idade
      if (idadeDe.trim()) {
        const minAge = parseInt(idadeDe, 10)
        if (!c.idade || c.idade < minAge) {
          return false
        }
      }
      if (idadeAte.trim()) {
        const maxAge = parseInt(idadeAte, 10)
        if (!c.idade || c.idade > maxAge) {
          return false
        }
      }

      return true
    })
  }, [coaches, hasActiveCoachFilters, coachSearch, selectedCoachLevels, selectedStyles, selectedAcessos, selectedExAtleta, onlyWithTitles, idadeDe, idadeAte])

  // Count distinct positions in results
  const distinctPositionsCount = useMemo(() => {
    const posSet = new Set(filteredResults.map(p => p.posicao))
    return posSet.size
  }, [filteredResults])

  const totalFound = filteredResults.length + filteredCoaches.length

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

  const getPositionLabel = (posKey) => {
    if (posKey === 'zagueiro' || posKey === 'Zagueiro' || posKey === 'zag-destro') return 'Zag. Destro'
    const found = POSITION_OPTIONS.find(p => p.id === posKey)
    return found ? found.label : posKey
  }

  if (!isOpen) return null

  const isPlayerMode = categoryTab === 'PLAYERS'
  const isCoachMode = categoryTab === 'COACHES'

  const activeResultsCount = isPlayerMode ? filteredResults.length : filteredCoaches.length
  const hasActiveFiltersForCurrentTab = isPlayerMode ? hasActivePlayerFilters : hasActiveCoachFilters

  return (
    <div className="fixed inset-0 z-[100] bg-[#070b12] text-slate-200 flex flex-col font-sans select-none overflow-hidden">
      {/* 1. CABEÇALHO SUPERIOR */}
      <header className="bg-[#0b111c] border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <span className="text-emerald-400 font-black text-base tracking-wide flex items-center gap-2">
              <span className="text-xl">🔍</span> BUSCA GLOBAL
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400">
              {hasActiveFiltersForCurrentTab ? (
                <>
                  <strong className="text-emerald-400 font-bold">{activeResultsCount}</strong> {isPlayerMode ? (activeResultsCount === 1 ? 'atleta encontrado' : 'atletas encontrados') : (activeResultsCount === 1 ? 'treinador encontrado' : 'treinadores encontrados')}
                  {isPlayerMode && (
                    <span className="ml-1 text-slate-400">
                      em <strong className="text-slate-200">{distinctPositionsCount}</strong> {distinctPositionsCount === 1 ? 'posição' : 'posições'}
                    </span>
                  )}
                </>
              ) : (
                isPlayerMode ? 'Filtre atletas por posição, nível, idade e alertas' : 'Filtre treinadores por nível, modelo de jogo, acessos e idade'
              )}
            </span>
          </div>

          {/* Abas / Filtro de Entidade Ativa */}
          <div className="flex items-center bg-[#070b12] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCategoryTab('PLAYERS')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isPlayerMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⚽</span>
              <span>Atletas</span>
              {hasActivePlayerFilters && filteredResults.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[10px] text-emerald-300 ml-0.5">
                  {filteredResults.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCategoryTab('COACHES')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isCoachMode
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📋</span>
              <span>Treinadores</span>
              {hasActiveCoachFilters && filteredCoaches.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-violet-500/30 text-[10px] text-violet-300 ml-0.5">
                  {filteredCoaches.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão recolher filtros */}
          <button
            onClick={() => setShowFilters(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131d2e] hover:bg-[#19273e] text-slate-300 border border-slate-700/80 text-xs font-semibold transition-colors cursor-pointer"
          >
            {showFilters ? (
              <>
                <ChevronLeft className="w-4 h-4 text-emerald-400" />
                <span>Esconder filtros</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
                <span>Mostrar filtros</span>
              </>
            )}
          </button>

          {/* Botão Fechar ESC */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Fechar (ESC)</span>
          </button>
        </div>
      </header>

      {/* 2. CORPO: SIDEBAR FILTROS + ÁREA DE RESULTADOS */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR ESQUERDA DINÂMICA */}
        {showFilters && (
          <aside className="w-80 shrink-0 bg-[#0a0f1a] border-r border-slate-800/90 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {isCoachMode ? (
              /* FILTROS EXCLUSIVOS PARA TREINADORES */
              <>
                {/* a) BUSCA POR TEXTO */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400 block mb-1.5">
                    BUSCA POR TEXTO
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Nome do técnico, clube atual, títulos..."
                      value={coachSearch}
                      onChange={(e) => setCoachSearch(e.target.value)}
                      className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500/60"
                      autoFocus
                    />
                  </div>
                </div>

                {/* b) NÍVEL TÉCNICO */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      NÍVEL TÉCNICO
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        onClick={() => setSelectedCoachLevels([...COACH_LEVEL_OPTIONS])}
                        className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                      >
                        Todos
                      </button>
                      <span className="text-slate-600">&bull;</span>
                      <button
                        onClick={() => setSelectedCoachLevels([])}
                        className="text-slate-500 hover:text-slate-400 font-semibold cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {COACH_LEVEL_OPTIONS.map(lvl => {
                      const isSelected = selectedCoachLevels.includes(lvl)
                      return (
                        <button
                          key={lvl}
                          onClick={() => toggleSelection(lvl, selectedCoachLevels, setSelectedCoachLevels)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-violet-600 text-white border-violet-400 font-black shadow-sm'
                              : 'bg-[#131d2e]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* c) CARACTERÍSTICAS / MODELO DE JOGO */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      CARACTERÍSTICAS / MODELO
                    </span>
                    {selectedStyles.length > 0 && (
                      <button
                        onClick={() => setSelectedStyles([])}
                        className="text-[10px] text-slate-500 hover:text-slate-400 font-semibold cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ESTILOS_JOGO_OPTIONS.map(style => {
                      const isSelected = selectedStyles.includes(style)
                      return (
                        <button
                          key={style}
                          onClick={() => toggleSelection(style, selectedStyles, setSelectedStyles)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-violet-500/20 text-violet-300 border-violet-500/60 font-semibold shadow-sm'
                              : 'bg-[#131d2e]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {style}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* d) ACESSOS CONQUISTADOS */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      ACESSOS CONQUISTADOS
                    </span>
                    {selectedAcessos.length > 0 && (
                      <button
                        onClick={() => setSelectedAcessos([])}
                        className="text-[10px] text-slate-500 hover:text-slate-400 font-semibold cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ACESSOS_OPTIONS.map(acesso => {
                      const isSelected = selectedAcessos.includes(acesso)
                      return (
                        <button
                          key={acesso}
                          onClick={() => toggleSelection(acesso, selectedAcessos, setSelectedAcessos)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold shadow-sm'
                              : 'bg-[#131d2e]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <Trophy className="w-3 h-3 text-emerald-400" />
                          <span>{acesso}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* e) PERFIL & EXPERIÊNCIA */}
                <div className="border-t border-slate-800/80 pt-3 space-y-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    PERFIL & EXPERIÊNCIA
                  </span>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1.5">Ex-Atleta de Futebol?</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'ALL', label: 'Todos' },
                        { id: 'SIM', label: 'Sim' },
                        { id: 'NAO', label: 'Não' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedExAtleta(opt.id)}
                          className={`py-1 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                            selectedExAtleta === opt.id
                              ? 'bg-violet-500/20 text-violet-300 border-violet-500/60 font-bold'
                              : 'bg-[#131d2e]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => setOnlyWithTitles(prev => !prev)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        onlyWithTitles
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-[#131d2e]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Apenas com Títulos</span>
                      </span>
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border ${
                        onlyWithTitles ? 'bg-amber-400 text-slate-950 font-bold border-amber-400' : 'border-slate-700'
                      }`}>
                        {onlyWithTitles ? '✓' : ''}
                      </span>
                    </button>
                  </div>
                </div>

                {/* f) FAIXA DE IDADE */}
                <div className="border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                    FAIXA DE IDADE
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">De (anos)</label>
                      <input
                        type="number"
                        placeholder="Ex: 38"
                        value={idadeDe}
                        onChange={(e) => setIdadeDe(e.target.value)}
                        className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-violet-500/60 text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Até (anos)</label>
                      <input
                        type="number"
                        placeholder="Ex: 55"
                        value={idadeAte}
                        onChange={(e) => setIdadeAte(e.target.value)}
                        className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-violet-500/60 text-center"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* FILTROS EXCLUSIVOS PARA ATLETAS */
              <>
                {/* Campo Busca Textual */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    BUSCA POR TEXTO
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Nome, clube, agente..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/60"
                      autoFocus
                    />
                  </div>
                </div>

                {/* POSIÇÕES */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      POSIÇÕES
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        onClick={() => setSelectedPositions(POSITION_OPTIONS.map(p => p.id))}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        Todas
                      </button>
                      <span className="text-slate-600">&bull;</span>
                      <button
                        onClick={() => setSelectedPositions([])}
                        className="text-slate-500 hover:text-slate-400 font-semibold cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {POSITION_OPTIONS.map(pos => {
                      const Icon = pos.icon
                      const isSelected = selectedPositions.includes(pos.id)
                      return (
                        <button
                          key={pos.id}
                          onClick={() => toggleSelection(pos.id, selectedPositions, setSelectedPositions)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-semibold'
                              : 'bg-[#131d2e]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{pos.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* NÍVEL */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      NÍVEL TÉCNICO
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        onClick={() => setSelectedLevels([...LEVEL_OPTIONS])}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        Todos
                      </button>
                      <span className="text-slate-600">&bull;</span>
                      <button
                        onClick={() => setSelectedLevels([])}
                        className="text-slate-500 hover:text-slate-400 font-semibold cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {LEVEL_OPTIONS.map(lvl => {
                      const isSelected = selectedLevels.includes(lvl)
                      return (
                        <button
                          key={lvl}
                          onClick={() => toggleSelection(lvl, selectedLevels, setSelectedLevels)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                              : 'bg-[#131d2e]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ALERTA DE CONTRATO */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      ALERTA DE CONTRATO
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        onClick={() => setSelectedAlerts(ALERT_OPTIONS.map(a => a.id))}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        Todos
                      </button>
                      <span className="text-slate-600">&bull;</span>
                      <button
                        onClick={() => setSelectedAlerts([])}
                        className="text-slate-500 hover:text-slate-400 font-semibold cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ALERT_OPTIONS.map(alert => {
                      const isSelected = selectedAlerts.includes(alert.id)
                      return (
                        <button
                          key={alert.id}
                          onClick={() => toggleSelection(alert.id, selectedAlerts, setSelectedAlerts)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? `${alert.color} font-bold shadow-sm`
                              : 'bg-[#131d2e]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {alert.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* PÉ PREFERENCIAL */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      PÉ PREFERENCIAL
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        onClick={() => setSelectedFeet([...FOOT_OPTIONS])}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        Todos
                      </button>
                      <span className="text-slate-600">&bull;</span>
                      <button
                        onClick={() => setSelectedFeet([])}
                        className="text-slate-500 hover:text-slate-400 font-semibold cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {FOOT_OPTIONS.map(foot => {
                      const isSelected = selectedFeet.includes(foot)
                      return (
                        <button
                          key={foot}
                          onClick={() => toggleSelection(foot, selectedFeet, setSelectedFeet)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold'
                              : 'bg-[#131d2e]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {foot}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ANO DE NASCIMENTO */}
                <div className="border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                    ANO DE NASCIMENTO
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">De</label>
                      <input
                        type="number"
                        placeholder="Ex: 1998"
                        value={anoDe}
                        onChange={(e) => setAnoDe(e.target.value)}
                        className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/60 text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Até</label>
                      <input
                        type="number"
                        placeholder="Ex: 2005"
                        value={anoAte}
                        onChange={(e) => setAnoAte(e.target.value)}
                        className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/60 text-center"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </aside>
        )}

        {/* ÁREA CENTRAL DE RESULTADOS */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#070b12] flex flex-col">
          {!hasActiveFiltersForCurrentTab ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#0f172a] border border-slate-800 flex items-center justify-center text-3xl mb-4 shadow-inner">
                🔍
              </div>
              <h3 className="text-base font-bold text-slate-300 mb-1">
                Busca Global Multicritério {isCoachMode ? 'de Treinadores' : 'de Atletas'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {isCoachMode
                  ? 'Digite o nome, clube, títulos ou selecione os filtros de modelo de jogo, nível e acessos.'
                  : 'Selecione filtros ou digite um nome, clube ou posição para encontrar atletas.'}
              </p>
            </div>
          ) : activeResultsCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl mb-3">
                ✕
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">
                {isCoachMode ? 'Nenhum treinador encontrado' : 'Nenhum atleta encontrado'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Tente ajustar sua busca por texto ou os filtros aplicados para expandir o alcance da busca.
              </p>
            </div>
          ) : isCoachMode ? (
            /* LISTAGEM DE TREINADORES */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Treinadores Encontrados ({filteredCoaches.length})
                  </h4>
                </div>
                {onSelectCoach && (
                  <button
                    onClick={() => {
                      onSelectCoach()
                      onClose()
                    }}
                    className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    Abrir módulo de Treinadores &rarr;
                  </button>
                )}
              </div>

              {/* Grid / Lista de Cards de Treinadores conforme solicitado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    onClick={() => {
                      if (onSelectCoach) onSelectCoach()
                      onClose()
                    }}
                    className="bg-[#0b1322] border border-slate-800 hover:border-violet-500/50 rounded-xl p-4 transition-all hover:translate-y-[-2px] hover:shadow-xl group cursor-pointer space-y-3"
                  >
                    {/* Linha 1: Nome, Idade, Badge de Nível e Ex-Atleta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                          {coach.nome}
                        </span>
                        {coach.idade ? (
                          <span className="text-[11px] text-slate-400 font-medium">
                            ({coach.idade} anos)
                          </span>
                        ) : null}
                        {coach.exAtleta && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                            Ex-Atleta
                          </span>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${getNivelStyle(coach.nivelAtual)}`}>
                        {coach.nivelAtual}
                      </span>
                    </div>

                    {/* Linha 2: Clube Atual e Experiência */}
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 text-[11px]">Clube Atual: </span>
                        <strong className="text-white">{coach.clubeAtual || 'Livre no Mercado'}</strong>
                      </div>
                      {coach.experiencia && (
                        <span className="text-[11px] text-slate-400 bg-[#121c2e] px-2 py-0.5 rounded border border-slate-800">
                          {coach.experiencia}
                        </span>
                      )}
                    </div>

                    {/* Linha 3: Badges dos Acessos Conquistados */}
                    {coach.acessos && coach.acessos.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-emerald-400" />
                          Acessos:
                        </span>
                        {coach.acessos.map((acesso, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          >
                            {acesso}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Linha 4: Tags do Modelo de Jogo / Características */}
                    {coach.caracteristicas && coach.caracteristicas.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-800/80">
                        {coach.caracteristicas.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] px-2 py-0.5 rounded-full bg-violet-950/50 text-violet-300 border border-violet-800/60 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Linha 5: Títulos em destaque discreto */}
                    {coach.titulos && (
                      <div className="text-[11px] text-slate-400 italic bg-[#080e1a] p-2 rounded-lg border border-slate-800/70">
                        🏆 {coach.titulos}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* LISTAGEM DE ATLETAS */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Atletas Encontrados ({filteredResults.length})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  {distinctPositionsCount} {distinctPositionsCount === 1 ? 'posição' : 'posições'}
                </span>
              </div>

              <div className="bg-[#0b111c] border border-slate-800/90 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-[#080d16] text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        <th className="py-3 px-4">ATLETA</th>
                        <th className="py-3 px-3">POSIÇÃO</th>
                        <th className="py-3 px-3 text-center">AN</th>
                        <th className="py-3 px-3 text-center">ALT</th>
                        <th className="py-3 px-3 text-center">PÉ</th>
                        <th className="py-3 px-3 text-center">NÍVEL</th>
                        <th className="py-3 px-3 text-center">PROJEÇÃO</th>
                        <th className="py-3 px-3 text-center">ALERTA</th>
                        <th className="py-3 px-4">CLUBE ATUAL</th>
                        <th className="py-3 px-4">CLUBE FORM.</th>
                        <th className="py-3 px-4">CARACTERÍSTICAS</th>
                        <th className="py-3 px-3 text-center">AGENTE</th>
                        <th className="py-3 px-4 text-center">CONTRATO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filteredResults.map((player) => {
                        const isExpiring = player.alerta === 'VENCENDO'

                        return (
                          <tr
                            key={player.id}
                            className="hover:bg-[#101929]/70 transition-colors group cursor-pointer"
                            onClick={() => {
                              if (onSelectPlayerPosition && player.posicao) {
                                onSelectPlayerPosition(player.posicao)
                                onClose()
                              }
                            }}
                          >
                            {/* ATLETA */}
                            <td className="py-3.5 px-4 font-bold text-white tracking-wide text-xs">
                              <div className="flex items-center gap-2">
                                <span>{player.nome}</span>
                                {player.hotList && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                                    HOT
                                  </span>
                                )}
                                {player.radarSub23 && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30">
                                    Sub-23
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* POSIÇÃO */}
                            <td className="py-3.5 px-3">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60">
                                {getPositionLabel(player.posicao)}
                              </span>
                            </td>

                            {/* AN */}
                            <td className="py-3.5 px-3 text-center font-bold text-slate-200">
                              {player.an}
                            </td>

                            {/* ALT */}
                            <td className="py-3.5 px-3 text-center font-bold text-slate-200">
                              {player.alt ? `${player.alt}cm` : '—'}
                            </td>

                            {/* PÉ */}
                            <td className="py-3.5 px-3 text-center">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                player.pe === 'Destro'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                  : 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40'
                              }`}>
                                {player.pe}
                              </span>
                            </td>

                            {/* NÍVEL */}
                            <td className="py-3.5 px-3 text-center">
                              <span className={`inline-flex items-center justify-center w-6 h-5 rounded text-[10px] leading-none ${getNivelStyle(player.nivel)}`}>
                                {player.nivel}
                              </span>
                            </td>

                            {/* PROJEÇÃO */}
                            <td className="py-3.5 px-3 text-center">
                              {player.projecao ? (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#131d2e] text-slate-200 border border-slate-700/80 shadow-xs">
                                  {player.projecao}
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>

                            {/* ALERTA */}
                            <td className="py-3.5 px-3 text-center">
                              {isExpiring ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs">
                                  VENCENDO
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs">
                                  OK
                                </span>
                              )}
                            </td>

                            {/* CLUBE ATUAL */}
                            <td className="py-3.5 px-4 text-slate-300 font-medium">
                              {player.ca}
                            </td>

                            {/* CLUBE FORMADOR */}
                            <td className="py-3.5 px-4 text-slate-400">
                              {player.clubeFormador}
                            </td>

                            {/* CARACTERÍSTICAS */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {player.caracteristicas?.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* AGENTE */}
                            <td className="py-3.5 px-3 text-center text-slate-400 font-mono">
                              {player.agente}
                            </td>

                            {/* CONTRATO */}
                            <td className="py-3.5 px-4 text-center font-bold tracking-tight">
                              <span className={isExpiring ? 'text-amber-500 font-bold' : 'text-emerald-400 font-semibold'}>
                                {player.contrato}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

