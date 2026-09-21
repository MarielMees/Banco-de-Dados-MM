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
  Menu
} from 'lucide-react'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'
import UserBadge from './UserBadge'

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

// Dados mockados iniciais para os cenários padrão (campinho 100% VAZIO)
const INITIAL_SHADOW_TEAMS = [
  {
    id: 'serie-a',
    nome: '★ Série A 2026',
    formacao: '4-3-3',
    escalacao: {}
  },
  {
    id: 'serie-b',
    nome: 'Série B',
    formacao: '4-2-3-1',
    escalacao: {}
  },
  {
    id: 'serie-c',
    nome: 'Série C',
    formacao: '4-4-2',
    escalacao: {}
  },
  {
    id: 'alternativas',
    nome: 'Alternativas / Mercado',
    formacao: '3-4-3',
    escalacao: {}
  }
]

export default function ShadowTeam({ onBack, players = [], user, onSignOut, onOpenMobileMenu }) {
  // Limpa chaves de cache que possam reter mocks antigos
  useEffect(() => {
    try {
      localStorage.removeItem('radar_selection_squad')
      localStorage.removeItem('radar_shadow_teams')
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

  // Persistir alterações no localStorage automaticamente
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
      const saved = localStorage.getItem('radar_shadow_teams')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id
        }
      }
    } catch (e) {
      // fallback
    }
    return 'serie-a'
  })
  const [assigningPos, setAssigningPos] = useState(null)
  const [playerSearch, setPlayerSearch] = useState('')
  const [playerFilterTab, setPlayerFilterTab] = useState('SUGERIDOS') // 'SUGERIDOS' | 'TODOS'
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const pitchRef = useRef(null)

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

  // Obter cenário ativo
  const activeTeam = useMemo(() => {
    return shadowTeams.find(t => t.id === activeTeamId) || shadowTeams[0]
  }, [shadowTeams, activeTeamId])

  const selectedFormation = activeTeam.formacao || '4-3-3'
  const slotsData = activeTeam.escalacao || {}
  const customPositions = activeTeam.customPositions || {}
  const activeFormation = FORMATIONS_CONFIG[selectedFormation] || FORMATIONS_CONFIG['4-3-3']

  // Mudar formação do cenário ativo
  const handleFormationChange = (fmt) => {
    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        return { ...team, formacao: fmt }
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
        return updated
      }
      return team
    }))
  }

  // Base do cálculo de métricas físicas e etárias ('TITULARES' | 'COMPLETO')
  const [metricsScope, setMetricsScope] = useState('TITULARES')

  // Contagem dinâmica de posições preenchidas na formação ativa
  const filledCount = useMemo(() => {
    return activeFormation.positions.filter(pos => {
      const list = slotsData[pos.id] || []
      return list.length > 0
    }).length
  }, [activeFormation, slotsData])

  // Cálculo das métricas de Idade e Altura
  const teamMetrics = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const targetAthletes = []

    activeFormation.positions.forEach(pos => {
      const currentSlots = slotsData[pos.id] || []
      if (currentSlots.length === 0) return

      if (metricsScope === 'TITULARES') {
        const titular = currentSlots[0]
        if (titular) {
          const full = players.find(p => p.id === titular.id) || titular
          targetAthletes.push(full)
        }
      } else {
        currentSlots.forEach(slot => {
          const full = players.find(p => p.id === slot.id) || slot
          targetAthletes.push(full)
        })
      }
    })

    // 1. Média de Idade
    let totalAge = 0
    let countAge = 0

    targetAthletes.forEach(athlete => {
      const rawAn = athlete.an || athlete.anoNascimento
      if (rawAn) {
        let numAn = parseInt(String(rawAn).trim(), 10)
        if (!isNaN(numAn)) {
          if (numAn < 100) {
            numAn = numAn > 30 ? 1900 + numAn : 2000 + numAn
          }
          if (numAn > 1900 && numAn <= currentYear) {
            const age = currentYear - numAn
            if (age >= 14 && age <= 50) {
              totalAge += age
              countAge += 1
            }
          }
        }
      }
    })

    const avgAge = countAge > 0 ? (totalAge / countAge).toFixed(1) : null

    // 2. Média de Altura
    let totalHeight = 0
    let countHeight = 0

    targetAthletes.forEach(athlete => {
      const rawAlt = athlete.alt || athlete.altura
      if (rawAlt) {
        const numAlt = parseFloat(String(rawAlt).replace(',', '.'))
        if (!isNaN(numAlt) && numAlt > 0) {
          const cm = numAlt < 3 ? Math.round(numAlt * 100) : Math.round(numAlt)
          if (cm >= 150 && cm <= 220) {
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
      totalConsidered: targetAthletes.length
    }
  }, [activeFormation, slotsData, players, metricsScope])

  // Desescalar atleta do cenário ativo
  const handleRemovePlayer = (posId, index) => {
    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const currentList = team.escalacao[posId] || []
        return {
          ...team,
          escalacao: {
            ...team.escalacao,
            [posId]: currentList.filter((_, i) => i !== index)
          }
        }
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

        // Cenário A: Mesma posição (reordenação / troca de hierarquia)
        if (sourcePosId === targetPosId) {
          if (targetIndex !== null && targetIndex < sourceList.length) {
            // Troca os dois de lugar (inversão)
            const temp = sourceList[sourceIndex]
            sourceList[sourceIndex] = sourceList[targetIndex]
            sourceList[targetIndex] = temp
          } else {
            // Moveu para o final da lista da mesma posição
            const [moved] = sourceList.splice(sourceIndex, 1)
            sourceList.push(moved)
          }
          escalacao[sourcePosId] = sourceList
          return { ...team, escalacao }
        }

        // Cenário B: Entre posições diferentes
        const targetList = [...(escalacao[targetPosId] || [])]
        const [movedAthlete] = sourceList.splice(sourceIndex, 1)

        // Se o atleta já estiver na posição alvo de alguma forma, cancela para não duplicar
        if (targetList.some(p => p.id === movedAthlete.id)) {
          return team
        }

        // Se a posição de destino atingiu 5 atletas e o drop foi num slot específico, faz substituição ou não permite
        if (targetIndex !== null && targetIndex < targetList.length) {
          // Insere ou troca no slot alvo
          targetList.splice(targetIndex, 0, movedAthlete)
          // Se passou de 5, remove o excedente do final
          if (targetList.length > 5) {
            targetList.pop()
          }
        } else {
          // Adiciona ao final da lista de destino
          if (targetList.length < 5) {
            targetList.push(movedAthlete)
          } else {
            // Se já tem 5 e dropou na posição geral, substitui a 5ª opção
            targetList[4] = movedAthlete
          }
        }

        escalacao[sourcePosId] = sourceList
        escalacao[targetPosId] = targetList
        return { ...team, escalacao }
      }
      return team
    }))

    setDraggedItem(null)
  }

  // Reposicionamento livre dos blocos de posição no gramado
  const handlePositionMouseDown = (e, posId) => {
    // Apenas botão principal do mouse e somente se não estiver clicando em botão
    if (e.button !== 0 || e.target.closest('button')) return
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

  // Escalar atleta no cenário ativo
  const handleAssignPlayer = (player) => {
    if (!assigningPos) return
    const posId = assigningPos.id

    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        const currentList = team.escalacao[posId] || []
        if (currentList.length >= 5) return team
        if (currentList.some(p => p.id === player.id)) return team

        return {
          ...team,
          escalacao: {
            ...team.escalacao,
            [posId]: [
              ...currentList,
              {
                id: player.id,
                nome: player.nome,
                nivel: player.nivel,
                ca: player.ca,
                clube: player.clube || player.ca,
                an: player.an || player.anoNascimento,
                alt: player.alt || player.altura,
                anoNascimento: player.anoNascimento || player.an,
                altura: player.altura || player.alt,
                posicaoOriginal: player.posicao
              }
            ]
          }
        }
      }
      return team
    }))

    setAssigningPos(null)
    setPlayerSearch('')
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
      escalacao: {}
    }

    setShadowTeams(prev => [...prev, newTeam])
    setActiveTeamId(newId)
    setNewTeamName('')
    setIsNewTeamModalOpen(false)
  }

  // Renomear Time Sombra ativo
  const handleRenameTeam = (e) => {
    e.preventDefault()
    if (!renameValue.trim()) return

    setShadowTeams(prev => prev.map(team => {
      if (team.id === activeTeam.id) {
        return { ...team, nome: renameValue.trim() }
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
    const rawAn = athlete.an || athlete.anoNascimento
    if (!rawAn) return athlete.nome
    const strAn = String(rawAn).trim()
    const numAn = parseInt(strAn, 10)
    if (!isNaN(numAn) && numAn > 1900) {
      const lastTwo = String(numAn).slice(-2)
      return `${athlete.nome} ${lastTwo}'`
    }
    if (strAn.length === 2 && !isNaN(parseInt(strAn, 10))) {
      return `${athlete.nome} ${strAn}'`
    }
    return athlete.nome
  }

  const formatAthleteBirthYear = (athlete) => {
    if (!athlete) return ''
    const rawAn = athlete.an || athlete.anoNascimento
    if (!rawAn) return ''
    const strAn = String(rawAn).trim()
    const numAn = parseInt(strAn, 10)
    if (!isNaN(numAn) && numAn > 1900) {
      return `${String(numAn).slice(-2)}'`
    }
    if (strAn.length === 2 && !isNaN(parseInt(strAn, 10))) {
      return `${strAn}'`
    }
    return ''
  }

  const formatAthleteSubDetails = (athlete) => {
    if (!athlete) return ''
    const club = athlete.clube || athlete.ca || ''
    const rawAlt = athlete.alt || athlete.altura
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

      pdf.text(
        `Esquema: ${selectedFormation}   |   Média de Idade: ${idadeStr}   |   Média de Altura: ${alturaStr}`,
        40,
        80
      )

      // Estampa o campograma sem cortes
      pdf.addImage(dataUrl, 'PNG', 0, headerHeight, img.width, img.height)

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
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 md:px-6 py-4 md:py-6 flex flex-col items-center overflow-x-auto">
        {/* PAINEL RESUMO DE MÉTRICAS FÍSICAS E ETÁRIAS */}
        <div className="w-full max-w-[1400px] mb-4 flex flex-wrap items-center justify-between gap-3 bg-[#0d1522] border border-slate-800/80 rounded-2xl p-3 px-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Card 1: Média de Idade */}
            <div className="flex items-center gap-3 bg-[#131d2e] border border-slate-700/60 rounded-xl px-4 py-2 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
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
                  <span className="text-[11px] text-slate-500 font-medium">
                    {metricsScope === 'TITULARES'
                      ? `(${teamMetrics.countAge} titulares calculados)`
                      : `(${teamMetrics.countAge} atletas calculados)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Média de Altura */}
            <div className="flex items-center gap-3 bg-[#131d2e] border border-slate-700/60 rounded-xl px-4 py-2 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
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
                  <span className="text-[11px] text-slate-500 font-medium">
                    {metricsScope === 'TITULARES'
                      ? `(${teamMetrics.countHeight} titulares calculados)`
                      : `(${teamMetrics.countHeight} atletas calculados)`}
                  </span>
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
                Titulares (11)
              </button>
              <button
                type="button"
                onClick={() => setMetricsScope('COMPLETO')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  metricsScope === 'COMPLETO'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                Elenco Completo
              </button>
            </div>
          </div>
        </div>

        <div ref={pitchRef} className="relative w-full max-w-[1400px] min-h-[1250px] h-[1280px] pt-6 rounded-3xl overflow-hidden border-2 border-emerald-800/40 shadow-2xl bg-[#091b12]">
          {/* Textura sutil de faixas de grama cortada */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 80px)'
            }}
          />

          {/* LINHAS DO GRAMADO */}
          {/* Linha Lateral Externa */}
          <div className="absolute inset-5 border border-emerald-400/25 rounded-xl pointer-events-none" />

          {/* Linha do Meio de Campo */}
          <div className="absolute top-1/2 left-5 right-5 h-[1px] bg-emerald-400/25 -translate-y-1/2 pointer-events-none" />

          {/* Círculo Central */}
          <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-emerald-400/25 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-400/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* Grande Área Superior (Ataque) */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[440px] h-36 border-b border-x border-emerald-400/25 pointer-events-none" />
          {/* Pequena Área Superior */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-48 h-16 border-b border-x border-emerald-400/25 pointer-events-none" />
          {/* Marca do Pênalti Superior */}
          <div className="absolute top-28 left-1/2 w-2 h-2 bg-emerald-400/30 rounded-full -translate-x-1/2 pointer-events-none" />

          {/* Grande Área Inferior (Defesa / Gol) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[440px] h-36 border-t border-x border-emerald-400/25 pointer-events-none" />
          {/* Pequena Área Inferior */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-48 h-16 border-t border-x border-emerald-400/25 pointer-events-none" />
          {/* Marca do Pênalti Inferior */}
          <div className="absolute bottom-28 left-1/2 w-2 h-2 bg-emerald-400/30 rounded-full -translate-x-1/2 pointer-events-none" />

          {/* Trave do Gol Inferior */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-24 h-2 border-t-2 border-x-2 border-white/40 pointer-events-none" />

          {/* 3. DISPOSIÇÃO DAS 11 POSIÇÕES CONFORME A FORMAÇÃO SELECIONADA */}
          {activeFormation.positions.map((pos) => {
            const currentSlots = slotsData[pos.id] || []
            const titular = currentSlots[0]
            const alternates = currentSlots.slice(1)
            const isFull = currentSlots.length >= 5
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
                {/* CARD TÁTICO TRANSLÚCIDO COMPACTO */}
                <div
                  onDragOver={(e) => handleDragOver(e, pos.id)}
                  onDragLeave={(e) => handleDragLeave(e, pos.id)}
                  onDrop={(e) => handleDropOnSlot(e, pos.id, null)}
                  className={`w-[220px] min-w-[220px] max-w-[230px] bg-[#070e1b]/95 backdrop-blur-md border rounded-xl p-2.5 shadow-2xl transition-all hover:scale-105 group ${
                    isBeingMoved
                      ? 'border-2 border-emerald-400 shadow-emerald-500/30 scale-105 ring-2 ring-emerald-500/20'
                      : dragOverTarget === pos.id
                      ? 'border-2 border-dashed border-emerald-500/80 bg-emerald-950/30'
                      : 'border-slate-700/70 hover:border-emerald-500/70'
                  }`}
                >
                  {/* Topo do Card: Alça Exclusiva de Arraste da Posição + Nome + Botão "+" */}
                  <div
                    onMouseDown={(e) => handlePositionMouseDown(e, pos.id)}
                    className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 cursor-move select-none active:cursor-grabbing group/header"
                    title="Arraste pelo cabeçalho para reposicionar livremente no gramado"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 truncate group-hover/header:text-emerald-300">
                        {pos.label}
                      </span>
                    </div>

                    {!isFull && (
                      <button
                        data-export-hide="true"
                        onClick={(e) => {
                          e.stopPropagation()
                          setAssigningPos(pos)
                          setPlayerSearch('')
                        }}
                        title="Adicionar Atleta"
                        className="w-4 h-4 rounded bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 stroke-[3]" />
                      </button>
                    )}
                  </div>

                  {/* Corpo do Card: Linhas Ordenadas (1º Titular + Suplentes) */}
                  <div className="space-y-1.5 h-auto">
                    {/* 1º Titular */}
                    {titular ? (
                      (() => {
                        const fullTitular = players.find(p => p.id === titular.id) || titular
                        const birthYearFormatted = formatAthleteBirthYear(fullTitular)
                        const subDetails = formatAthleteSubDetails(fullTitular)
                        const slotKey = `${pos.id}-0`
                        const isBeingDragged = draggedItem?.posId === pos.id && draggedItem?.index === 0
                        const isDragOverThis = dragOverTarget === slotKey

                        return (
                          <div
                            data-player-card="true"
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, pos.id, 0, fullTitular)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => {
                              e.stopPropagation()
                              handleDragOver(e, slotKey)
                            }}
                            onDragLeave={(e) => {
                              e.stopPropagation()
                              handleDragLeave(e, slotKey)
                            }}
                            onDrop={(e) => handleDropOnSlot(e, pos.id, 0)}
                            className={`rounded-lg px-2 py-1.5 flex flex-col gap-0.5 group/row transition-all cursor-grab active:cursor-grabbing ${
                              isBeingDragged
                                ? 'opacity-40 scale-95 border border-dashed border-emerald-400'
                                : isDragOverThis
                                ? 'border-2 border-dashed border-emerald-500/80 bg-emerald-950/60 shadow-md shadow-emerald-500/20'
                                : 'bg-emerald-950/40 border border-emerald-700/40 hover:border-emerald-500/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 w-full">
                              <div className="flex items-center gap-1 min-w-0 flex-1">
                                <span className="text-[10px] font-black text-emerald-400 shrink-0">1º</span>
                                <span className="text-white font-bold text-[12px] truncate" title={fullTitular.nome}>
                                  {fullTitular.nome}
                                </span>
                                {birthYearFormatted && (
                                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-1 py-0.5 rounded ml-1 shrink-0">
                                    {birthYearFormatted}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                <span className={`text-[8px] font-bold px-1 rounded border leading-tight ${getNivelStyle(fullTitular.nivel)}`}>
                                  {fullTitular.nivel || '—'}
                                </span>
                                <button
                                  data-export-hide="true"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemovePlayer(pos.id, 0)
                                  }}
                                  title="Desescalar"
                                  className="opacity-0 group-hover/row:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer ml-0.5"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>

                            {subDetails && (
                              <div className="text-[10px] text-slate-400 truncate pl-3" title={subDetails}>
                                {subDetails}
                              </div>
                            )}
                          </div>
                        )
                      })()
                    ) : (
                      <div
                        data-export-hide="true"
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
                        className={`rounded-lg p-1.5 text-center text-[10px] font-semibold cursor-pointer transition-colors border ${
                          dragOverTarget === `${pos.id}-empty`
                            ? 'border-2 border-dashed border-emerald-400 bg-emerald-500/20 text-emerald-200'
                            : 'border-dashed border-emerald-500/30 hover:border-emerald-400 text-emerald-400/70 hover:text-emerald-300'
                        }`}
                      >
                        + 1º Titular
                      </div>
                    )}

                    {/* Suplentes (2º ao 5º) - Design Ultra-Compacto */}
                    {alternates.map((player, idx) => {
                      const priorityNum = idx + 2
                      const fullPlayer = players.find(p => p.id === player.id) || player
                      const birthYearFormatted = formatAthleteBirthYear(fullPlayer)
                      const subDetails = formatAthleteSubDetails(fullPlayer)
                      const slotKey = `${pos.id}-${idx + 1}`
                      const isBeingDragged = draggedItem?.posId === pos.id && draggedItem?.index === (idx + 1)
                      const isDragOverThis = dragOverTarget === slotKey

                      return (
                        <div
                          key={player.id}
                          data-player-card="true"
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, pos.id, idx + 1, fullPlayer)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => {
                            e.stopPropagation()
                            handleDragOver(e, slotKey)
                          }}
                          onDragLeave={(e) => {
                            e.stopPropagation()
                            handleDragLeave(e, slotKey)
                          }}
                          onDrop={(e) => handleDropOnSlot(e, pos.id, idx + 1)}
                          className={`rounded-md py-0.5 px-1.5 flex flex-col gap-0.5 group/row transition-all cursor-grab active:cursor-grabbing border ${
                            isBeingDragged
                              ? 'opacity-40 scale-95 border-dashed border-emerald-400 bg-slate-900/40'
                              : isDragOverThis
                              ? 'border-2 border-dashed border-emerald-500/80 bg-emerald-950/60 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 w-full">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <span className="text-[9.5px] text-slate-500 font-bold shrink-0">{priorityNum}º</span>
                              <span className="text-white font-bold text-[11.5px] leading-tight truncate" title={fullPlayer.nome}>
                                {fullPlayer.nome}
                              </span>
                              {birthYearFormatted && (
                                <span className="text-[9.5px] font-semibold text-slate-400 bg-slate-800/80 px-1 py-0.2 rounded ml-0.5 shrink-0">
                                  {birthYearFormatted}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              <span className={`text-[8px] font-bold px-1 rounded border leading-tight ${getNivelStyle(fullPlayer.nivel)}`}>
                                {fullPlayer.nivel || '—'}
                              </span>
                              <button
                                data-export-hide="true"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemovePlayer(pos.id, idx + 1)
                                }}
                                title="Desescalar"
                                className="opacity-0 group-hover/row:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer ml-0.5"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {subDetails && (
                            <div className="text-[9.5px] text-slate-400 leading-tight truncate pl-2.5" title={subDetails}>
                              {subDetails}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Linha discreta para adicionar caso haja titular mas não esteja cheio */}
                    {titular && !isFull && alternates.length < 4 && (
                      <div
                        data-export-hide="true"
                        onDragOver={(e) => {
                          e.stopPropagation()
                          handleDragOver(e, `${pos.id}-add-slot`)
                        }}
                        onDragLeave={(e) => {
                          e.stopPropagation()
                          handleDragLeave(e, `${pos.id}-add-slot`)
                        }}
                        onDrop={(e) => handleDropOnSlot(e, pos.id, null)}
                        onClick={() => {
                          setAssigningPos(pos)
                          setPlayerSearch('')
                        }}
                        className={`text-[9px] flex items-center justify-center gap-0.5 cursor-pointer py-0.5 transition-colors border rounded ${
                          dragOverTarget === `${pos.id}-add-slot`
                            ? 'border-2 border-dashed border-emerald-400 bg-emerald-500/20 text-emerald-200'
                            : 'text-slate-500 hover:text-emerald-400 border-dashed border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>{alternates.length + 2}º Opção</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* 4. MODAL DE SELEÇÃO DO BANCO */}
      {assigningPos && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
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
    </div>
  )
}

