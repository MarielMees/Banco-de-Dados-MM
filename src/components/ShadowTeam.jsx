import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Shield,
  Plus,
  X,
  Search,
  CheckCircle2,
  Calendar,
  Ruler,
  FileText,
  Loader2,
  RotateCcw,
  Menu,
  DollarSign,
  TrendingUp,
  Wallet,
  Coins,
  AlertTriangle,
  Pencil,
  Check,
  Percent,
  Sparkles,
  Eye,
  EyeOff,
  Trash2,
  Globe,
  UserCheck,
  Target
} from 'lucide-react'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'
import UserBadge from './UserBadge'
import {
  formatBRL,
  formatCompactBRL,
  parseBRL,
  getAthleteSalary,
  isAthleteSalaryCustom,
  calculateTeamPayroll,
  calculatePositionSalaryMetrics,
  formatSalaryDiff,
  getDefaultEstimatedSalary,
  DEFAULT_TIER_SALARIES
} from '../utils/salaryUtils'
import { saveShadowTeamToSupabase, upsertPlayerToSupabase } from '../services/supabaseService'
import PlayerModal from './PlayerModal'
import { sanitizeSalary } from '../utils/playerSanitizer'

// Definição das 5 formações táticas com coordenadas percentuais (top / left)
// top: 0% = Ataque, 100% = Gol
const FORMATIONS_CONFIG = {
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { id: 'ca', label: 'Centroavante', matchPositions: ['centroavante'], top: 8, left: 50 },
      { id: 'ext-e', label: 'Extremo Esquerdo', matchPositions: ['extremo'], top: 11, left: 16 },
      { id: 'ext-d', label: 'Extremo Direito', matchPositions: ['extremo'], top: 11, left: 84 },
      { id: 'mei-o', label: 'Meia Ofensivo', matchPositions: ['meia-ofensivo'], top: 34, left: 50 },
      { id: 'med-c', label: 'Médio Central', matchPositions: ['medio'], top: 50, left: 30 },
      { id: 'vol', label: 'Volante (1º Médio)', matchPositions: ['medio'], top: 50, left: 70 },
      { id: 'lat-e', label: 'Lat. Esquerdo', matchPositions: ['lat-esquerdo'], top: 72, left: 14 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto'], top: 72, left: 38 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 62 },
      { id: 'lat-d', label: 'Lat. Direito', matchPositions: ['lat-direito'], top: 72, left: 86 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { id: 'ca', label: 'Centroavante', matchPositions: ['centroavante'], top: 8, left: 50 },
      { id: 'mei-e', label: 'Meia / Ext. Esq.', matchPositions: ['extremo', 'meia-ofensivo'], top: 22, left: 18 },
      { id: 'mei-c', label: 'Meia Central', matchPositions: ['meia-ofensivo'], top: 32, left: 50 },
      { id: 'mei-d', label: 'Meia / Ext. Dir.', matchPositions: ['extremo', 'meia-ofensivo'], top: 22, left: 82 },
      { id: 'vol-1', label: 'Volante 1', matchPositions: ['medio'], top: 50, left: 34 },
      { id: 'vol-2', label: 'Volante 2', matchPositions: ['medio'], top: 50, left: 66 },
      { id: 'lat-e', label: 'Lat. Esquerdo', matchPositions: ['lat-esquerdo'], top: 72, left: 14 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto'], top: 72, left: 38 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 62 },
      { id: 'lat-d', label: 'Lat. Direito', matchPositions: ['lat-direito'], top: 72, left: 86 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  },
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { id: 'ca-1', label: 'Centroavante 1', matchPositions: ['centroavante'], top: 8, left: 38 },
      { id: 'ca-2', label: 'Centroavante 2', matchPositions: ['centroavante'], top: 8, left: 62 },
      { id: 'me-e', label: 'Médio / Ext. Esq.', matchPositions: ['extremo', 'medio'], top: 30, left: 16 },
      { id: 'vol', label: 'Volante', matchPositions: ['medio'], top: 50, left: 38 },
      { id: 'med', label: 'Médio Central', matchPositions: ['medio'], top: 50, left: 62 },
      { id: 'me-d', label: 'Médio / Ext. Dir.', matchPositions: ['extremo', 'medio'], top: 30, left: 84 },
      { id: 'lat-e', label: 'Lat. Esquerdo', matchPositions: ['lat-esquerdo'], top: 72, left: 14 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto'], top: 72, left: 38 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 62 },
      { id: 'lat-d', label: 'Lat. Direito', matchPositions: ['lat-direito'], top: 72, left: 86 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  },
  '3-4-3': {
    name: '3-4-3',
    positions: [
      { id: 'ca', label: 'Centroavante', matchPositions: ['centroavante'], top: 8, left: 50 },
      { id: 'ext-e', label: 'Extremo Esquerdo', matchPositions: ['extremo'], top: 11, left: 18 },
      { id: 'ext-d', label: 'Extremo Direito', matchPositions: ['extremo'], top: 11, left: 82 },
      { id: 'ala-e', label: 'Ala Esquerdo', matchPositions: ['lat-esquerdo', 'extremo'], top: 38, left: 12 },
      { id: 'vol', label: 'Volante', matchPositions: ['medio'], top: 50, left: 38 },
      { id: 'med', label: 'Médio Central', matchPositions: ['medio'], top: 50, left: 62 },
      { id: 'ala-d', label: 'Ala Direito', matchPositions: ['lat-direito', 'extremo'], top: 38, left: 88 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto'], top: 72, left: 26 },
      { id: 'zag-c', label: 'Zagueiro Central', matchPositions: ['zagueiro'], top: 72, left: 50 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 74 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      { id: 'ca-1', label: 'Centroavante 1', matchPositions: ['centroavante'], top: 8, left: 38 },
      { id: 'ca-2', label: 'Centroavante 2', matchPositions: ['centroavante'], top: 8, left: 62 },
      { id: 'ala-e', label: 'Ala Esquerdo', matchPositions: ['lat-esquerdo', 'extremo'], top: 38, left: 12 },
      { id: 'vol-1', label: 'Volante 1', matchPositions: ['medio'], top: 50, left: 36 },
      { id: 'mei-o', label: 'Meia Ofensivo', matchPositions: ['meia-ofensivo'], top: 33, left: 50 },
      { id: 'vol-2', label: 'Volante 2', matchPositions: ['medio'], top: 50, left: 64 },
      { id: 'ala-d', label: 'Ala Direito', matchPositions: ['lat-direito', 'extremo'], top: 38, left: 88 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto'], top: 72, left: 26 },
      { id: 'zag-c', label: 'Zagueiro Central', matchPositions: ['zagueiro'], top: 72, left: 50 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 74 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  }
}

// Dados iniciais para os cenários padrão (campinho 100% VAZIO) com tetos orçamentários
const INITIAL_SHADOW_TEAMS = [
  {
    id: 'serie-a',
    nome: '★ Série A 2026',
    formacao: '4-3-3',
    budget_ceiling: 2500000,
    escalacao: {}
  },
  {
    id: 'serie-b',
    nome: 'Série B',
    formacao: '4-2-3-1',
    budget_ceiling: 1500000,
    escalacao: {}
  },
  {
    id: 'serie-c',
    nome: 'Série C',
    formacao: '4-4-2',
    budget_ceiling: 800000,
    escalacao: {}
  },
  {
    id: 'alternativas',
    nome: 'Alternativas / Mercado',
    formacao: '3-4-3',
    budget_ceiling: 2000000,
    escalacao: {}
  }
]

export default function ShadowTeam({ onBack, players = [], user, onSignOut, onOpenMobileMenu, onSavePlayer }) {
  // Limpa apenas chaves antigas sem tocar nos dados do Time Sombra
  useEffect(() => {
    try {
      localStorage.removeItem('radar_selection_squad')
    } catch (e) {}
  }, [])

  const [shadowTeams, setShadowTeams] = useState(() => {
    try {
      const saved = localStorage.getItem('radar_shadow_teams')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Erro ao carregar radar_shadow_teams do localStorage:', e)
    }
    return INITIAL_SHADOW_TEAMS
  })

  // Persistir alterações no localStorage
  useEffect(() => {
    if (shadowTeams && shadowTeams.length > 0) {
      try {
        localStorage.setItem('radar_shadow_teams', JSON.stringify(shadowTeams))
      } catch (e) {
        console.error('Erro ao salvar radar_shadow_teams no localStorage:', e)
      }
    }
  }, [shadowTeams])

  const [activeTeamId, setActiveTeamId] = useState(() => {
    try {
      const savedActiveId = localStorage.getItem('radar_shadow_active_team_id')
      const saved = localStorage.getItem('radar_shadow_teams')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (savedActiveId && parsed.some(t => t.id === savedActiveId)) {
            return savedActiveId
          }
          return parsed[0].id
        }
      }
    } catch (e) {
      // fallback
    }
    return 'serie-a'
  })

  useEffect(() => {
    if (activeTeamId) {
      try {
        localStorage.setItem('radar_shadow_active_team_id', activeTeamId)
      } catch (e) {}
    }
  }, [activeTeamId])

  const [assigningPos, setAssigningPos] = useState(null)
  const [playerSearch, setPlayerSearch] = useState('')
  const [playerFilterTab, setPlayerFilterTab] = useState('SUGERIDOS') // 'SUGERIDOS' | 'TODOS'
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const pitchRef = useRef(null)

  // Controle de autocomplete inline na Tabela de Gestão de Elenco & Simulação
  // rowKey: `${posId}-${slotIdx}`
  const [activeRowAutocomplete, setActiveRowAutocomplete] = useState(null)

  // Estado de Drag and Drop
  // draggedItem: { posId: string, index: number, player: object }
  const [draggedItem, setDraggedItem] = useState(null)
  // dragOverTarget: string (ex: 'ca' ou 'ca-0' ou 'ca-1')
  const [dragOverTarget, setDragOverTarget] = useState(null)

  // Estado de reposicionamento livre dos cards de posição
  const [draggingPosId, setDraggingPosId] = useState(null)
  const isDraggingBlockRef = useRef(false)

  // Modais de gerenciamento de cenário
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  // Estados do Simulador de Orçamento e Folha Salarial
  const [showFinancials, setShowFinancials] = useState(() => {
    try {
      const saved = localStorage.getItem('radar_shadow_team_show_financials')
      if (saved !== null) {
        return JSON.parse(saved)
      }
    } catch (e) {}
    return true
  })

  useEffect(() => {
    try {
      localStorage.setItem('radar_shadow_team_show_financials', JSON.stringify(showFinancials))
    } catch (e) {}
  }, [showFinancials])

  const [isEditingBudgetCeiling, setIsEditingBudgetCeiling] = useState(false)
  const [editingSalary, setEditingSalary] = useState(null) // { posId, posLabel, athleteIndex, athlete, initialSalary }
  const [editingFullPlayer, setEditingFullPlayer] = useState(null)
  const [salaryInputVal, setSalaryInputVal] = useState('')
  const [positionImpacts, setPositionImpacts] = useState({}) // { [posId]: { diff: number, timestamp: number } }
  const [isScenarioBalanceOpen, setIsScenarioBalanceOpen] = useState(true)

  // Auto-limpeza suave dos micro-badges de impacto após 7 segundos
  useEffect(() => {
    const keys = Object.keys(positionImpacts)
    if (keys.length === 0) return
    const timer = setTimeout(() => {
      const now = Date.now()
      setPositionImpacts(prev => {
        const next = {}
        Object.entries(prev).forEach(([k, v]) => {
          if (now - v.timestamp < 7000) {
            next[k] = v
          }
        })
        return next
      })
    }, 7000)
    return () => clearTimeout(timer)
  }, [positionImpacts])

  // Obter cenário ativo
  const activeTeam = useMemo(() => {
    return shadowTeams.find(t => t.id === activeTeamId) || shadowTeams[0]
  }, [shadowTeams, activeTeamId])

  const selectedFormation = activeTeam.formacao || '4-3-3'
  const slotsData = activeTeam.escalacao || {}
  const customPositions = activeTeam.customPositions || {}
  const activeFormation = FORMATIONS_CONFIG[selectedFormation] || FORMATIONS_CONFIG['4-3-3']

  // Resolve um slot mesclando dados da base (se houver id) com edições em tempo real da linha/slot
  const resolveSlotAthlete = (slot) => {
    if (!slot) return null
    const base = slot.id
      ? players.find(p => String(p.id) === String(slot.id))
      : null
    return {
      ...(base || {}),
      ...slot,
      nome: slot.nome !== undefined ? slot.nome : (base?.nome || ''),
      ca: slot.ca !== undefined ? slot.ca : (slot.clube !== undefined ? slot.clube : (base?.ca || base?.clube || '')),
      clube: slot.clube !== undefined ? slot.clube : (slot.ca !== undefined ? slot.ca : (base?.clube || base?.ca || '')),
      alt: slot.alt !== undefined ? slot.alt : (slot.altura !== undefined ? slot.altura : (base?.alt ?? base?.altura ?? '')),
      altura: slot.altura !== undefined ? slot.altura : (slot.alt !== undefined ? slot.alt : (base?.altura ?? base?.alt ?? '')),
      an: slot.an !== undefined ? slot.an : (slot.anoNascimento !== undefined ? slot.anoNascimento : (base?.an ?? base?.anoNascimento ?? '')),
      anoNascimento: slot.anoNascimento !== undefined ? slot.anoNascimento : (slot.an !== undefined ? slot.an : (base?.anoNascimento ?? base?.an ?? '')),
      nivel: slot.nivel !== undefined ? slot.nivel : (base?.nivel ?? null),
      is_own_player: Boolean(slot.is_own_player),
      is_simulated_active: slot.is_simulated_active !== false,
      is_foreign: Boolean(slot.is_foreign !== undefined ? slot.is_foreign : base?.is_foreign),
      target_plan: slot.target_plan === 'PLANO_B' ? 'PLANO_B' : 'PLANO_A'
    }
  }

  // Classifica uma posição da formação em 1 dos 4 macro-setores executivos: GOLEIROS, DEFESA, MEIO_CAMPO, ATAQUE
  const getMacroSectorKey = (pos) => {
    const id = (pos?.id || '').toLowerCase()
    if (id === 'gl') return 'GOLEIROS'
    if (id.startsWith('zag') || id.startsWith('lat') || id.startsWith('ala')) return 'DEFESA'
    if (id.startsWith('vol') || id.startsWith('med') || id.startsWith('mei')) return 'MEIO_CAMPO'
    return 'ATAQUE'
  }

  // Métricas e Cálculos Financeiros em Tempo Real (base exclusiva: atletas com 'Ativo na Simulação' marcado)
  const budgetCeiling = activeTeam.budget_ceiling !== undefined && activeTeam.budget_ceiling !== null
    ? Number(activeTeam.budget_ceiling)
    : 2500000

  const payrollStats = useMemo(() => {
    return calculateTeamPayroll(activeFormation.positions, slotsData, players, 'COMPLETO')
  }, [activeFormation, slotsData, players])

  // Mudar formação do cenário ativo
  const handleFormationChange = (fmt) => {
    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const updated = { ...team, formacao: fmt }
        saveShadowTeamToSupabase(updated)
        return updated
      }
      return team
    }))
  }

  // Restaurar posições originais da formação no cenário ativo
  const handleResetPositions = () => {
    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const updated = { ...team }
        delete updated.customPositions
        saveShadowTeamToSupabase(updated)
        return updated
      }
      return team
    }))
  }

  // Contagem dinâmica de posições preenchidas na formação ativa
  const filledCount = useMemo(() => {
    return activeFormation.positions.filter(pos => {
      const list = slotsData[pos.id] || []
      return list.some(s => s && s.is_simulated_active !== false && (s.nome?.trim() || s.id))
    }).length
  }, [activeFormation, slotsData])

  // Extrai idade e ano de nascimento a partir de qualquer formato (ex: 1998, '98, ou idade direta 26)
  const extractAgeAndBirthYear = (athlete) => {
    if (!athlete) return { age: null, birthYear: null }
    const currentYear = new Date().getFullYear()
    const rawVal = athlete.an !== undefined && athlete.an !== ''
      ? athlete.an
      : (athlete.anoNascimento !== undefined && athlete.anoNascimento !== '' ? athlete.anoNascimento : athlete.idade)
    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
      return { age: null, birthYear: null }
    }
    const num = parseInt(String(rawVal).replace(/\D/g, ''), 10)
    if (isNaN(num) || num <= 0) return { age: null, birthYear: null }

    // Caso tenha digitado a idade diretamente (ex: 14 a 55)
    if (num >= 14 && num <= 55) {
      return { age: num, birthYear: currentYear - num }
    }
    // Caso tenha digitado ano com 4 dígitos (ex: 1997, 2004)
    if (num >= 1950 && num <= currentYear) {
      const age = currentYear - num
      return { age: age >= 14 && age <= 55 ? age : null, birthYear: num }
    }
    // Caso tenha digitado ano com 2 dígitos (ex: 98, 04)
    if (num < 100) {
      const fullYear = num > 40 ? 1900 + num : 2000 + num
      const age = currentYear - fullYear
      return { age: age >= 14 && age <= 55 ? age : null, birthYear: fullYear }
    }
    return { age: null, birthYear: null }
  }

  // Extrai altura em centímetros (ex: 1.85 -> 185, 185 -> 185)
  const extractHeightCm = (athlete) => {
    if (!athlete) return null
    const rawAlt = athlete.alt !== undefined && athlete.alt !== '' ? athlete.alt : athlete.altura
    if (rawAlt === undefined || rawAlt === null || String(rawAlt).trim() === '') return null
    const numAlt = parseFloat(String(rawAlt).replace(',', '.'))
    if (isNaN(numAlt) || numAlt <= 0) return null
    const cm = numAlt < 3 ? Math.round(numAlt * 100) : Math.round(numAlt)
    return cm >= 140 && cm <= 230 ? cm : null
  }

  // Ordena as posições da formação de Defesa (Goleiro -> Zagueiros -> Laterais) para Ataque (Volantes -> Meias -> Extremos -> Centroavante)
  const orderedPositionsForTable = useMemo(() => {
    const getSectorOrderWeight = (pos) => {
      const id = (pos.id || '').toLowerCase()
      if (id === 'gl') return 10
      if (id.startsWith('zag-d')) return 20
      if (id.startsWith('zag-c')) return 25
      if (id.startsWith('zag-e')) return 30
      if (id.startsWith('lat-d') || id.startsWith('ala-d')) return 40
      if (id.startsWith('lat-e') || id.startsWith('ala-e')) return 50
      if (id.startsWith('vol')) return 60
      if (id.startsWith('med')) return 65
      if (id.startsWith('mei')) return 70
      if (id.startsWith('ext') || id.startsWith('me-')) return 80
      if (id.startsWith('ca')) return 90
      return 100 - (pos.top || 0)
    }
    return [...activeFormation.positions].sort((a, b) => getSectorOrderWeight(a) - getSectorOrderWeight(b))
  }, [activeFormation])

  // Cálculo unificado de Orçamento, Folha (Elenco vs Contratações), Idade, Altura, Setores e Atletas Ativos
  // Regra estrita: considera EXCLUSIVAMENTE os atletas com 'Ativo na Simulação' (is_simulated_active !== false)
  const teamMetrics = useMemo(() => {
    const activeAthletesDetailed = []
    let activeOwnPlayersCount = 0
    let activeTargetsCount = 0
    let activeForeignersCount = 0
    let ownPayroll = 0
    let targetsPayroll = 0
    let totalAge = 0
    let countAge = 0
    let totalHeight = 0
    let countHeight = 0

    const sectorBuckets = {
      GOLEIROS: { key: 'GOLEIROS', label: 'Goleiros', count: 0, payroll: 0, totalHeight: 0, countHeight: 0, totalAge: 0, countAge: 0 },
      DEFESA: { key: 'DEFESA', label: 'Linha Defensiva', count: 0, payroll: 0, totalHeight: 0, countHeight: 0, totalAge: 0, countAge: 0 },
      MEIO_CAMPO: { key: 'MEIO_CAMPO', label: 'Meio-Campo', count: 0, payroll: 0, totalHeight: 0, countHeight: 0, totalAge: 0, countAge: 0 },
      ATAQUE: { key: 'ATAQUE', label: 'Ataque', count: 0, payroll: 0, totalHeight: 0, countHeight: 0, totalAge: 0, countAge: 0 }
    }

    orderedPositionsForTable.forEach(pos => {
      const currentSlots = slotsData[pos.id] || []
      if (currentSlots.length === 0) return

      const macroKey = getMacroSectorKey(pos)
      const activeSlots = currentSlots.filter(s => s && s.is_simulated_active !== false)

      activeSlots.forEach(slot => {
        const full = resolveSlotAthlete(slot)
        if (!full) return
        // Ignora linhas vazias sem atleta definido nas contagens e médias
        if (!full.nome?.trim() && !full.id) return

        const sal = getAthleteSalary(full, players)
        const { age } = extractAgeAndBirthYear(full)
        const heightCm = extractHeightCm(full)
        const isOwn = Boolean(full.is_own_player)

        if (isOwn) {
          activeOwnPlayersCount += 1
          ownPayroll += sal
        } else {
          activeTargetsCount += 1
          targetsPayroll += sal
        }

        if (full.is_foreign) {
          activeForeignersCount += 1
        }

        if (age !== null && age >= 14 && age <= 55) {
          totalAge += age
          countAge += 1
          sectorBuckets[macroKey].totalAge += age
          sectorBuckets[macroKey].countAge += 1
        }

        if (heightCm !== null) {
          totalHeight += heightCm
          countHeight += 1
          sectorBuckets[macroKey].totalHeight += heightCm
          sectorBuckets[macroKey].countHeight += 1
        }

        sectorBuckets[macroKey].count += 1
        sectorBuckets[macroKey].payroll += sal

        activeAthletesDetailed.push({
          id: full.id || full.slotId,
          nome: full.nome || '—',
          posId: pos.id,
          posLabel: pos.label,
          macroSector: macroKey,
          sectorLabel: sectorBuckets[macroKey].label,
          isOwnPlayer: isOwn,
          tipoLabel: isOwn ? 'Elenco' : 'Contratação',
          clube: (full.clube || full.ca || '').trim() || '—',
          heightCm,
          heightStr: heightCm !== null ? `${heightCm} cm` : '—',
          age,
          ageStr: age !== null ? `${age} anos` : '—',
          monthlySalary: sal,
          seasonCost13: sal * 13
        })
      })
    })

    const totalPayroll = ownPayroll + targetsPayroll
    const avgAge = countAge > 0 ? (totalAge / countAge).toFixed(1) : null
    const avgHeight = countHeight > 0 ? (totalHeight / countHeight).toFixed(1) : null

    const sectorSummary = ['GOLEIROS', 'DEFESA', 'MEIO_CAMPO', 'ATAQUE'].map(key => {
      const b = sectorBuckets[key]
      return {
        key: b.key,
        label: b.label,
        count: b.count,
        payroll: b.payroll,
        pctOfPayroll: totalPayroll > 0 ? (b.payroll / totalPayroll) * 100 : 0,
        avgHeight: b.countHeight > 0 ? `${(b.totalHeight / b.countHeight).toFixed(1)} cm` : '—',
        avgAge: b.countAge > 0 ? `${(b.totalAge / b.countAge).toFixed(1)} anos` : '—'
      }
    })

    return {
      avgAge,
      countAge,
      avgHeight,
      countHeight,
      totalConsidered: activeAthletesDetailed.length,
      activeOwnPlayersCount,
      activeTargetsCount,
      activeForeignersCount,
      ownPayroll,
      targetsPayroll,
      totalPayroll,
      seasonTotal13: totalPayroll * 13,
      sectorSummary,
      activeAthletesDetailed
    }
  }, [orderedPositionsForTable, slotsData, players])

  const folhaProjetada = teamMetrics.totalPayroll
  const ownPayroll = teamMetrics.ownPayroll
  const targetsPayroll = teamMetrics.targetsPayroll
  const saldoOrcamentario = budgetCeiling - folhaProjetada
  const isBudgetExceeded = saldoOrcamentario < 0
  const percentualComprometido = budgetCeiling > 0 ? (folhaProjetada / budgetCeiling) * 100 : 0
  const ownPctOfCeiling = budgetCeiling > 0 ? (ownPayroll / budgetCeiling) * 100 : 0
  const targetsPctOfCeiling = budgetCeiling > 0 ? (targetsPayroll / budgetCeiling) * 100 : 0
  const availablePctOfCeiling = budgetCeiling > 0 ? Math.max(0, (saldoOrcamentario / budgetCeiling) * 100) : 0


  // Cálculo Comparativo Multi-Cenários:
  // Coluna 1: Elenco Real (is_own_player === true, ativos)
  // Coluna 2: Cenário 1 (Elenco Real + Alvos Plano A ativos)
  // Coluna 3: Cenário 2 (Elenco Real + Alvos Plano B ativos)
  const scenarioComparisonData = useMemo(() => {
    const computeScenarioMetrics = (predicateFn) => {
      let totalPayroll = 0
      let totalAthletes = 0
      let ownCount = 0
      let targetCount = 0
      let foreignersCount = 0
      let totalAge = 0
      let countAge = 0
      let totalHeight = 0
      let countHeight = 0

      const sectorTotals = {
        GOLEIROS: { amount: 0, count: 0 },
        DEFESA: { amount: 0, count: 0 },
        MEIO_CAMPO: { amount: 0, count: 0 },
        ATAQUE: { amount: 0, count: 0 }
      }

      activeFormation.positions.forEach(pos => {
        const currentSlots = slotsData[pos.id] || []
        const macroKey = getMacroSectorKey(pos)

        currentSlots.forEach(slot => {
          const full = resolveSlotAthlete(slot)
          if (!full) return
          if (!full.nome?.trim() && !full.id) return
          if (full.is_simulated_active === false) return
          if (!predicateFn(full)) return

          const sal = getAthleteSalary(full, players)
          totalPayroll += sal
          totalAthletes += 1

          if (full.is_own_player) {
            ownCount += 1
          } else {
            targetCount += 1
          }

          if (full.is_foreign) {
            foreignersCount += 1
          }

          sectorTotals[macroKey].amount += sal
          sectorTotals[macroKey].count += 1

          const { age } = extractAgeAndBirthYear(full)
          if (age !== null && age >= 14 && age <= 55) {
            totalAge += age
            countAge += 1
          }

          const rawAlt = full.alt !== undefined && full.alt !== '' ? full.alt : full.altura
          if (rawAlt !== undefined && rawAlt !== null && String(rawAlt).trim() !== '') {
            const numAlt = parseFloat(String(rawAlt).replace(',', '.'))
            if (!isNaN(numAlt) && numAlt > 0) {
              const cm = numAlt < 3 ? Math.round(numAlt * 100) : Math.round(numAlt)
              if (cm >= 140 && cm <= 230) {
                totalHeight += cm
                countHeight += 1
              }
            }
          }
        })
      })

      const availableBalance = budgetCeiling - totalPayroll
      const isOverBudget = availableBalance < 0
      const commitmentPct = budgetCeiling > 0 ? (totalPayroll / budgetCeiling) * 100 : 0
      const avgAgeNum = countAge > 0 ? totalAge / countAge : null
      const avgHeightNum = countHeight > 0 ? totalHeight / countHeight : null

      const sectors = {
        GOLEIROS: {
          ...sectorTotals.GOLEIROS,
          pct: totalPayroll > 0 ? (sectorTotals.GOLEIROS.amount / totalPayroll) * 100 : 0
        },
        DEFESA: {
          ...sectorTotals.DEFESA,
          pct: totalPayroll > 0 ? (sectorTotals.DEFESA.amount / totalPayroll) * 100 : 0
        },
        MEIO_CAMPO: {
          ...sectorTotals.MEIO_CAMPO,
          pct: totalPayroll > 0 ? (sectorTotals.MEIO_CAMPO.amount / totalPayroll) * 100 : 0
        },
        ATAQUE: {
          ...sectorTotals.ATAQUE,
          pct: totalPayroll > 0 ? (sectorTotals.ATAQUE.amount / totalPayroll) * 100 : 0
        }
      }

      return {
        totalPayroll,
        availableBalance,
        isOverBudget,
        commitmentPct,
        totalAthletes,
        ownCount,
        targetCount,
        foreignersCount,
        avgAge: avgAgeNum !== null ? avgAgeNum.toFixed(1) : null,
        avgAgeNum,
        countAge,
        avgHeight: avgHeightNum !== null ? avgHeightNum.toFixed(1) : null,
        avgHeightNum,
        countHeight,
        sectors
      }
    }

    const elencoReal = computeScenarioMetrics(a => a.is_own_player === true)
    const cenario1 = computeScenarioMetrics(
      a => a.is_own_player === true || (!a.is_own_player && (a.target_plan || 'PLANO_A') === 'PLANO_A')
    )
    const cenario2 = computeScenarioMetrics(
      a => a.is_own_player === true || (!a.is_own_player && a.target_plan === 'PLANO_B')
    )

    // Delta Executivo (Cenário 2 - Cenário 1)
    const monthlyDiff = cenario2.totalPayroll - cenario1.totalPayroll
    const annualDiff12 = monthlyDiff * 12
    const annualDiff13 = monthlyDiff * 13.33
    const ageDiff =
      cenario2.avgAgeNum !== null && cenario1.avgAgeNum !== null
        ? cenario2.avgAgeNum - cenario1.avgAgeNum
        : null
    const heightDiff =
      cenario2.avgHeightNum !== null && cenario1.avgHeightNum !== null
        ? cenario2.avgHeightNum - cenario1.avgHeightNum
        : null
    const foreignersDiff = cenario2.foreignersCount - cenario1.foreignersCount

    return {
      elencoReal,
      cenario1,
      cenario2,
      delta: {
        monthlyDiff,
        annualDiff12,
        annualDiff13,
        ageDiff,
        heightDiff,
        foreignersDiff
      }
    }
  }, [activeFormation, slotsData, players, budgetCeiling])

  // Adicionar nova linha em branco sincronizada (Tabela ⇄ Campograma)
  const handleAddEmptySlot = (posId) => {
    const newSlot = {
      slotId: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      id: null,
      nome: '',
      nivel: null,
      ca: '',
      clube: '',
      an: '',
      anoNascimento: '',
      idade: '',
      alt: '',
      altura: '',
      estimated_salary: null,
      salarioEstimado: null,
      is_own_player: false,
      is_simulated_active: true,
      is_foreign: false,
      target_plan: 'PLANO_A'
    }

    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const currentList = team.escalacao[posId] || []
        const updatedTeam = {
          ...team,
          escalacao: {
            ...team.escalacao,
            [posId]: [...currentList, newSlot]
          }
        }
        saveShadowTeamToSupabase(updatedTeam)
        return updatedTeam
      }
      return team
    }))
  }

  // Atualizar qualquer campo de um slot em tempo real (Tabela ⇄ Campograma)
  const handleUpdateSlotField = (posId, slotIndex, fieldUpdates) => {
    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const currentList = [...(team.escalacao[posId] || [])]
        if (slotIndex < 0 || slotIndex >= currentList.length) return team
        const existingSlot = currentList[slotIndex] || {}
        currentList[slotIndex] = {
          ...existingSlot,
          ...fieldUpdates
        }
        const updatedTeam = {
          ...team,
          escalacao: {
            ...team.escalacao,
            [posId]: currentList
          }
        }
        saveShadowTeamToSupabase(updatedTeam)
        return updatedTeam
      }
      return team
    }))
  }

  // Selecionar um jogador do banco (scout_players) a partir do autocomplete da linha na tabela
  const handleSelectDatabasePlayerForSlot = (posId, slotIndex, dbPlayer) => {
    if (!dbPlayer) return
    const salaryVal = getAthleteSalary(dbPlayer, players)
    handleUpdateSlotField(posId, slotIndex, {
      id: dbPlayer.id,
      nome: dbPlayer.nome || '',
      nivel: dbPlayer.nivel || null,
      ca: dbPlayer.ca || dbPlayer.clube || '',
      clube: dbPlayer.clube || dbPlayer.ca || '',
      an: dbPlayer.an || dbPlayer.anoNascimento || '',
      anoNascimento: dbPlayer.anoNascimento || dbPlayer.an || '',
      alt: dbPlayer.alt || dbPlayer.altura || '',
      altura: dbPlayer.altura || dbPlayer.alt || '',
      posicaoOriginal: dbPlayer.posicao || '',
      estimated_salary: salaryVal > 0 ? salaryVal : null,
      salarioEstimado: salaryVal > 0 ? salaryVal : null,
      salaryCleared: false,
      is_foreign: Boolean(dbPlayer.is_foreign)
    })
    setActiveRowAutocomplete(null)
  }

  // Desescalar / excluir linha de atleta do cenário ativo (Tabela ⇄ Campograma)
  const handleRemovePlayer = (posId, index) => {
    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const currentList = team.escalacao[posId] || []
        const updatedTeam = {
          ...team,
          escalacao: {
            ...team.escalacao,
            [posId]: currentList.filter((_, i) => i !== index)
          }
        }
        saveShadowTeamToSupabase(updatedTeam)
        return updatedTeam
      }
      return team
    }))
  }

  // Ações de Drag and Drop
  const handleDragStart = (e, posId, index, player) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ posId, index, playerId: player.id }))
    e.dataTransfer.effectAllowed = 'move'
    setDraggedItem({ posId, index, player })
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverTarget(null)
  }

  const handleDragOver = (e, targetKey) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverTarget !== targetKey) {
      setDragOverTarget(targetKey)
    }
  }

  const handleDragLeave = (e, targetKey) => {
    if (dragOverTarget === targetKey) {
      setDragOverTarget(null)
    }
  }

  const handleDropOnSlot = (e, targetPosId, targetIndex) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTarget(null)

    if (!draggedItem) return
    const sourcePosId = draggedItem.posId
    const sourceIndex = draggedItem.index

    // Arrastou para o exato mesmo slot: não faz nada
    if (sourcePosId === targetPosId && sourceIndex === targetIndex) {
      setDraggedItem(null)
      return
    }

    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const escalacao = { ...team.escalacao }
        const sourceList = [...(escalacao[sourcePosId] || [])]

        // Cenário A: Mesma posição (reordenação)
        if (sourcePosId === targetPosId) {
          if (targetIndex !== null && targetIndex < sourceList.length) {
            const temp = sourceList[sourceIndex]
            sourceList[sourceIndex] = sourceList[targetIndex]
            sourceList[targetIndex] = temp
          } else {
            const [moved] = sourceList.splice(sourceIndex, 1)
            sourceList.push(moved)
          }
          escalacao[sourcePosId] = sourceList
          const updatedTeam = { ...team, escalacao }
          saveShadowTeamToSupabase(updatedTeam)
          return updatedTeam
        }

        // Cenário B: Entre posições diferentes (sem limite fixo de 5 atletas)
        const targetList = [...(escalacao[targetPosId] || [])]
        const [movedAthlete] = sourceList.splice(sourceIndex, 1)

        if (movedAthlete.id && targetList.some(p => p.id && String(p.id) === String(movedAthlete.id))) {
          return team
        }

        if (targetIndex !== null && targetIndex < targetList.length) {
          targetList.splice(targetIndex, 0, movedAthlete)
        } else {
          targetList.push(movedAthlete)
        }

        escalacao[sourcePosId] = sourceList
        escalacao[targetPosId] = targetList
        const updatedTeam = { ...team, escalacao }
        saveShadowTeamToSupabase(updatedTeam)
        return updatedTeam
      }
      return team
    }))

    setDraggedItem(null)
  }

  // Reposicionamento livre dos blocos de posição no gramado
  const handlePositionMouseDown = (e, posId) => {
    // Apenas botão principal do mouse e somente se não estiver clicando em botão ou input
    if (e.button !== 0 || e.target.closest('button') || e.target.closest('input') || e.target.closest('label')) return
    e.preventDefault()

    const pitchEl = pitchRef.current
    if (!pitchEl) return

    isDraggingBlockRef.current = true
    setDraggingPosId(posId)

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingBlockRef.current || !pitchRef.current) return
      const fieldRect = pitchRef.current.getBoundingClientRect()

      const newLeftPercent = Math.max(2, Math.min(85, ((moveEvent.clientX - fieldRect.left) / fieldRect.width) * 100))
      const newTopPercent = Math.max(2, Math.min(92, ((moveEvent.clientY - fieldRect.top) / fieldRect.height) * 100))

      setShadowTeams(prev => prev.map(team => {
        if (team.id === activeTeam.id) {
          const currentCustom = team.customPositions || {}
          return {
            ...team,
            customPositions: {
              ...currentCustom,
              [posId]: {
                top: `${newTopPercent.toFixed(2)}%`,
                left: `${newLeftPercent.toFixed(2)}%`
              }
            }
          }
        }
        return team
      }))
    }

    const handleMouseUp = () => {
      isDraggingBlockRef.current = false
      setDraggingPosId(null)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Escalar atleta no cenário ativo (sem limite restritivo de 5 atletas, suportando preenchimento de slot específico)
  const handleAssignPlayer = (player) => {
    if (!assigningPos) return
    const posId = assigningPos.id
    const targetSlotIndex = assigningPos.targetSlotIndex

    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const currentList = [...(team.escalacao[posId] || [])]
        if (player.id && currentList.some((p, idx) => idx !== targetSlotIndex && p.id && String(p.id) === String(player.id))) {
          return team
        }

        const existingSlot = (targetSlotIndex !== undefined && targetSlotIndex !== null && currentList[targetSlotIndex])
          ? currentList[targetSlotIndex]
          : null

        const newEntry = {
          slotId: existingSlot?.slotId || `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          id: player.id,
          nome: player.nome,
          nivel: player.nivel,
          ca: player.ca,
          clube: player.clube || player.ca,
          an: player.an || player.anoNascimento,
          alt: player.alt || player.altura,
          anoNascimento: player.anoNascimento || player.an,
          altura: player.altura || player.alt,
          posicaoOriginal: player.posicao,
          estimated_salary: player.estimated_salary || player.salarioEstimado || null,
          salarioEstimado: player.estimated_salary || player.salarioEstimado || null,
          is_own_player: existingSlot ? Boolean(existingSlot.is_own_player) : Boolean(player.is_own_player),
          is_simulated_active: existingSlot ? existingSlot.is_simulated_active !== false : true,
          is_foreign: Boolean(player.is_foreign)
        }

        if (targetSlotIndex !== undefined && targetSlotIndex !== null && targetSlotIndex < currentList.length) {
          currentList[targetSlotIndex] = newEntry
        } else {
          currentList.push(newEntry)
        }

        const updatedTeam = {
          ...team,
          escalacao: {
            ...team.escalacao,
            [posId]: currentList
          }
        }
        saveShadowTeamToSupabase(updatedTeam)
        return updatedTeam
      }
      return team
    }))

    setAssigningPos(null)
    setPlayerSearch('')
  }

  // Alterar teto orçamentário mensal do cenário ativo
  const handleBudgetCeilingChange = (newVal) => {
    const numericCeiling = typeof newVal === 'number' ? newVal : parseBRL(newVal)
    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const updated = { ...team, budget_ceiling: numericCeiling }
        saveShadowTeamToSupabase(updated)
        return updated
      }
      return team
    }))
  }

  // Promover linha para o topo da posição
  const handlePromoteToStarter = (posId, candidateIndex) => {
    if (candidateIndex === 0) return

    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const currentList = [...(team.escalacao[posId] || [])]
        if (candidateIndex >= currentList.length) return team

        const oldTitular = currentList[0]
        const newTitular = currentList[candidateIndex]

        const oldSalary = getAthleteSalary(oldTitular, players)
        const newSalary = getAthleteSalary(newTitular, players)
        const diff = newSalary - oldSalary

        // Troca os dois de lugar no array
        const temp = currentList[0]
        currentList[0] = currentList[candidateIndex]
        currentList[candidateIndex] = temp

        // Registra impacto salarial dinâmico na posição
        setPositionImpacts(prevImpacts => ({
          ...prevImpacts,
          [posId]: {
            diff,
            timestamp: Date.now()
          }
        }))

        const updatedTeam = {
          ...team,
          escalacao: {
            ...team.escalacao,
            [posId]: currentList
          }
        }
        saveShadowTeamToSupabase(updatedTeam)
        return updatedTeam
      }
      return team
    }))
  }

  // Abrir modal de edição rápida de salário
  const handleOpenSalaryModal = (posId, posLabel, athleteIndex, athlete) => {
    const curSal = getAthleteSalary(athlete, players)
    setEditingSalary({
      posId,
      posLabel,
      athleteIndex,
      athlete,
      initialSalary: curSal
    })
    setSalaryInputVal(formatBRL(curSal, true))
  }

  // Salvar salário editado do atleta com sanitização universal e persistência
  const handleSaveAthleteSalary = async (posId, athleteIndex, athlete, rawInputVal) => {
    const numericSalary = sanitizeSalary(rawInputVal)

    // 1. Atualiza no cenário do Time Sombra ativo
    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const currentList = [...(team.escalacao[posId] || [])]
        if (athleteIndex < currentList.length) {
          currentList[athleteIndex] = {
            ...currentList[athleteIndex],
            estimated_salary: numericSalary,
            salarioEstimado: numericSalary,
            salaryCleared: numericSalary === null
          }
        }
        const updatedTeam = {
          ...team,
          escalacao: {
            ...team.escalacao,
            [posId]: currentList
          }
        }
        saveShadowTeamToSupabase(updatedTeam)
        return updatedTeam
      }
      return team
    }))

    // 2. Atualiza atleta globalmente se tiver id no banco
    if (athlete?.id) {
      const updatedPlayerData = {
        ...athlete,
        estimated_salary: numericSalary,
        salarioEstimado: numericSalary
      }

      if (onSavePlayer) {
        await onSavePlayer(updatedPlayerData)
      } else {
        try {
          const cached = localStorage.getItem('scout_players') || localStorage.getItem('radar_players')
          if (cached) {
            const list = JSON.parse(cached)
            const updated = list.map(p => String(p.id) === String(athlete.id) ? { ...p, ...updatedPlayerData } : p)
            localStorage.setItem('scout_players', JSON.stringify(updated))
            localStorage.setItem('radar_players', JSON.stringify(updated))
          }
        } catch (e) {}
        await upsertPlayerToSupabase(updatedPlayerData)
      }
    }

    setEditingSalary(null)
  }

  // Criar novo Time Sombra
  const handleCreateNewTeam = (e) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    const newId = `team-${Date.now()}`
    const newTeam = {
      id: newId,
      nome: newTeamName.trim(),
      formacao: '4-3-3',
      budget_ceiling: 2500000,
      escalacao: {}
    }

    setShadowTeams(prev => [...prev, newTeam])
    setActiveTeamId(newId)
    saveShadowTeamToSupabase(newTeam)
    setNewTeamName('')
    setIsNewTeamModalOpen(false)
  }

  // Renomear Time Sombra ativo
  const handleRenameTeam = (e) => {
    e.preventDefault()
    if (!renameValue.trim()) return

    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const updated = { ...team, nome: renameValue.trim() }
        saveShadowTeamToSupabase(updated)
        return updated
      }
      return team
    }))

    setIsRenameModalOpen(false)
  }

  // Excluir Time Sombra ativo
  const handleDeleteTeam = (teamIdToDelete) => {
    if (shadowTeams.length <= 1) {
      alert('É necessário manter ao menos um Time Sombra cadastrado.')
      return
    }

    if (window.confirm(`Deseja realmente excluir a simulação "${activeTeam.nome}"?`)) {
      setShadowTeams(prev => {
        const filtered = prev.filter(t => t.id !== teamIdToDelete)
        setActiveTeamId(filtered[0].id)
        return filtered
      })
    }
  }

  const getNivelStyle = (nivel) => {
    switch (nivel) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
      case 'B+':
      case 'B':
        return 'bg-blue-600 text-white font-bold border-blue-500'
      case 'C+':
      case 'C':
        return 'bg-amber-500 text-slate-950 font-bold border-amber-400'
      default:
        return 'bg-slate-600 text-slate-100 font-bold border-slate-500'
    }
  }

  const formatAthleteDisplayName = (athlete) => {
    if (!athlete || !athlete.nome) return ''
    const { birthYear } = extractAgeAndBirthYear(athlete)
    if (birthYear) {
      return `${athlete.nome} ${String(birthYear).slice(-2)}'`
    }
    return athlete.nome
  }

  const formatAthleteBirthYear = (athlete) => {
    if (!athlete) return ''
    const { age } = extractAgeAndBirthYear(athlete)
    if (age) {
      return `${age}a`
    }
    return ''
  }

  const formatAthleteSubDetails = (athlete) => {
    if (!athlete) return ''
    const club = (athlete.clube || athlete.ca || '').trim()
    const heightCm = extractHeightCm(athlete)
    const heightStr = heightCm !== null ? `${heightCm} cm` : ''
    if (club && heightStr) return `${club} • ${heightStr}`
    if (club) return club
    if (heightStr) return heightStr
    return ''
  }

  const getPositionLabel = (posKey) => {
    const map = {
      goleiro: 'Goleiro',
      zagueiro: 'Zag. Destro',
      'zag-destro': 'Zag. Destro',
      'zag-canhoto': 'Zag. Canhoto',
      'lat-direito': 'Lat. Direito',
      'lat-esquerdo': 'Lat. Esquerdo',
      medio: 'Médio',
      'meia-ofensivo': 'Meia Ofensivo',
      extremo: 'Extremo',
      centroavante: 'Centroavante'
    }
    if (posKey === 'Zagueiro') return 'Zag. Destro'
    return map[posKey] || posKey || 'Atleta'
  }

  // Mapeia o código/tag do setor para a Tabela de Gestão de Elenco & Simulação
  const getSectorBadgeAndTitle = (pos) => {
    const id = (pos.id || '').toLowerCase()
    if (id === 'gl') return { tag: 'GOLEIROS', name: pos.label }
    if (id.startsWith('zag-d')) return { tag: 'ZAG D', name: pos.label }
    if (id.startsWith('zag-e')) return { tag: 'ZAG E', name: pos.label }
    if (id.startsWith('zag-c')) return { tag: 'ZAG C', name: pos.label }
    if (id.startsWith('lat-d') || id.startsWith('ala-d')) return { tag: 'LAT D', name: pos.label }
    if (id.startsWith('lat-e') || id.startsWith('ala-e')) return { tag: 'LAT E', name: pos.label }
    if (id.startsWith('vol') || id.startsWith('med')) return { tag: 'VOLANTES', name: pos.label }
    if (id.startsWith('mei')) return { tag: 'MEIAS', name: pos.label }
    if (id.startsWith('ext') || id.startsWith('me-')) return { tag: 'EXTREMOS', name: pos.label }
    if (id.startsWith('ca')) return { tag: 'CENTROAVANTE', name: pos.label }
    return { tag: pos.id.toUpperCase(), name: pos.label }
  }

  // Candidatos para o modal de escalação com busca universal e filtro sugeridos vs todos
  const candidatePlayers = useMemo(() => {
    if (!assigningPos) return []
    const matchPositions = assigningPos.matchPositions || []
    const currentList = slotsData[assigningPos.id] || []
    const alreadyAssignedIds = currentList.map(p => p.id)

    return players
      .map(p => ({
        ...p,
        isAlreadyAssigned: alreadyAssignedIds.includes(p.id)
      }))
      .filter(p => {
        // Filtro da aba de sugestão
        if (playerFilterTab === 'SUGERIDOS') {
          const matchPrincipal = matchPositions.includes(p.posicao)
          const matchSecundaria = p.posSecundaria && p.posSecundaria !== '—' && matchPositions.some(mp => p.posSecundaria.toLowerCase().includes(mp.toLowerCase()))
          if (!matchPrincipal && !matchSecundaria) {
            return false
          }
        }

        // Busca universal por texto
        if (playerSearch.trim()) {
          const q = playerSearch.toLowerCase()
          const matchNome = (p.nome || '').toLowerCase().includes(q)
          const matchClube = (p.ca || '').toLowerCase().includes(q)
          const matchFormador = (p.clubeFormador || '').toLowerCase().includes(q)
          const matchAgente = (p.agente || '').toLowerCase().includes(q)
          const matchPos = (p.posicao || '').toLowerCase().includes(q)
          if (!matchNome && !matchClube && !matchFormador && !matchAgente && !matchPos) {
            return false
          }
        }

        return true
      })
  }, [players, assigningPos, slotsData, playerSearch, playerFilterTab])

  // Exportação em PDF Executivo Completo:
  // 1. Topo: Captura limpa do Campograma Tático montado
  // 2. Tabela de Resumo Financeiro (Teto Total, Gasto Elenco Atual, Gasto Reforços Simulados, Saldo Livre e % Comprometido)
  // 3. Tabela de Balanço por Setores (Goleiros, Linha Defensiva, Meio-Campo, Ataque)
  // 4. Tabela de Detalhamento dos Atletas Ativos (Nome, Posição, Tipo, Clube de Origem, Altura, Idade, Salário Mensal, Projeção 13 meses)
  const handleExportPdf = async () => {
    if (!pitchRef.current || isExportingPdf) return
    setIsExportingPdf(true)

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      const element = pitchRef.current

      // Captura limpa do Campograma Tático ocultando apenas controles interativos marcados com data-export-hide
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        filter: (node) => {
          if (
            node.classList?.contains('no-export') ||
            node.classList?.contains('no-pdf') ||
            node.getAttribute?.('data-export-hide') === 'true'
          ) {
            return false
          }
          return true
        }
      })

      const img = new Image()
      img.src = dataUrl
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const pdfWidth = img.width
      const scale = pdfWidth / 1400
      const s = (v) => Math.round(v * scale)
      const font = (sz) => Math.max(8, Math.round(sz * scale))

      const activeRows = teamMetrics.activeAthletesDetailed || []
      const sectorRows = teamMetrics.sectorSummary || []

      // Cálculo de altura dinâmica para acomodar o Campograma no topo + as 3 tabelas executivas completas sem cortes
      const topHeaderH = s(95)
      const pitchImageH = img.height
      const sectionGap = s(24)
      const summaryTableSectionH = s(135)
      const sectorTableSectionH = s(64) + (sectorRows.length + 2) * s(28)
      const athletesRowsCount = Math.max(1, activeRows.length)
      const athletesTableSectionH = s(64) + (athletesRowsCount + 2) * s(26)
      const bottomFooterH = s(50)

      const pdfHeight =
        topHeaderH +
        pitchImageH +
        sectionGap +
        summaryTableSectionH +
        sectionGap +
        sectorTableSectionH +
        sectionGap +
        athletesTableSectionH +
        bottomFooterH

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      })

      // Fundo Geral Dark (#070b12)
      pdf.setFillColor(7, 11, 18)
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F')

      // Cabeçalho Institucional Superior
      pdf.setFillColor(6, 13, 23)
      pdf.rect(0, 0, pdfWidth, topHeaderH, 'F')
      pdf.setFillColor(16, 185, 129)
      pdf.rect(0, 0, pdfWidth, Math.max(4, s(5)), 'F')

      const cleanName = (activeTeam?.nome || 'PLANEJAMENTO DE ELENCO').replace(/[^\w\s\dÀ-ú-]/gi, '').trim()
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(font(22))
      pdf.text(`RELATÓRIO EXECUTIVO & FINANCEIRO — ${cleanName.toUpperCase()}`, s(40), s(40))

      const idadeStr = teamMetrics.avgAge ? `${teamMetrics.avgAge} anos (${teamMetrics.countAge} ativos)` : '—'
      const alturaStr = teamMetrics.avgHeight ? `${teamMetrics.avgHeight} cm (${teamMetrics.countHeight} ativos)` : '—'
      const nowStr = new Date().toLocaleDateString('pt-BR')

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(font(12))
      pdf.text(
        `Esquema: ${selectedFormation}   |   Atletas Ativos: ${teamMetrics.totalConsidered} (${teamMetrics.activeOwnPlayersCount} Elenco / ${teamMetrics.activeTargetsCount} Contratações)   |   Idade Média: ${idadeStr}   |   Altura Média: ${alturaStr}   |   Data: ${nowStr}`,
        s(40),
        s(68)
      )

      // 1. TOPO: CAPTURA LIMPA DO CAMPOGRAMA TÁTICO MONTADO
      pdf.addImage(dataUrl, 'PNG', 0, topHeaderH, img.width, img.height)

      let cursorY = topHeaderH + pitchImageH + sectionGap
      const marginX = s(40)
      const contentW = pdfWidth - marginX * 2

      // =========================================================================
      // 2. TABELA DE RESUMO FINANCEIRO
      // (Teto Total, Gasto Elenco Atual, Gasto Reforços Simulados, Saldo Livre e % Comprometido)
      // =========================================================================
      pdf.setFillColor(11, 18, 30)
      pdf.setDrawColor(30, 41, 59)
      pdf.setLineWidth(1)
      pdf.roundedRect(marginX, cursorY, contentW, summaryTableSectionH, s(8), s(8), 'FD')

      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(16, 185, 129)
      pdf.setFontSize(font(13))
      pdf.text('1. TABELA DE RESUMO FINANCEIRO (BASE: ATLETAS ATIVOS NA SIMULAÇÃO)', marginX + s(18), cursorY + s(24))

      const sumTableY = cursorY + s(38)
      const sumHeaderH = s(28)
      const sumRowH = s(48)
      const sumTableW = contentW - s(36)
      const sumTableX = marginX + s(18)
      const sumColW = Math.floor(sumTableW / 5)

      // Cabeçalho da Tabela de Resumo Financeiro
      pdf.setFillColor(18, 28, 45)
      pdf.rect(sumTableX, sumHeaderH ? sumTableY : sumTableY, sumTableW, sumHeaderH, 'F')

      const summaryColumns = [
        {
          title: 'TETO TOTAL MENSAL',
          mainVal: formatBRL(budgetCeiling, true),
          subVal: '100% do limite aprovado',
          color: [255, 255, 255]
        },
        {
          title: 'GASTO ELENCO ATUAL',
          mainVal: formatBRL(ownPayroll, true),
          subVal: `${ownPctOfCeiling.toFixed(1)}% do teto (${teamMetrics.activeOwnPlayersCount} atletas)`,
          color: [34, 211, 238]
        },
        {
          title: 'GASTO REFORÇOS SIMULADOS',
          mainVal: formatBRL(targetsPayroll, true),
          subVal: `${targetsPctOfCeiling.toFixed(1)}% do teto (${teamMetrics.activeTargetsCount} alvos)`,
          color: [251, 191, 36]
        },
        {
          title: 'SALDO LIVRE NO TETO',
          mainVal: `${saldoOrcamentario >= 0 ? '+ ' : '- '}${formatBRL(Math.abs(saldoOrcamentario), true)}`,
          subVal: saldoOrcamentario >= 0 ? `${availablePctOfCeiling.toFixed(1)}% de margem livre` : 'Acima do teto estipulado',
          color: saldoOrcamentario >= 0 ? [52, 211, 153] : [251, 113, 133]
        },
        {
          title: '% COMPROMETIDO DO TETO',
          mainVal: `${percentualComprometido.toFixed(1)}%`,
          subVal: `Folha Total: ${formatBRL(folhaProjetada, false)}/mês`,
          color: isBudgetExceeded ? [251, 113, 133] : [52, 211, 153]
        }
      ]

      summaryColumns.forEach((col, idx) => {
        const colX = sumTableX + idx * sumColW
        if (idx > 0) {
          pdf.setDrawColor(30, 41, 59)
          pdf.line(colX, sumTableY, colX, sumTableY + sumHeaderH + sumRowH)
        }
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(148, 163, 184)
        pdf.setFontSize(font(9.5))
        pdf.text(col.title, colX + s(12), sumTableY + s(18))

        const valY = sumTableY + sumHeaderH
        pdf.setFillColor(13, 22, 37)
        pdf.rect(colX, valY, sumColW, sumRowH, 'F')

        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(col.color[0], col.color[1], col.color[2])
        pdf.setFontSize(font(14))
        pdf.text(col.mainVal, colX + s(12), valY + s(22))

        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(148, 163, 184)
        pdf.setFontSize(font(9))
        pdf.text(col.subVal, colX + s(12), valY + s(38))
      })

      pdf.setDrawColor(30, 41, 59)
      pdf.rect(sumTableX, sumTableY, sumTableW, sumHeaderH + sumRowH, 'D')

      cursorY += summaryTableSectionH + sectionGap

      // =========================================================================
      // 3. TABELA DE BALANÇO POR SETORES (Goleiros, Linha Defensiva, Meio-Campo, Ataque)
      // Colunas: Setor | Total de Atletas | Folha Salarial do Setor | % da Folha | Média de Altura | Média de Idade
      // =========================================================================
      pdf.setFillColor(11, 18, 30)
      pdf.setDrawColor(30, 41, 59)
      pdf.setLineWidth(1)
      pdf.roundedRect(marginX, cursorY, contentW, sectorTableSectionH, s(8), s(8), 'FD')

      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(16, 185, 129)
      pdf.setFontSize(font(13))
      pdf.text('2. TABELA DE BALANÇO POR SETORES (GOLEIROS, LINHA DEFENSIVA, MEIO-CAMPO, ATAQUE)', marginX + s(18), cursorY + s(24))

      const secTableX = marginX + s(18)
      const secTableW = contentW - s(36)
      const secHeaderY = cursorY + s(38)
      const secRowH = s(28)

      const secColX = [
        secTableX + s(14),
        secTableX + Math.round(secTableW * 0.28),
        secTableX + Math.round(secTableW * 0.44),
        secTableX + Math.round(secTableW * 0.64),
        secTableX + Math.round(secTableW * 0.78),
        secTableX + Math.round(secTableW * 0.90)
      ]

      // Header Setores
      pdf.setFillColor(18, 28, 45)
      pdf.rect(secTableX, secHeaderY, secTableW, secRowH, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(font(9.5))
      pdf.text('SETOR TÁTICO', secColX[0], secHeaderY + s(18))
      pdf.text('TOTAL DE ATLETAS', secColX[1], secHeaderY + s(18))
      pdf.text('FOLHA SALARIAL DO SETOR', secColX[2], secHeaderY + s(18))
      pdf.text('% DA FOLHA', secColX[3], secHeaderY + s(18))
      pdf.text('MÉDIA DE ALTURA', secColX[4], secHeaderY + s(18))
      pdf.text('MÉDIA DE IDADE', secColX[5], secHeaderY + s(18))

      sectorRows.forEach((sec, idx) => {
        const rY = secHeaderY + (idx + 1) * secRowH
        pdf.setFillColor(idx % 2 === 0 ? 13 : 16, idx % 2 === 0 ? 21 : 26, idx % 2 === 0 ? 35 : 42)
        pdf.rect(secTableX, rY, secTableW, secRowH, 'F')

        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(241, 245, 249)
        pdf.setFontSize(font(10))
        pdf.text(sec.label, secColX[0], rY + s(18))

        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(203, 213, 225)
        pdf.text(`${sec.count} ${sec.count === 1 ? 'atleta' : 'atletas'}`, secColX[1], rY + s(18))

        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(251, 191, 36)
        pdf.text(formatBRL(sec.payroll, true), secColX[2], rY + s(18))

        pdf.setTextColor(52, 211, 153)
        pdf.text(`${sec.pctOfPayroll.toFixed(1)}%`, secColX[3], rY + s(18))

        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(203, 213, 225)
        pdf.text(sec.avgHeight, secColX[4], rY + s(18))
        pdf.text(sec.avgAge, secColX[5], rY + s(18))
      })

      // Linha Totalizadora de Setores
      const secTotalY = secHeaderY + (sectorRows.length + 1) * secRowH
      pdf.setFillColor(10, 35, 26)
      pdf.rect(secTableX, secTotalY, secTableW, secRowH, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(font(10))
      pdf.setTextColor(52, 211, 153)
      pdf.text('TOTAL / MÉDIA GERAL DOS ATIVOS', secColX[0], secTotalY + s(18))
      pdf.text(`${teamMetrics.totalConsidered} atletas ativos`, secColX[1], secTotalY + s(18))
      pdf.setTextColor(251, 191, 36)
      pdf.text(formatBRL(folhaProjetada, true), secColX[2], secTotalY + s(18))
      pdf.setTextColor(52, 211, 153)
      pdf.text(folhaProjetada > 0 ? '100.0%' : '0.0%', secColX[3], secTotalY + s(18))
      pdf.setTextColor(241, 245, 249)
      pdf.text(teamMetrics.avgHeight ? `${teamMetrics.avgHeight} cm` : '—', secColX[4], secTotalY + s(18))
      pdf.text(teamMetrics.avgAge ? `${teamMetrics.avgAge} anos` : '—', secColX[5], secTotalY + s(18))

      pdf.setDrawColor(30, 41, 59)
      pdf.rect(secTableX, secHeaderY, secTableW, (sectorRows.length + 2) * secRowH, 'D')

      cursorY += sectorTableSectionH + sectionGap

      // =========================================================================
      // 4. TABELA DE DETALHAMENTO DOS ATLETAS ATIVOS
      // Colunas: Nome | Posição | Tipo (Elenco ou Contratação) | Clube de Origem | Altura | Idade | Salário Mensal | Projeção de Custo da Temporada (13 meses)
      // =========================================================================
      pdf.setFillColor(11, 18, 30)
      pdf.setDrawColor(30, 41, 59)
      pdf.setLineWidth(1)
      pdf.roundedRect(marginX, cursorY, contentW, athletesTableSectionH, s(8), s(8), 'FD')

      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(16, 185, 129)
      pdf.setFontSize(font(13))
      pdf.text('3. TABELA DE DETALHAMENTO DOS ATLETAS ATIVOS (PROJEÇÃO MENSAL E TEMPORADA 13 MESES)', marginX + s(18), cursorY + s(24))

      const athTableX = marginX + s(18)
      const athTableW = contentW - s(36)
      const athHeaderY = cursorY + s(38)
      const athRowH = s(26)

      const athColX = [
        athTableX + s(12),                          // Nome
        athTableX + Math.round(athTableW * 0.21),   // Posição
        athTableX + Math.round(athTableW * 0.34),   // Tipo (Elenco ou Contratação)
        athTableX + Math.round(athTableW * 0.46),   // Clube de Origem
        athTableX + Math.round(athTableW * 0.60),   // Altura
        athTableX + Math.round(athTableW * 0.68),   // Idade
        athTableX + Math.round(athTableW * 0.76),   // Salário Mensal
        athTableX + Math.round(athTableW * 0.88)    // Projeção Temporada (13 meses)
      ]

      // Header Detalhamento de Atletas
      pdf.setFillColor(18, 28, 45)
      pdf.rect(athTableX, athHeaderY, athTableW, athRowH, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(font(9))
      pdf.text('NOME DO ATLETA', athColX[0], athHeaderY + s(17))
      pdf.text('POSIÇÃO', athColX[1], athHeaderY + s(17))
      pdf.text('TIPO', athColX[2], athHeaderY + s(17))
      pdf.text('CLUBE DE ORIGEM', athColX[3], athHeaderY + s(17))
      pdf.text('ALTURA', athColX[4], athHeaderY + s(17))
      pdf.text('IDADE', athColX[5], athHeaderY + s(17))
      pdf.text('SALÁRIO MENSAL', athColX[6], athHeaderY + s(17))
      pdf.text('CUSTO TEMPORADA (13M)', athColX[7], athHeaderY + s(17))

      if (activeRows.length === 0) {
        const emptyRowY = athHeaderY + athRowH
        pdf.setFillColor(13, 21, 35)
        pdf.rect(athTableX, emptyRowY, athTableW, athRowH, 'F')
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(148, 163, 184)
        pdf.setFontSize(font(9.5))
        pdf.text('Nenhum atleta marcado como Ativo na Simulação neste cenário.', athColX[0], emptyRowY + s(17))
      } else {
        activeRows.forEach((ath, idx) => {
          const rY = athHeaderY + (idx + 1) * athRowH
          pdf.setFillColor(idx % 2 === 0 ? 13 : 16, idx % 2 === 0 ? 21 : 26, idx % 2 === 0 ? 35 : 42)
          pdf.rect(athTableX, rY, athTableW, athRowH, 'F')

          // Nome
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(font(9.5))
          const nomeTrunc = ath.nome.length > 26 ? ath.nome.slice(0, 25) + '.' : ath.nome
          pdf.text(nomeTrunc, athColX[0], rY + s(17))

          // Posição
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(203, 213, 225)
          const posTrunc = ath.posLabel.length > 18 ? ath.posLabel.slice(0, 17) + '.' : ath.posLabel
          pdf.text(posTrunc, athColX[1], rY + s(17))

          // Tipo (Elenco vs Contratação)
          pdf.setFont('helvetica', 'bold')
          if (ath.isOwnPlayer) {
            pdf.setTextColor(34, 211, 238)
          } else {
            pdf.setTextColor(251, 191, 36)
          }
          pdf.text(ath.tipoLabel, athColX[2], rY + s(17))

          // Clube de Origem
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(203, 213, 225)
          const clubTrunc = ath.clube.length > 20 ? ath.clube.slice(0, 19) + '.' : ath.clube
          pdf.text(clubTrunc, athColX[3], rY + s(17))

          // Altura
          pdf.text(ath.heightStr, athColX[4], rY + s(17))

          // Idade
          pdf.text(ath.ageStr, athColX[5], rY + s(17))

          // Salário Mensal
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(251, 191, 36)
          pdf.text(formatBRL(ath.monthlySalary, true), athColX[6], rY + s(17))

          // Projeção de Custo da Temporada (13 meses)
          pdf.setTextColor(52, 211, 153)
          pdf.text(formatBRL(ath.seasonCost13, true), athColX[7], rY + s(17))
        })
      }

      // Linha de Rodapé: Total Mensal e Total Temporada (13 meses)
      const athTotalY = athHeaderY + (athletesRowsCount + 1) * athRowH
      pdf.setFillColor(10, 35, 26)
      pdf.rect(athTableX, athTotalY, athTableW, athRowH, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(font(10))
      pdf.setTextColor(52, 211, 153)
      pdf.text(`TOTAL CONSOLIDADO (${teamMetrics.totalConsidered} ATLETAS ATIVOS)`, athColX[0], athTotalY + s(17))
      pdf.setTextColor(34, 211, 238)
      pdf.text(`${teamMetrics.activeOwnPlayersCount} Elenco | ${teamMetrics.activeTargetsCount} Contratações`, athColX[2], athTotalY + s(17))
      pdf.setTextColor(251, 191, 36)
      pdf.text(formatBRL(folhaProjetada, true), athColX[6], athTotalY + s(17))
      pdf.setTextColor(52, 211, 153)
      pdf.text(formatBRL(teamMetrics.seasonTotal13, true), athColX[7], athTotalY + s(17))

      pdf.setDrawColor(30, 41, 59)
      pdf.rect(athTableX, athHeaderY, athTableW, (athletesRowsCount + 2) * athRowH, 'D')

      // Rodapé Institucional
      const footerY = pdfHeight - s(18)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 116, 139)
      pdf.setFontSize(font(9.5))
      pdf.text('DOCUMENTO EXECUTIVO CONFIDENCIAL — DEPARTAMENTO DE INTELIGÊNCIA & SCOUT', marginX, footerY)
      const userTag = user?.email || 'Sistema'
      pdf.text(
        `Gerado em: ${new Date().toLocaleString('pt-BR')}   |   Operador: ${userTag}`,
        pdfWidth - marginX - s(310),
        footerY
      )

      const safeFileName = cleanName.replace(/\s+/g, '_') || 'cenario'
      const fileDate = new Date().toISOString().slice(0, 10)
      pdf.save(`Relatorio_Executivo_${safeFileName}_${selectedFormation}_${fileDate}.pdf`)
    } catch (err) {
      console.error('Erro ao gerar PDF via html-to-image:', err)
      alert('Houve um erro ao gerar o PDF. Verifique o console.')
    } finally {
      setIsExportingPdf(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 font-sans pb-16 select-none flex flex-col">
      {/* 1. TOPO DA PÁGINA */}
      <header className="bg-[#0b111c] border-b border-slate-800/80 px-3 md:px-6 py-3 md:py-3.5 sticky top-0 z-40 shadow-lg">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 md:gap-4">
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
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-lg bg-[#131d2e] hover:bg-[#19273e] text-slate-300 border border-slate-700/80 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Voltar</span>
            </button>

            <div>
              <div className="flex items-center gap-2 md:gap-2.5">
                <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
                  Time Sombra <span className="hidden sm:inline text-slate-600">—</span> <span className="hidden sm:inline text-emerald-400">Campograma Tático</span>
                </h1>
                <span className="text-[9px] md:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                  OFICIAL
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-400 line-clamp-1">
                Visualização espacial no gramado com hierarquia de até 5 atletas por posição
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Seletor de Formações Táticas */}
            <div className="flex items-center gap-1.5 bg-[#0a0f1a] p-1 rounded-xl border border-slate-800 text-xs">
              {['4-3-3', '4-2-3-1', '4-4-2', '3-4-3', '3-5-2'].map((fmt) => {
                const isSelected = selectedFormation === fmt
                return (
                  <button
                    key={fmt}
                    onClick={() => handleFormationChange(fmt)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {fmt}
                  </button>
                )
              })}
            </div>

            {/* Botão Resetar Posições Padrão */}
            {Object.keys(customPositions).length > 0 && (
              <button
                onClick={handleResetPositions}
                title="Restaurar alinhamento tático padrão da formação"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-colors shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Resetar Posições</span>
              </button>
            )}

            {/* Indicador de Preenchimento */}
            <div className="bg-[#121c2d] border border-slate-700/80 rounded-lg px-3.5 py-1.5 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">
                  <strong className="text-emerald-400">{filledCount}</strong> / 11
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Posições Preenchidas
                </div>
              </div>
            </div>

            {user && (
              <UserBadge user={user} onSignOut={onSignOut} />
            )}
          </div>
        </div>

        {/* BARRA DE CENÁRIOS / SIMULAÇÕES */}
        <div className="max-w-[1720px] mx-auto pt-2 border-t border-slate-800/70 flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mr-1">
              CENÁRIOS:
            </span>

            {shadowTeams.map((team) => {
              const isActive = team.id === activeTeam.id
              return (
                <div
                  key={team.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/10'
                      : 'bg-[#131d2e]/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                  onClick={() => setActiveTeamId(team.id)}
                >
                  <span>{team.nome}</span>

                  {/* Ações na aba ativa: Renomear e Excluir */}
                  {isActive && (
                    <div className="flex items-center gap-1 ml-1.5 pl-1.5 border-l border-emerald-500/30">
                      <button
                        title="Renomear Simulação"
                        onClick={(e) => {
                          e.stopPropagation()
                          setRenameValue(team.nome)
                          setIsRenameModalOpen(true)
                        }}
                        className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                      >
                        ✎
                      </button>
                      {shadowTeams.length > 1 && (
                        <button
                          title="Excluir Simulação"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTeam(team.id)
                          }}
                          className="text-slate-400 hover:text-rose-400 p-0.5 rounded cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botão de Alternância "Ocultar / Mostrar Financeiro" (Modo Tático Limpo) */}
            <button
              type="button"
              onClick={() => setShowFinancials(prev => !prev)}
              title={
                showFinancials
                  ? 'Ocultar simulador financeiro e valores de salários (Modo Tático Limpo)'
                  : 'Exibir simulador financeiro e análise de investimento por posição'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer shrink-0 border ${
                showFinancials
                  ? 'bg-[#152338] hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-slate-600'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
              }`}
            >
              {showFinancials ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ocultar Financeiro</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Modo Financeiro</span>
                </>
              )}
            </button>

            {/* Botão Exportar PDF */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              title="Exportar Campograma Tático em PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#152338] hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-500/60 font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exportar PDF do Campograma</span>
                </>
              )}
            </button>

            {/* Botão "+ Novo Time Sombra" */}
            <button
              onClick={() => {
                setNewTeamName('')
                setIsNewTeamModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Novo Time Sombra</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. O CAMPO DE FUTEBOL (CAMPOGRAMA VISUAL) */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 md:px-6 py-4 md:py-6 flex flex-col items-center overflow-x-hidden md:overflow-x-auto">
        {/* PAINEL EXECUTIVO: SIMULADOR DE ORÇAMENTO E FOLHA SALARIAL */}
        {showFinancials && (
          <div className="w-full max-w-[1400px] mb-3 bg-gradient-to-r from-[#0a111e] via-[#0d1728] to-[#0a111e] border border-slate-800 rounded-2xl p-3.5 md:p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Topo do Painel de Orçamento */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 mb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs md:text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                    <span>Simulador de Orçamento &amp; Divisão do Teto Salarial</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 lowercase">
                      tempo real
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    Base de cálculo exclusiva: atletas com a caixinha <strong className="text-emerald-300">&quot;Ativo na Simulação&quot;</strong> marcada ({teamMetrics.totalConsidered} ativos no momento)
                  </p>
                </div>
              </div>

              {/* Presets Rápidos de Teto Orçamentário */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 mr-1 hidden sm:inline">
                  Atalhos de Teto:
                </span>
                {[1000000, 1500000, 2000000, 2500000, 3000000, 4000000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleBudgetCeilingChange(preset)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                      budgetCeiling === preset
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {formatCompactBRL(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Cartões de Progresso Orçamentário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3.5">
              {/* Card 1: Teto Orçamentário Total */}
              <div className="bg-[#111c2e] border border-slate-700/70 rounded-xl p-3 flex flex-col justify-between shadow-sm relative group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-300" />
                    Teto Orçamentário Total
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingBudgetCeiling(!isEditingBudgetCeiling)}
                    className="text-slate-400 hover:text-emerald-300 p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                    title="Editar teto orçamentário mensal"
                  >
                    <Pencil className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>

                {isEditingBudgetCeiling ? (
                  <div className="my-0.5">
                    <input
                      type="text"
                      defaultValue={formatBRL(budgetCeiling, true)}
                      onBlur={(e) => {
                        handleBudgetCeilingChange(e.target.value)
                        setIsEditingBudgetCeiling(false)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleBudgetCeilingChange(e.currentTarget.value)
                          setIsEditingBudgetCeiling(false)
                        } else if (e.key === 'Escape') {
                          setIsEditingBudgetCeiling(false)
                        }
                      }}
                      autoFocus
                      placeholder="R$ 1.000.000,00"
                      className="w-full bg-[#080d16] border border-emerald-500 rounded px-2.5 py-1 text-base font-black text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingBudgetCeiling(true)}
                    className="cursor-pointer group-hover:text-emerald-300 transition-colors my-0.5"
                    title="Clique para editar o Teto Orçamentário Total"
                  >
                    <div className="text-lg md:text-xl font-black text-white tracking-tight">
                      {formatBRL(budgetCeiling, true)}
                    </div>
                  </div>
                )}

                <div className="mt-1.5">
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-1">
                    <div className="h-full w-full bg-slate-400 rounded-full" />
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="truncate">100% do limite mensal</span>
                    <span className="text-emerald-400/90 font-semibold shrink-0 ml-1">clique p/ editar</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Gasto Real do Elenco (Atletas Meu Jogador/Elenco ativos) */}
              <div className="bg-[#111c2e] border border-cyan-500/30 rounded-xl p-3 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Gasto Real do Elenco
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {ownPctOfCeiling.toFixed(1)}% do teto
                  </span>
                </div>

                <div className="text-lg md:text-xl font-black text-cyan-300 tracking-tight my-0.5">
                  {formatBRL(ownPayroll, true)}
                </div>

                <div className="mt-1.5">
                  <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-1">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ownPctOfCeiling)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Apenas &quot;Elenco&quot; ativos</span>
                    <span className="text-cyan-300 font-bold">
                      {teamMetrics.activeOwnPlayersCount} {teamMetrics.activeOwnPlayersCount === 1 ? 'atleta' : 'atletas'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Gasto de Contratações (Atletas Alvo/Mercado ativos) */}
              <div className="bg-[#111c2e] border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    Gasto de Contratações
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {targetsPctOfCeiling.toFixed(1)}% do teto
                  </span>
                </div>

                <div className="text-lg md:text-xl font-black text-amber-300 tracking-tight my-0.5">
                  {formatBRL(targetsPayroll, true)}
                </div>

                <div className="mt-1.5">
                  <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-1">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, targetsPctOfCeiling)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Apenas &quot;Alvo/Mercado&quot; ativos</span>
                    <span className="text-amber-300 font-bold">
                      {teamMetrics.activeTargetsCount} {teamMetrics.activeTargetsCount === 1 ? 'alvo' : 'alvos'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Saldo Disponível (Margem Livre no Teto Salarial) */}
              <div
                className={`border rounded-xl p-3 flex flex-col justify-between shadow-sm transition-all duration-300 ${
                  isBudgetExceeded
                    ? 'bg-rose-950/25 border-rose-500/60 shadow-rose-950/40'
                    : 'bg-emerald-950/25 border-emerald-500/50 shadow-emerald-950/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    {isBudgetExceeded ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                    ) : (
                      <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    Saldo Disponível
                  </span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                      isBudgetExceeded
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {isBudgetExceeded
                      ? `+${(percentualComprometido - 100).toFixed(1)}% acima`
                      : `${availablePctOfCeiling.toFixed(1)}% livre`}
                  </span>
                </div>

                <div
                  className={`text-lg md:text-xl font-black tracking-tight my-0.5 ${
                    isBudgetExceeded ? 'text-rose-400' : 'text-emerald-300'
                  }`}
                >
                  {isBudgetExceeded
                    ? `- ${formatBRL(Math.abs(saldoOrcamentario), true)}`
                    : `+ ${formatBRL(saldoOrcamentario, true)}`}
                </div>

                <div className="mt-1.5">
                  <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBudgetExceeded ? 'bg-rose-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${isBudgetExceeded ? 100 : Math.min(100, availablePctOfCeiling)}%` }}
                    />
                  </div>
                  <div className="text-[10px] flex items-center justify-between font-semibold">
                    <span className={isBudgetExceeded ? 'text-rose-300' : 'text-emerald-400'}>
                      Folha Ativa: {formatBRL(folhaProjetada, false)}
                    </span>
                    <span className="text-slate-300">
                      {percentualComprometido.toFixed(1)}% usado
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico em Barra Segmentada / Empilhada: Divisão Visual do Teto Orçamentário */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/70">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase tracking-wider text-slate-300">
                    Gráfico de Composição do Teto Orçamentário:
                  </span>
                  <span
                    className={`font-black px-2 py-0.5 rounded-full text-[10px] border ${
                      isBudgetExceeded
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {percentualComprometido.toFixed(1)}% Comprometido ({formatBRL(folhaProjetada, true)} de {formatBRL(budgetCeiling, true)})
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Projeção Temporada (13 meses): <strong className="text-emerald-300">{formatBRL(teamMetrics.seasonTotal13, false)}</strong>
                </span>
              </div>

              {/* Barra Empilhada Segmentada */}
              {(() => {
                const baseRef = Math.max(budgetCeiling, folhaProjetada, 1)
                const ownBarWidth = Math.min(100, (ownPayroll / baseRef) * 100)
                const targetsBarWidth = Math.min(100 - ownBarWidth, (targetsPayroll / baseRef) * 100)
                const freeBarWidth = Math.max(0, 100 - ownBarWidth - targetsBarWidth)

                return (
                  <>
                    <div className="w-full h-4 rounded-xl bg-[#070c15] border border-slate-700/80 overflow-hidden flex p-0.5 gap-0.5 shadow-inner">
                      {ownBarWidth > 0 && (
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 first:rounded-l-lg last:rounded-r-lg transition-all duration-500"
                          style={{ width: `${ownBarWidth}%` }}
                          title={`Gasto Real do Elenco: ${formatBRL(ownPayroll, true)} (${ownPctOfCeiling.toFixed(1)}% do teto)`}
                        />
                      )}
                      {targetsBarWidth > 0 && (
                        <div
                          className={`h-full transition-all duration-500 first:rounded-l-lg last:rounded-r-lg ${
                            isBudgetExceeded
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-amber-500 to-amber-400'
                          }`}
                          style={{ width: `${targetsBarWidth}%` }}
                          title={`Gasto de Contratações: ${formatBRL(targetsPayroll, true)} (${targetsPctOfCeiling.toFixed(1)}% do teto)`}
                        />
                      )}
                      {freeBarWidth > 0 && (
                        <div
                          className="h-full bg-emerald-500/25 border border-emerald-500/30 first:rounded-l-lg last:rounded-r-lg transition-all duration-500"
                          style={{ width: `${freeBarWidth}%` }}
                          title={`Saldo Disponível: ${formatBRL( Math.max(0, saldoOrcamentario), true)} (${availablePctOfCeiling.toFixed(1)}% do teto)`}
                        />
                      )}
                    </div>

                    {/* Legenda Analítica da Barra Segmentada com R$ e % */}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400 inline-block" />
                          <span className="text-slate-400">Gasto Real do Elenco:</span>
                          <strong className="text-cyan-300">{formatBRL(ownPayroll, false)}</strong>
                          <span className="text-slate-500 font-bold">({ownPctOfCeiling.toFixed(1)}%)</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block" />
                          <span className="text-slate-400">Gasto de Contratações:</span>
                          <strong className="text-amber-300">{formatBRL(targetsPayroll, false)}</strong>
                          <span className="text-slate-500 font-bold">({targetsPctOfCeiling.toFixed(1)}%)</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-xs inline-block ${
                              isBudgetExceeded ? 'bg-rose-500' : 'bg-emerald-400'
                            }`}
                          />
                          <span className="text-slate-400">
                            {isBudgetExceeded ? 'Excedente sobre o Teto:' : 'Saldo Disponível:'}
                          </span>
                          <strong className={isBudgetExceeded ? 'text-rose-400' : 'text-emerald-300'}>
                            {isBudgetExceeded
                              ? `- ${formatBRL(Math.abs(saldoOrcamentario), false)}`
                              : formatBRL(saldoOrcamentario, false)}
                          </strong>
                          <span className="text-slate-500 font-bold">
                            ({isBudgetExceeded ? `+${(percentualComprometido - 100).toFixed(1)}%` : `${availablePctOfCeiling.toFixed(1)}%`})
                          </span>
                        </div>
                      </div>

                      <div className="text-slate-400">
                        Teto Total: <strong className="text-white">{formatBRL(budgetCeiling, false)} (100%)</strong>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* PAINEL RESUMO DE MÉTRICAS FÍSICAS, ETÁRIAS E COMPOSIÇÃO DE ELENCO */}
        <div className="w-full max-w-[1400px] mb-4 flex flex-wrap items-center justify-between gap-3 bg-[#0d1522] border border-slate-800/80 rounded-2xl p-3 px-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Card 1: Média de Idade */}
            <div className="flex items-center gap-3 bg-[#131d2e] border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  MÉDIA DE IDADE
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-amber-300">
                    {teamMetrics.avgAge ? `${teamMetrics.avgAge} anos` : '—'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    ({teamMetrics.countAge} ativos)
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Média de Altura */}
            <div className="flex items-center gap-3 bg-[#131d2e] border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  MÉDIA DE ALTURA
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-emerald-300">
                    {teamMetrics.avgHeight ? `${teamMetrics.avgHeight} cm` : '—'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    ({teamMetrics.countHeight} ativos)
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Elenco Atual vs Alvos de Mercado */}
            <div className="flex items-center gap-3 bg-[#131d2e] border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  ELENCO VS CONTRATAÇÕES (ATIVOS)
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-cyan-300">{teamMetrics.activeOwnPlayersCount} Elenco</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-300">{teamMetrics.activeTargetsCount} Alvos</span>
                </div>
              </div>
            </div>

            {/* Card 4: Estrangeiros Ativos */}
            <div className="flex items-center gap-2.5 bg-[#131d2e] border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  ESTRANGEIROS
                </div>
                <div className="text-sm font-black text-purple-300">
                  {teamMetrics.activeForeignersCount} <span className="text-[10px] font-medium text-slate-500">ativos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de Regra Única de Cálculo */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cálculo: Somente Atletas Marcados &quot;Ativo na Simulação&quot; ({teamMetrics.totalConsidered})</span>
            </span>
          </div>
        </div>

        <div ref={pitchRef} className="relative w-full max-w-[1400px] h-[520px] sm:h-[620px] md:min-h-[1280px] md:h-[1320px] pt-3 md:pt-6 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-emerald-800/40 shadow-2xl bg-[#091b12]">
          {/* Textura sutil de faixas de grama cortada */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 80px)'
            }}
          />

          {/* LINHAS DO GRAMADO */}
          {/* Linha Lateral Externa */}
          <div className="absolute inset-3 md:inset-5 border border-emerald-400/25 rounded-lg md:rounded-xl pointer-events-none" />

          {/* Linha do Meio de Campo */}
          <div className="absolute top-1/2 left-3 md:left-5 right-3 md:right-5 h-[1px] bg-emerald-400/25 -translate-y-1/2 pointer-events-none" />

          {/* Círculo Central */}
          <div className="absolute top-1/2 left-1/2 w-24 h-24 md:w-48 md:h-48 border border-emerald-400/25 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-1.5 md:w-2 h-1.5 md:h-2 bg-emerald-400/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* Grande Área Superior (Ataque) */}
          <div className="absolute top-3 md:top-5 left-1/2 -translate-x-1/2 w-[220px] md:w-[440px] h-16 md:h-36 border-b border-x border-emerald-400/25 pointer-events-none" />
          {/* Pequena Área Superior */}
          <div className="absolute top-3 md:top-5 left-1/2 -translate-x-1/2 w-24 md:w-48 h-8 md:h-16 border-b border-x border-emerald-400/25 pointer-events-none" />
          {/* Marca do Pênalti Superior */}
          <div className="absolute top-12 md:top-28 left-1/2 w-1.5 md:w-2 h-1.5 md:h-2 bg-emerald-400/30 rounded-full -translate-x-1/2 pointer-events-none" />

          {/* Grande Área Inferior (Defesa / Gol) */}
          <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 w-[220px] md:w-[440px] h-16 md:h-36 border-t border-x border-emerald-400/25 pointer-events-none" />
          {/* Pequena Área Inferior */}
          <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 w-24 md:w-48 h-8 md:h-16 border-t border-x border-emerald-400/25 pointer-events-none" />
          {/* Marca do Pênalti Inferior */}
          <div className="absolute bottom-12 md:bottom-28 left-1/2 w-1.5 md:w-2 h-1.5 md:h-2 bg-emerald-400/30 rounded-full -translate-x-1/2 pointer-events-none" />

          {/* Trave do Gol Inferior */}
          <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 w-14 md:w-24 h-1 md:h-2 border-t-2 border-x-2 border-white/40 pointer-events-none" />

          {/* 3. DISPOSIÇÃO DAS 11 POSIÇÕES CONFORME A FORMAÇÃO SELECIONADA (SINCRONIZADA COM A TABELA) */}
          {activeFormation.positions.map((pos) => {
            const currentSlots = slotsData[pos.id] || []
            const activeSlotsInPos = currentSlots.filter(s => s && s.is_simulated_active !== false && (s.nome?.trim() || s.id))
            const firstActiveSlot = activeSlotsInPos[0] || null
            const posCoords = customPositions[pos.id] || { top: `${pos.top}%`, left: `${pos.left}%` }
            const isBeingMoved = draggingPosId === pos.id

            return (
              <div
                key={pos.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 ${
                  isBeingMoved ? 'transition-none select-none z-30' : 'transition-all duration-500 ease-out'
                }`}
                style={{ top: posCoords.top, left: posCoords.left }}
              >
                {/* CARD TÁTICO TRANSLÚCIDO COMPACTO (DESKTOP) — LIMPO E ALINHADO */}
                <div
                  onDragOver={(e) => handleDragOver(e, pos.id)}
                  onDragLeave={(e) => handleDragLeave(e, pos.id)}
                  onDrop={(e) => handleDropOnSlot(e, pos.id, null)}
                  className={`hidden md:block w-[236px] min-w-[236px] max-w-[236px] bg-[#070e1b]/95 backdrop-blur-md border rounded-xl p-2.5 shadow-2xl transition-all hover:z-30 group ${
                    isBeingMoved
                      ? 'border-2 border-emerald-400 shadow-emerald-500/30 scale-105 ring-2 ring-emerald-500/20'
                      : dragOverTarget === pos.id
                      ? 'border-2 border-dashed border-emerald-500/80 bg-emerald-950/30'
                      : 'border-slate-700/70 hover:border-emerald-500/70'
                  }`}
                >
                  {/* Topo do Card: Alça de Arraste da Posição + Nome + Botões de Adicionar */}
                  <div
                    onMouseDown={(e) => handlePositionMouseDown(e, pos.id)}
                    className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5 cursor-move select-none active:cursor-grabbing group/header"
                    title="Arraste pelo cabeçalho para reposicionar livremente no gramado"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 truncate group-hover/header:text-emerald-300">
                        {pos.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" data-export-hide="true">
                      <button
                        type="button"
                        data-export-hide="true"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddEmptySlot(pos.id)
                        }}
                        title="Adicionar nova linha sincronizada nesta posição"
                        className="px-1.5 h-4 rounded bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 flex items-center gap-0.5 text-[8.5px] font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-2 h-2 stroke-[3]" />
                        <span>Linha</span>
                      </button>
                      <button
                        type="button"
                        data-export-hide="true"
                        onClick={(e) => {
                          e.stopPropagation()
                          setAssigningPos(pos)
                          setPlayerSearch('')
                        }}
                        title="Escalar atleta do banco de dados"
                        className="w-4 h-4 rounded bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                      >
                        <Search className="w-2.5 h-2.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Corpo do Card: Lista Dinâmica de Slots Sincronizados com a Tabela */}
                  <div className="space-y-1.5 max-h-[230px] overflow-y-auto pr-0.5 custom-scrollbar">
                    {currentSlots.length === 0 ? (
                      /* Posição sem linhas: exibe card vazio com a exata mesma altura, largura e espaçamento */
                      <div
                        data-player-card="true"
                        onDragOver={(e) => {
                          e.stopPropagation()
                          handleDragOver(e, `${pos.id}-empty`)
                        }}
                        onDragLeave={(e) => {
                          e.stopPropagation()
                          handleDragLeave(e, `${pos.id}-empty`)
                        }}
                        onDrop={(e) => handleDropOnSlot(e, pos.id, 0)}
                        onClick={() => {
                          setAssigningPos(pos)
                          setPlayerSearch('')
                        }}
                        className={`w-full min-h-[42px] h-[42px] rounded-lg px-2 py-1.5 flex flex-col justify-between transition-all cursor-pointer border ${
                          dragOverTarget === `${pos.id}-empty`
                            ? 'border-2 border-dashed border-emerald-400 bg-emerald-500/20'
                            : 'border-slate-800/80 bg-slate-950/35 hover:border-slate-700'
                        }`}
                      />
                    ) : (
                      currentSlots.map((slot, slotIdx) => {
                        const fullAthlete = resolveSlotAthlete(slot)
                        const isSimulatedActive = fullAthlete.is_simulated_active !== false
                        const isOwnPlayer = Boolean(fullAthlete.is_own_player)
                        const isBlankSlot = !fullAthlete.nome?.trim() && !fullAthlete.id
                        const ageFormatted = formatAthleteBirthYear(fullAthlete)
                        const subDetails = formatAthleteSubDetails(fullAthlete)
                        const slotKey = `${pos.id}-${slotIdx}`
                        const isBeingDragged = draggedItem?.posId === pos.id && draggedItem?.index === slotIdx
                        const isDragOverThis = dragOverTarget === slotKey

                        // Card Vazio (linha criada sem atleta definido):
                        // Totalmente vazio (sem nenhum texto ou placeholder) e com rigorosamente a mesma altura, largura e espaçamento dos cards preenchidos
                        if (isBlankSlot) {
                          return (
                            <div
                              key={slot.slotId || slot.id || slotIdx}
                              data-player-card="true"
                              onDragOver={(e) => {
                                e.stopPropagation()
                                handleDragOver(e, slotKey)
                              }}
                              onDragLeave={(e) => {
                                e.stopPropagation()
                                handleDragLeave(e, slotKey)
                              }}
                              onDrop={(e) => handleDropOnSlot(e, pos.id, slotIdx)}
                              onClick={() => {
                                setAssigningPos({ ...pos, targetSlotIndex: slotIdx })
                                setPlayerSearch('')
                              }}
                              className={`relative w-full min-h-[42px] h-[42px] rounded-lg px-2 py-1.5 flex flex-col justify-between group/row transition-all cursor-pointer border ${
                                isDragOverThis
                                  ? 'border-2 border-dashed border-emerald-500/80 bg-emerald-950/60'
                                  : 'border-slate-800/80 bg-slate-950/35 hover:border-slate-700'
                              }`}
                            >
                              <button
                                type="button"
                                data-export-hide="true"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemovePlayer(pos.id, slotIdx)
                                }}
                                title="Remover linha"
                                className="absolute top-1 right-1 opacity-0 group-hover/row:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )
                        }

                        // Card Preenchido:
                        // Exibe de forma limpa e direta apenas: Nome do Jogador, Idade, Clube Atual, Altura (mantendo os badges discretos de Elenco/Alvo e o toggle de cálculo)
                        return (
                          <div
                            key={slot.slotId || slot.id || slotIdx}
                            data-player-card="true"
                            draggable
                            onDragStart={(e) => handleDragStart(e, pos.id, slotIdx, fullAthlete)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => {
                              e.stopPropagation()
                              handleDragOver(e, slotKey)
                            }}
                            onDragLeave={(e) => {
                              e.stopPropagation()
                              handleDragLeave(e, slotKey)
                            }}
                            onDrop={(e) => handleDropOnSlot(e, pos.id, slotIdx)}
                            className={`w-full min-h-[42px] h-[42px] rounded-lg px-2 py-1.5 flex flex-col justify-between group/row transition-all border ${
                              !isSimulatedActive
                                ? 'opacity-40 grayscale border-dashed border-slate-700 bg-slate-950/40'
                                : isBeingDragged
                                ? 'opacity-40 scale-95 border-dashed border-emerald-400'
                                : isDragOverThis
                                ? 'border-2 border-dashed border-emerald-500/80 bg-emerald-950/60 shadow-md shadow-emerald-500/20'
                                : isOwnPlayer
                                ? 'bg-cyan-950/35 border-cyan-700/40 hover:border-cyan-500/60'
                                : 'bg-emerald-950/35 border-emerald-700/40 hover:border-emerald-500/60'
                            }`}
                          >
                            {/* Linha 1: Toggle de cálculo + Nome + Idade + Badge Elenco/Alvo */}
                            <div className="flex items-center justify-between gap-1 w-full">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <input
                                  type="checkbox"
                                  data-export-hide="true"
                                  checked={isSimulatedActive}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    handleUpdateSlotField(pos.id, slotIdx, {
                                      is_simulated_active: e.target.checked
                                    })
                                  }}
                                  title={
                                    isSimulatedActive
                                      ? 'Ativo na Simulação (desmarque para retirar do cálculo imediatamente)'
                                      : 'Inativo na Simulação (marque para incluir no cálculo)'
                                  }
                                  className="w-3 h-3 rounded accent-emerald-500 cursor-pointer shrink-0"
                                />

                                <span
                                  className={`font-bold text-[11px] leading-tight truncate ${
                                    isSimulatedActive ? 'text-white' : 'text-slate-400 line-through'
                                  }`}
                                  title={fullAthlete.nome}
                                >
                                  {fullAthlete.nome}
                                </span>

                                {ageFormatted && (
                                  <span className="text-[9px] font-semibold text-slate-300 bg-slate-800/90 px-1 py-0.2 rounded shrink-0">
                                    {ageFormatted}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdateSlotField(pos.id, slotIdx, {
                                      is_own_player: !isOwnPlayer
                                    })
                                  }}
                                  title={
                                    isOwnPlayer
                                      ? 'Elenco Atual (clique para alternar para Alvo)'
                                      : 'Alvo de Mercado (clique para alternar para Elenco)'
                                  }
                                  className={`text-[7.5px] font-black uppercase px-1 py-0.2 rounded border transition-colors cursor-pointer ${
                                    isOwnPlayer
                                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                  }`}
                                >
                                  {isOwnPlayer ? 'Elenco' : 'Alvo'}
                                </button>

                                <button
                                  type="button"
                                  data-export-hide="true"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemovePlayer(pos.id, slotIdx)
                                  }}
                                  title="Remover linha / slot"
                                  className="opacity-0 group-hover/row:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>

                            {/* Linha 2: Clube Atual • Altura */}
                            <div className="text-[9.5px] text-slate-400 leading-tight truncate pl-4 h-[13px]" title={subDetails}>
                              {subDetails}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* NÓ TÁTICO COMPACTO MOBILE TOUCH (< 768px) */}
                <div
                  className="md:hidden flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
                  style={{ minWidth: '56px', minHeight: '56px' }}
                  onClick={() => {
                    setAssigningPos(pos)
                    setPlayerSearch('')
                  }}
                  title={pos.label}
                >
                  {firstActiveSlot ? (
                    (() => {
                      const fullFirst = resolveSlotAthlete(firstActiveSlot)
                      const ageFormatted = formatAthleteBirthYear(fullFirst)
                      return (
                        <>
                          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 border-2 border-emerald-300 shadow-lg shadow-black/80 flex items-center justify-center">
                            <span className="text-[10px] font-black text-slate-950 uppercase">{pos.label}</span>
                            {currentSlots.length > 1 && (
                              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-950 text-emerald-400 border border-emerald-500/50 text-[8px] font-black px-1 rounded shadow">
                                +{currentSlots.length - 1}
                              </span>
                            )}
                          </div>
                          <span className="mt-1 text-[10px] font-bold text-white max-w-[75px] truncate text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {fullFirst.nome}
                          </span>
                          <span className="text-[8px] font-semibold text-emerald-300/90 max-w-[70px] truncate text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {fullFirst.clube || fullFirst.ca || ageFormatted || ''}
                          </span>
                        </>
                      )
                    })()
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-emerald-400/60 bg-slate-950/70 shadow-md flex flex-col items-center justify-center text-emerald-400">
                      <span className="text-[8px] font-black uppercase text-emerald-400/90">{pos.label}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>


        {/* ===================================================================== */}
        {/* TABELA DE GESTÃO DE ELENCO & SIMULAÇÃO (SINCRONIZADA COM O CAMPOGRAMA) */}
        {/* ===================================================================== */}
        <section className="w-full max-w-[1400px] mt-6 bg-[#0b121e] border border-slate-800/90 rounded-2xl p-4 md:p-6 shadow-2xl">
          {/* Cabeçalho da Tabela de Gestão */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="text-base md:text-lg font-black text-white tracking-tight uppercase">
                  Tabela de Gestão de Elenco &amp; Simulação
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Sincronização em Tempo Real ⇄ Campograma
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Adicione linhas livremente em cada setor, diferencie atletas do <strong className="text-cyan-300">Elenco Atual</strong> vs <strong className="text-amber-300">Alvos de Mercado</strong> (<strong className="text-emerald-300">Cenário 1 - Plano A</strong> ou <strong className="text-indigo-300">Cenário 2 - Plano B</strong>), e marque/desmarque <strong className="text-emerald-300">Ativo na Simulação</strong>.
              </p>
            </div>

            {/* Resumo Rápido de Controles da Tabela */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-[#111c2e] border border-slate-700/70 flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold">Ativos no Cálculo:</span>
                <span className="font-black text-emerald-400">{teamMetrics.totalConsidered}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#111c2e] border border-slate-700/70 flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold">Elenco Atual:</span>
                <span className="font-black text-cyan-300">{teamMetrics.activeOwnPlayersCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#111c2e] border border-slate-700/70 flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold">Alvos:</span>
                <span className="font-black text-amber-300">{teamMetrics.activeTargetsCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#111c2e] border border-slate-700/70 flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold">Estrangeiros:</span>
                <span className="font-black text-purple-300">{teamMetrics.activeForeignersCount}</span>
              </div>
            </div>
          </div>

          {/* Grupos por Setor / Posição */}
          <div className="space-y-4">
            {orderedPositionsForTable.map((pos) => {
              const sectorInfo = getSectorBadgeAndTitle(pos)
              const currentSlots = slotsData[pos.id] || []
              const activeCountInPos = currentSlots.filter(s => s && s.is_simulated_active !== false && (s.nome?.trim() || s.id)).length
              const posSalaryMetrics = calculatePositionSalaryMetrics(currentSlots, players)

              return (
                <div
                  key={`table-sector-${pos.id}`}
                  className="bg-[#0f1826] border border-slate-800/90 rounded-xl overflow-visible shadow-md transition-all hover:border-slate-700/80"
                >
                  {/* Barra de Título do Setor + Botão '+ Adicionar Linha' */}
                  <div className="px-4 py-2.5 bg-[#131f33] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 rounded-t-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                        {sectorInfo.tag}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-white">
                        {sectorInfo.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        ({activeCountInPos} {activeCountInPos === 1 ? 'ativo' : 'ativos'} de {currentSlots.length} {currentSlots.length === 1 ? 'linha' : 'linhas'})
                      </span>
                      {showFinancials && posSalaryMetrics.totalSalary > 0 && (
                        <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          Subtotal Ativo: {formatBRL(posSalaryMetrics.totalSalary, false)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAssigningPos(pos)
                          setPlayerSearch('')
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Selecionar atleta existente na base de dados"
                      >
                        <Search className="w-3 h-3 text-emerald-400" />
                        <span>Buscar na Base</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddEmptySlot(pos.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-sm shadow-emerald-500/20 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>+ Adicionar Linha</span>
                      </button>
                    </div>
                  </div>

                  {/* Tabela de Linhas do Setor */}
                  {currentSlots.length === 0 ? (
                    <div className="px-4 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <span>Nenhuma linha cadastrada neste setor.</span>
                      <button
                        type="button"
                        onClick={() => handleAddEmptySlot(pos.id)}
                        className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                      >
                        Clique em &quot;+ Adicionar Linha&quot; para iniciar
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1060px]">
                        <thead>
                          <tr className="border-b border-slate-800/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#0b1320]">
                            <th className="py-2 px-3 w-[105px] text-center">Ativo na Simulação</th>
                            <th className="py-2 px-3 w-[115px] text-center">Elenco Atual</th>
                            <th className="py-2 px-3 w-[195px] text-center">Prioridade do Alvo</th>
                            <th className="py-2 px-3 min-w-[220px]">Nome do Atleta (Base ou Livre)</th>
                            <th className="py-2 px-3 w-[140px]">Salário Mensal (R$)</th>
                            <th className="py-2 px-3 w-[95px]">Altura (cm)</th>
                            <th className="py-2 px-3 w-[130px]">Idade / Ano Nasc.</th>
                            <th className="py-2 px-3 w-[105px] text-center">Estrangeiro</th>
                            <th className="py-2 px-3 min-w-[150px]">Clube Atual / Vínculo</th>
                            <th className="py-2 px-3 w-[55px] text-center">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-xs">
                          {currentSlots.map((slot, slotIdx) => {
                            const fullAthlete = resolveSlotAthlete(slot)
                            const isSimulatedActive = fullAthlete.is_simulated_active !== false
                            const isOwnPlayer = Boolean(fullAthlete.is_own_player)
                            const isForeign = Boolean(fullAthlete.is_foreign)
                            const targetPlan = fullAthlete.target_plan === 'PLANO_B' ? 'PLANO_B' : 'PLANO_A'
                            const rowKey = `${pos.id}-${slotIdx}`
                            const isAutocompleteOpen = activeRowAutocomplete === rowKey

                            const currentSalaryNum = getAthleteSalary(fullAthlete, players)
                            const rawSalaryDisplay = slot.salaryCleared
                              ? ''
                              : (slot.estimated_salary !== undefined && slot.estimated_salary !== null && slot.estimated_salary !== ''
                                ? slot.estimated_salary
                                : (currentSalaryNum > 0 ? currentSalaryNum : ''))

                            const rawHeightVal = slot.alt !== undefined
                              ? slot.alt
                              : (fullAthlete.alt || fullAthlete.altura || '')

                            const rawAgeOrYearVal = slot.an !== undefined
                              ? slot.an
                              : (fullAthlete.an || fullAthlete.anoNascimento || fullAthlete.idade || '')

                            const { age: calcAge, birthYear: calcBirthYear } = extractAgeAndBirthYear(fullAthlete)

                            const rawClubVal = slot.ca !== undefined
                              ? slot.ca
                              : (fullAthlete.ca || fullAthlete.clube || '')

                            // Sugestões de autocomplete para o input de Nome
                            const nameQuery = (fullAthlete.nome || '').trim().toLowerCase()
                            const autocompleteMatches = isAutocompleteOpen
                              ? players
                                  .filter(p => {
                                    if (!nameQuery) {
                                      return (pos.matchPositions || []).includes(p.posicao)
                                    }
                                    return (
                                      (p.nome || '').toLowerCase().includes(nameQuery) ||
                                      (p.ca || '').toLowerCase().includes(nameQuery)
                                    )
                                  })
                                  .slice(0, 8)
                              : []

                            return (
                              <tr
                                key={slot.slotId || slot.id || slotIdx}
                                className={`transition-all ${
                                  !isSimulatedActive
                                    ? 'opacity-40 grayscale bg-slate-950/50'
                                    : isOwnPlayer
                                    ? 'bg-cyan-950/10 hover:bg-cyan-950/20'
                                    : 'hover:bg-slate-800/40'
                                }`}
                              >
                                {/* 1. Checkbox: Ativo na Simulação (is_simulated_active) */}
                                <td className="py-2 px-3 text-center">
                                  <label className="inline-flex items-center justify-center gap-1.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={isSimulatedActive}
                                      onChange={(e) =>
                                        handleUpdateSlotField(pos.id, slotIdx, {
                                          is_simulated_active: e.target.checked
                                        })
                                      }
                                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                                    />
                                    <span
                                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                                        isSimulatedActive
                                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                          : 'bg-slate-800 text-slate-400 border-slate-700'
                                      }`}
                                    >
                                      {isSimulatedActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                  </label>
                                </td>

                                {/* 2. Checkbox: Elenco Atual / Meu Jogador (is_own_player) */}
                                <td className="py-2 px-3 text-center">
                                  <label className="inline-flex items-center justify-center gap-1.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={isOwnPlayer}
                                      onChange={(e) =>
                                        handleUpdateSlotField(pos.id, slotIdx, {
                                          is_own_player: e.target.checked
                                        })
                                      }
                                      className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                                    />
                                    <span
                                      className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                                        isOwnPlayer
                                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      }`}
                                    >
                                      {isOwnPlayer ? 'Elenco' : 'Alvo'}
                                    </span>
                                  </label>
                                </td>

                                {/* 2B. Classificação de Alvos: Cenário 1 (Plano A) vs Cenário 2 (Plano B) */}
                                <td className="py-2 px-3 text-center">
                                  {isOwnPlayer ? (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold"
                                      title="Atleta do Elenco Real — incluído automaticamente na base fixa de todos os cenários"
                                    >
                                      <UserCheck className="w-3 h-3 text-cyan-400" />
                                      <span>Base Fixa (Elenco Real)</span>
                                    </span>
                                  ) : (
                                    <div className="inline-flex items-center bg-[#080d16] p-0.5 rounded-lg border border-slate-700/80">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateSlotField(pos.id, slotIdx, {
                                            target_plan: 'PLANO_A'
                                          })
                                        }
                                        title="Incluir este alvo no Cenário 1 (Plano A)"
                                        className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                                          targetPlan === 'PLANO_A'
                                            ? 'bg-emerald-500 text-slate-950 shadow-xs'
                                            : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                      >
                                        Cenário 1 (Plano A)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateSlotField(pos.id, slotIdx, {
                                            target_plan: 'PLANO_B'
                                          })
                                        }
                                        title="Incluir este alvo no Cenário 2 (Plano B)"
                                        className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                                          targetPlan === 'PLANO_B'
                                            ? 'bg-indigo-500 text-white shadow-xs'
                                            : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                      >
                                        Cenário 2 (Plano B)
                                      </button>
                                    </div>
                                  )}
                                </td>

                                {/* 3. Nome do Atleta (com seletor/autocomplete buscando de players OU digitação livre) */}
                                <td className="py-2 px-3 relative">
                                  <div className="flex items-center gap-1.5">
                                    <div className="relative flex-1">
                                      <input
                                        type="text"
                                        value={fullAthlete.nome || ''}
                                        onFocus={() => setActiveRowAutocomplete(rowKey)}
                                        onBlur={() => {
                                          setTimeout(() => {
                                            setActiveRowAutocomplete(prev => (prev === rowKey ? null : prev))
                                          }, 180)
                                        }}
                                        onChange={(e) => {
                                          setActiveRowAutocomplete(rowKey)
                                          handleUpdateSlotField(pos.id, slotIdx, {
                                            nome: e.target.value
                                          })
                                        }}
                                        placeholder="Digite o nome ou busque na base..."
                                        className="w-full bg-[#090f19] border border-slate-700/80 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white placeholder-slate-500 focus:outline-none"
                                      />

                                      {/* Dropdown de Autocomplete da Base (scout_players) */}
                                      {isAutocompleteOpen && autocompleteMatches.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#0b1322] border border-slate-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto divide-y divide-slate-800/70">
                                          <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-emerald-400 bg-slate-900/90 flex items-center justify-between">
                                            <span>Sugestões da Base de Dados</span>
                                            <span className="text-slate-500">Clique p/ vincular</span>
                                          </div>
                                          {autocompleteMatches.map((dbPlayer) => (
                                            <button
                                              key={dbPlayer.id}
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault()
                                                handleSelectDatabasePlayerForSlot(pos.id, slotIdx, dbPlayer)
                                              }}
                                              className="w-full px-3 py-1.5 text-left hover:bg-emerald-500/15 flex items-center justify-between gap-2 transition cursor-pointer"
                                            >
                                              <div className="min-w-0">
                                                <div className="text-xs font-bold text-white truncate">
                                                  {dbPlayer.nome}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate">
                                                  {dbPlayer.ca || 'Sem clube'} • {getPositionLabel(dbPlayer.posicao)}
                                                  {dbPlayer.alt ? ` • ${dbPlayer.alt}cm` : ''}
                                                  {dbPlayer.an ? ` • ${dbPlayer.an}` : ''}
                                                </div>
                                              </div>
                                              {dbPlayer.nivel && (
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${getNivelStyle(dbPlayer.nivel)}`}>
                                                  {dbPlayer.nivel}
                                                </span>
                                              )}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAssigningPos({ ...pos, targetSlotIndex: slotIdx })
                                        setPlayerSearch('')
                                      }}
                                      title="Abrir catálogo de atletas para esta linha"
                                      className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700 transition cursor-pointer shrink-0"
                                    >
                                      <Search className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>

                                {/* 4. Salário Mensal (R$) */}
                                <td className="py-2 px-3">
                                  <div className="relative flex items-center">
                                    <span className="absolute left-2.5 text-[10px] font-bold text-slate-500 pointer-events-none">
                                      R$
                                    </span>
                                    <input
                                      type="number"
                                      step="1000"
                                      min="0"
                                      value={rawSalaryDisplay}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        if (val === '') {
                                          handleUpdateSlotField(pos.id, slotIdx, {
                                            estimated_salary: null,
                                            salarioEstimado: null,
                                            salaryCleared: true
                                          })
                                        } else {
                                          const num = Number(val)
                                          handleUpdateSlotField(pos.id, slotIdx, {
                                            estimated_salary: isNaN(num) ? null : num,
                                            salarioEstimado: isNaN(num) ? null : num,
                                            salaryCleared: false
                                          })
                                        }
                                      }}
                                      placeholder="0"
                                      className="w-full bg-[#090f19] border border-slate-700/80 focus:border-amber-400 rounded-lg pl-7 pr-2 py-1.5 text-xs font-bold text-amber-300 placeholder-slate-600 focus:outline-none"
                                    />
                                  </div>
                                </td>

                                {/* 5. Altura (cm) */}
                                <td className="py-2 px-3">
                                  <div className="relative flex items-center">
                                    <input
                                      type="text"
                                      value={rawHeightVal}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        handleUpdateSlotField(pos.id, slotIdx, {
                                          alt: val,
                                          altura: val
                                        })
                                      }}
                                      placeholder="Ex: 186"
                                      className="w-full bg-[#090f19] border border-slate-700/80 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-300 placeholder-slate-600 focus:outline-none"
                                    />
                                  </div>
                                </td>

                                {/* 6. Idade / Ano de nascimento */}
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={rawAgeOrYearVal}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        handleUpdateSlotField(pos.id, slotIdx, {
                                          an: val,
                                          anoNascimento: val,
                                          idade: val
                                        })
                                      }}
                                      placeholder="Ex: 2001 ou 25"
                                      className="w-full bg-[#090f19] border border-slate-700/80 focus:border-emerald-500 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-200 placeholder-slate-600 focus:outline-none"
                                    />
                                    {(calcAge || calcBirthYear) && (
                                      <span
                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 shrink-0"
                                        title={calcBirthYear && calcAge ? `Ano: ${calcBirthYear} • Idade: ${calcAge} anos` : ''}
                                      >
                                        {calcAge ? `${calcAge}a` : `${calcBirthYear}`}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* 7. Flag Estrangeiro (is_foreign) */}
                                <td className="py-2 px-3 text-center">
                                  <label className="inline-flex items-center justify-center gap-1.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={isForeign}
                                      onChange={(e) =>
                                        handleUpdateSlotField(pos.id, slotIdx, {
                                          is_foreign: e.target.checked
                                        })
                                      }
                                      className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                                    />
                                    <span
                                      className={`text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                                        isForeign
                                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                          : 'bg-slate-800/70 text-slate-500 border-slate-700/60'
                                      }`}
                                    >
                                      {isForeign ? 'EST' : 'NAC'}
                                    </span>
                                  </label>
                                </td>

                                {/* 8. Clube Atual / Vínculo */}
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={rawClubVal}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      handleUpdateSlotField(pos.id, slotIdx, {
                                        ca: val,
                                        clube: val
                                      })
                                    }}
                                    placeholder="Clube atual / vínculo..."
                                    className="w-full bg-[#090f19] border border-slate-700/80 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                                  />
                                </td>

                                {/* 9. Ação de excluir a linha (sincronizado com o campograma) */}
                                <td className="py-2 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePlayer(pos.id, slotIdx)}
                                    title="Excluir linha (remove também do campograma)"
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition cursor-pointer inline-flex items-center justify-center"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ===================================================================== */}
        {/* BALANÇO FINANCEIRO & BIOMÉTRICO DOS CENÁRIOS (MULTI-CENÁRIOS + DELTA) */}
        {/* ===================================================================== */}
        <section className="w-full max-w-[1400px] mt-6 mb-8 bg-gradient-to-b from-[#0c1524] to-[#09101b] border border-slate-800/90 rounded-2xl p-4 md:p-6 shadow-2xl">
          {/* Cabeçalho Expansível */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base md:text-lg font-black text-white tracking-tight uppercase">
                    Balanço Financeiro &amp; Biométrico dos Cenários
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Comparativo Executivo Multi-Cenários
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparação direta entre a base fixa (<strong className="text-cyan-300">Elenco Real</strong>), a projeção com alvos prioritários (<strong className="text-emerald-300">Cenário 1 — Plano A</strong>) e a alternativa secundária (<strong className="text-indigo-300">Cenário 2 — Plano B</strong>).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsScenarioBalanceOpen(!isScenarioBalanceOpen)}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer self-start sm:self-auto shrink-0"
            >
              {isScenarioBalanceOpen ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isScenarioBalanceOpen ? 'Recolher Balanço' : 'Expandir Balanço'}</span>
            </button>
          </div>

          {isScenarioBalanceOpen && (
            <div className="mt-5 space-y-6 animate-in fade-in duration-200">
              {/* 1. CARD DE VARIAÇÃO (DELTA EXECUTIVO: CENÁRIO 1 VS CENÁRIO 2) */}
              <div className="bg-[#101b2e] border border-indigo-500/30 rounded-2xl p-4 md:p-5 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3.5 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-white">
                      Card de Variação — Delta Executivo (Cenário 2 Plano B vs Cenário 1 Plano A)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Impacto direto ao optar pela lista de alvos do <strong className="text-indigo-300">Plano B</strong> em relação ao <strong className="text-emerald-300">Plano A</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Delta 1: Diferença Mensal de Folha */}
                  <div className="bg-[#0b1320] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Diferença Mensal de Folha</span>
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div
                      className={`text-lg md:text-xl font-black my-1 ${
                        scenarioComparisonData.delta.monthlyDiff < 0
                          ? 'text-emerald-400'
                          : scenarioComparisonData.delta.monthlyDiff > 0
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {scenarioComparisonData.delta.monthlyDiff === 0
                        ? 'R$ 0,00 / mês'
                        : `${scenarioComparisonData.delta.monthlyDiff > 0 ? '+' : '-'} ${formatBRL(
                            Math.abs(scenarioComparisonData.delta.monthlyDiff),
                            true
                          )} / mês`}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {scenarioComparisonData.delta.monthlyDiff < 0 ? (
                        <span className="text-emerald-300 font-semibold">
                          Cenário 2 (Plano B) gera economia mensal na folha
                        </span>
                      ) : scenarioComparisonData.delta.monthlyDiff > 0 ? (
                        <span className="text-rose-300 font-semibold">
                          Cenário 2 (Plano B) exige maior investimento mensal
                        </span>
                      ) : (
                        <span>Mesmo custo mensal entre Plano A e Plano B</span>
                      )}
                    </div>
                  </div>

                  {/* Delta 2: Diferença Anual Projetada (12m e 13,3m) */}
                  <div className="bg-[#0b1320] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Impacto no Orçamento Anual</span>
                      <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div
                      className={`text-lg md:text-xl font-black my-1 ${
                        scenarioComparisonData.delta.annualDiff12 < 0
                          ? 'text-emerald-400'
                          : scenarioComparisonData.delta.annualDiff12 > 0
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {scenarioComparisonData.delta.annualDiff12 === 0
                        ? 'R$ 0,00 / ano (12x)'
                        : `${scenarioComparisonData.delta.annualDiff12 > 0 ? '+' : '-'} ${formatBRL(
                            Math.abs(scenarioComparisonData.delta.annualDiff12),
                            false
                          )} (12x)`}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Com 13º + férias (13,33x):</span>
                      <strong className="text-slate-200">
                        {scenarioComparisonData.delta.annualDiff13 === 0
                          ? 'R$ 0'
                          : `${scenarioComparisonData.delta.annualDiff13 > 0 ? '+' : '-'} ${formatBRL(
                              Math.abs(scenarioComparisonData.delta.annualDiff13),
                              false
                            )}`}
                      </strong>
                    </div>
                  </div>

                  {/* Delta 3: Diferença Física & Biométrica (Altura e Idade) */}
                  <div className="bg-[#0b1320] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Diferença Física (Altura &amp; Idade)</span>
                      <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-4 my-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Δ Altura Média</span>
                        <span className="text-base font-black text-emerald-300">
                          {scenarioComparisonData.delta.heightDiff === null
                            ? '—'
                            : `${scenarioComparisonData.delta.heightDiff > 0 ? '+' : ''}${scenarioComparisonData.delta.heightDiff.toFixed(1)} cm`}
                        </span>
                      </div>
                      <div className="h-7 w-[1px] bg-slate-800" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Δ Idade Média</span>
                        <span className="text-base font-black text-amber-300">
                          {scenarioComparisonData.delta.ageDiff === null
                            ? '—'
                            : `${scenarioComparisonData.delta.ageDiff > 0 ? '+' : ''}${scenarioComparisonData.delta.ageDiff.toFixed(1)} anos`}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Variação de Estrangeiros:</span>
                      <strong className="text-purple-300">
                        {scenarioComparisonData.delta.foreignersDiff > 0
                          ? `+${scenarioComparisonData.delta.foreignersDiff}`
                          : scenarioComparisonData.delta.foreignersDiff}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. TABELA EXECUTIVA DE CENÁRIOS (3 COLUNAS) */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse min-w-[820px]">
                  <thead>
                    <tr className="bg-[#111c2e] border-b border-slate-800">
                      <th className="py-3.5 px-4 text-xs font-black uppercase tracking-wider text-slate-300 w-[26%]">
                        Indicador Executivo / Setor
                      </th>
                      <th className="py-3.5 px-4 w-[24.6%] border-l border-slate-800/80 bg-cyan-950/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                            Coluna 1: Elenco Real
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {scenarioComparisonData.elencoReal.totalAthletes} atletas
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          Apenas atletas com Elenco Atual = Sim
                        </div>
                      </th>
                      <th className="py-3.5 px-4 w-[24.6%] border-l border-slate-800/80 bg-emerald-950/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                            Coluna 2: Cenário 1 (Plano A)
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {scenarioComparisonData.cenario1.totalAthletes} atletas ({scenarioComparisonData.cenario1.targetCount} alvos A)
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          Elenco Real + Alvos Plano A ativos
                        </div>
                      </th>
                      <th className="py-3.5 px-4 w-[24.6%] border-l border-slate-800/80 bg-indigo-950/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                            Coluna 3: Cenário 2 (Plano B)
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {scenarioComparisonData.cenario2.totalAthletes} atletas ({scenarioComparisonData.cenario2.targetCount} alvos B)
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          Elenco Real + Alvos Plano B ativos
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs bg-[#0b1320]">
                    {/* Linha 1: Folha Salarial Total (R$) */}
                    <tr className="hover:bg-slate-900/60">
                      <td className="py-3 px-4 font-extrabold text-slate-200 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Folha Salarial Total (R$)</span>
                      </td>
                      {[scenarioComparisonData.elencoReal, scenarioComparisonData.cenario1, scenarioComparisonData.cenario2].map((col, idx) => (
                        <td key={`payroll-${idx}`} className="py-3 px-4 border-l border-slate-800/70 font-black text-sm text-amber-300">
                          {formatBRL(col.totalPayroll, true)}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 2: Saldo Disponível no Teto (R$) */}
                    <tr className="hover:bg-slate-900/60">
                      <td className="py-3 px-4 font-extrabold text-slate-200 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Saldo Disponível no Teto (R$)</span>
                      </td>
                      {[scenarioComparisonData.elencoReal, scenarioComparisonData.cenario1, scenarioComparisonData.cenario2].map((col, idx) => (
                        <td
                          key={`balance-${idx}`}
                          className={`py-3 px-4 border-l border-slate-800/70 font-black text-sm ${
                            col.isOverBudget ? 'text-rose-400' : 'text-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>
                              {col.isOverBudget
                                ? `- ${formatBRL(Math.abs(col.availableBalance), true)}`
                                : `+ ${formatBRL(col.availableBalance, true)}`}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                                col.isOverBudget
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {col.isOverBudget ? 'ACIMA DO TETO' : 'DENTRO DO TETO'}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Linha 3: % de Comprometimento do Teto */}
                    <tr className="hover:bg-slate-900/60">
                      <td className="py-3 px-4 font-extrabold text-slate-200 flex items-center gap-2">
                        <Percent className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>% de Comprometimento do Teto</span>
                      </td>
                      {[scenarioComparisonData.elencoReal, scenarioComparisonData.cenario1, scenarioComparisonData.cenario2].map((col, idx) => (
                        <td key={`pct-${idx}`} className="py-3 px-4 border-l border-slate-800/70">
                          <div className="flex items-center justify-between text-xs font-black mb-1">
                            <span className={col.isOverBudget ? 'text-rose-400' : 'text-slate-100'}>
                              {col.commitmentPct.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              Teto: {formatCompactBRL(budgetCeiling)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                col.isOverBudget
                                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                                  : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                              }`}
                              style={{ width: `${Math.min(100, col.commitmentPct)}%` }}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Linha 4: Média de Idade (anos) */}
                    <tr className="hover:bg-slate-900/60">
                      <td className="py-3 px-4 font-extrabold text-slate-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Média de Idade (anos)</span>
                      </td>
                      {[scenarioComparisonData.elencoReal, scenarioComparisonData.cenario1, scenarioComparisonData.cenario2].map((col, idx) => (
                        <td key={`age-${idx}`} className="py-3 px-4 border-l border-slate-800/70 font-bold text-slate-100">
                          {col.avgAge ? (
                            <span>
                              <strong className="text-amber-300 text-sm font-black">{col.avgAge} anos</strong>{' '}
                              <span className="text-[10px] text-slate-500">({col.countAge} atletas)</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 5: Média de Altura (cm) */}
                    <tr className="hover:bg-slate-900/60">
                      <td className="py-3 px-4 font-extrabold text-slate-200 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Média de Altura (cm)</span>
                      </td>
                      {[scenarioComparisonData.elencoReal, scenarioComparisonData.cenario1, scenarioComparisonData.cenario2].map((col, idx) => (
                        <td key={`height-${idx}`} className="py-3 px-4 border-l border-slate-800/70 font-bold text-slate-100">
                          {col.avgHeight ? (
                            <span>
                              <strong className="text-emerald-300 text-sm font-black">{col.avgHeight} cm</strong>{' '}
                              <span className="text-[10px] text-slate-500">({col.countHeight} atletas)</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 6: Total de Estrangeiros */}
                    <tr className="hover:bg-slate-900/60">
                      <td className="py-3 px-4 font-extrabold text-slate-200 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Total de Estrangeiros</span>
                      </td>
                      {[scenarioComparisonData.elencoReal, scenarioComparisonData.cenario1, scenarioComparisonData.cenario2].map((col, idx) => (
                        <td key={`foreign-${idx}`} className="py-3 px-4 border-l border-slate-800/70">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 font-black text-xs">
                            {col.foreignersCount} {col.foreignersCount === 1 ? 'estrangeiro' : 'estrangeiros'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Divisor: Distribuição por Setor (R$ e %) */}
                    <tr className="bg-[#0e1829]">
                      <td colSpan={4} className="py-2 px-4 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        Distribuição Orçamentária por Macro-Setor (R$ Mensal e % sobre a Folha do Cenário)
                      </td>
                    </tr>

                    {[
                      { key: 'GOLEIROS', label: 'Setor: Goleiros' },
                      { key: 'DEFESA', label: 'Setor: Defesa (Zagueiros + Laterais/Alas)' },
                      { key: 'MEIO_CAMPO', label: 'Setor: Meio-Campo (Volantes + Meias)' },
                      { key: 'ATAQUE', label: 'Setor: Ataque (Extremos + Centroavantes)' }
                    ].map((sec) => (
                      <tr key={`sector-row-${sec.key}`} className="hover:bg-slate-900/60">
                        <td className="py-2.5 px-4 font-bold text-slate-300 pl-6">
                          {sec.label}
                        </td>
                        {[scenarioComparisonData.elencoReal, scenarioComparisonData.cenario1, scenarioComparisonData.cenario2].map((col, idx) => {
                          const secData = col.sectors[sec.key]
                          return (
                            <td key={`sec-${sec.key}-${idx}`} className="py-2.5 px-4 border-l border-slate-800/70">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-100">
                                  {formatBRL(secData.amount, false)}
                                </span>
                                <span className="text-[10.5px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded">
                                  {secData.pct.toFixed(1)}%
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {secData.count} {secData.count === 1 ? 'atleta ativo' : 'atletas ativos'} no setor
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 4. MODAL DE SELEÇÃO DO BANCO */}
      {assigningPos && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d16]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Escalar para: <span className="text-emerald-400">{assigningPos.label}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Selecione um atleta cadastrado no banco de dados
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAssigningPos(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Campo de Busca e Filtros Rápidos */}
            <div className="p-4 border-b border-slate-800/80 bg-[#0a0f1a] space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar pelo nome, clube, posição..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/60"
                  autoFocus
                />
              </div>

              {/* Filtros rápidos: Sugeridos vs Todos */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerFilterTab('SUGERIDOS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    playerFilterTab === 'SUGERIDOS'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/10'
                      : 'bg-[#131d2e] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  Sugeridos para a Posição
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerFilterTab('TODOS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    playerFilterTab === 'TODOS'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/10'
                      : 'bg-[#131d2e] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  Todos do Banco ({players.length})
                </button>
              </div>
            </div>

            {/* Lista de Atletas Elegíveis */}
            <div className="p-4 max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
              {candidatePlayers.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Nenhum atleta encontrado para os critérios selecionados.
                </div>
              ) : (
                candidatePlayers.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => {
                      if (!player.isAlreadyAssigned) {
                        handleAssignPlayer(player)
                      }
                    }}
                    className={`bg-[#0f172a] border rounded-xl p-3 flex items-center justify-between transition-all ${
                      player.isAlreadyAssigned
                        ? 'opacity-50 border-slate-800 cursor-not-allowed'
                        : 'hover:bg-[#152238] border-slate-800 hover:border-emerald-500/50 cursor-pointer group'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-xs ${player.isAlreadyAssigned ? 'text-slate-400' : 'text-white group-hover:text-emerald-300'} transition-colors`}>
                          {player.nome}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getNivelStyle(player.nivel)}`}>
                          {player.nivel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {player.ca || 'Sem clube'} &bull; <span className="font-mono">{player.an}</span> &bull;{' '}
                        <span className="text-slate-300 font-semibold">{getPositionLabel(player.posicao)}</span>
                        {player.posSecundaria && player.posSecundaria !== '—' && (
                          <span className="text-slate-500"> ({player.posSecundaria})</span>
                        )}
                      </div>
                    </div>

                    {player.isAlreadyAssigned ? (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-semibold text-[10px] border border-slate-700">
                        Já escalado
                      </span>
                    ) : (
                      <button className="px-3 py-1 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-slate-950 font-bold text-xs border border-emerald-500/30 transition-colors cursor-pointer">
                        + Escalar
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL DE CRIAR NOVO TIME SOMBRA */}
      {isNewTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d16]">
              <h3 className="font-bold text-sm text-white">
                Novo Time Sombra / Cenário
              </h3>
              <button
                onClick={() => setIsNewTeamModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTeam} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Nome do Cenário *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Série B 2027, Alternativo Sub-23..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-[#131d2e] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTeamModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newTeamName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Criar Cenário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL DE RENOMEAR TIME SOMBRA */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d16]">
              <h3 className="font-bold text-sm text-white">
                Renomear Time Sombra
              </h3>
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameTeam} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Novo Nome *
                </label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full bg-[#131d2e] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!renameValue.trim()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL DE EDIÇÃO RÁPIDA DE SALÁRIO ESTIMADO */}
      {editingSalary && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-[#0b121e] border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-4 bg-gradient-to-r from-[#101b2d] to-[#0d1624] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Editar Salário Estimado</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                    {editingSalary.athlete.nome} &bull; {editingSalary.posLabel || 'Atleta'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSalary(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveAthleteSalary(
                  editingSalary.posId,
                  editingSalary.athleteIndex,
                  editingSalary.athlete,
                  salaryInputVal
                )
              }}
              className="p-5 space-y-4"
            >
              {/* Card Resumo do Atleta */}
              <div className="flex items-center justify-between bg-[#111a29] p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">{editingSalary.athlete.nome}</div>
                  <div className="text-[11px] text-slate-400">
                    {editingSalary.athlete.clubeAtual || editingSalary.athlete.ca || editingSalary.athlete.clube || 'Sem clube'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getNivelStyle(editingSalary.athlete.nivel)}`}>
                    Tier {editingSalary.athlete.nivel || '—'}
                  </span>
                </div>
              </div>

              {/* Campo de Salário Estimado */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  Salário Mensal Estimado (R$) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={salaryInputVal}
                    onChange={(e) => setSalaryInputVal(e.target.value)}
                    placeholder="R$ 80.000,00"
                    className="w-full bg-[#070b13] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-base font-black text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Recalcula automaticamente a folha projetada dos 11 titulares e o saldo disponível.
                </p>
              </div>

              {/* Sugestões Rápidas de Mercado */}
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400 mb-2">
                  Atalhos Rápidos de Mercado:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[25000, 45000, 85000, 130000, 220000, 350000].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSalaryInputVal(formatBRL(s, true))}
                      className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-semibold transition cursor-pointer text-center"
                    >
                      {formatCompactBRL(s)}
                    </button>
                  ))}
                </div>

                {/* Botão de Sugestão pelo Tier do Atleta */}
                <button
                  type="button"
                  onClick={() => setSalaryInputVal(formatBRL(getDefaultEstimatedSalary(editingSalary.athlete.nivel), true))}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition cursor-pointer text-center"
                >
                  Usar Padrão do Tier {editingSalary.athlete.nivel}: {formatBRL(getDefaultEstimatedSalary(editingSalary.athlete.nivel), true)}
                </button>
              </div>

              {/* Botões de Ação */}
              <div className="p-3 -mx-5 -mb-5 mt-4 bg-[#0a0f18] border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingSalary(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Salvar Salário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Completo de Edição de Atleta com Sanitização Rigorosa */}
      {editingFullPlayer && (
        <PlayerModal
          isOpen={Boolean(editingFullPlayer)}
          onClose={() => setEditingFullPlayer(null)}
          onSave={async (savedPlayerData) => {
            let result = null
            if (onSavePlayer) {
              result = await onSavePlayer(savedPlayerData)
            } else {
              try {
                const cached = localStorage.getItem('scout_players') || localStorage.getItem('radar_players')
                if (cached) {
                  const list = JSON.parse(cached)
                  const updated = list.map(p => String(p.id) === String(savedPlayerData.id) ? { ...p, ...savedPlayerData } : p)
                  localStorage.setItem('scout_players', JSON.stringify(updated))
                  localStorage.setItem('radar_players', JSON.stringify(updated))
                }
              } catch (e) {}
              result = await upsertPlayerToSupabase(savedPlayerData)
            }

            // Sincroniza atleta atualizado nas escalações do Time Sombra
            setShadowTeams(prev => prev.map(team => {
              let changed = false
              const nextEscalacao = { ...team.escalacao }
              Object.keys(nextEscalacao).forEach(posKey => {
                const list = nextEscalacao[posKey] || []
                const updatedList = list.map(item => {
                  if (String(item.id) === String(savedPlayerData.id) || (item.nome && item.nome === savedPlayerData.nome)) {
                    changed = true
                    return {
                      ...item,
                      ...savedPlayerData
                    }
                  }
                  return item
                })
                if (changed) {
                  nextEscalacao[posKey] = updatedList
                }
              })
              if (changed) {
                const updatedTeam = { ...team, escalacao: nextEscalacao }
                saveShadowTeamToSupabase(updatedTeam)
                return updatedTeam
              }
              return team
            }))

            setEditingFullPlayer(null)
            return result
          }}
          playerToEdit={editingFullPlayer}
        />
      )}
    </div>
  )
}

