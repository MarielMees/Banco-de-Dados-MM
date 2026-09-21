import React, { useState, useMemo, useEffect } from 'react'
import {
  X,
  Zap,
  Star,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Trophy,
  Check,
  User,
  Shield,
  Search,
  UserCheck,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Save,
  FileText
} from 'lucide-react'

const QUICK_COMPETITIONS = [
  'Brasileirão Série A',
  'Brasileirão Série B',
  'Brasileirão Série C',
  'Brasileirão Série D',
  'Copa do Brasil',
  'Libertadores',
  'Sul-Americana',
  'Sub-20 / Copinha',
  'Estaduais',
  'Copas Regionais',
  'Jogos Internacionais'
]

const QUICK_POSITIONS = [
  { id: 'goleiro', label: 'Goleiro' },
  { id: 'zagueiro', label: 'Zag. Destro' },
  { id: 'zag-canhoto', label: 'Zag. Canhoto' },
  { id: 'lat-direito', label: 'Lat. Direito' },
  { id: 'lat-esquerdo', label: 'Lat. Esquerdo' },
  { id: 'medio', label: 'Volante (1º Médio)' },
  { id: 'medio-central', label: 'Médio Central' },
  { id: 'meia-ofensivo', label: 'Meia Ofensivo' },
  { id: 'extremo-direito', label: 'Extremo Direito' },
  { id: 'extremo-esquerdo', label: 'Extremo Esquerdo' },
  { id: 'centroavante', label: 'Centroavante' }
]

const GRADE_OPTIONS = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]

const formatPositionLabel = (pos) => {
  if (!pos) return 'Meia Ofensivo'
  const p = String(pos).toLowerCase().trim()
  if (p === 'goleiro' || p === 'gol') return 'Goleiro'
  if (p === 'zag-canhoto' || p.includes('canhoto')) return 'Zag. Canhoto'
  if (p === 'zagueiro' || p === 'zag-destro' || p.includes('destro') || p === 'zag') return 'Zag. Destro'
  if (p === 'lat-direito' || p === 'ld' || p.includes('lateral direito') || p.includes('lat. direito')) return 'Lat. Direito'
  if (p === 'lat-esquerdo' || p === 'le' || p.includes('lateral esquerdo') || p.includes('lat. esquerdo')) return 'Lat. Esquerdo'
  if (p === 'volante' || p.includes('volante') || p === '1º médio' || p === '1o medio') return 'Volante (1º Médio)'
  if (p === 'medio-central' || p.includes('médio central') || p.includes('medio central')) return 'Médio Central'
  if (p === 'medio' || p === 'médio') return 'Médio'
  if (p === 'meia-ofensivo' || p === 'meia' || p.includes('ofensivo')) return 'Meia Ofensivo'
  if (p === 'extremo-direito' || p === 'ext-d' || p.includes('extremo dir') || p.includes('ponta dir')) return 'Extremo Direito'
  if (p === 'extremo-esquerdo' || p === 'ext-e' || p.includes('extremo esq') || p.includes('ponta esq')) return 'Extremo Esquerdo'
  if (p === 'extremo' || p === 'ext' || p === 'ponta') return 'Extremo'
  if (p === 'centroavante' || p === 'ca' || p.includes('ata') || p.includes('centroavante')) return 'Centroavante'
  const match = QUICK_POSITIONS.find(qp => qp.id === p)
  return match ? match.label : pos
}

const normalizePositionId = (pos) => {
  if (!pos) return 'meia-ofensivo'
  const p = String(pos).toLowerCase().trim()
  if (p === 'goleiro' || p === 'gol') return 'goleiro'
  if (p === 'zag-canhoto' || p.includes('canhoto')) return 'zag-canhoto'
  if (p === 'zagueiro' || p === 'zag-destro' || p.includes('destro') || p === 'zag') return 'zagueiro'
  if (p === 'lat-direito' || p === 'ld' || p.includes('lateral direito') || p.includes('lat. direito')) return 'lat-direito'
  if (p === 'lat-esquerdo' || p === 'le' || p.includes('lateral esquerdo') || p.includes('lat. esquerdo')) return 'lat-esquerdo'
  if (p === 'medio' || p === 'volante' || p.includes('volante') || p === '1º médio' || p === '1o medio') return 'medio'
  if (p === 'medio-central' || p.includes('médio central') || p.includes('medio central')) return 'medio-central'
  if (p === 'meia-ofensivo' || p === 'meia' || p.includes('ofensivo')) return 'meia-ofensivo'
  if (p === 'extremo-direito' || p === 'ext-d' || p.includes('extremo dir') || p.includes('ponta dir')) return 'extremo-direito'
  if (p === 'extremo-esquerdo' || p === 'ext-e' || p.includes('extremo esq') || p.includes('ponta esq')) return 'extremo-esquerdo'
  if (p === 'extremo' || p === 'ext' || p === 'ponta') return 'extremo-direito'
  if (p === 'centroavante' || p === 'ca' || p.includes('ata') || p.includes('centroavante')) return 'centroavante'
  const match = QUICK_POSITIONS.find(qp => qp.id === p)
  return match ? match.id : 'meia-ofensivo'
}

export default function QuickMatchReportModal({
  isOpen,
  onClose,
  matchData = null,
  reportToEdit = null,
  isEditing = false,
  onSaveQuickReport,
  onSaveSuccess,
  onSaveReport,
  players = [],
  coaches = []
}) {
  if (!isOpen) return null

  const isEditMode = isEditing || !!reportToEdit

  // Bloco 1: Identificação do Jogo
  const [partida, setPartida] = useState('')
  const [competicao, setCompeticao] = useState('Brasileirão Série A')
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0])
  const [local, setLocal] = useState('')

  // Bloco Opcional: Treinadores / Comissão Técnica
  const [isCoachesOpen, setIsCoachesOpen] = useState(true)
  const [coachMandante, setCoachMandante] = useState(null)
  const [searchCoachMandante, setSearchCoachMandante] = useState('')
  const [isSearchingMandante, setIsSearchingMandante] = useState(false)

  const [coachVisitante, setCoachVisitante] = useState(null)
  const [searchCoachVisitante, setSearchCoachVisitante] = useState('')
  const [isSearchingVisitante, setIsSearchingVisitante] = useState(false)

  // Bloco 2: Atletas Observados
  const [atletasAvaliados, setAtletasAvaliados] = useState([])
  const [playerSearch, setPlayerSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Sub-formulário para adicionar atleta não cadastrado (provisório)
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerPos, setNewPlayerPos] = useState('meia-ofensivo')
  const [newPlayerClub, setNewPlayerClub] = useState('')

  // Bloco 3: Resumo Geral
  const [analiseGeral, setAnaliseGeral] = useState('')

  // Sincronização inteligente de estados ao abrir o modal (Modo Edição vs Criação)
  useEffect(() => {
    if (!isOpen) return

    if (reportToEdit) {
      // 1. Identificação Básica
      const partidaStr = reportToEdit.partida || (reportToEdit.mandante?.nome && reportToEdit.visitante?.nome ? (reportToEdit.mandante.nome + ' x ' + reportToEdit.visitante.nome) : '')
      setPartida(partidaStr)
      setCompeticao(reportToEdit.competicao || reportToEdit.campeonato || 'Brasileirão Série A')
      setData(reportToEdit.data || new Date().toISOString().split('T')[0])
      setLocal(reportToEdit.local || reportToEdit.estadio || '')
      setAnaliseGeral(reportToEdit.analiseGeral || '')

      // Extrair clubes do confronto para preenchimento de treinadores
      let mClub = ''
      let vClub = ''
      if (partidaStr.includes('x')) {
        const parts = partidaStr.split('x').map(s => s.trim())
        mClub = parts[0] || ''
        vClub = parts[1] || ''
      } else if (reportToEdit.mandante?.nome && reportToEdit.visitante?.nome) {
        mClub = reportToEdit.mandante.nome
        vClub = reportToEdit.visitante.nome
      }

      // 2. Treinadores
      let homeCoach = null
      let awayCoach = null

      if (reportToEdit.treinadoresAvaliados && Array.isArray(reportToEdit.treinadoresAvaliados) && reportToEdit.treinadoresAvaliados.length > 0) {
        const m = reportToEdit.treinadoresAvaliados.find(c => c.time === 'mandante')
        const v = reportToEdit.treinadoresAvaliados.find(c => c.time === 'visitante')
        if (m && m.nome) {
          homeCoach = {
            id: m.idTreinador || m.id || ('coach_m_' + Date.now()),
            nome: m.nome,
            clubeAtual: m.clubeAtual || mClub || 'Mandante',
            isProvisorio: !!m.isProvisorio,
            nota: m.nota !== undefined && m.nota !== null ? parseFloat(m.nota) : null,
            comentario: m.comentario || ''
          }
        }
        if (v && v.nome) {
          awayCoach = {
            id: v.idTreinador || v.id || ('coach_v_' + Date.now()),
            nome: v.nome,
            clubeAtual: v.clubeAtual || vClub || 'Visitante',
            isProvisorio: !!v.isProvisorio,
            nota: v.nota !== undefined && v.nota !== null ? parseFloat(v.nota) : null,
            comentario: v.comentario || ''
          }
        }
      } else if (reportToEdit.treinadorAvaliado && reportToEdit.treinadorAvaliado.nome) {
        const c = reportToEdit.treinadorAvaliado
        const isAway = c.time === 'visitante'
        const coachObj = {
          id: c.idTreinador || c.id || ('coach_' + Date.now()),
          nome: c.nome,
          clubeAtual: c.clubeAtual || (isAway ? vClub : mClub) || (isAway ? 'Visitante' : 'Mandante'),
          isProvisorio: !!c.isProvisorio,
          nota: c.nota !== undefined && c.nota !== null ? parseFloat(c.nota) : null,
          comentario: c.comentario || ''
        }
        if (isAway) awayCoach = coachObj
        else homeCoach = coachObj
      }

      setCoachMandante(homeCoach)
      setCoachVisitante(awayCoach)
      setIsCoachesOpen(!!(homeCoach || awayCoach))

      // 3. Atletas Avaliados
      const rawAthletes = [
        ...(Array.isArray(reportToEdit.atletasAvaliados) ? reportToEdit.atletasAvaliados : []),
        ...(Array.isArray(reportToEdit.atletas) ? reportToEdit.atletas : []),
        ...(Array.isArray(reportToEdit.atletasMandante) ? reportToEdit.atletasMandante.map(a => ({ ...a, time: 'mandante' })) : []),
        ...(Array.isArray(reportToEdit.atletasVisitante) ? reportToEdit.atletasVisitante.map(a => ({ ...a, time: 'visitante' })) : [])
      ]

      const seenIds = new Set()
      const mappedAthletes = []

      rawAthletes.forEach((a, idx) => {
        const athleteKey = a.idAtleta || a.id || a.savedPlayerId || a.apiId || (a.nome ? (a.nome + '_' + (a.clube || '')) : ('ath_' + idx))
        if (seenIds.has(athleteKey)) return
        seenIds.add(athleteKey)

        const notaVal = (a.notaScout !== undefined && a.notaScout !== null && a.notaScout !== '')
          ? parseFloat(a.notaScout)
          : ((a.nota !== undefined && a.nota !== null && a.nota !== '' && a.nota !== 0) ? parseFloat(a.nota) : 7.0)

        mappedAthletes.push({
          idAtleta: a.idAtleta || a.id || a.savedPlayerId || ('temp_edit_' + idx + '_' + Date.now()),
          apiId: a.apiId || null,
          nome: a.nome || a.name || 'Atleta',
          clube: a.clube || a.ca || a.time || '',
          posicao: normalizePositionId(a.posicao),
          isProvisorio: a.isProvisorio ?? false,
          nota: isNaN(notaVal) ? 7.0 : notaVal,
          destaque: !!(a.destaque || a.tipoDestaque === 'positivo'),
          sub20: !!(a.sub20 || a.radarSub23),
          comentario: a.comentario || a.parecerDestaque || a.parecerNegativo || ''
        })
      })

      setAtletasAvaliados(mappedAthletes)
      setShowNewPlayerForm(false)
      setPlayerSearch('')
      setSearchCoachMandante('')
      setSearchCoachVisitante('')
    } else if (matchData) {
      const mNome = matchData.mandante?.nome || matchData.teams?.home?.name || (typeof matchData.mandante === 'string' ? matchData.mandante : '') || 'Mandante'
      const vNome = matchData.visitante?.nome || matchData.teams?.away?.name || (typeof matchData.visitante === 'string' ? matchData.visitante : '') || 'Visitante'
      setPartida(matchData.partida || `${mNome} x ${vNome}`)
      setCompeticao(matchData.competicao || matchData.campeonato || matchData.campeonato_nome || matchData.league?.name || 'Brasileirão Série A')
      setData(matchData.data || matchData.fixture?.date?.split('T')?.[0] || new Date().toISOString().split('T')[0])
      setLocal(matchData.estadio || matchData.local || matchData.fixture?.venue?.name || '')

      // 1. Treinadores
      let homeCoach = null
      let awayCoach = null
      if (matchData.treinadorMandante) {
        homeCoach = {
          id: 'coach_m_' + (matchData.id || Date.now()),
          nome: matchData.treinadorMandante,
          clubeAtual: mNome,
          isProvisorio: false,
          nota: null,
          comentario: ''
        }
      }
      if (matchData.treinadorVisitante) {
        awayCoach = {
          id: 'coach_v_' + (matchData.id || Date.now()),
          nome: matchData.treinadorVisitante,
          clubeAtual: vNome,
          isProvisorio: false,
          nota: null,
          comentario: ''
        }
      }
      setCoachMandante(homeCoach)
      setCoachVisitante(awayCoach)
      setIsCoachesOpen(!!(homeCoach || awayCoach))

      // 2. Atletas com Posicao, Minutos e 'player.rating'
      const rawAthletes = [
        ...(Array.isArray(matchData.atletasMandante) ? matchData.atletasMandante.map(a => ({ ...a, time: mNome })) : []),
        ...(Array.isArray(matchData.atletasVisitante) ? matchData.atletasVisitante.map(a => ({ ...a, time: vNome })) : []),
        ...(Array.isArray(matchData.atletasAvaliados) ? matchData.atletasAvaliados : [])
      ]

      const mappedAthletes = rawAthletes.map((a, idx) => {
        const rawNota = a.notaScout || a.notaApi || a.nota || a.rating || null
        const notaFloat = rawNota && !isNaN(parseFloat(rawNota)) ? parseFloat(rawNota) : 7.0
        const minStr = a.minutos !== undefined && a.minutos !== null ? `${a.minutos} min` : ''
        const notaApiStr = a.notaApi && a.notaApi !== '—' ? `Nota FotMob: ${a.notaApi}` : ''
        const infoParts = [minStr, notaApiStr].filter(Boolean).join(' • ')

        return {
          idAtleta: a.id || a.idAtleta || ('match_ath_' + idx),
          apiId: a.apiId || a.id || null,
          nome: a.nome || a.name || 'Atleta',
          clube: a.clube || a.time || (idx < (matchData.atletasMandante?.length || 0) ? mNome : vNome),
          posicao: normalizePositionId(a.posicao),
          isProvisorio: false,
          nota: notaFloat,
          destaque: false,
          sub20: !!(a.sub20 || a.radarSub23),
          comentario: a.comentario || infoParts
        }
      })

      setAtletasAvaliados(mappedAthletes)

      // 3. Estatisticas Coletivas: Placar, xG, chutes e posse de bola
      const mScore = matchData.placarMandante ?? matchData.placar_mandante ?? matchData.placar?.mandante
      const vScore = matchData.placarVisitante ?? matchData.placar_visitante ?? matchData.placar?.visitante
      const statsM = matchData.statsMandante || {}
      const statsV = matchData.statsVisitante || {}

      let resumoText = ''
      if (mScore !== undefined && vScore !== undefined && mScore !== null && vScore !== null) {
        resumoText += `Placar Final: ${mNome} ${mScore} x ${vScore} ${vNome}\n`
      }
      if (statsM.xg || statsV.xg) {
        resumoText += `xG (Expected Goals): ${mNome} ${statsM.xg || '—'} x ${statsV.xg || '—'} ${vNome}\n`
      }
      if (statsM.posse || statsV.posse) {
        resumoText += `Posse de Bola: ${mNome} ${statsM.posse || '—'} x ${statsV.posse || '—'} ${vNome}\n`
      }
      if (statsM.finalizacoes || statsV.finalizacoes) {
        resumoText += `Finalizações: ${mNome} ${statsM.finalizacoes || '—'} (no alvo: ${statsM.finalizacoesAlvo || '—'}) x ${statsV.finalizacoes || '—'} (no alvo: ${statsV.finalizacoesAlvo || '—'}) ${vNome}\n`
      }
      if (matchData.esquemaMandante || matchData.esquemaVisitante) {
        resumoText += `Esquemas: ${mNome} (${matchData.esquemaMandante || '—'}) x ${vNome} (${matchData.esquemaVisitante || '—'})\n`
      }

      setAnaliseGeral(resumoText.trim())
      setShowNewPlayerForm(false)
      setPlayerSearch('')
      setSearchCoachMandante('')
      setSearchCoachVisitante('')
    } else {
      setPartida('')
      setCompeticao('Brasileirão Série A')
      setData(new Date().toISOString().split('T')[0])
      setLocal('')
      setAnaliseGeral('')
      setCoachMandante(null)
      setCoachVisitante(null)
      setAtletasAvaliados([])
      setShowNewPlayerForm(false)
      setPlayerSearch('')
      setSearchCoachMandante('')
      setSearchCoachVisitante('')
    }
  }, [isOpen, reportToEdit, matchData])

  // Contador preciso de destaques selecionados
  const destaquesCount = useMemo(() => {
    return (atletasAvaliados || []).filter(a => !!a.destaque).length
  }, [atletasAvaliados])

  // Extrair clubes do confronto para preenchimento de treinadores
  const [mandanteClubName, visitanteClubName] = useMemo(() => {
    if (!partida || !partida.includes('x')) return ['', '']
    const parts = partida.split('x').map(s => s.trim())
    return [parts[0] || '', parts[1] || '']
  }, [partida])

  // Filtragem de atletas para busca rápida
  const filteredSearchPlayers = playerSearch.trim()
    ? players.filter(p =>
        (p.nome || '').toLowerCase().includes(playerSearch.toLowerCase()) ||
        (p.ca || '').toLowerCase().includes(playerSearch.toLowerCase())
      ).slice(0, 6)
    : []

  // Filtragem de Treinadores Mandante e Visitante
  const filteredCoachesMandante = useMemo(() => {
    if (!searchCoachMandante.trim()) return []
    const s = searchCoachMandante.toLowerCase()
    return coaches.filter(c =>
      (c.nome || '').toLowerCase().includes(s) ||
      (c.clubeAtual || '').toLowerCase().includes(s)
    ).slice(0, 6)
  }, [coaches, searchCoachMandante])

  const filteredCoachesVisitante = useMemo(() => {
    if (!searchCoachVisitante.trim()) return []
    const s = searchCoachVisitante.toLowerCase()
    return coaches.filter(c =>
      (c.nome || '').toLowerCase().includes(s) ||
      (c.clubeAtual || '').toLowerCase().includes(s)
    ).slice(0, 6)
  }, [coaches, searchCoachVisitante])

  const handleSelectCoach = (tipo, coachObj) => {
    const entry = {
      id: coachObj.id,
      nome: coachObj.nome,
      clubeAtual: coachObj.clubeAtual || (tipo === 'mandante' ? mandanteClubName : visitanteClubName) || '',
      isProvisorio: !!coachObj.isProvisorio,
      nota: null,
      comentario: ''
    }

    if (tipo === 'mandante') {
      setCoachMandante(entry)
      setSearchCoachMandante('')
      setIsSearchingMandante(false)
    } else {
      setCoachVisitante(entry)
      setSearchCoachVisitante('')
      setIsSearchingVisitante(false)
    }
  }

  const handleAddProvisorioCoach = (tipo, nameToUse) => {
    const typedName = (nameToUse || (tipo === 'mandante' ? searchCoachMandante : searchCoachVisitante)).trim()
    if (!typedName) return

    const teamClub = tipo === 'mandante' ? mandanteClubName : visitanteClubName
    const tempCoachId = 'coach_temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)

    const entry = {
      id: tempCoachId,
      nome: typedName,
      clubeAtual: teamClub || 'Sem Clube',
      isProvisorio: true,
      nota: null,
      comentario: ''
    }

    if (tipo === 'mandante') {
      setCoachMandante(entry)
      setSearchCoachMandante('')
      setIsSearchingMandante(false)
    } else {
      setCoachVisitante(entry)
      setSearchCoachVisitante('')
      setIsSearchingVisitante(false)
    }
  }

  const handleUpdateCoach = (tipo, field, value) => {
    if (tipo === 'mandante') {
      setCoachMandante(prev => prev ? { ...prev, [field]: value } : null)
    } else {
      setCoachVisitante(prev => prev ? { ...prev, [field]: value } : null)
    }
  }

  const handleRemoveCoach = (tipo) => {
    if (tipo === 'mandante') {
      setCoachMandante(null)
      setSearchCoachMandante('')
    } else {
      setCoachVisitante(null)
      setSearchCoachVisitante('')
    }
  }

  const handleSelectExistingPlayer = (player) => {
    // Evita duplicar se já foi adicionado
    if (atletasAvaliados.some(a => a.idAtleta === player.id)) {
      setPlayerSearch('')
      setIsSearching(false)
      return
    }

    const newEntry = {
      idAtleta: player.id,
      nome: player.nome,
      clube: player.ca || '—',
      posicao: normalizePositionId(player.posicao),
      isProvisorio: !!player.isProvisorio,
      nota: 7.0,
      destaque: false,
      sub20: false,
      comentario: ''
    }

    setAtletasAvaliados(prev => [...prev, newEntry])
    setPlayerSearch('')
    setIsSearching(false)
  }

  const handleStartAddProvisorio = (name) => {
    setNewPlayerName(name || playerSearch.trim())
    setNewPlayerClub('')
    setNewPlayerPos('meia-ofensivo')
    setShowNewPlayerForm(true)
    setIsSearching(false)
  }

  const handleConfirmAddProvisorio = (e) => {
    e?.preventDefault()
    if (!newPlayerName.trim()) return

    const tempId = 'temp_' + Date.now()
    const newEntry = {
      idAtleta: tempId,
      nome: newPlayerName.trim(),
      clube: newPlayerClub.trim() || 'Sem Clube',
      posicao: normalizePositionId(newPlayerPos),
      isProvisorio: true,
      nota: 7.0,
      destaque: false,
      sub20: false,
      comentario: ''
    }

    setAtletasAvaliados(prev => [...prev, newEntry])
    setShowNewPlayerForm(false)
    setNewPlayerName('')
    setPlayerSearch('')
  }

  const handleUpdateAthlete = (index, field, value) => {
    setAtletasAvaliados(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleRemoveAthlete = (index) => {
    setAtletasAvaliados(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!partida.trim()) {
      alert('Por favor, digite o confronto da partida (ex: Goiás x Vila Nova).')
      return
    }

    if (atletasAvaliados.length === 0 && !coachMandante && !coachVisitante) {
      if (!confirm('Nenhum atleta ou treinador foi adicionado a este relatório. Deseja salvar mesmo assim?')) {
        return
      }
    }

    // Separa atletas provisórios que precisam ser registrados no estado global
    const provisorioPlayersToSave = atletasAvaliados
      .filter(a => a.isProvisorio && String(a.idAtleta).startsWith('temp_'))
      .map(a => ({
        id: a.idAtleta,
        nome: a.nome,
        posicao: a.posicao || 'meia-ofensivo',
        clube: a.clube || null,
        isProvisorio: true,
        anoNascimento: null,
        altura: null,
        an: null,
        alt: null,
        pe: null,
        nivel: null,
        projecao: [],
        nivelFisico: null,
        alerta: 'OK',
        ca: a.clube || null,
        clubeFormador: null,
        posSecundaria: null,
        caracteristicas: [],
        agente: null,
        contrato: null,
        radarSub23: !!a.sub20,
        monitoramento: true,
        hotList: false,
        observacao: a.comentario ? ('Observação de Campo: ' + a.comentario) : 'Cadastrado via Relatório de Jogo.',
        videoYoutube: ''
      }))

    // Processa treinadores avaliados (Opcionais)
    const treinadoresAvaliados = []
    const provisorioCoachesToSave = []

    if (coachMandante && coachMandante.nome) {
      treinadoresAvaliados.push({
        idTreinador: coachMandante.id,
        nome: coachMandante.nome,
        time: 'mandante',
        nota: coachMandante.nota !== null ? parseFloat(coachMandante.nota) : null,
        comentario: (coachMandante.comentario || '').trim()
      })

      if (coachMandante.isProvisorio && String(coachMandante.id).startsWith('coach_temp_')) {
        provisorioCoachesToSave.push({
          id: coachMandante.id,
          nome: coachMandante.nome,
          clubeAtual: coachMandante.clubeAtual || mandanteClubName || null,
          isProvisorio: true,
          nivelAtual: null,
          nivel: null,
          titulos: { nacionais: 0, estaduais: 0, internacionais: 0, base: 0 },
          acessos: { bParaA: 0, cParaB: 0, dParaC: 0 },
          caracteristicas: [],
          estilo: null,
          idade: null,
          experiencia: '',
          exAtleta: false,
          observacao: coachMandante.comentario ? ('Observação de Campo: ' + coachMandante.comentario) : 'Cadastrado via Relatório de Jogo.'
        })
      }
    }

    if (coachVisitante && coachVisitante.nome) {
      treinadoresAvaliados.push({
        idTreinador: coachVisitante.id,
        nome: coachVisitante.nome,
        time: 'visitante',
        nota: coachVisitante.nota !== null ? parseFloat(coachVisitante.nota) : null,
        comentario: (coachVisitante.comentario || '').trim()
      })

      if (coachVisitante.isProvisorio && String(coachVisitante.id).startsWith('coach_temp_')) {
        provisorioCoachesToSave.push({
          id: coachVisitante.id,
          nome: coachVisitante.nome,
          clubeAtual: coachVisitante.clubeAtual || visitanteClubName || null,
          isProvisorio: true,
          nivelAtual: null,
          nivel: null,
          titulos: { nacionais: 0, estaduais: 0, internacionais: 0, base: 0 },
          acessos: { bParaA: 0, cParaB: 0, dParaC: 0 },
          caracteristicas: [],
          estilo: null,
          idade: null,
          experiencia: '',
          exAtleta: false,
          observacao: coachVisitante.comentario ? ('Observação de Campo: ' + coachVisitante.comentario) : 'Cadastrado via Relatório de Jogo.'
        })
      }
    }

    const primaryCoach = treinadoresAvaliados[0] || null

    // Preserva o ID original do relatório se estiver em modo de edição
    const finalReportId = (reportToEdit && reportToEdit.id) ? reportToEdit.id : Date.now().toString()

    const reportPayload = {
      id: finalReportId,
      partida: partida.trim(),
      competicao: competicao.trim() || 'Partida',
      data: data || new Date().toISOString().split('T')[0],
      local: local.trim() || 'Em campo (Express)',
      analiseGeral: analiseGeral.trim(),
      treinadoresAvaliados,
      treinadorAvaliado: primaryCoach,
      atletasAvaliados: atletasAvaliados.map(a => ({
        idAtleta: a.idAtleta,
        apiId: a.apiId || null,
        nome: a.nome,
        clube: a.clube,
        posicao: a.posicao,
        isProvisorio: !!a.isProvisorio,
        nota: parseFloat(a.nota) || 7.0,
        destaque: !!a.destaque,
        sub20: !!a.sub20,
        comentario: (a.comentario || '').trim()
      }))
    }

    if (onSaveSuccess) {
      onSaveSuccess(reportPayload, provisorioPlayersToSave, provisorioCoachesToSave)
    }
    if (onSaveQuickReport) {
      onSaveQuickReport(reportPayload, provisorioPlayersToSave, provisorioCoachesToSave)
    }
    if (onSaveReport) {
      onSaveReport(reportPayload, provisorioPlayersToSave, provisorioCoachesToSave)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-[#0b121e] border border-amber-500/40 rounded-2xl w-full max-w-xl max-h-[94vh] flex flex-col shadow-2xl shadow-black overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo Mobile-Friendly com Destaque Neon Âmbar ou Ciano/Esmeralda */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#121a2d] to-[#0c1424] border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={'w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ' + (
              isEditMode 
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-emerald-500/20' 
                : 'bg-amber-500/20 border border-amber-500/50 text-amber-400 shadow-amber-500/20'
            )}>
              {isEditMode ? (
                <FileEdit className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  {isEditMode ? 'Editar Relatório de Jogo' : 'Relatório Express'}
                </h2>
                <span className={'text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ' + (
                  isEditMode 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                )}>
                  {isEditMode ? 'Modo Edição' : 'Campo / Touch'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isEditMode 
                  ? 'Atualize os dados táticos, comissão e notas mantendo o histórico íntegro'
                  : 'Registro rápido em tempo real direto da arquibancada'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com Scroll Vertical Suave */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* BLOCO 1: IDENTIFICAÇÃO DO JOGO */}
          <div className="bg-[#10192a] border border-slate-700/70 rounded-xl p-3.5 space-y-3">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Identificação da Partida</span>
            </div>

            {/* Confronto */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Confronto *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Vila Nova x Goiás"
                value={partida}
                onChange={(e) => setPartida(e.target.value)}
                className="w-full bg-[#16233b] border border-slate-600 rounded-lg px-3.5 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Competição (Pílulas Rápidas) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Competição
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_COMPETITIONS.map((comp) => {
                  const isSelected = competicao === comp
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setCompeticao(comp)}
                      className={'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ' + (
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/30'
                          : 'bg-[#152136] text-slate-300 border-slate-700 hover:border-slate-500'
                      )}
                    >
                      {comp}
                    </button>
                  )
                })}
              </div>
              <input
                type="text"
                placeholder="Ou digite outra competição..."
                value={competicao}
                onChange={(e) => setCompeticao(e.target.value)}
                className="w-full bg-[#16233b] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Grid Data & Local */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Data da Partida
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full bg-[#16233b] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Estádio / Local (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Serra Dourada"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="w-full bg-[#16233b] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* BLOCO OPCIONAL: COMISSÃO TÉCNICA / TREINADORES */}
          <div className="bg-[#10192a] border border-slate-700/70 rounded-xl overflow-hidden shadow-sm transition-all">
            <button
              type="button"
              onClick={() => setIsCoachesOpen(prev => !prev)}
              className="w-full px-3.5 py-2.5 bg-[#121c2d] hover:bg-[#162338] border-b border-slate-700/60 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                    👨‍💼 COMISSÃO TÉCNICA / TREINADORES
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Opcional
                  </span>
                  {(coachMandante || coachVisitante) && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {[coachMandante && 'Mandante', coachVisitante && 'Visitante'].filter(Boolean).join(' + ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <span className="text-[10px] hidden sm:inline">{isCoachesOpen ? 'Recolher' : 'Expandir'}</span>
                {isCoachesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isCoachesOpen && (
              <div className="p-3.5 space-y-4 animate-in fade-in duration-150">
                {/* 1. Treinador Mandante */}
                <div className="p-3 bg-[#132035] border border-slate-700/80 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Treinador Mandante {mandanteClubName ? ('(' + mandanteClubName + ')') : ''}
                    </span>
                    {coachMandante && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCoach('mandante')}
                        className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>

                  {!coachMandante ? (
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder={mandanteClubName ? ('Buscar técnico do ' + mandanteClubName + ' ou digitar...') : "Buscar treinador mandante..."}
                            value={searchCoachMandante}
                            onChange={(e) => {
                              setSearchCoachMandante(e.target.value)
                              setIsSearchingMandante(true)
                            }}
                            onFocus={() => setIsSearchingMandante(true)}
                            className="w-full bg-[#18263e] border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                          />
                          {searchCoachMandante && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchCoachMandante('')
                                setIsSearchingMandante(false)
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {searchCoachMandante.trim() && (
                          <button
                            type="button"
                            onClick={() => handleAddProvisorioCoach('mandante')}
                            className="px-2.5 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                            title="Cadastrar treinador provisório"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Provisório</span>
                          </button>
                        )}
                      </div>

                      {/* Dropdown de Autocomplete Mandante */}
                      {isSearchingMandante && searchCoachMandante.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#131f33] border border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden max-h-52 overflow-y-auto">
                          {filteredCoachesMandante.length > 0 ? (
                            <div className="divide-y divide-slate-800">
                              {filteredCoachesMandante.map((c) => (
                                <div
                                  key={c.id}
                                  onClick={() => handleSelectCoach('mandante', c)}
                                  className="p-2 hover:bg-[#1c2c47] cursor-pointer flex items-center justify-between transition-colors"
                                >
                                  <div>
                                    <div className="font-bold text-white text-xs">{c.nome}</div>
                                    <div className="text-[10px] text-slate-400">
                                      {c.clubeAtual || 'Sem Clube'} {c.nivelAtual ? ('• Nível ' + c.nivelAtual) : ''}
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    Selecionar
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {/* Botão de Adicionar Provisório se não encontrado ou opção rápida */}
                          <div
                            onClick={() => handleAddProvisorioCoach('mandante')}
                            className="p-2.5 bg-indigo-950/40 hover:bg-indigo-900/50 border-t border-indigo-800/40 cursor-pointer flex items-center justify-between transition-colors text-indigo-300 font-bold"
                          >
                            <div className="flex items-center gap-1.5 text-xs">
                              <Plus className="w-3.5 h-3.5 text-indigo-400" />
                              <span>+ Adicionar "<strong>{searchCoachMandante.trim()}</strong>" como provisório</span>
                            </div>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40">
                              {mandanteClubName || 'Mandante'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Ficha Rápida do Treinador Mandante Selecionado */
                    <div className="space-y-2.5 pt-0.5">
                      <div className="flex items-center justify-between bg-[#18263e] p-2.5 rounded-lg border border-slate-700">
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{coachMandante.nome}</span>
                            {coachMandante.isProvisorio && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Provisório
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {coachMandante.clubeAtual || mandanteClubName || 'Mandante'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Nota:</span>
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            {coachMandante.nota !== null ? Number(coachMandante.nota).toFixed(1) : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Botões Rápidos de Nota (5.0 a 10.0) */}
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                          Avaliação Tática do Treinador:
                        </div>
                        <div className="grid grid-cols-6 sm:grid-cols-11 gap-1">
                          {GRADE_OPTIONS.map(val => {
                            const isSelected = coachMandante.nota === val
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleUpdateCoach('mandante', 'nota', isSelected ? null : val)}
                                className={'py-1.5 text-center rounded text-[11px] font-black transition-all cursor-pointer ' + (
                                  isSelected
                                    ? 'bg-indigo-400 text-slate-950 ring-2 ring-indigo-300 shadow-md scale-105'
                                    : 'bg-[#18263e] text-slate-300 hover:bg-[#223554] border border-slate-700/60'
                                )}
                              >
                                {val.toFixed(1)}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Parecer do Treinador Mandante */}
                      <div>
                        <textarea
                          rows={2}
                          placeholder="Observações táticas sobre escalação, modelo de jogo, postura ou substituições..."
                          value={coachMandante.comentario}
                          onChange={(e) => handleUpdateCoach('mandante', 'comentario', e.target.value)}
                          className="w-full bg-[#18263e] border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Treinador Visitante */}
                <div className="p-3 bg-[#132035] border border-slate-700/80 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                      Treinador Visitante {visitanteClubName ? ('(' + visitanteClubName + ')') : ''}
                    </span>
                    {coachVisitante && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCoach('visitante')}
                        className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>

                  {!coachVisitante ? (
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder={visitanteClubName ? ('Buscar técnico do ' + visitanteClubName + ' ou digitar...') : "Buscar treinador visitante..."}
                            value={searchCoachVisitante}
                            onChange={(e) => {
                              setSearchCoachVisitante(e.target.value)
                              setIsSearchingVisitante(true)
                            }}
                            onFocus={() => setIsSearchingVisitante(true)}
                            className="w-full bg-[#18263e] border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                          />
                          {searchCoachVisitante && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchCoachVisitante('')
                                setIsSearchingVisitante(false)
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {searchCoachVisitante.trim() && (
                          <button
                            type="button"
                            onClick={() => handleAddProvisorioCoach('visitante')}
                            className="px-2.5 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                            title="Cadastrar treinador provisório"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Provisório</span>
                          </button>
                        )}
                      </div>

                      {/* Dropdown de Autocomplete Visitante */}
                      {isSearchingVisitante && searchCoachVisitante.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#131f33] border border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden max-h-52 overflow-y-auto">
                          {filteredCoachesVisitante.length > 0 ? (
                            <div className="divide-y divide-slate-800">
                              {filteredCoachesVisitante.map((c) => (
                                <div
                                  key={c.id}
                                  onClick={() => handleSelectCoach('visitante', c)}
                                  className="p-2 hover:bg-[#1c2c47] cursor-pointer flex items-center justify-between transition-colors"
                                >
                                  <div>
                                    <div className="font-bold text-white text-xs">{c.nome}</div>
                                    <div className="text-[10px] text-slate-400">
                                      {c.clubeAtual || 'Sem Clube'} {c.nivelAtual ? ('• Nível ' + c.nivelAtual) : ''}
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    Selecionar
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {/* Botão de Adicionar Provisório Visitante */}
                          <div
                            onClick={() => handleAddProvisorioCoach('visitante')}
                            className="p-2.5 bg-indigo-950/40 hover:bg-indigo-900/50 border-t border-indigo-800/40 cursor-pointer flex items-center justify-between transition-colors text-indigo-300 font-bold"
                          >
                            <div className="flex items-center gap-1.5 text-xs">
                              <Plus className="w-3.5 h-3.5 text-indigo-400" />
                              <span>+ Adicionar "<strong>{searchCoachVisitante.trim()}</strong>" como provisório</span>
                            </div>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40">
                              {visitanteClubName || 'Visitante'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Ficha Rápida do Treinador Visitante Selecionado */
                    <div className="space-y-2.5 pt-0.5">
                      <div className="flex items-center justify-between bg-[#18263e] p-2.5 rounded-lg border border-slate-700">
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{coachVisitante.nome}</span>
                            {coachVisitante.isProvisorio && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Provisório
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {coachVisitante.clubeAtual || visitanteClubName || 'Visitante'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Nota:</span>
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            {coachVisitante.nota !== null ? Number(coachVisitante.nota).toFixed(1) : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Botões Rápidos de Nota (5.0 a 10.0) */}
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                          Avaliação Tática do Treinador:
                        </div>
                        <div className="grid grid-cols-6 sm:grid-cols-11 gap-1">
                          {GRADE_OPTIONS.map(val => {
                            const isSelected = coachVisitante.nota === val
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleUpdateCoach('visitante', 'nota', isSelected ? null : val)}
                                className={'py-1.5 text-center rounded text-[11px] font-black transition-all cursor-pointer ' + (
                                  isSelected
                                    ? 'bg-indigo-400 text-slate-950 ring-2 ring-indigo-300 shadow-md scale-105'
                                    : 'bg-[#18263e] text-slate-300 hover:bg-[#223554] border border-slate-700/60'
                                )}
                              >
                                {val.toFixed(1)}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Parecer do Treinador Visitante */}
                      <div>
                        <textarea
                          rows={2}
                          placeholder="Observações táticas sobre postura da equipe, encaixes ou transições..."
                          value={coachVisitante.comentario}
                          onChange={(e) => handleUpdateCoach('visitante', 'comentario', e.target.value)}
                          className="w-full bg-[#18263e] border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BLOCO 2: ATLETAS OBSERVADOS */}
          <div className="bg-[#10192a] border border-slate-700/70 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-teal-400" />
                <span>2. Atletas Observados ({atletasAvaliados.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ' + (
                  destaquesCount > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                )}>
                  ★ {destaquesCount} destaque{destaquesCount !== 1 ? 's' : ''} selecionado{destaquesCount !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Toque na estrela para eleger destaques
                </span>
              </div>
            </div>

            {/* Campo de Busca de Atletas */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar atleta no banco ou digitar nome..."
                    value={playerSearch}
                    onChange={(e) => {
                      setPlayerSearch(e.target.value)
                      setIsSearching(true)
                    }}
                    onFocus={() => setIsSearching(true)}
                    className="w-full bg-[#16233b] border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
                  />
                  {playerSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setPlayerSearch('')
                        setIsSearching(false)
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {playerSearch.trim() && (
                  <button
                    type="button"
                    onClick={() => handleStartAddProvisorio(playerSearch)}
                    className="px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cadastrar</span>
                  </button>
                )}
              </div>

              {/* Dropdown de sugestões e opção provisória */}
              {isSearching && playerSearch.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#131f33] border border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                  {filteredSearchPlayers.length > 0 ? (
                    <div className="divide-y divide-slate-800">
                      {filteredSearchPlayers.map((player) => (
                        <div
                          key={player.id}
                          onClick={() => handleSelectExistingPlayer(player)}
                          className="p-2.5 hover:bg-[#1c2c47] cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <div className="font-bold text-white text-xs">{player.nome}</div>
                            <div className="text-[10px] text-slate-400">
                              {player.ca || 'Sem Clube'} • <span className="font-medium text-slate-300">{formatPositionLabel(player.posicao)}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            Selecionar
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* Opção de Criar Provisório */}
                  <div
                    onClick={() => handleStartAddProvisorio(playerSearch)}
                    className="p-2.5 bg-emerald-950/30 hover:bg-emerald-900/40 border-t border-emerald-800/40 cursor-pointer flex items-center justify-between transition-colors text-emerald-300 font-bold"
                  >
                    <div className="flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Adicionar "<strong>{playerSearch.trim()}</strong>" como Provisório</span>
                    </div>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                      Rápido
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Subformulário Inline para Novo Provisório */}
            {showNewPlayerForm && (
              <div className="p-3 bg-[#132035] border border-emerald-500/50 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Cadastrar Atleta Provisório
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNewPlayerForm(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Nome do Atleta *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome do atleta"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="w-full bg-[#18263e] border border-slate-600 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Clube Atual</label>
                    <input
                      type="text"
                      placeholder="Ex: Anápolis"
                      value={newPlayerClub}
                      onChange={(e) => setNewPlayerClub(e.target.value)}
                      className="w-full bg-[#18263e] border border-slate-600 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Posição Principal</label>
                  <div className="flex flex-wrap gap-1">
                    {QUICK_POSITIONS.map(pos => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setNewPlayerPos(pos.id)}
                        className={'px-2 py-1 rounded text-[10px] font-semibold border cursor-pointer transition-colors ' + (
                          newPlayerPos === pos.id
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                            : 'bg-[#18263e] text-slate-300 border-slate-700 hover:border-slate-500'
                        )}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewPlayerForm(false)}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAddProvisorio}
                    className="px-3.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                  >
                    Adicionar à Partida
                  </button>
                </div>
              </div>
            )}

            {/* Listagem e Avaliação dos Atletas Adicionados */}
            <div className="space-y-3 pt-1">
              {atletasAvaliados.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-700/80 rounded-xl text-slate-500 text-xs">
                  Nenhum atleta inserido nesta partida ainda.
                </div>
              ) : (
                atletasAvaliados.map((entry, index) => (
                  <div
                    key={entry.idAtleta || ('atleta-row-' + index)}
                    className="p-3 bg-[#132035] border border-slate-700/80 rounded-xl space-y-2.5 shadow-sm"
                  >
                    {/* Linha Superior do Card do Atleta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{entry.nome}</span>
                            {entry.isProvisorio && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Provisório
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{entry.clube || 'Sem Clube'}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] uppercase font-bold text-slate-500">Posição:</span>
                              <select
                                value={entry.posicao || 'meia-ofensivo'}
                                onChange={(e) => handleUpdateAthlete(index, 'posicao', e.target.value)}
                                className="bg-[#18263e] hover:bg-[#203252] border border-slate-600 rounded px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 cursor-pointer focus:outline-none focus:border-emerald-400"
                                title="Corrigir posição tática do atleta com 1 clique"
                              >
                                {QUICK_POSITIONS.map(qp => (
                                  <option key={qp.id} value={qp.id}>
                                    {qp.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAthlete(index)}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remover atleta da partida"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Grade de Notas para Toque Rápido */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Nota do Desempenho:
                        </span>
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                          {entry.nota ? Number(entry.nota).toFixed(1) : '7.0'}
                        </span>
                      </div>

                      <div className="grid grid-cols-6 sm:grid-cols-11 gap-1">
                        {GRADE_OPTIONS.map(val => {
                          const isSelected = entry.nota === val
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleUpdateAthlete(index, 'nota', val)}
                              className={'py-2 text-center rounded-lg text-xs font-black transition-all cursor-pointer ' + (
                                isSelected
                                  ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 shadow-md scale-105'
                                  : 'bg-[#18263e] text-slate-300 hover:bg-[#203252] border border-slate-700/60'
                              )}
                            >
                              {val.toFixed(1)}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Toggles Rápidos: Destaque e Sub-20 */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateAthlete(index, 'destaque', !entry.destaque)}
                        className={'flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ' + (
                          entry.destaque
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/30'
                            : 'bg-[#18263e] text-slate-400 border-slate-700 hover:border-slate-500'
                        )}
                      >
                        <Star className={'w-3.5 h-3.5 ' + (entry.destaque ? 'fill-slate-950 text-slate-950' : 'text-slate-400')} />
                        <span>★ Destaque</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateAthlete(index, 'sub20', !entry.sub20)}
                        className={'flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ' + (
                          entry.sub20
                            ? 'bg-purple-500 text-white border-purple-400 shadow-sm shadow-purple-500/30'
                            : 'bg-[#18263e] text-slate-400 border-slate-700 hover:border-slate-500'
                        )}
                      >
                        <span>Sub-20</span>
                      </button>
                    </div>

                    {/* Campo de Texto Rápido de Observação */}
                    <div>
                      <textarea
                        rows={2}
                        placeholder="Observação rápida de campo (ou ditar por voz)..."
                        value={entry.comentario}
                        onChange={(e) => handleUpdateAthlete(index, 'comentario', e.target.value)}
                        className="w-full bg-[#18263e] border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BLOCO 3: RESUMO GERAL DA PARTIDA */}
          <div className="bg-[#10192a] border border-slate-700/70 rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              3. Resumo Geral da Partida (Opcional)
            </div>
            <textarea
              rows={2}
              placeholder="Dinâmica do jogo, aspectos táticos gerais, clima..."
              value={analiseGeral}
              onChange={(e) => setAnaliseGeral(e.target.value)}
              className="w-full bg-[#16233b] border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Botão Inferior Grande de Salvar */}
          <div className="pt-2 sticky bottom-0 bg-[#0b121e] pb-1">
            <button
              type="submit"
              className={'w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] ' + (
                isEditMode
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20'
              )}
            >
              {isEditMode ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Salvar Alterações</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Salvar Relatório de Campo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
