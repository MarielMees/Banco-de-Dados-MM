import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  GraduationCap,
  Plus,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ClipboardList,
  FileText,
  Trophy,
  Star,
  RotateCcw,
  Loader2,
  Calendar,
  Layers,
  CheckCircle2,
  Menu
} from 'lucide-react'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'
import UserBadge from './UserBadge'

// Posições internas para observação e jogos da Copa SP
const POSICOES_COPA_SP = [
  'Goleiro',
  'Zagueiro',
  'Lateral Direito',
  'Lateral Esquerdo',
  'Volante',
  'Meia / Armador',
  'Ponta / Extremo',
  'Centroavante'
]

const STATUS_OLHAR_OPTIONS = [
  { id: 'Observar Novamente', label: 'Observar Novamente', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'Interessante', label: 'Interessante', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { id: 'Prioridade', label: 'Prioridade', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'Descartado', label: 'Descartado', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' }
]

const POSICOES_PRINCIPAL = [
  { id: 'goleiro', label: 'Goleiro' },
  { id: 'zagueiro', label: 'Zag. Destro' },
  { id: 'zag-canhoto', label: 'Zag. Canhoto' },
  { id: 'lat-direito', label: 'Lat. Direito' },
  { id: 'lat-esquerdo', label: 'Lat. Esquerdo' },
  { id: 'medio', label: 'Médio' },
  { id: 'meia-ofensivo', label: 'Meia Ofensivo' },
  { id: 'extremo', label: 'Extremo' },
  { id: 'centroavante', label: 'Centroavante' }
]

const NIVEIS_PRO = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D']
const FASES_COPINHA = ['Fase de Grupos', '2ª Fase', '3ª Fase', 'Oitavas de Final', 'Quartas de Final', 'Semifinal', 'Final']

// Formações do Campograma da Seleção da Copa SP
const FORMATIONS_CONFIG = {
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { id: 'ca', label: 'Centroavante', matchPositions: ['centroavante'], top: 8, left: 50 },
      { id: 'ext-e', label: 'Extremo Esquerdo', matchPositions: ['extremo', 'ponta / extremo'], top: 11, left: 16 },
      { id: 'ext-d', label: 'Extremo Direito', matchPositions: ['extremo', 'ponta / extremo'], top: 11, left: 84 },
      { id: 'mei-o', label: 'Meia Ofensivo', matchPositions: ['meia-ofensivo', 'meia / armador'], top: 34, left: 50 },
      { id: 'med-c', label: 'Médio Central', matchPositions: ['medio', 'volante'], top: 50, left: 30 },
      { id: 'vol', label: 'Volante', matchPositions: ['medio', 'volante'], top: 50, left: 70 },
      { id: 'lat-e', label: 'Lat. Esquerdo', matchPositions: ['lat-esquerdo', 'lateral esquerdo'], top: 72, left: 14 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto', 'zagueiro'], top: 72, left: 38 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 62 },
      { id: 'lat-d', label: 'Lat. Direito', matchPositions: ['lat-direito', 'lateral direito'], top: 72, left: 86 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { id: 'ca', label: 'Centroavante', matchPositions: ['centroavante'], top: 8, left: 50 },
      { id: 'mei-e', label: 'Meia / Ext. Esq.', matchPositions: ['extremo', 'meia-ofensivo', 'ponta / extremo'], top: 22, left: 18 },
      { id: 'mei-c', label: 'Meia Central', matchPositions: ['meia-ofensivo', 'meia / armador'], top: 32, left: 50 },
      { id: 'mei-d', label: 'Meia / Ext. Dir.', matchPositions: ['extremo', 'meia-ofensivo', 'ponta / extremo'], top: 22, left: 82 },
      { id: 'vol-1', label: 'Volante 1', matchPositions: ['medio', 'volante'], top: 50, left: 34 },
      { id: 'vol-2', label: 'Volante 2', matchPositions: ['medio', 'volante'], top: 50, left: 66 },
      { id: 'lat-e', label: 'Lat. Esquerdo', matchPositions: ['lat-esquerdo', 'lateral esquerdo'], top: 72, left: 14 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto', 'zagueiro'], top: 72, left: 38 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 62 },
      { id: 'lat-d', label: 'Lat. Direito', matchPositions: ['lat-direito', 'lateral direito'], top: 72, left: 86 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  },
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { id: 'ca-1', label: 'Centroavante 1', matchPositions: ['centroavante'], top: 8, left: 38 },
      { id: 'ca-2', label: 'Centroavante 2', matchPositions: ['centroavante'], top: 8, left: 62 },
      { id: 'me-e', label: 'Médio / Ext. Esq.', matchPositions: ['extremo', 'medio', 'ponta / extremo'], top: 30, left: 16 },
      { id: 'vol', label: 'Volante', matchPositions: ['medio', 'volante'], top: 50, left: 38 },
      { id: 'med', label: 'Médio Central', matchPositions: ['medio', 'volante'], top: 50, left: 62 },
      { id: 'me-d', label: 'Médio / Ext. Dir.', matchPositions: ['extremo', 'medio', 'ponta / extremo'], top: 30, left: 84 },
      { id: 'lat-e', label: 'Lat. Esquerdo', matchPositions: ['lat-esquerdo', 'lateral esquerdo'], top: 72, left: 14 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto', 'zagueiro'], top: 72, left: 38 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 62 },
      { id: 'lat-d', label: 'Lat. Direito', matchPositions: ['lat-direito', 'lateral direito'], top: 72, left: 86 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  }
}

const normalizeCopaPosKey = (pos) => {
  if (!pos) return 'centroavante'
  const p = pos.toLowerCase().trim()
  if (p.includes('gol')) return 'goleiro'
  if (p.includes('canhot') || p.includes('zag-canhoto')) return 'zag-canhoto'
  if (p.includes('zag')) return 'zagueiro'
  if (p.includes('lat') && (p.includes('dir') || p.includes('d'))) return 'lat-direito'
  if (p.includes('lat') && (p.includes('esq') || p.includes('e'))) return 'lat-esquerdo'
  if (p.includes('vol') || p.includes('méd') || p.includes('med')) return 'medio'
  if (p.includes('mei') || p.includes('arm')) return 'meia-ofensivo'
  if (p.includes('pont') || p.includes('ext')) return 'extremo'
  if (p.includes('cent') || p.includes('ata')) return 'centroavante'
  return p
}

export default function CopaSPList({
  onBack,
  onPromotePlayer,
  mainPlayers = [],
  initialMatchToCreate = null,
  user,
  onSignOut,
  onOpenMobileMenu
}) {
  // 3 Sub-abas da Copa SP
  const [subTab, setSubTab] = useState(initialMatchToCreate ? 'JOGOS' : 'ATLETAS') // 'ATLETAS' | 'JOGOS' | 'SELECAO'

  // 1. BANCO DE ATLETAS DA COPA SP
  const [copaPlayers, setCopaPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('radar_copa_sp_players') || localStorage.getItem('copa_sp_players')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  // 2. RELATÓRIOS DE JOGO EXCLUSIVOS DA COPA SP
  const [copaMatches, setCopaMatches] = useState(() => {
    try {
      const saved = localStorage.getItem('radar_copa_sp_matches')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  // 3. SELEÇÃO DA COPA SP (Curadoria Manual & Posições)
  const [copaSelectionData, setCopaSelectionData] = useState(() => {
    try {
      const saved = localStorage.getItem('radar_copa_sp_selection')
      return saved ? JSON.parse(saved) : { manualSlots: {}, customPositions: {}, formation: '4-3-3' }
    } catch (e) {
      return { manualSlots: {}, customPositions: {}, formation: '4-3-3' }
    }
  })

  const [selectedFormation, setSelectedFormation] = useState(copaSelectionData.formation || '4-3-3')

  // Filtros Atletas
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modais Atleta
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [playerToDelete, setPlayerToDelete] = useState(null)

  // Modais Partida
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(!!initialMatchToCreate)
  const [editingMatch, setEditingMatch] = useState(null)
  const [matchToDelete, setMatchToDelete] = useState(null)

  // Modal Promoção ao Radar Profissional
  const [promotingPlayer, setPromotingPlayer] = useState(null)
  const [promoteForm, setPromoteForm] = useState({
    posicaoPrincipal: 'centroavante',
    nivel: 'B',
    clubeFormador: '',
    observacoesContratuais: ''
  })

  // Modal Seleção da Copinha (Slot manual)
  const [assigningSlotPos, setAssigningSlotPos] = useState(null)
  const [slotSearch, setSlotSearch] = useState('')

  // Dragging nos blocos da Seleção
  const [draggingPosId, setDraggingPosId] = useState(null)
  const isDraggingBlockRef = useRef(false)
  const pitchRef = useRef(null)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  // Persistência Isolada
  useEffect(() => {
    try {
      localStorage.setItem('radar_copa_sp_players', JSON.stringify(copaPlayers))
      localStorage.setItem('copa_sp_players', JSON.stringify(copaPlayers))
    } catch (e) {}
  }, [copaPlayers])

  useEffect(() => {
    try {
      localStorage.setItem('radar_copa_sp_matches', JSON.stringify(copaMatches))
    } catch (e) {}
  }, [copaMatches])

  useEffect(() => {
    try {
      localStorage.setItem('radar_copa_sp_selection', JSON.stringify(copaSelectionData))
    } catch (e) {}
  }, [copaSelectionData])

  // Form Atleta State
  const [formData, setFormData] = useState({
    nome: '',
    clubeCopaSP: '',
    anoNascimento: 2006,
    posicaoObservada: 'Centroavante',
    pe: 'Destro',
    alt: 180,
    notaJogo: '7.0',
    destaquePartida: false,
    statusOlhar: 'Interessante',
    observacoes: ''
  })

  // Form Match State
  const [matchForm, setMatchForm] = useState(() => {
    if (initialMatchToCreate) {
      return {
        partida: `${initialMatchToCreate.mandante?.nome || ''} vs ${initialMatchToCreate.visitante?.nome || ''}`,
        fase: initialMatchToCreate.rodada || 'Fase de Grupos',
        data: initialMatchToCreate.data || new Date().toISOString().split('T')[0],
        placar: initialMatchToCreate.placar || '',
        observacoesGerais: initialMatchToCreate.estadio ? `Local: ${initialMatchToCreate.estadio}` : '',
        atletasAvaliados: []
      }
    }
    return {
      partida: '',
      fase: 'Fase de Grupos',
      data: new Date().toISOString().split('T')[0],
      placar: '',
      observacoesGerais: '',
      atletasAvaliados: []
    }
  })

  // Auto-cálculo do Ranking e Notas da Copa SP
  const copaPlayerStats = useMemo(() => {
    const stats = {}

    // Inicializa com atletas observados
    copaPlayers.forEach(p => {
      stats[p.id] = {
        id: p.id,
        nome: p.nome,
        clube: p.clubeCopaSP || p.ca || '—',
        anoNascimento: p.anoNascimento || p.an || 2006,
        alt: p.alt || 178,
        pe: p.pe || 'Destro',
        posicao: p.posicaoObservada || 'Centroavante',
        totalJogos: 0,
        somaNotas: 0,
        destaquesCount: 0,
        promovido: !!p.promovido
      }
    })

    // Processa jogos da Copinha
    copaMatches.forEach(m => {
      const avaliados = Array.isArray(m.atletasAvaliados) ? m.atletasAvaliados : []
      avaliados.forEach(atleta => {
        if (!atleta) return
        const aNome = atleta.nome ? atleta.nome.trim().toLowerCase() : ''
        let targetId = atleta.idAtleta || atleta.id

        // Se não tiver id direto ou se não estiver no stats, tenta localizar pelo nome em copaPlayers
        if (!targetId || !stats[targetId]) {
          const registered = copaPlayers.find(p => 
            (targetId && p.id === targetId) ||
            (p.nome && p.nome.trim().toLowerCase() === aNome)
          )
          if (registered) {
            targetId = registered.id
          } else if (atleta.nome) {
            targetId = targetId || `virtual_${aNome}`
          }
        }

        if (!targetId) return

        if (!stats[targetId]) {
          const registered = copaPlayers.find(p => p.id === targetId || (p.nome && p.nome.trim().toLowerCase() === aNome))
          stats[targetId] = {
            id: targetId,
            nome: atleta.nome || registered?.nome || 'Atleta',
            clube: atleta.clube || registered?.clubeCopaSP || registered?.ca || '—',
            anoNascimento: registered?.anoNascimento || registered?.an || 2006,
            alt: registered?.alt || 178,
            pe: atleta.pe || registered?.pe || 'Destro',
            posicao: atleta.posicao || registered?.posicaoObservada || 'Centroavante',
            totalJogos: 0,
            somaNotas: 0,
            destaquesCount: 0,
            promovido: !!registered?.promovido
          }
        }

        const notaNum = parseFloat(atleta.nota)
        if (!isNaN(notaNum) && notaNum > 0) {
          stats[targetId].somaNotas += notaNum
          stats[targetId].totalJogos += 1
        }

        if (atleta.destaque) {
          stats[targetId].destaquesCount += 1
        }
      })
    })

    // Agrupa por posição normalizada para o campograma
    const byPos = {}
    Object.values(stats).forEach(st => {
      const media = st.totalJogos > 0 ? (st.somaNotas / st.totalJogos) : 0
      const posKey = normalizeCopaPosKey(st.posicao)
      if (!byPos[posKey]) byPos[posKey] = []
      byPos[posKey].push({
        ...st,
        mediaNota: media,
        mediaGeral: media > 0 ? media.toFixed(1) : (copaPlayers.find(p => p.id === st.id)?.notaJogo || '7.0'),
        estrelas: st.destaquesCount
      })
    })

    // Ordena cada posição por Destaques DESC depois Média DESC
    Object.keys(byPos).forEach(k => {
      byPos[k].sort((a, b) => {
        if (b.destaquesCount !== a.destaquesCount) return b.destaquesCount - a.destaquesCount
        return b.mediaNota - a.mediaNota
      })
    })

    return { stats, byPos }
  }, [copaPlayers, copaMatches])

  // Handlers Atletas
  const handleOpenAddAthlete = () => {
    setEditingPlayer(null)
    setFormData({
      nome: '',
      clubeCopaSP: '',
      anoNascimento: 2006,
      posicaoObservada: 'Centroavante',
      pe: 'Destro',
      alt: 180,
      notaJogo: '7.0',
      destaquePartida: false,
      statusOlhar: 'Interessante',
      observacoes: ''
    })
    setIsFormModalOpen(true)
  }

  const handleOpenEditAthlete = (athlete) => {
    setEditingPlayer(athlete)
    setFormData({
      nome: athlete.nome || '',
      clubeCopaSP: athlete.clubeCopaSP || athlete.ca || '',
      anoNascimento: athlete.anoNascimento || athlete.an || 2006,
      posicaoObservada: athlete.posicaoObservada || 'Centroavante',
      pe: athlete.pe || 'Destro',
      alt: athlete.alt || 180,
      notaJogo: athlete.notaJogo || '7.0',
      destaquePartida: !!athlete.destaquePartida,
      statusOlhar: athlete.statusOlhar || 'Interessante',
      observacoes: athlete.observacoes || ''
    })
    setIsFormModalOpen(true)
  }

  const handleSaveAthlete = (e) => {
    e.preventDefault()
    if (!formData.nome.trim()) return

    if (editingPlayer) {
      setCopaPlayers(prev => prev.map(p => {
        if (p.id === editingPlayer.id) {
          return {
            ...p,
            ...formData,
            anoNascimento: parseInt(formData.anoNascimento, 10) || 2006,
            an: parseInt(formData.anoNascimento, 10) || 2006,
            ca: formData.clubeCopaSP
          }
        }
        return p
      }))
    } else {
      const newAthlete = {
        id: `copasp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...formData,
        anoNascimento: parseInt(formData.anoNascimento, 10) || 2006,
        an: parseInt(formData.anoNascimento, 10) || 2006,
        ca: formData.clubeCopaSP,
        isSandboxBase: true,
        promovido: false,
        criadoEm: new Date().toISOString()
      }
      setCopaPlayers(prev => [newAthlete, ...prev])
    }
    setIsFormModalOpen(false)
  }

  const handleDeleteAthlete = () => {
    if (!playerToDelete) return
    setCopaPlayers(prev => prev.filter(p => p.id !== playerToDelete.id))
    setPlayerToDelete(null)
  }

  // Handlers Partidas
  const handleOpenAddMatch = () => {
    setEditingMatch(null)
    setMatchForm({
      partida: '',
      fase: 'Fase de Grupos',
      data: new Date().toISOString().split('T')[0],
      placar: '',
      observacoesGerais: '',
      atletasAvaliados: []
    })
    setIsMatchModalOpen(true)
  }

  const handleOpenEditMatch = (match) => {
    setEditingMatch(match)
    setMatchForm({
      partida: match.partida || '',
      fase: match.fase || 'Fase de Grupos',
      data: match.data || new Date().toISOString().split('T')[0],
      placar: match.placar || '',
      observacoesGerais: match.observacoesGerais || '',
      atletasAvaliados: match.atletasAvaliados || []
    })
    setIsMatchModalOpen(true)
  }

  const handleAddAthleteToMatch = () => {
    setMatchForm(prev => ({
      ...prev,
      atletasAvaliados: [
        ...prev.atletasAvaliados,
        {
          idAtleta: '',
          nome: '',
          clube: '',
          posicao: 'Centroavante',
          nota: '7.0',
          destaque: false,
          observacao: ''
        }
      ]
    }))
  }

  const handleSaveMatch = (e) => {
    e.preventDefault()
    if (!matchForm.partida.trim()) return

    const matchId = editingMatch ? editingMatch.id : `match_copasp_${Date.now()}`
    const finalMatch = {
      id: matchId,
      ...matchForm,
      criadoEm: editingMatch ? editingMatch.criadoEm : new Date().toISOString()
    }

    // 1. Atualizar ou Criar Partida
    if (editingMatch) {
      setCopaMatches(prev => prev.map(m => m.id === editingMatch.id ? finalMatch : m))
    } else {
      setCopaMatches(prev => [finalMatch, ...prev])
    }

    // 2. Auto-Cadastro e Sincronização em Atletas Observados (copaPlayers)
    const validAtletas = (matchForm.atletasAvaliados || []).filter(a => a && a.nome && a.nome.trim())
    if (validAtletas.length > 0) {
      setCopaPlayers(prevPlayers => {
        let updatedList = [...prevPlayers]

        validAtletas.forEach((atleta, idx) => {
          const atletaNome = atleta.nome.trim()
          const notaNum = parseFloat(atleta.nota) || 7.0
          const isDestaque = !!atleta.destaque

          // Encontra se já existe pelo idAtleta ou nome
          const existingIdx = updatedList.findIndex(p => 
            (atleta.idAtleta && p.id === atleta.idAtleta) ||
            (p.nome && p.nome.trim().toLowerCase() === atletaNome.toLowerCase())
          )

          const novaAvaliacao = {
            partidaId: matchId,
            partida: matchForm.partida,
            fase: matchForm.fase,
            data: matchForm.data,
            nota: notaNum,
            destaque: isDestaque,
            observacao: atleta.observacao || ''
          }

          if (existingIdx >= 0) {
            // Atleta já existente: atualiza avaliações, clube/posição se não preenchidos
            const existing = updatedList[existingIdx]
            const prevAvals = Array.isArray(existing.avaliacoes) ? existing.avaliacoes : []
            // Substitui avaliação da mesma partida ou adiciona
            const filteredAvals = prevAvals.filter(av => av.partidaId !== matchId)
            const updatedAvals = [...filteredAvals, novaAvaliacao]
            const totalJogos = updatedAvals.length
            const somaNotas = updatedAvals.reduce((acc, curr) => acc + (parseFloat(curr.nota) || 0), 0)
            const mediaCalc = totalJogos > 0 ? (somaNotas / totalJogos).toFixed(1) : existing.notaJogo
            const destaquesCalc = updatedAvals.filter(av => av.destaque).length

            updatedList[existingIdx] = {
              ...existing,
              clubeCopaSP: existing.clubeCopaSP || atleta.clube || existing.ca || '',
              ca: existing.clubeCopaSP || atleta.clube || existing.ca || '',
              posicaoObservada: existing.posicaoObservada || atleta.posicao || 'Centroavante',
              destaquePartida: destaquesCalc > 0,
              totalDestaques: destaquesCalc,
              notaJogo: mediaCalc,
              mediaGeral: mediaCalc,
              avaliacoes: updatedAvals
            }
          } else {
            // Atleta novo: auto-cadastro no banco da Copinha
            const newId = atleta.idAtleta || `copasp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`
            const newAthlete = {
              id: newId,
              nome: atletaNome,
              clubeCopaSP: atleta.clube || '',
              ca: atleta.clube || '',
              anoNascimento: 2006,
              an: 2006,
              posicaoObservada: atleta.posicao || 'Centroavante',
              pe: 'Destro',
              alt: 180,
              notaJogo: notaNum.toFixed(1),
              mediaGeral: notaNum.toFixed(1),
              destaquePartida: isDestaque,
              totalDestaques: isDestaque ? 1 : 0,
              statusOlhar: isDestaque ? 'Prioridade' : 'Interessante',
              observacoes: `Auto-cadastrado via relatório de jogo: ${matchForm.partida}`,
              isSandboxBase: true,
              promovido: false,
              avaliacoes: [novaAvaliacao],
              criadoEm: new Date().toISOString()
            }
            updatedList = [newAthlete, ...updatedList]
          }
        })

        return updatedList
      })
    }

    setIsMatchModalOpen(false)
  }

  const handleDeleteMatch = () => {
    if (!matchToDelete) return
    setCopaMatches(prev => prev.filter(m => m.id !== matchToDelete.id))
    setMatchToDelete(null)
  }

  // Handler Promoção ao Profissional
  const handleOpenPromote = (athlete) => {
    setPromotingPlayer(athlete)
    let defPos = 'centroavante'
    const posObs = (athlete.posicaoObservada || athlete.posicao || '').toLowerCase()
    if (posObs.includes('gol')) defPos = 'goleiro'
    else if (posObs.includes('zag')) defPos = athlete.pe === 'Canhoto' ? 'zag-canhoto' : 'zagueiro'
    else if (posObs.includes('direito') || posObs.includes('lat. d')) defPos = 'lat-direito'
    else if (posObs.includes('esquerdo') || posObs.includes('lat. e')) defPos = 'lat-esquerdo'
    else if (posObs.includes('volante')) defPos = 'medio'
    else if (posObs.includes('meia') || posObs.includes('armador')) defPos = 'meia-ofensivo'
    else if (posObs.includes('ponta') || posObs.includes('extremo')) defPos = 'extremo'

    setPromoteForm({
      posicaoPrincipal: defPos,
      nivel: 'B',
      clubeFormador: athlete.clubeCopaSP || athlete.clube || '',
      observacoesContratuais: ''
    })
  }

  const handleConfirmPromote = (e) => {
    e.preventDefault()
    if (!promotingPlayer) return

    const promotedAthlete = {
      id: Date.now(),
      copaSpRefId: promotingPlayer.id,
      nome: promotingPlayer.nome,
      posicao: promoteForm.posicaoPrincipal,
      an: promotingPlayer.anoNascimento || promotingPlayer.an || 2006,
      alt: promotingPlayer.alt || 178,
      pe: promotingPlayer.pe || 'Destro',
      nivel: promoteForm.nivel || 'B',
      projecao: 'BR2',
      nivelFisico: 'Bom',
      alerta: 'Base',
      origem: 'Copa SP',
      categoria: 'Sub-20/Base',
      ca: promotingPlayer.clubeCopaSP || promotingPlayer.clube || '',
      clubeFormador: promoteForm.clubeFormador || promotingPlayer.clubeCopaSP || promotingPlayer.clube || '',
      posSecundaria: '—',
      caracteristicas: ['Formação de Base', promotingPlayer.posicaoObservada || promotingPlayer.posicao || 'Copa SP'],
      agente: '—',
      contrato: promoteForm.observacoesContratuais || '',
      radarSub23: true,
      monitoramento: true,
      hotList: promotingPlayer.destaquesCount > 0 || promotingPlayer.statusOlhar === 'Prioridade',
      observacao: `[PROMOVIDO DA COPA SP] ${promotingPlayer.observacoes || ''} (Média Copinha: ${promotingPlayer.mediaGeral || promotingPlayer.notaJogo || '—'}, Destaques: ${promotingPlayer.destaquesCount || 0}★)`,
      videoYoutube: ''
    }

    if (onPromotePlayer) {
      onPromotePlayer(promotedAthlete)
    }

    setCopaPlayers(prev => prev.map(p => {
      if (p.id === promotingPlayer.id || p.nome === promotingPlayer.nome) {
        return {
          ...p,
          promovido: true,
          promovidoEm: new Date().toISOString(),
          posicaoPrincipalPromovida: promoteForm.posicaoPrincipal
        }
      }
      return p
    }))

    setPromotingPlayer(null)
  }

  // Lógica da Seleção da Copa SP
  const activeFormation = FORMATIONS_CONFIG[selectedFormation] || FORMATIONS_CONFIG['4-3-3']

  // Slots computados (automáticos + curadoria manual)
  const selectionSlots = useMemo(() => {
    const slots = {}
    const manual = copaSelectionData.manualSlots || {}

    activeFormation.positions.forEach(pos => {
      if (manual[pos.id] && manual[pos.id].length > 0) {
        slots[pos.id] = manual[pos.id]
      } else {
        const matchPosKeys = pos.matchPositions.map(mp => normalizeCopaPosKey(mp))
        const candidatesMap = new Map()
        matchPosKeys.forEach(mk => {
          if (copaPlayerStats.byPos[mk]) {
            copaPlayerStats.byPos[mk].forEach(cand => {
              if (!candidatesMap.has(cand.id)) {
                candidatesMap.set(cand.id, cand)
              }
            })
          }
        })
        const candidates = Array.from(candidatesMap.values())
        candidates.sort((a, b) => {
          if (b.destaquesCount !== a.destaquesCount) return b.destaquesCount - a.destaquesCount
          return b.mediaNota - a.mediaNota
        })
        slots[pos.id] = candidates.slice(0, 5)
      }
    })

    return slots
  }, [activeFormation, copaSelectionData.manualSlots, copaPlayerStats.byPos])

  // Resetar coordenadas customizadas
  const handleResetPositions = () => {
    setCopaSelectionData(prev => ({
      ...prev,
      customPositions: {}
    }))
  }

  // Arraste livre pelo cabeçalho
  const handlePositionMouseDown = (e, posId) => {
    if (e.button !== 0) return
    isDraggingBlockRef.current = true
    setDraggingPosId(posId)

    const pitch = pitchRef.current
    if (!pitch) return
    const rect = pitch.getBoundingClientRect()

    const onMouseMove = (moveEvent) => {
      if (!isDraggingBlockRef.current) return
      let x = moveEvent.clientX - rect.left
      let y = moveEvent.clientY - rect.top
      x = Math.max(110, Math.min(rect.width - 110, x))
      y = Math.max(45, Math.min(rect.height - 45, y))
      const xPct = Math.round((x / rect.width) * 1000) / 10
      const yPct = Math.round((y / rect.height) * 1000) / 10

      setCopaSelectionData(prev => ({
        ...prev,
        customPositions: {
          ...(prev.customPositions || {}),
          [posId]: { top: `${yPct}%`, left: `${xPct}%` }
        }
      }))
    }

    const onMouseUp = () => {
      isDraggingBlockRef.current = false
      setDraggingPosId(null)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Exportação limpa em PDF
  const handleExportPdf = async () => {
    if (!pitchRef.current || isExportingPdf) return
    setIsExportingPdf(true)

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      const element = pitchRef.current

      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        filter: (node) => {
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

      const img = new Image()
      img.src = dataUrl
      await new Promise((res, rej) => {
        img.onload = res
        img.onerror = rej
      })

      const headerHeight = 120
      const pdfWidth = img.width
      const pdfHeight = img.height + headerHeight

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      })

      // Cabeçalho Dark Executivo
      pdf.setFillColor(6, 13, 23)
      pdf.rect(0, 0, pdfWidth, headerHeight, 'F')

      // Linha superior dourada
      pdf.setFillColor(245, 158, 11)
      pdf.rect(0, 0, pdfWidth, 4, 'F')

      // Título
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.text('SELEÇÃO DA COPA SP — 11 IDEAL DA BASE', 40, 48)

      // Subtítulo
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(14)
      const dataFormatada = new Date().toLocaleDateString('pt-BR')
      pdf.text(
        `Esquema Tático: ${selectedFormation}  |  Critério: Destaques da Rodada e Médias da Copinha  |  Data: ${dataFormatada}`,
        40,
        84
      )

      pdf.addImage(dataUrl, 'PNG', 0, headerHeight, img.width, img.height)
      pdf.save(`Selecao_Copa_SP_${selectedFormation}.pdf`)
    } catch (err) {
      console.error('Erro ao gerar PDF da Seleção Copa SP:', err)
      alert('Houve um erro ao gerar o PDF da Seleção. Verifique o console.')
    } finally {
      setIsExportingPdf(false)
    }
  }

  // Filtragem da lista de atletas
  const filteredAthletes = useMemo(() => {
    return copaPlayers.filter(p => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchNome = (p.nome || '').toLowerCase().includes(q)
        const matchClube = (p.clubeCopaSP || p.ca || '').toLowerCase().includes(q)
        const matchObs = (p.observacoes || '').toLowerCase().includes(q)
        if (!matchNome && !matchClube && !matchObs) return false
      }
      if (posFilter !== 'ALL' && p.posicaoObservada !== posFilter) return false
      if (yearFilter !== 'ALL' && String(p.anoNascimento || p.an) !== String(yearFilter)) return false
      if (statusFilter !== 'ALL' && p.statusOlhar !== statusFilter) return false
      return true
    })
  }, [copaPlayers, search, posFilter, yearFilter, statusFilter])

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 font-sans pb-16 select-none">
      {/* 1. CABEÇALHO DA ABA COPA SP */}
      <header className="bg-[#0b111c] border-b border-slate-800/80 px-3 md:px-6 py-3 md:py-3.5 sticky top-0 z-40">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
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
            <button
              onClick={onBack}
              title="Voltar para a Visão Geral"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
                  Copa SP de Futebol Júnior
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-tight">
                  Sandbox de Base
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {copaPlayers.length} atletas &bull; {copaMatches.length} jogos
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-400 line-clamp-1">
                Ecossistema isolado da base: observações, relatórios de partidas e 11 ideal da Copinha
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sub-abas de Navegação */}
            <div className="flex items-center gap-1 bg-[#080d16] p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
              <button
                onClick={() => setSubTab('ATLETAS')}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  subTab === 'ATLETAS'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Atletas <span className="hidden sm:inline">Observados</span> ({copaPlayers.length})</span>
              </button>

              <button
                onClick={() => setSubTab('JOGOS')}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  subTab === 'JOGOS'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Jogos <span className="hidden sm:inline">({copaMatches.length})</span></span>
              </button>

              <button
                onClick={() => setSubTab('SELECAO')}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  subTab === 'SELECAO'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Seleção <span className="hidden sm:inline">da Copa SP</span></span>
              </button>
            </div>

            {user && (
              <UserBadge user={user} onSignOut={onSignOut} />
            )}
          </div>
        </div>
      </header>

      {/* SUB-ABA 1: ATLETAS OBSERVADOS */}
      {subTab === 'ATLETAS' && (
        <>
          {/* Barra de Filtros */}
          <div className="max-w-[1720px] mx-auto px-3 md:px-6 pt-4 md:pt-5 pb-3">
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por atleta, clube..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <select
                  value={posFilter}
                  onChange={(e) => setPosFilter(e.target.value)}
                  className="bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-amber-500/60 cursor-pointer"
                >
                  <option value="ALL">Todas as Posições</option>
                  {POSICOES_COPA_SP.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-amber-500/60 cursor-pointer"
                >
                  <option value="ALL">Todos os Status</option>
                  {STATUS_OLHAR_OPTIONS.map(st => (
                    <option key={st.id} value={st.id}>{st.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenAddAthlete}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Observar Novo Atleta</span>
              </button>
            </div>
          </div>

          {/* Grid de Atletas */}
          <main className="w-full min-h-screen max-w-[1720px] mx-auto px-3 md:px-6 py-2">
            {filteredAthletes.length === 0 ? (
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center max-w-xl mx-auto mt-8 shadow-lg">
                <GraduationCap className="w-12 h-12 text-amber-500/60 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Nenhum Atleta da Copinha Encontrado</h3>
                <p className="text-xs text-slate-400 mb-5">
                  Cadastre jovens atletas observados durante a Copa SP sem impactar os rankings profissionais.
                </p>
                <button
                  onClick={handleOpenAddAthlete}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  Cadastrar Primeiro Atleta
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredAthletes.map(athlete => {
                  const statusCfg = STATUS_OLHAR_OPTIONS.find(s => s.id === athlete.statusOlhar) || STATUS_OLHAR_OPTIONS[0]
                  const stat = copaPlayerStats.stats[athlete.id] || {}

                  return (
                    <div
                      key={athlete.id}
                      className={`bg-[#0d1524] border rounded-xl p-3.5 transition-all shadow-md flex flex-col justify-between ${
                        athlete.promovido
                          ? 'border-emerald-500/40 bg-gradient-to-b from-[#0d1d22] to-[#0a121c]'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-sm text-white truncate" title={athlete.nome}>
                                {athlete.nome}
                              </h4>
                              {athlete.destaquePartida && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                  Destaque
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate mt-0.5" title={athlete.clubeCopaSP}>
                              {athlete.clubeCopaSP || 'Sem clube informado'}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditAthlete(athlete)}
                              title="Editar Ficha"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setPlayerToDelete(athlete)}
                              title="Excluir Registro"
                              className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Metadados */}
                        <div className="grid grid-cols-4 gap-1 text-center my-2.5 bg-[#090e18] p-2 rounded-lg border border-slate-800/80">
                          <div>
                            <div className="text-[8.5px] text-slate-500 uppercase font-semibold">Nasc.</div>
                            <div className="text-xs font-bold text-slate-200">
                              {athlete.anoNascimento || athlete.an || '—'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[8.5px] text-slate-500 uppercase font-semibold">Pé</div>
                            <div className="text-xs font-semibold text-slate-300">
                              {athlete.pe || '—'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[8.5px] text-slate-500 uppercase font-semibold">Nota Média</div>
                            <div className="text-xs font-mono font-bold text-emerald-400">
                              {stat.totalJogos > 0 ? (stat.somaNotas / stat.totalJogos).toFixed(1) : (athlete.notaJogo || '—')}
                            </div>
                          </div>
                          <div>
                            <div className="text-[8.5px] text-slate-500 uppercase font-semibold">Destaques</div>
                            <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              {stat.destaquesCount || (athlete.destaquePartida ? 1 : 0)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1 text-[11px] mb-2.5">
                          <span className="text-slate-300 bg-[#121c2e] px-2 py-0.5 rounded border border-slate-800 font-medium">
                            {athlete.posicaoObservada}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>

                        {athlete.observacoes && (
                          <div className="text-xs text-slate-400 bg-[#090f1a] p-2 rounded border border-slate-800/60 leading-relaxed line-clamp-3 mb-2.5 italic">
                            "{athlete.observacoes}"
                          </div>
                        )}
                      </div>

                      {/* Promoção ao Profissional */}
                      <div className="pt-2 border-t border-slate-800/80 mt-2">
                        {athlete.promovido ? (
                          <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                            <span className="flex items-center gap-1.5 text-[11px]">
                              <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                              Promovido ao Profissional
                            </span>
                            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50">
                              {athlete.posicaoPrincipalPromovida || 'Pro'}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenPromote(athlete)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-bold text-xs transition-all cursor-pointer shadow-xs"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Promover ao Radar Principal</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </>
      )}

      {/* SUB-ABA 2: RELATÓRIOS DE JOGO DA COPINHA */}
      {subTab === 'JOGOS' && (
        <main className="w-full min-h-screen max-w-[1720px] mx-auto px-3 md:px-6 py-4 md:py-5 space-y-4">
          <div className="flex items-center justify-between gap-4 bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 shadow-md">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Partidas & Avaliações da Copinha
              </h2>
              <p className="text-xs text-slate-400">
                Avalie os atletas da base com notas e eleição de Destaque da Partida (★)
              </p>
            </div>
            <button
              onClick={handleOpenAddMatch}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Novo Relatório de Jogo</span>
            </button>
          </div>

          {copaMatches.length === 0 ? (
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center max-w-xl mx-auto mt-6">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Nenhum Jogo Registrado</h3>
              <p className="text-xs text-slate-400 mb-5">
                Cadastre o primeiro confronto da Copinha para alimentar automaticamente as notas e o 11 Ideal.
              </p>
              <button
                onClick={handleOpenAddMatch}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Registrar Partida
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {copaMatches.map(match => (
                <div key={match.id} className="bg-[#0d1524] border border-slate-800 rounded-xl p-4 shadow-md">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">{match.partida}</h3>
                        {match.placar && (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                            {match.placar}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
                          {match.fase}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{match.data}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditMatch(match)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Editar Relatório"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setMatchToDelete(match)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Excluir Relatório"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de Atletas Avaliados nesta Partida */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Atletas Avaliados ({match.atletasAvaliados?.length || 0})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(match.atletasAvaliados || []).map((atleta, idx) => (
                        <div key={idx} className="bg-[#090e18] p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-200 truncate">{atleta.nome}</span>
                              {atleta.destaque && (
                                <span className="text-amber-400 text-[10px] font-bold flex items-center gap-0.5 bg-amber-500/20 px-1 rounded border border-amber-500/40">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                                  Destaque
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {atleta.clube || '—'} &bull; {atleta.posicao}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {atleta.nota || '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {match.observacoesGerais && (
                    <div className="mt-3 text-xs text-slate-400 bg-[#090e18] p-2.5 rounded border border-slate-800/60 leading-relaxed italic">
                      "{match.observacoesGerais}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* SUB-ABA 3: SELEÇÃO DA COPA SP (CAMPOGRAMA TÁTICO) */}
      {subTab === 'SELECAO' && (
        <main className="w-full min-h-screen max-w-[1720px] mx-auto px-3 md:px-6 py-4 space-y-4">
          {/* Barra de Controles Táticos */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
            {/* Esquemas Táticos */}
            <div className="flex items-center gap-1 bg-[#131d2e] p-1 rounded-lg border border-slate-700/60">
              {['4-3-3', '4-2-3-1', '4-4-2'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => {
                    setSelectedFormation(fmt)
                    setCopaSelectionData(prev => ({ ...prev, formation: fmt }))
                  }}
                  className={`px-3 py-1 rounded-md font-bold text-xs transition-all cursor-pointer ${
                    selectedFormation === fmt
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2">
              {copaSelectionData.customPositions && Object.keys(copaSelectionData.customPositions).length > 0 && (
                <button
                  onClick={handleResetPositions}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Resetar Posições</span>
                </button>
              )}

              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#152338] hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/60 font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Gerando PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Exportar PDF da Seleção</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* O CAMPOGRAMA */}
          <div className="overflow-x-auto pb-4">
            <div
              ref={pitchRef}
              className="relative w-full min-w-[1000px] h-[1260px] rounded-2xl overflow-hidden border border-emerald-900/60 shadow-2xl select-none"
              style={{
                backgroundColor: '#071510',
                backgroundImage: `
                  linear-gradient(to bottom, rgba(16, 185, 129, 0.04) 1px, transparent 1px),
                  linear-gradient(to right, rgba(16, 185, 129, 0.04) 1px, transparent 1px),
                  repeating-linear-gradient(0deg, rgba(6, 78, 59, 0.15), rgba(6, 78, 59, 0.15) 60px, rgba(4, 47, 46, 0.2) 60px, rgba(4, 47, 46, 0.2) 120px)
                `,
                backgroundSize: '40px 40px, 40px 40px, 100% 120px'
              }}
            >
              {/* Linhas de demarcação do campo */}
              <div className="absolute inset-5 border border-emerald-400/25 rounded-xl pointer-events-none" />
              <div className="absolute top-1/2 left-5 right-5 h-[1px] bg-emerald-400/25 -translate-y-1/2 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-emerald-400/25 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[440px] h-36 border-b border-x border-emerald-400/25 pointer-events-none" />
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[440px] h-36 border-t border-x border-emerald-400/25 pointer-events-none" />

              {/* Blocos de Posição */}
              {activeFormation.positions.map(pos => {
                const candidates = selectionSlots[pos.id] || []
                const titular = candidates[0]
                const alternates = candidates.slice(1)
                const customCoords = (copaSelectionData.customPositions || {})[pos.id]
                const posCoords = customCoords || { top: `${pos.top}%`, left: `${pos.left}%` }
                const isBeingMoved = draggingPosId === pos.id

                return (
                  <div
                    key={pos.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 ${
                      isBeingMoved ? 'transition-none select-none z-30' : 'transition-all duration-500 ease-out'
                    }`}
                    style={{ top: posCoords.top, left: posCoords.left }}
                  >
                    <div className={`w-[220px] min-w-[220px] max-w-[230px] bg-[#070e1b]/95 backdrop-blur-md border rounded-xl p-2.5 shadow-2xl transition-all hover:scale-105 group ${
                      isBeingMoved
                        ? 'border-2 border-amber-400 shadow-amber-500/30 scale-105 ring-2 ring-amber-500/20'
                        : 'border-slate-700/80 hover:border-amber-400/80'
                    }`}>
                      {/* Alça do Cabeçalho */}
                      <div
                        onMouseDown={(e) => handlePositionMouseDown(e, pos.id)}
                        className="flex items-center justify-between border-b border-slate-800/90 pb-1.5 mb-2 cursor-move select-none group/header"
                        title="Arraste para reposicionar no campo"
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 truncate group-hover/header:text-amber-300">
                          {pos.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {titular && !titular.promovido && (
                            <button
                              data-export-hide="true"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenPromote(titular)
                              }}
                              title="Promover Titular ao Profissional"
                              className="no-export text-slate-400 hover:text-emerald-400 p-0.5 rounded cursor-pointer"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Titular */}
                      <div className="space-y-1.5">
                        {titular ? (
                          <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-600/50 rounded-lg px-2 py-1.5 flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-1 w-full">
                              <div className="flex items-center gap-1 min-w-0 flex-1">
                                <span className="text-[10px] text-amber-500 font-bold shrink-0">1º</span>
                                <span className="text-white font-bold text-xs truncate" title={titular.nome}>
                                  {titular.nome}
                                </span>
                                {titular.anoNascimento && (
                                  <span className="text-slate-400 font-semibold text-[11px] shrink-0">
                                    {String(titular.anoNascimento).slice(-2)}'
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                {titular.destaquesCount > 0 && (
                                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                                    {titular.destaquesCount}
                                  </span>
                                )}
                                {titular.mediaGeral && (
                                  <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                    {Number(titular.mediaGeral).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-300 truncate pl-3">
                              {titular.clube || '—'} {titular.alt ? ` • ${titular.alt}cm` : ''}
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 px-2 rounded-lg border border-slate-800/80 bg-slate-900/40 text-center text-[10px] text-slate-500 font-medium italic">
                            Disponível / Em Aberto
                          </div>
                        )}

                        {/* Suplentes */}
                        {alternates.map((sub, idx) => (
                          <div
                            key={sub.id || idx}
                            className="bg-slate-900/80 border border-slate-800 rounded-md px-1.5 py-1 flex flex-col gap-0.5 text-[11px]"
                          >
                            <div className="flex items-center justify-between gap-1 w-full">
                              <div className="flex items-center gap-1 min-w-0 flex-1">
                                <span className="text-[8px] font-mono text-slate-500 shrink-0">{idx + 2}º</span>
                                <span className="text-[10.5px] font-bold text-slate-200 truncate">{sub.nome}</span>
                                {sub.anoNascimento && (
                                  <span className="text-slate-400 font-semibold text-[9.5px] shrink-0">
                                    {String(sub.anoNascimento).slice(-2)}'
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                {sub.mediaGeral && (
                                  <span className="text-[8.5px] font-mono px-1 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                                    {Number(sub.mediaGeral).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-[9.5px] text-slate-400 truncate pl-3">
                              {sub.clube || '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      )}

      {/* MODAL 1: FORMULÁRIO DE ATLETA DA COPA SP */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d16]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  {editingPlayer ? 'Editar Atleta da Copa SP' : 'Ficha de Observação da Copinha'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAthlete} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nome do Atleta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Matheusinho, Ryan..."
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/80"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Clube na Copa SP *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Novorizontino Sub-20..."
                    value={formData.clubeCopaSP}
                    onChange={(e) => setFormData({ ...formData, clubeCopaSP: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Ano Nasc.
                  </label>
                  <input
                    type="number"
                    min="2003"
                    max="2009"
                    value={formData.anoNascimento}
                    onChange={(e) => setFormData({ ...formData, anoNascimento: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500/80"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    min="150"
                    max="210"
                    placeholder="180"
                    value={formData.alt}
                    onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500/80"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Posição
                  </label>
                  <select
                    value={formData.posicaoObservada}
                    onChange={(e) => setFormData({ ...formData, posicaoObservada: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-2 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500/80 cursor-pointer"
                  >
                    {POSICOES_COPA_SP.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Pé
                  </label>
                  <select
                    value={formData.pe}
                    onChange={(e) => setFormData({ ...formData, pe: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-2 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500/80 cursor-pointer"
                  >
                    <option value="Destro">Destro</option>
                    <option value="Canhoto">Canhoto</option>
                    <option value="Ambidestro">Ambidestro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nota do Jogo (0-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.notaJogo}
                    onChange={(e) => setFormData({ ...formData, notaJogo: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500/80"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status do Olhar
                  </label>
                  <select
                    value={formData.statusOlhar}
                    onChange={(e) => setFormData({ ...formData, statusOlhar: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500/80 cursor-pointer"
                  >
                    {STATUS_OLHAR_OPTIONS.map(st => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.destaquePartida}
                      onChange={(e) => setFormData({ ...formData, destaquePartida: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span className="font-semibold text-slate-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Destaque do Jogo
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Observações Técnicas / Relatório Sucinto
                </label>
                <textarea
                  rows={3}
                  placeholder="Aspectos táticos, físicos, tomada de decisão..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg p-3 text-slate-100 text-xs focus:outline-none focus:border-amber-500/80 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  {editingPlayer ? 'Salvar Edição' : 'Registrar Observação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORMULÁRIO DE RELATÓRIO DE PARTIDA DA COPINHA */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d16] shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  {editingMatch ? 'Editar Relatório de Partida' : 'Registrar Partida da Copinha'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMatchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Confronto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Corinthians Sub-20 vs Novorizontino Sub-20"
                    value={matchForm.partida}
                    onChange={(e) => setMatchForm({ ...matchForm, partida: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/80"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Placar (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2 x 1"
                    value={matchForm.placar}
                    onChange={(e) => setMatchForm({ ...matchForm, placar: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Fase da Competição
                  </label>
                  <select
                    value={matchForm.fase}
                    onChange={(e) => setMatchForm({ ...matchForm, fase: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-2.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500/80 cursor-pointer"
                  >
                    {FASES_COPINHA.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Data da Partida
                  </label>
                  <input
                    type="date"
                    value={matchForm.data}
                    onChange={(e) => setMatchForm({ ...matchForm, data: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/80"
                  />
                </div>
              </div>

              {/* Atletas Avaliados */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Atletas Observados em Campo ({matchForm.atletasAvaliados.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAthleteToMatch}
                    className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold border border-amber-500/30 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Adicionar Atleta</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {matchForm.atletasAvaliados.map((item, idx) => (
                    <div key={idx} className="bg-[#090e18] p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Nome do atleta..."
                            value={item.nome}
                            onChange={(e) => {
                              const val = e.target.value
                              setMatchForm(prev => {
                                const next = [...prev.atletasAvaliados]
                                next[idx].nome = val
                                return { ...prev, atletasAvaliados: next }
                              })
                            }}
                            className="w-full bg-[#131d2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Clube..."
                            value={item.clube}
                            onChange={(e) => {
                              const val = e.target.value
                              setMatchForm(prev => {
                                const next = [...prev.atletasAvaliados]
                                next[idx].clube = val
                                return { ...prev, atletasAvaliados: next }
                              })
                            }}
                            className="w-full bg-[#131d2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <select
                            value={item.posicao}
                            onChange={(e) => {
                              const val = e.target.value
                              setMatchForm(prev => {
                                const next = [...prev.atletasAvaliados]
                                next[idx].posicao = val
                                return { ...prev, atletasAvaliados: next }
                              })
                            }}
                            className="w-full bg-[#131d2e] border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 text-xs"
                          >
                            {POSICOES_COPA_SP.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              setMatchForm(prev => ({
                                ...prev,
                                atletasAvaliados: prev.atletasAvaliados.filter((_, i) => i !== idx)
                              }))
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-[11px] pt-1 border-t border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-semibold">Nota:</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={item.nota}
                            onChange={(e) => {
                              const val = e.target.value
                              setMatchForm(prev => {
                                const next = [...prev.atletasAvaliados]
                                next[idx].nota = val
                                return { ...prev, atletasAvaliados: next }
                              })
                            }}
                            className="w-16 bg-[#131d2e] border border-slate-700 rounded px-2 py-1 text-center text-emerald-400 font-mono font-bold"
                          />
                        </div>

                        <label className="flex items-center gap-1.5 cursor-pointer text-amber-300 font-bold">
                          <input
                            type="checkbox"
                            checked={item.destaque}
                            onChange={(e) => {
                              const val = e.target.checked
                              setMatchForm(prev => {
                                const next = [...prev.atletasAvaliados]
                                next[idx].destaque = val
                                return { ...prev, atletasAvaliados: next }
                              })
                            }}
                            className="rounded bg-slate-800 border-slate-700 text-amber-500"
                          />
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>★ Destaque do Jogo</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Observações Gerais da Partida
                </label>
                <textarea
                  rows={2}
                  placeholder="Ritmo, contexto do gramado, destaques táticos..."
                  value={matchForm.observacoesGerais}
                  onChange={(e) => setMatchForm({ ...matchForm, observacoesGerais: e.target.value })}
                  className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500/80 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  {editingMatch ? 'Salvar Alterações' : 'Salvar Partida'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRMAÇÃO DE PROMOÇÃO AO RADAR PROFISSIONAL */}
      {promotingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-800 bg-[#080d16] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Promover ao Radar Profissional
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Transição da base para o banco principal 'players'
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPromotingPlayer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPromote} className="p-5 space-y-4 text-xs">
              <div className="bg-[#121c2d] p-3 rounded-lg border border-slate-700/80">
                <div className="font-bold text-white text-sm">{promotingPlayer.nome}</div>
                <div className="text-slate-400 text-xs">
                  {promotingPlayer.clubeCopaSP || promotingPlayer.clube} &bull; Nasc: {promotingPlayer.anoNascimento || promotingPlayer.an} &bull; Pé: {promotingPlayer.pe}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Posição Definitiva no Profissional *
                </label>
                <select
                  value={promoteForm.posicaoPrincipal}
                  onChange={(e) => setPromoteForm({ ...promoteForm, posicaoPrincipal: e.target.value })}
                  className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                >
                  {POSICOES_PRINCIPAL.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nível Inicial Atribuído
                  </label>
                  <select
                    value={promoteForm.nivel}
                    onChange={(e) => setPromoteForm({ ...promoteForm, nivel: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                  >
                    {NIVEIS_PRO.map(lvl => (
                      <option key={lvl} value={lvl}>Nível {lvl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Clube Formador
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Novorizontino"
                    value={promoteForm.clubeFormador}
                    onChange={(e) => setPromoteForm({ ...promoteForm, clubeFormador: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-emerald-500/80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Observações Contratuais / Vencimento
                </label>
                <input
                  type="text"
                  placeholder="Ex: 31/12/2026 ou Em formação"
                  value={promoteForm.observacoesContratuais}
                  onChange={(e) => setPromoteForm({ ...promoteForm, observacoesContratuais: e.target.value })}
                  className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-emerald-500/80"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] leading-relaxed">
                O atleta será incluído no banco principal com as tags <strong>'origem: "Copa SP"'</strong> e <strong>'categoria: "Sub-20/Base"'</strong>.
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPromotingPlayer(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Confirmar Promoção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRMAÇÃO EXCLUSÃO ATLETA */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-sm p-5 text-center shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h4 className="font-bold text-white text-sm mb-1">Excluir Atleta da Copinha?</h4>
            <p className="text-xs text-slate-400 mb-5">
              Deseja remover <strong>{playerToDelete.nome}</strong> da sua lista de observação?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPlayerToDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAthlete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CONFIRMAÇÃO EXCLUSÃO RELATÓRIO DE JOGO */}
      {matchToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-sm p-5 text-center shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h4 className="font-bold text-white text-sm mb-1">Excluir Relatório de Jogo?</h4>
            <p className="text-xs text-slate-400 mb-5">
              Deseja remover a partida <strong>{matchToDelete.partida}</strong>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setMatchToDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteMatch}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
