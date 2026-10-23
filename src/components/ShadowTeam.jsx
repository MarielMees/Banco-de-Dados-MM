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
      is_foreign: Boolean(slot.is_foreign !== undefined ? slot.is_foreign : base?.is_foreign)
    }
  }

  // Base do cálculo de métricas físicas, etárias e orçamentárias ('COMPLETO' considera todas as linhas ativas na simulação)
  const [metricsScope, setMetricsScope] = useState('COMPLETO')

  // Métricas e Cálculos Financeiros em Tempo Real (unificados com metricsScope e is_simulated_active)
  const budgetCeiling = activeTeam.budget_ceiling !== undefined && activeTeam.budget_ceiling !== null
    ? Number(activeTeam.budget_ceiling)
    : 2500000

  const payrollStats = useMemo(() => {
    return calculateTeamPayroll(activeFormation.positions, slotsData, players, metricsScope)
  }, [activeFormation, slotsData, players, metricsScope])

  const folhaProjetada = payrollStats.folhaProjetada
  const saldoOrcamentario = budgetCeiling - folhaProjetada
  const isBudgetExceeded = saldoOrcamentario < 0
  const percentualComprometido = budgetCeiling > 0 ? (folhaProjetada / budgetCeiling) * 100 : 0

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

  // Cálculo das métricas de Idade, Altura, Elenco Atual vs Alvos e Estrangeiros (respeitando is_simulated_active)
  const teamMetrics = useMemo(() => {
    const targetAthletes = []
    let activeOwnPlayersCount = 0
    let activeTargetsCount = 0
    let activeForeignersCount = 0

    activeFormation.positions.forEach(pos => {
      const currentSlots = slotsData[pos.id] || []
      if (currentSlots.length === 0) return

      const activeSlots = currentSlots.filter(s => s && s.is_simulated_active !== false)

      const slotsToProcess = metricsScope === 'TITULARES'
        ? (activeSlots[0] ? [activeSlots[0]] : [])
        : activeSlots

      slotsToProcess.forEach(slot => {
        const full = resolveSlotAthlete(slot)
        if (!full) return
        // Ignora linhas em branco sem nome e sem id nas contagens e médias
        if (!full.nome?.trim() && !full.id) return
        targetAthletes.push(full)
        if (full.is_own_player) {
          activeOwnPlayersCount += 1
        } else {
          activeTargetsCount += 1
        }
        if (full.is_foreign) {
          activeForeignersCount += 1
        }
      })
    })

    // 1. Média de Idade
    let totalAge = 0
    let countAge = 0

    targetAthletes.forEach(athlete => {
      const { age } = extractAgeAndBirthYear(athlete)
      if (age !== null && age >= 14 && age <= 55) {
        totalAge += age
        countAge += 1
      }
    })

    const avgAge = countAge > 0 ? (totalAge / countAge).toFixed(1) : null

    // 2. Média de Altura
    let totalHeight = 0
    let countHeight = 0

    targetAthletes.forEach(athlete => {
      const rawAlt = athlete.alt !== undefined && athlete.alt !== '' ? athlete.alt : athlete.altura
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

    const avgHeight = countHeight > 0 ? (totalHeight / countHeight).toFixed(1) : null

    return {
      avgAge,
      countAge,
      avgHeight,
      countHeight,
      totalConsidered: targetAthletes.length,
      activeOwnPlayersCount,
      activeTargetsCount,
      activeForeignersCount
    }
  }, [activeFormation, slotsData, players, metricsScope])

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
      is_foreign: false
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
    const { age, birthYear } = extractAgeAndBirthYear(athlete)
    if (birthYear && age) {
      return `${String(birthYear).slice(-2)}' (${age}a)`
    }
    if (birthYear) {
      return `${String(birthYear).slice(-2)}'`
    }
    if (age) {
      return `${age}a`
    }
    return ''
  }

  const formatAthleteSubDetails = (athlete) => {
    if (!athlete) return ''
    const club = athlete.clube || athlete.ca || ''
    const rawAlt = athlete.alt !== undefined && athlete.alt !== '' ? athlete.alt : athlete.altura
    let heightStr = ''
    if (rawAlt) {
      const numAlt = parseFloat(String(rawAlt).replace(',', '.'))
      if (!isNaN(numAlt) && numAlt > 0) {
        if (numAlt < 3) {
          heightStr = `${Math.round(numAlt * 100)} cm`
        } else {
          heightStr = `${Math.round(numAlt)} cm`
        }
      }
    }
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

  // Exportação em PDF do Campograma Tático via html-to-image (renderização nativa 1:1)
  const handleExportPdf = async () => {
    if (!pitchRef.current || isExportingPdf) return
    setIsExportingPdf(true)

    try {
      // 1. Aguardar carregamento completo das fontes do navegador
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      const element = pitchRef.current

      // Captura o elemento com fidelidade nativa do navegador via SVG foreignObject
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2, // Garante alta resolução nítida
        filter: (node) => {
          // Oculta botões de adicionar (+) ou controles que não devem sair no PDF
          if (
            node.tagName === 'BUTTON' ||
            node.classList?.contains('no-export') ||
            node.classList?.contains('no-pdf') ||
            node.getAttribute?.('data-export-hide') === 'true'
          ) {
            return false
          }
          return true
        }
      })

      // Carrega as dimensões da imagem capturada
      const img = new Image()
      img.src = dataUrl
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const headerHeight = 110
      const pdfWidth = img.width
      const pdfHeight = img.height + headerHeight

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      })

      // Cabeçalho Institucional Dark
      pdf.setFillColor(6, 13, 23)
      pdf.rect(0, 0, pdfWidth, headerHeight, 'F')

      // Detalhe superior em esmeralda
      pdf.setFillColor(16, 185, 129)
      pdf.rect(0, 0, pdfWidth, 4, 'F')

      // Título limpo (sem emojis ou caracteres corrompidos)
      const cleanName = (activeTeam?.nome || 'PLANEJAMENTO DE ELENCO').replace(/[^\w\s\dÀ-ú-]/gi, '').trim()
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.text(`TIME SOMBRA — ${cleanName}`, 40, 45)

      // Subtítulo com Métricas Táticas
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(14)
      const idadeStr = teamMetrics.avgAge
        ? `${teamMetrics.avgAge} anos (${teamMetrics.countAge} ${metricsScope === 'TITULARES' ? 'titulares' : 'atletas'})`
        : '—'
      const alturaStr = teamMetrics.avgHeight
        ? `${teamMetrics.avgHeight} cm (${teamMetrics.countHeight} ${metricsScope === 'TITULARES' ? 'titulares' : 'atletas'})`
        : '—'

      let headerSubText = `Esquema: ${selectedFormation}   |   Idade: ${idadeStr}   |   Altura: ${alturaStr}`
      if (showFinancials) {
        const folhaStr = `${formatBRL(folhaProjetada, false)} (${metricsScope === 'TITULARES' ? '11 Titulares' : 'Elenco Completo'})`
        headerSubText += `   |   Folha: ${folhaStr}`
      }
      pdf.text(headerSubText, 40, 80)

      // Estampa o campograma sem cortes
      pdf.addImage(dataUrl, 'PNG', 0, headerHeight, img.width, img.height)

      // Rodapé da Página 1
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(11)
      if (showFinancials) {
        pdf.text('Página 1 de 2  |  Campograma Tático', pdfWidth - 260, pdfHeight - 14)
      } else {
        pdf.text('Campograma Tático', pdfWidth - 160, pdfHeight - 14)
      }

      if (showFinancials) {
        // ==========================================
        // PÁGINA 2: DIAGNÓSTICO FINANCEIRO & SALARIAL
        // ==========================================
        pdf.addPage([pdfWidth, pdfHeight], pdfWidth > pdfHeight ? 'landscape' : 'portrait')

      // Fator de escala dinâmico proporcional à resolução da imagem (base de referência: 1400px de largura)
      const scale = pdfWidth / 1400
      const s = (v) => Math.round(v * scale)
      const font = (sz) => Math.max(7, Math.round(sz * scale))

      // 1. Fundo Dark da Página 2 (#070b12)
      pdf.setFillColor(7, 11, 18)
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F')

      // Faixa Superior em Esmeralda (#10b981)
      pdf.setFillColor(16, 185, 129)
      pdf.rect(0, 0, pdfWidth, Math.max(3, s(4)), 'F')

      // 2. Cabeçalho Institucional de Diagnóstico Financeiro
      const headY = s(38)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(font(20))
      pdf.text(`RELATÓRIO FINANCEIRO & DIAGNÓSTICO SALARIAL — ${cleanName.toUpperCase()}`, s(40), headY)

      const budgetCeiling = activeTeam?.budget_ceiling || 2000000
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(font(11))
      const nowStr = new Date().toLocaleDateString('pt-BR')
      pdf.text(
        `Esquema: ${selectedFormation}   |   Teto Aprovado: ${formatBRL(budgetCeiling, false)}   |   Base: 11 Titulares + Suplentes   |   Data: ${nowStr}`,
        s(40),
        headY + s(18)
      )

      // 3. Coleta de dados financeiros detalhados por posição
      const positionsList = activeFormation.positions
      const posFinancials = positionsList.map((pos) => {
        const slots = slotsData[pos.id] || []
        const titular = slots[0] || null
        const alternates = slots.slice(1)
        const metrics = calculatePositionSalaryMetrics(slots, players)

        return {
          id: pos.id,
          label: pos.label,
          titular,
          alternates,
          titularSalary: metrics.titularSalary,
          reservasSalary: metrics.reservasSalary,
          totalPosSalary: metrics.totalSalary,
          avgSalary: metrics.avgSalary,
          countWithSalary: metrics.countWithSalary,
          hasSalaryInversion: metrics.hasSalaryInversion,
          secondSalary: metrics.secondSalary,
          optionsCount: slots.length
        }
      })

      const totalTitularesCost = posFinancials.reduce((sum, p) => sum + p.titularSalary, 0)
      const totalReservasCost = posFinancials.reduce((sum, p) => sum + p.reservasSalary, 0)
      const totalSquadCost = totalTitularesCost + totalReservasCost
      const startersCount = posFinancials.filter((p) => p.titular !== null).length
      const totalPlayersCount = posFinancials.reduce((sum, p) => sum + p.optionsCount, 0)
      const saldoTitulares = budgetCeiling - totalTitularesCost
      const pctTetoTitulares = budgetCeiling > 0 ? Math.round((totalTitularesCost / budgetCeiling) * 100) : 0
      const pctTetoSquad = budgetCeiling > 0 ? Math.round((totalSquadCost / budgetCeiling) * 100) : 0

      // 4. Quatro Cards Executivos de Resumo Financeiro
      const cardsY = headY + s(32)
      const cardsH = s(70)
      const totalCardsW = pdfWidth - s(80)
      const gapCards = s(16)
      const cardW = Math.floor((totalCardsW - gapCards * 3) / 4)

      const summaryCards = [
        {
          label: 'TETO SALARIAL MENSAL',
          value: formatBRL(budgetCeiling, false),
          subtext: 'Limite orçamentário aprovado',
          borderColor: [51, 65, 85],
          valColor: [255, 255, 255],
          lblColor: [148, 163, 184]
        },
        {
          label: 'FOLHA 11 TITULARES',
          value: formatBRL(totalTitularesCost, false),
          subtext: `${pctTetoTitulares}% do teto (${startersCount}/11 titulares)`,
          borderColor: [16, 185, 129],
          valColor: [52, 211, 153],
          lblColor: [110, 231, 183]
        },
        {
          label: 'FOLHA ELENCO COMPLETO',
          value: formatBRL(totalSquadCost, false),
          subtext: `${pctTetoSquad}% do teto (${totalPlayersCount} atletas no elenco)`,
          borderColor: [245, 158, 11],
          valColor: [251, 191, 36],
          lblColor: [252, 211, 77]
        },
        {
          label: 'SALDO ORÇAMENTÁRIO',
          value: `${saldoTitulares >= 0 ? '+' : ''}${formatBRL(saldoTitulares, false)}`,
          subtext: saldoTitulares >= 0 ? 'Margem disponível p/ reforços' : 'Orçamento excedente',
          borderColor: saldoTitulares >= 0 ? [16, 185, 129] : [244, 63, 94],
          valColor: saldoTitulares >= 0 ? [52, 211, 153] : [251, 113, 133],
          lblColor: saldoTitulares >= 0 ? [110, 231, 183] : [253, 164, 175]
        }
      ]

      summaryCards.forEach((c, idx) => {
        const cx = s(40) + idx * (cardW + gapCards)
        pdf.setFillColor(13, 21, 36)
        pdf.setDrawColor(c.borderColor[0], c.borderColor[1], c.borderColor[2])
        pdf.setLineWidth(1)
        pdf.roundedRect(cx, cardsY, cardW, cardsH, s(6), s(6), 'FD')

        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(c.lblColor[0], c.lblColor[1], c.lblColor[2])
        pdf.setFontSize(font(8.5))
        pdf.text(c.label, cx + s(14), cardsY + s(18))

        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(c.valColor[0], c.valColor[1], c.valColor[2])
        pdf.setFontSize(font(15))
        pdf.text(c.value, cx + s(14), cardsY + s(40))

        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(148, 163, 184)
        pdf.setFontSize(font(8))
        pdf.text(c.subtext, cx + s(14), cardsY + s(58))
      })

      // 5. Painéis: Gráfico de Barras (Esquerda) e Tabela Analítica (Direita)
      const footerAreaH = s(36)
      const panelsY = cardsY + cardsH + s(18)
      const availablePanelH = pdfHeight - panelsY - footerAreaH
      const panelGap = s(20)
      const totalPanelsW = pdfWidth - s(80)
      const panelW = Math.floor((totalPanelsW - panelGap) / 2)

      const panel1X = s(40)
      const panel2X = panel1X + panelW + panelGap

      // --- PAINEL 1: GRÁFICO DE BARRAS POR POSIÇÃO ---
      pdf.setFillColor(11, 18, 30)
      pdf.setDrawColor(30, 41, 59)
      pdf.setLineWidth(1)
      pdf.roundedRect(panel1X, panelsY, panelW, availablePanelH, s(6), s(6), 'FD')

      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(font(12))
      pdf.text('DISTRIBUIÇÃO DA FOLHA POR POSIÇÃO', panel1X + s(16), panelsY + s(20))

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(font(8.5))
      pdf.text('Custo segmentado: Titular (Verde) vs Suplentes/Reservas (Âmbar)', panel1X + s(16), panelsY + s(32))

      const maxPosCost = Math.max(...posFinancials.map((p) => p.totalPosSalary), budgetCeiling * 0.2, 100000)
      const usableChartH = availablePanelH - s(64)
      const rowH = Math.floor(usableChartH / 11)

      posFinancials.forEach((p, i) => {
        const rowY = panelsY + s(40) + i * rowH

        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(203, 213, 225)
        pdf.setFontSize(font(8.5))
        const labelStr = p.label.length > 15 ? p.label.slice(0, 14) + '.' : p.label
        pdf.text(labelStr, panel1X + s(16), rowY + s(12))

        const barStartX = panel1X + s(130)
        const barMaxW = panelW - s(130) - s(110)
        const barH = Math.max(6, Math.min(s(12), Math.floor(rowH * 0.55)))
        const barY = rowY + Math.floor((rowH - barH) / 2)

        // Trilho de fundo
        pdf.setFillColor(18, 28, 45)
        pdf.roundedRect(barStartX, barY, barMaxW, barH, s(2), s(2), 'F')

        // Segmento Titular (Verde)
        const titW = Math.round((p.titularSalary / maxPosCost) * barMaxW)
        if (titW > 0) {
          pdf.setFillColor(16, 185, 129)
          pdf.rect(barStartX, barY, Math.min(titW, barMaxW), barH, 'F')
        }

        // Segmento Reservas (Âmbar)
        const resW = Math.round((p.reservasSalary / maxPosCost) * barMaxW)
        if (resW > 0) {
          pdf.setFillColor(245, 158, 11)
          const resX = barStartX + titW
          const clampedResW = Math.min(resW, Math.max(0, barMaxW - titW))
          if (clampedResW > 0) pdf.rect(resX, barY, clampedResW, barH, 'F')
        }

        // Valor total no final da barra
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(226, 232, 240)
        pdf.setFontSize(font(8))
        const totalText = p.totalPosSalary > 0 ? formatCompactBRL(p.totalPosSalary) : '—'
        pdf.text(totalText, barStartX + titW + resW + s(6), barY + barH - s(2))

        // Alerta de inversão
        if (p.hasSalaryInversion) {
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(245, 158, 11)
          pdf.setFontSize(font(7.5))
          pdf.text('(!)', barStartX + barMaxW + s(60), barY + barH - s(2))
        }
      })

      // Legenda do Gráfico
      const legendY = panelsY + availablePanelH - s(12)
      pdf.setFillColor(16, 185, 129)
      pdf.rect(panel1X + s(16), legendY - s(7), s(8), s(8), 'F')
      pdf.setTextColor(148, 163, 184)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(font(8))
      pdf.text('Titular Ativo', panel1X + s(28), legendY)

      pdf.setFillColor(245, 158, 11)
      pdf.rect(panel1X + s(95), legendY - s(7), s(8), s(8), 'F')
      pdf.text('Reservas / Suplentes', panel1X + s(107), legendY)

      pdf.setTextColor(245, 158, 11)
      pdf.setFont('helvetica', 'bold')
      pdf.text('(!) Inversão (Reserva > Titular)', panel1X + s(215), legendY)

      // --- PAINEL 2: TABELA ANALÍTICA POR POSIÇÃO ---
      pdf.setFillColor(11, 18, 30)
      pdf.setDrawColor(30, 41, 59)
      pdf.setLineWidth(1)
      pdf.roundedRect(panel2X, panelsY, panelW, availablePanelH, s(6), s(6), 'FD')

      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(font(12))
      pdf.text('TABELA ANALÍTICA POR POSIÇÃO', panel2X + s(16), panelsY + s(20))

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(font(8.5))
      pdf.text('Detalhamento nominal, média ponderada e impacto no orçamento', panel2X + s(16), panelsY + s(32))

      // Colunas da Tabela
      const cX0 = panel2X + s(16)
      const cX1 = cX0 + s(90)
      const cX2 = cX1 + s(130)
      const cX3 = cX2 + s(80)
      const cX4 = cX3 + s(80)
      const cX5 = cX4 + s(80)

      const tableHeaderY = panelsY + s(40)
      const tableHeaderH = s(18)
      pdf.setFillColor(18, 28, 45)
      pdf.rect(panel2X + s(12), tableHeaderY, panelW - s(24), tableHeaderH, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(font(8))
      pdf.text('POSIÇÃO', cX0, tableHeaderY + s(12))
      pdf.text('TITULAR ATIVO', cX1, tableHeaderY + s(12))
      pdf.text('CUSTO TIT.', cX2, tableHeaderY + s(12))
      pdf.text('RESERVAS', cX3, tableHeaderY + s(12))
      pdf.text('MÉDIA VAGA', cX4, tableHeaderY + s(12))
      pdf.text('% TETO', cX5, tableHeaderY + s(12))

      const tableBodyStartY = tableHeaderY + tableHeaderH + s(2)
      const tableRowH = Math.floor((availablePanelH - s(65)) / 12)

      posFinancials.forEach((p, idx) => {
        const rowY = tableBodyStartY + idx * tableRowH

        if (idx % 2 === 1) {
          pdf.setFillColor(15, 23, 38)
          pdf.rect(panel2X + s(12), rowY, panelW - s(24), tableRowH, 'F')
        }

        if (p.hasSalaryInversion) {
          pdf.setFillColor(45, 30, 10)
          pdf.rect(panel2X + s(12), rowY, panelW - s(24), tableRowH, 'F')
          pdf.setDrawColor(245, 158, 11)
          pdf.setLineWidth(1)
          pdf.line(panel2X + s(12), rowY, panel2X + s(12), rowY + tableRowH)
        }

        // Posição
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(226, 232, 240)
        pdf.setFontSize(font(8))
        pdf.text(p.label.length > 13 ? p.label.slice(0, 12) + '.' : p.label, cX0, rowY + s(11))

        // Titular
        pdf.setFont('helvetica', 'normal')
        const titName = p.titular
          ? p.titular.nome.length > 18
            ? p.titular.nome.slice(0, 17) + '.'
            : p.titular.nome
          : '— Vago'
        pdf.setTextColor(p.titular ? 203 : 100, p.titular ? 213 : 116, p.titular ? 225 : 139)
        pdf.text(titName, cX1, rowY + s(11))

        // Custo Titular
        pdf.setTextColor(52, 211, 153)
        pdf.text(p.titularSalary > 0 ? formatCompactBRL(p.titularSalary) : '—', cX2, rowY + s(11))

        // Reservas
        pdf.setTextColor(251, 191, 36)
        pdf.text(p.reservasSalary > 0 ? formatCompactBRL(p.reservasSalary) : '—', cX3, rowY + s(11))

        // Média Vaga
        pdf.setTextColor(203, 213, 225)
        pdf.text(p.avgSalary > 0 ? formatCompactBRL(p.avgSalary) : '—', cX4, rowY + s(11))

        // % Teto
        const pctPos = budgetCeiling > 0 ? ((p.totalPosSalary / budgetCeiling) * 100).toFixed(1) : '0.0'
        pdf.setTextColor(148, 163, 184)
        pdf.text(`${pctPos}%`, cX5, rowY + s(11))
      })

      // Linha de Rodapé da Tabela: TOTAL GERAL
      const totalRowY = tableBodyStartY + 11 * tableRowH + s(2)
      pdf.setFillColor(10, 35, 26)
      pdf.setDrawColor(16, 185, 129)
      pdf.setLineWidth(1)
      pdf.rect(panel2X + s(12), totalRowY, panelW - s(24), tableRowH + s(2), 'FD')

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(font(8.5))
      pdf.setTextColor(52, 211, 153)
      pdf.text('TOTAL GERAL', cX0, totalRowY + s(12))
      pdf.text(`${startersCount}/11 Titulares`, cX1, totalRowY + s(12))
      pdf.text(formatCompactBRL(totalTitularesCost), cX2, totalRowY + s(12))
      pdf.setTextColor(251, 191, 36)
      pdf.text(formatCompactBRL(totalReservasCost), cX3, totalRowY + s(12))
      pdf.setTextColor(255, 255, 255)
      pdf.text(formatCompactBRL(totalSquadCost), cX4, totalRowY + s(12))
      pdf.setTextColor(52, 211, 153)
      pdf.text(`${pctTetoSquad}%`, cX5, totalRowY + s(12))

      // 6. Rodapé Confidencial da Página 2
      const footerY = pdfHeight - s(14)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 116, 139)
      pdf.setFontSize(font(8.5))
      pdf.text('DOCUMENTO CONFIDENCIAL — DEPARTAMENTO DE INTELIGÊNCIA & SCOUT', s(40), footerY)
      const userTag = user?.email || 'Sistema'
      pdf.text(
        `Extração: ${new Date().toLocaleString('pt-BR')}   |   Operador: ${userTag}`,
        pdfWidth / 2 - s(120),
        footerY
      )
      pdf.setFont('helvetica', 'bold')
      pdf.text('Página 2 de 2', pdfWidth - s(100), footerY)
    }

    // Download imediato
      const safeFileName = cleanName.replace(/\s+/g, '_') || 'cenario'
      const fileDate = new Date().toISOString().slice(0, 10)
      pdf.save(`Time_Sombra_${safeFileName}_${selectedFormation}_${fileDate}.pdf`)
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
                  <span>Simulador de Orçamento & Folha Salarial</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 lowercase">
                    tempo real
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400 transition-colors duration-300">
                  {metricsScope === 'TITULARES'
                    ? 'Projeção baseada nos 11 titulares ativos na formação selecionada'
                    : 'Projeção baseada em todos os atletas do elenco (1ª, 2ª e 3ª opções)'}
                </p>
              </div>
            </div>

            {/* Controles do Topo: Base de Cálculo + Presets Rápidos de Teto */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Seletor Unificado de Base de Cálculo */}
              <div className="flex items-center gap-1 bg-[#090e17] p-1 rounded-xl border border-slate-800 text-xs shadow-inner">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 hidden sm:inline">
                  Base:
                </span>
                <button
                  type="button"
                  onClick={() => setMetricsScope('TITULARES')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    metricsScope === 'TITULARES'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  title="Calcular folha e métricas baseado apenas nos 11 titulares ativos"
                >
                  Titulares (11)
                </button>
                <button
                  type="button"
                  onClick={() => setMetricsScope('COMPLETO')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    metricsScope === 'COMPLETO'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  title="Calcular folha e métricas com todo o elenco (1ª, 2ª e 3ª opções)"
                >
                  Elenco Completo
                </button>
              </div>

              {/* Presets Rápidos de Teto Salarial */}
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
          </div>

          {/* 3 Cartões de Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-4">
            {/* Métrica 1: Teto Salarial Mensal */}
            <div className="bg-[#111c2e] border border-slate-700/70 rounded-xl p-3 flex flex-col justify-between shadow-sm relative group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  Teto Salarial Mensal
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingBudgetCeiling(!isEditingBudgetCeiling)}
                  className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                  title="Editar teto orçamentário mensal"
                >
                  <Pencil className="w-3 h-3 text-cyan-400" />
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
                    placeholder="R$ 2.000.000,00"
                    className="w-full bg-[#080d16] border border-cyan-500 rounded px-2.5 py-1 text-base font-black text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingBudgetCeiling(true)}
                  className="cursor-pointer group-hover:text-cyan-300 transition-colors my-0.5"
                  title="Clique para editar valor do teto"
                >
                  <div className="text-lg md:text-xl font-black text-white tracking-tight">
                    {formatBRL(budgetCeiling, true)}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span className="truncate">Definido p/ {activeTeam.nome}</span>
                <span className="text-cyan-400/80 font-medium shrink-0 ml-1">clique p/ editar</span>
              </div>
            </div>

            {/* Métrica 2: Folha Projetada Atual */}
            <div className="bg-[#111c2e] border border-slate-700/70 rounded-xl p-3 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  Folha Projetada Atual
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 transition-all duration-300">
                  {metricsScope === 'TITULARES'
                    ? `${payrollStats.startersCount}/11 titulares definidos`
                    : `${payrollStats.totalAthletesCount} atletas no elenco`}
                </span>
              </div>

              <div
                key={`folha-${metricsScope}`}
                className="text-lg md:text-xl font-black text-amber-300 tracking-tight my-0.5 transition-all duration-300 animate-in fade-in"
              >
                {formatBRL(folhaProjetada, true)}
              </div>

              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>
                  {metricsScope === 'TITULARES'
                    ? 'Soma dos 11 titulares ativos'
                    : 'Soma de todo o elenco do campograma'}
                </span>
                <span className="text-slate-500 font-medium">
                  {metricsScope === 'TITULARES'
                    ? `${payrollStats.customSalaryCount} salários definidos`
                    : `${payrollStats.athletesWithSalaryCount || payrollStats.totalAthletesCount} atletas com salário definido`}
                </span>
              </div>
            </div>

            {/* Métrica 3: Saldo / Variação */}
            <div
              className={`border rounded-xl p-3 flex flex-col justify-between shadow-sm transition-all duration-300 ${
                isBudgetExceeded
                  ? 'bg-rose-950/25 border-rose-500/60 shadow-rose-950/40'
                  : 'bg-emerald-950/25 border-emerald-500/50 shadow-emerald-950/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  {isBudgetExceeded ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                  ) : (
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  Saldo / Variação
                </span>
                <span
                  className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border transition-all duration-300 ${
                    isBudgetExceeded
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {isBudgetExceeded ? 'TETO ESTOURADO' : 'DENTRO DO TETO'}
                </span>
              </div>

              <div
                key={`saldo-${metricsScope}`}
                className={`text-lg md:text-xl font-black tracking-tight my-0.5 transition-all duration-300 animate-in fade-in ${
                  isBudgetExceeded ? 'text-rose-400' : 'text-emerald-300'
                }`}
              >
                {isBudgetExceeded
                  ? `- ${formatBRL(Math.abs(saldoOrcamentario), true)}`
                  : `+ ${formatBRL(saldoOrcamentario, true)}`}
              </div>

              <div className="text-[10px] mt-1 flex items-center justify-between font-semibold">
                <span className={isBudgetExceeded ? 'text-rose-300/90' : 'text-emerald-400/90'}>
                  {isBudgetExceeded ? 'Excedente (necessita ajuste)' : 'Margem disponível na folha'}
                </span>
                <span className="text-slate-400">
                  {percentualComprometido.toFixed(1)}% utilizado
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Progresso Visual do Teto Salarial */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <span>
                  Comprometimento Orçamentário ({metricsScope === 'TITULARES' ? '11 Titulares' : 'Elenco Completo'}):
                </span>
                <strong className={isBudgetExceeded ? 'text-rose-400' : 'text-emerald-400'}>
                  {percentualComprometido.toFixed(1)}%
                </strong>
              </span>
              <span>
                {formatBRL(folhaProjetada, false)} de {formatBRL(budgetCeiling, false)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isBudgetExceeded
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : percentualComprometido > 85
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${Math.min(percentualComprometido, 100)}%` }}
              />
            </div>
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
                  ELENCO VS ALVOS (ATIVOS)
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

          {/* Seletor de Escopo: Titulares vs Elenco Completo */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
              Base de Cálculo:
            </span>
            <div className="flex items-center bg-[#090e17] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setMetricsScope('TITULARES')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  metricsScope === 'TITULARES'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                1º Ativo por Posição
              </button>
              <button
                type="button"
                onClick={() => setMetricsScope('COMPLETO')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  metricsScope === 'COMPLETO'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                Todos Ativos na Simulação
              </button>
            </div>
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
            const activeSlotsInPos = currentSlots.filter(s => s && s.is_simulated_active !== false)
            const firstActiveSlot = activeSlotsInPos[0] || currentSlots[0] || null
            const posCoords = customPositions[pos.id] || { top: `${pos.top}%`, left: `${pos.left}%` }
            const isBeingMoved = draggingPosId === pos.id
            const posSalaryMetrics = calculatePositionSalaryMetrics(currentSlots, players)
            const posCostInScope = metricsScope === 'TITULARES'
              ? posSalaryMetrics.titularSalary
              : posSalaryMetrics.totalSalary
            const posPercentOfTotal = folhaProjetada > 0 && posCostInScope > 0
              ? (posCostInScope / folhaProjetada) * 100
              : 0

            return (
              <div
                key={pos.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 ${
                  isBeingMoved ? 'transition-none select-none z-30' : 'transition-all duration-500 ease-out'
                }`}
                style={{ top: posCoords.top, left: posCoords.left }}
              >
                {/* CARD TÁTICO TRANSLÚCIDO COMPACTO (DESKTOP) — LISTA DINÂMICA SEM RÓTULOS FIXOS */}
                <div
                  onDragOver={(e) => handleDragOver(e, pos.id)}
                  onDragLeave={(e) => handleDragLeave(e, pos.id)}
                  onDrop={(e) => handleDropOnSlot(e, pos.id, null)}
                  className={`hidden md:block w-[236px] min-w-[236px] max-w-[246px] bg-[#070e1b]/95 backdrop-blur-md border rounded-xl p-2.5 shadow-2xl transition-all hover:z-30 group ${
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
                      {currentSlots.length > 0 && (
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                          {activeSlotsInPos.length}/{currentSlots.length}
                        </span>
                      )}
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
                      <div className="flex items-center gap-1" data-export-hide="true">
                        <button
                          type="button"
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
                          className={`flex-1 rounded-lg p-1.5 text-center text-[9.5px] font-semibold cursor-pointer transition-colors border ${
                            dragOverTarget === `${pos.id}-empty`
                              ? 'border-2 border-dashed border-emerald-400 bg-emerald-500/20 text-emerald-200'
                              : 'border-dashed border-emerald-500/30 hover:border-emerald-400 text-emerald-400/80 hover:text-emerald-300'
                          }`}
                        >
                          + Escalar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddEmptySlot(pos.id)}
                          className="px-2 py-1.5 rounded-lg text-[9.5px] font-semibold cursor-pointer transition-colors border border-dashed border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-cyan-300"
                          title="Criar slot em branco sincronizado com a tabela"
                        >
                          + Linha
                        </button>
                      </div>
                    ) : (
                      currentSlots.map((slot, slotIdx) => {
                        const fullAthlete = resolveSlotAthlete(slot)
                        const isSimulatedActive = fullAthlete.is_simulated_active !== false
                        const isOwnPlayer = Boolean(fullAthlete.is_own_player)
                        const isForeign = Boolean(fullAthlete.is_foreign)
                        const isBlankSlot = !fullAthlete.nome?.trim() && !fullAthlete.id
                        const birthYearFormatted = formatAthleteBirthYear(fullAthlete)
                        const subDetails = formatAthleteSubDetails(fullAthlete)
                        const slotKey = `${pos.id}-${slotIdx}`
                        const isBeingDragged = draggedItem?.posId === pos.id && draggedItem?.index === slotIdx
                        const isDragOverThis = dragOverTarget === slotKey
                        const athleteSalary = getAthleteSalary(fullAthlete, players)

                        return (
                          <div
                            key={slot.slotId || slot.id || slotIdx}
                            data-player-card="true"
                            draggable={!isBlankSlot}
                            onDragStart={(e) => !isBlankSlot && handleDragStart(e, pos.id, slotIdx, fullAthlete)}
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
                            className={`rounded-lg px-2 py-1.5 flex flex-col gap-0.5 group/row transition-all border ${
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
                            <div className="flex items-center justify-between gap-1 w-full">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {/* Checkbox B no Card: Ativo na Simulação */}
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
                                      ? 'Ativo na Simulação (clique para desativar do orçamento e médias)'
                                      : 'Inativo na Simulação (clique para incluir no orçamento e médias)'
                                  }
                                  className="w-3 h-3 rounded accent-emerald-500 cursor-pointer shrink-0"
                                />

                                {isBlankSlot ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setAssigningPos({ ...pos, targetSlotIndex: slotIdx })
                                      setPlayerSearch('')
                                    }}
                                    className="text-[10.5px] italic text-slate-400 hover:text-emerald-300 truncate text-left cursor-pointer"
                                    title="Slot sincronizado — digite na tabela abaixo ou clique para escalar do banco"
                                  >
                                    Slot em branco (escalar...)
                                  </button>
                                ) : (
                                  <span
                                    className={`font-bold text-[11.5px] leading-tight truncate ${
                                      isSimulatedActive ? 'text-white' : 'text-slate-400 line-through'
                                    }`}
                                    title={fullAthlete.nome}
                                  >
                                    {fullAthlete.nome}
                                  </span>
                                )}

                                {birthYearFormatted && (
                                  <span className="text-[9px] font-semibold text-slate-300 bg-slate-800/90 px-1 py-0.2 rounded shrink-0">
                                    {birthYearFormatted}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                {/* Badge discreto 'Elenco' vs 'Alvo' (Checkbox A) */}
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
                                      ? 'Atleta do Elenco Atual (clique para alternar para Alvo de Mercado)'
                                      : 'Alvo de Mercado (clique para marcar como Elenco Atual)'
                                  }
                                  className={`text-[7.5px] font-black uppercase px-1 py-0.2 rounded border transition-colors cursor-pointer ${
                                    isOwnPlayer
                                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                  }`}
                                >
                                  {isOwnPlayer ? 'Elenco' : 'Alvo'}
                                </button>

                                {isForeign && (
                                  <span
                                    className="text-[7.5px] font-black px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                    title="Atleta Estrangeiro"
                                  >
                                    EST
                                  </span>
                                )}

                                {fullAthlete.nivel && (
                                  <span className={`text-[8px] font-bold px-1 rounded border leading-tight ${getNivelStyle(fullAthlete.nivel)}`}>
                                    {fullAthlete.nivel}
                                  </span>
                                )}

                                {!isBlankSlot && (
                                  <button
                                    type="button"
                                    data-export-hide="true"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingFullPlayer(fullAthlete)
                                    }}
                                    title="Editar perfil completo do atleta"
                                    className="opacity-0 group-hover/row:opacity-100 text-slate-400 hover:text-amber-400 transition-opacity cursor-pointer"
                                  >
                                    <Pencil className="w-2.5 h-2.5" />
                                  </button>
                                )}

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

                            {subDetails && (
                              <div className="text-[9.5px] text-slate-400 leading-tight truncate pl-4" title={subDetails}>
                                {subDetails}
                              </div>
                            )}

                            {/* Linha de Salário Estimado com Edição Rápida */}
                            {showFinancials && !isBlankSlot && (
                              <div className="flex items-center justify-between mt-0.5 pt-0.5 border-t border-slate-800/50 pl-4">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenSalaryModal(pos.id, pos.label, slotIdx, fullAthlete)
                                  }}
                                  title="Clique para editar o salário mensal deste atleta"
                                  className="flex items-center gap-1 text-[8.5px] text-emerald-400/90 hover:text-emerald-300 font-bold cursor-pointer group/sal hover:underline"
                                >
                                  <Coins className="w-2 h-2 text-emerald-400" />
                                  <span>{formatBRL(athleteSalary, false)}/mês</span>
                                  <Pencil className="w-2 h-2 text-slate-400 opacity-60 group-hover/sal:opacity-100" />
                                </button>
                                {!isSimulatedActive && (
                                  <span className="text-[7px] font-extrabold uppercase px-1 rounded bg-slate-800 text-slate-400">
                                    FORA DA CONTA
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Rodapé do Nó: Investimento Ativo na Posição & % do Gasto Total */}
                  {showFinancials && currentSlots.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 bg-slate-950/60 -mx-2.5 -mb-2.5 px-2.5 py-1.5 rounded-b-xl flex flex-col gap-1 text-[8.5px]">
                      <div className="flex items-center justify-between gap-1 w-full">
                        <div
                          className="flex items-center gap-1 text-slate-400 truncate min-w-0"
                          title={`Investimento ativo na posição: ${formatBRL(posCostInScope, false)} • ${posPercentOfTotal.toFixed(1)}% da folha projetada`}
                        >
                          <span className="text-slate-500 font-medium">Subtotal Ativo:</span>
                          <span className="font-bold text-slate-200">
                            {formatBRL(posCostInScope, false)}
                          </span>
                          <span className="text-emerald-400 font-bold ml-0.5">
                            • {posPercentOfTotal.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-400"
                          style={{ width: `${Math.min(100, posPercentOfTotal)}%` }}
                        />
                      </div>
                    </div>
                  )}
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
                      const birthYearFormatted = formatAthleteBirthYear(fullFirst)
                      return (
                        <>
                          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 border-2 border-emerald-300 shadow-lg shadow-black/80 flex items-center justify-center">
                            <span className="text-[10px] font-black text-slate-950 uppercase">{pos.label}</span>
                            {fullFirst.nivel && (
                              <span className={`absolute -top-1.5 -right-1.5 text-[8px] font-black px-1 rounded-full border border-black shadow ${getNivelStyle(fullFirst.nivel)}`}>
                                {fullFirst.nivel}
                              </span>
                            )}
                            {currentSlots.length > 1 && (
                              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-950 text-emerald-400 border border-emerald-500/50 text-[8px] font-black px-1 rounded shadow">
                                +{currentSlots.length - 1}
                              </span>
                            )}
                          </div>
                          <span className="mt-1 text-[10px] font-bold text-white max-w-[75px] truncate text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {fullFirst.nome || 'Slot em branco'}
                          </span>
                          <span className="text-[8px] font-semibold text-emerald-300/90 max-w-[70px] truncate text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {fullFirst.clube || fullFirst.ca || birthYearFormatted || ''}
                          </span>
                        </>
                      )
                    })()
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-emerald-400/60 bg-slate-950/70 shadow-md flex flex-col items-center justify-center text-emerald-400">
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="text-[8px] font-black uppercase text-emerald-400/90">{pos.label}</span>
                      </div>
                      <span className="mt-0.5 text-[9px] font-semibold text-emerald-400/70 max-w-[70px] truncate text-center">
                        Vago
                      </span>
                    </>
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
              <div className="flex items-center gap-2.5">
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
                Adicione linhas livremente em cada setor, diferencie atletas do <strong className="text-cyan-300">Elenco Atual</strong> vs <strong className="text-amber-300">Alvos de Mercado</strong>, e marque/desmarque <strong className="text-emerald-300">Ativo na Simulação</strong> para testar cenários de folha salarial e médias físicas sem excluir atletas.
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
                      <table className="w-full text-left border-collapse min-w-[920px]">
                        <thead>
                          <tr className="border-b border-slate-800/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#0b1320]">
                            <th className="py-2 px-3 w-[110px] text-center">Ativo na Simulação</th>
                            <th className="py-2 px-3 w-[125px] text-center">Elenco Atual</th>
                            <th className="py-2 px-3 min-w-[230px]">Nome do Atleta (Base ou Livre)</th>
                            <th className="py-2 px-3 w-[150px]">Salário Mensal (R$)</th>
                            <th className="py-2 px-3 w-[105px]">Altura (cm)</th>
                            <th className="py-2 px-3 w-[135px]">Idade / Ano Nasc.</th>
                            <th className="py-2 px-3 w-[115px] text-center">Estrangeiro</th>
                            <th className="py-2 px-3 min-w-[160px]">Clube Atual / Vínculo</th>
                            <th className="py-2 px-3 w-[60px] text-center">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-xs">
                          {currentSlots.map((slot, slotIdx) => {
                            const fullAthlete = resolveSlotAthlete(slot)
                            const isSimulatedActive = fullAthlete.is_simulated_active !== false
                            const isOwnPlayer = Boolean(fullAthlete.is_own_player)
                            const isForeign = Boolean(fullAthlete.is_foreign)
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

