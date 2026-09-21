import React, { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  Search, 
  Plus, 
  Trash2, 
  Star, 
  UserCheck, 
  Shield, 
  FileText, 
  Check, 
  Trophy, 
  Calendar, 
  MapPin,
  Bookmark,
  UserPlus,
  Flame,
  Sparkles,
  Telescope,
  Layers,
  ChevronDown
} from 'lucide-react'

const STANDARD_POSITIONS = [
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

const MONITORING_LISTS = [
  { id: 'monitoramento', label: 'Monitoramento Ativo', icon: Telescope, color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
  { id: 'sub23', label: 'Radar Sub-23', icon: Sparkles, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
  { id: 'hotList', label: 'Hot List (Prioritário)', icon: Flame, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  { id: 'timeSombra', label: 'Time Sombra 2026', icon: Layers, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' }
]

function mapToRadarPosition(posLabel) {
  if (!posLabel) return 'medio'
  const p = posLabel.toLowerCase()
  if (p.includes('gol')) return 'goleiro'
  if (p.includes('canhoto')) return 'zag-canhoto'
  if (p.includes('zag')) return 'zagueiro'
  if (p.includes('lat') && p.includes('d')) return 'lat-direito'
  if (p.includes('lat') && p.includes('e')) return 'lat-esquerdo'
  if (p.includes('vol') || p.includes('1º')) return 'medio'
  if (p.includes('central')) return 'medio-central'
  if (p.includes('meia')) return 'meia-ofensivo'
  if (p.includes('extremo') || p.includes('ponta')) return 'extremo'
  if (p.includes('centroavante') || p.includes('ata')) return 'centroavante'
  return 'medio'
}

export default function MatchReportModal({
  isOpen,
  onClose,
  onSave,
  onSavePlayerToRadar,
  onDeletePlayer,
  reportToEdit = null,
  coaches = [],
  players = []
}) {
  const isEditing = !!reportToEdit

  const [partida, setPartida] = useState('')
  const [competicao, setCompeticao] = useState('Série B')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [local, setLocal] = useState('')

  // Bloco 2: Treinadores Avaliados (Mandante e Visitante)
  const [coachMandanteId, setCoachMandanteId] = useState('')
  const [coachMandanteNota, setCoachMandanteNota] = useState(7.0)
  const [coachMandanteComentario, setCoachMandanteComentario] = useState('')

  const [coachVisitanteId, setCoachVisitanteId] = useState('')
  const [coachVisitanteNota, setCoachVisitanteNota] = useState(7.0)
  const [coachVisitanteComentario, setCoachVisitanteComentario] = useState('')

  // Bloco 3: Atletas Avaliados
  const [atletasAvaliados, setAtletasAvaliados] = useState([])
  const totalDestaques = useMemo(() => {
    return (atletasAvaliados || []).filter(a => !!a.destaque).length
  }, [atletasAvaliados])
  const [playerSearch, setPlayerSearch] = useState('')
  const [isPlayerDropdownOpen, setIsPlayerDropdownOpen] = useState(false)
  const [openListDropdownPlayerId, setOpenListDropdownPlayerId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Bloco 4: Análise Geral
  const [analiseGeral, setAnaliseGeral] = useState('')

  // Helper para buscar se o atleta já existe no banco global 'players'
  const findExistingPlayer = (atleta) => {
    if (!atleta) return null
    return (players || []).find(p => {
      if (!p) return false
      if (atleta.idAtleta && String(p.id) === String(atleta.idAtleta)) return true
      if (atleta.savedPlayerId && String(p.id) === String(atleta.savedPlayerId)) return true
      if (atleta.apiId && p.apiId && String(p.apiId) === String(atleta.apiId)) return true
      
      const pNome = (p.nome || '').toLowerCase().trim()
      const aNome = (atleta.nome || '').toLowerCase().trim()
      if (pNome && aNome && pNome === aNome) {
        return true
      }
      return false
    })
  }

  // Efeito para preencher os dados quando abrir em modo de edição ou limpar quando for novo
  useEffect(() => {
    if (reportToEdit) {
      setPartida(reportToEdit.partida || '')
      setCompeticao(reportToEdit.competicao || 'Série B')
      setData(reportToEdit.data || new Date().toISOString().split('T')[0])
      setLocal(reportToEdit.local || '')
      setAnaliseGeral(reportToEdit.analiseGeral || '')
      setAtletasAvaliados(reportToEdit.atletasAvaliados || [])

      let mandante = null
      let visitante = null

      if (reportToEdit.treinadoresAvaliados && Array.isArray(reportToEdit.treinadoresAvaliados)) {
        mandante = reportToEdit.treinadoresAvaliados.find(t => t.time === 'mandante')
        visitante = reportToEdit.treinadoresAvaliados.find(t => t.time === 'visitante')
        if (!mandante && !visitante && reportToEdit.treinadoresAvaliados.length > 0) {
          mandante = reportToEdit.treinadoresAvaliados[0]
        }
      } else if (reportToEdit.treinadorAvaliado) {
        mandante = reportToEdit.treinadorAvaliado
      }

      if (mandante) {
        setCoachMandanteId(mandante.idTreinador || '')
        setCoachMandanteNota(mandante.nota !== undefined ? mandante.nota : 7.0)
        setCoachMandanteComentario(mandante.comentario || '')
      } else {
        setCoachMandanteId('')
        setCoachMandanteNota(7.0)
        setCoachMandanteComentario('')
      }

      if (visitante) {
        setCoachVisitanteId(visitante.idTreinador || '')
        setCoachVisitanteNota(visitante.nota !== undefined ? visitante.nota : 7.0)
        setCoachVisitanteComentario(visitante.comentario || '')
      } else {
        setCoachVisitanteId('')
        setCoachVisitanteNota(7.0)
        setCoachVisitanteComentario('')
      }
    } else {
      setPartida('')
      setCompeticao('Série B')
      setData(new Date().toISOString().split('T')[0])
      setLocal('')
      setCoachMandanteId('')
      setCoachMandanteNota(7.0)
      setCoachMandanteComentario('')
      setCoachVisitanteId('')
      setCoachVisitanteNota(7.0)
      setCoachVisitanteComentario('')
      setAtletasAvaliados([])
      setAnaliseGeral('')
    }
  }, [reportToEdit, isOpen])

  if (!isOpen) return null

  // Filtro de atletas para busca rápida
  const availablePlayers = (players || []).filter(p => {
    if (!p) return false
    if ((atletasAvaliados || []).some(a => a.idAtleta === p.id)) return false
    if (!playerSearch.trim()) return true
    const s = playerSearch.toLowerCase()
    return (
      (p.nome || '').toLowerCase().includes(s) ||
      (p.ca || '').toLowerCase().includes(s) ||
      (p.posicao || '').toLowerCase().includes(s)
    )
  })

  const handleAddPlayer = (p, timeDestino = 'mandante') => {
    setAtletasAvaliados(prev => [
      ...prev,
      {
        idAtleta: p.id,
        savedPlayerId: p.id,
        nome: p.nome,
        posicao: p.posicaoLabel || p.posicao || 'Médio',
        ca: p.ca || '',
        time: timeDestino,
        lado: timeDestino,
        nota: 7.0,
        destaque: false,
        sub20: !!p.radarSub23,
        comentario: ''
      }
    ])
    setPlayerSearch('')
    setIsPlayerDropdownOpen(false)
  }

  const handleRemovePlayer = (idAtleta) => {
    setAtletasAvaliados(prev => prev.filter(a => a.idAtleta !== idAtleta))
  }

  const handleUpdatePlayer = (idAtleta, field, value) => {
    setAtletasAvaliados(prev =>
      prev.map(a => (a.idAtleta === idAtleta ? { ...a, [field]: value } : a))
    )
  }

  // AÇÃO 1: Adicionar ou Alternar Atleta no Banco Global de Jogadores
  const handleToggleEnrollPlayer = (atleta) => {
    const existingP = findExistingPlayer(atleta)
    const isEnrolled = Boolean(existingP)

    if (isEnrolled) {
      // Se já está no banco, apenas exibimos feedback visual ou removemos se for provisório
      setToastMessage({
        type: 'info',
        text: atleta.nome + ' já está cadastrado no Banco de Dados (' + (existingP.ca || 'Sem clube') + ').'
      })
      setTimeout(() => setToastMessage(null), 3000)
    } else {
      // Cria o registro no banco global
      const newPlayerId = 'p-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
      const targetTeam = atleta.time === 'visitante' ? awayTeamName : homeTeamName
      const playerPayload = {
        id: newPlayerId,
        nome: atleta.nome,
        posicao: mapToRadarPosition(atleta.posicao),
        posicaoLabel: atleta.posicao || 'Médio',
        ca: atleta.ca || targetTeam,
        nivel: 'C',
        status: 'Triagem',
        statusTriagem: 'Em Observação',
        isProvisorio: false,
        perna: 'Destro',
        pernaDominante: 'Destro',
        caracteristicas: ['Em Análise'],
        notaScout: atleta.nota ? parseFloat(atleta.nota) : 7.0,
        radarSub23: !!atleta.sub20,
        observacoes: 'Cadastrado via Relatório de Jogo: ' + partida + ' (' + data + '). Nota Scout: ' + (atleta.nota || '7.0')
      }

      if (onSavePlayerToRadar) {
        onSavePlayerToRadar(playerPayload)
      }

      // Atualiza localmente no atleta do formulário
      setAtletasAvaliados(prev => prev.map(a => {
        if (a.idAtleta === atleta.idAtleta || a.nome === atleta.nome) {
          return {
            ...a,
            idAtleta: a.idAtleta || newPlayerId,
            savedPlayerId: newPlayerId,
            salvoRadar: true
          }
        }
        return a
      }))

      setToastMessage({
        type: 'success',
        text: '✓ ' + atleta.nome + ' cadastrado com sucesso no Banco de Dados!'
      })
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  // AÇÃO 2: Vincular Atleta a uma Lista de Monitoramento (Esteiras)
  const handleAssignToList = (atleta, listKey) => {
    const existingP = findExistingPlayer(atleta)
    const newPlayerId = existingP ? existingP.id : ('p-' + Date.now() + '-' + Math.floor(Math.random() * 1000))
    const targetTeam = atleta.time === 'visitante' ? awayTeamName : homeTeamName

    const isMonitoring = listKey === 'monitoramento'
    const isSub23 = listKey === 'sub23' || !!atleta.sub20
    const isHotList = listKey === 'hotList'
    const isTimeSombra = listKey === 'timeSombra'

    let statusTriagem = 'Em Observação'
    if (isMonitoring) statusTriagem = 'Monitoramento'
    else if (isHotList) statusTriagem = 'Prioritário'
    else if (isSub23) statusTriagem = 'Sub-23'
    else if (isTimeSombra) statusTriagem = 'Time Sombra'

    const playerPayload = {
      ...(existingP || {}),
      id: newPlayerId,
      nome: atleta.nome,
      posicao: mapToRadarPosition(atleta.posicao),
      posicaoLabel: atleta.posicao || 'Médio',
      ca: atleta.ca || existingP?.ca || targetTeam,
      nivel: existingP?.nivel || 'C',
      status: isHotList ? 'Hot List' : (isMonitoring ? 'Monitoramento Ativo' : (existingP?.status || 'Triagem')),
      statusTriagem: statusTriagem,
      monitoramento: isMonitoring || Boolean(existingP?.monitoramento),
      radarSub23: isSub23 || Boolean(existingP?.radarSub23),
      hotList: isHotList || Boolean(existingP?.hotList),
      timeSombra: isTimeSombra || Boolean(existingP?.timeSombra),
      isProvisorio: false,
      notaScout: atleta.nota ? parseFloat(atleta.nota) : (existingP?.notaScout || 7.0),
      observacoes: existingP?.observacoes 
        ? (existingP.observacoes + '\n[Adicionado à lista ' + statusTriagem + ' via ' + partida + ' (' + data + ')]')
        : ('Adicionado à lista ' + statusTriagem + ' via Relatório de Jogo: ' + partida + ' (' + data + ')')
    }

    if (onSavePlayerToRadar) {
      onSavePlayerToRadar(playerPayload)
    }

    // Atualiza o estado do atleta no relatório sem perder os dados
    setAtletasAvaliados(prev => prev.map(a => {
      if (a.idAtleta === atleta.idAtleta || a.nome === atleta.nome) {
        return {
          ...a,
          idAtleta: a.idAtleta || newPlayerId,
          savedPlayerId: newPlayerId,
          salvoRadar: true,
          listaAtiva: statusTriagem,
          sub20: isSub23 ? true : a.sub20
        }
      }
      return a
    }))

    setOpenListDropdownPlayerId(null)
    setToastMessage({
      type: 'success',
      text: '🔖 ' + atleta.nome + ' vinculado à lista: ' + statusTriagem + '!'
    })
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!partida.trim()) {
      alert('Por favor, informe a partida (ex: Mandante x Visitante).')
      return
    }

    if (!coachMandanteId && !coachVisitanteId) {
      alert('Por favor, selecione ao menos um treinador (Mandante ou Visitante) para avaliar.')
      return
    }

    const treinadoresAvaliados = []
    const coachMandanteObj = (coaches || []).find(c => c.id === coachMandanteId)
    const coachVisitanteObj = (coaches || []).find(c => c.id === coachVisitanteId)

    if (coachMandanteObj) {
      treinadoresAvaliados.push({
        idTreinador: coachMandanteObj.id,
        nome: coachMandanteObj.nome,
        time: 'mandante',
        nota: parseFloat(coachMandanteNota) || 0,
        comentario: coachMandanteComentario.trim()
      })
    }

    if (coachVisitanteObj) {
      treinadoresAvaliados.push({
        idTreinador: coachVisitanteObj.id,
        nome: coachVisitanteObj.nome,
        time: 'visitante',
        nota: parseFloat(coachVisitanteNota) || 0,
        comentario: coachVisitanteComentario.trim()
      })
    }

    const primaryCoach = treinadoresAvaliados[0] || null

    const payload = {
      id: reportToEdit ? reportToEdit.id : Date.now().toString(),
      partida: partida.trim(),
      competicao: competicao.trim() || 'Partida',
      data: data || new Date().toISOString().split('T')[0],
      local: local.trim() || 'Estádio / Local não informado',
      treinadoresAvaliados,
      treinadorAvaliado: primaryCoach,
      atletasAvaliados: (atletasAvaliados || []).map(a => ({
        ...a,
        nota: parseFloat(a.nota) || 0
      })),
      analiseGeral: analiseGeral.trim()
    }

    if (onSave) {
      onSave(payload)
    }
    if (onClose) {
      onClose()
    }
  }

  // Nomes dos clubes a partir de 'partida'
  const [mNamePartida, vNamePartida] = (partida || '').split(' x ').map(s => s.trim())
  const homeTeamName = mNamePartida || 'Mandante'
  const awayTeamName = vNamePartida || 'Visitante'

  // Separação dos atletas por equipe (Mandante vs Visitante)
  let homeAthletes = (atletasAvaliados || []).filter(a => {
    const aTime = (a.time || a.lado || a.ca || '').toLowerCase().trim()
    return aTime === 'mandante' || aTime === homeTeamName.toLowerCase().trim()
  })

  let awayAthletes = (atletasAvaliados || []).filter(a => {
    const aTime = (a.time || a.lado || a.ca || '').toLowerCase().trim()
    return aTime === 'visitante' || aTime === awayTeamName.toLowerCase().trim()
  })

  if (homeAthletes.length === 0 && awayAthletes.length === 0 && (atletasAvaliados || []).length > 0) {
    const mid = Math.ceil(atletasAvaliados.length / 2)
    homeAthletes.push(...atletasAvaliados.slice(0, mid))
    awayAthletes.push(...atletasAvaliados.slice(mid))
  } else if (homeAthletes.length > 0 && awayAthletes.length === 0 && (atletasAvaliados || []).length > homeAthletes.length) {
    awayAthletes = (atletasAvaliados || []).filter(a => !homeAthletes.includes(a))
  } else if (homeAthletes.length === 0 && awayAthletes.length > 0 && (atletasAvaliados || []).length > awayAthletes.length) {
    homeAthletes = (atletasAvaliados || []).filter(a => !awayAthletes.includes(a))
  }

  // Renderizador do Card de Atleta com Barra de Ações Rápidas da Agenda
  const renderAthleteCard = (item, idx) => {
    const existingP = findExistingPlayer(item)
    const isEnrolled = Boolean(existingP) || !!item.salvoRadar
    const isListMenuOpen = openListDropdownPlayerId === item.idAtleta
    
    // Identificar se já está em alguma esteira/lista
    let activeListName = item.listaAtiva || null
    if (!activeListName && existingP) {
      if (existingP.hotList) activeListName = 'Hot List'
      else if (existingP.monitoramento) activeListName = 'Monitoramento'
      else if (existingP.radarSub23) activeListName = 'Sub-23'
      else if (existingP.timeSombra) activeListName = 'Time Sombra'
      else if (existingP.statusTriagem && existingP.statusTriagem !== 'Em Observação') activeListName = existingP.statusTriagem
    }

    return (
      <div
        key={item.idAtleta || ('atleta-' + idx + '-' + item.nome)}
        className="p-3 bg-[#090f1b] border border-slate-800 hover:border-slate-700/80 rounded-xl space-y-2.5 shadow-sm transition-all relative"
      >
        {/* Linha 1: Nome, Posição Dropdown, Nota e Lixeira */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-white truncate">{item.nome}</span>
            <select
              value={item.posicao || 'Meia Ofensivo'}
              onChange={(e) => handleUpdatePlayer(item.idAtleta, 'posicao', e.target.value)}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-2 py-0.5 text-[10px] font-bold text-emerald-400 cursor-pointer focus:outline-none focus:border-emerald-500 shrink-0"
              title="Alterar/corrigir posição tática"
            >
              {STANDARD_POSITIONS.map(sp => (
                <option key={sp.id} value={sp.label}>
                  {sp.label}
                </option>
              ))}
            </select>
            {item.ca && (
              <span className="text-[10px] text-slate-400 shrink-0 truncate max-w-[90px]">
                ({item.ca})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Nota:</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={item.nota}
                onChange={(e) => handleUpdatePlayer(item.idAtleta, 'nota', e.target.value)}
                className="w-13 bg-[#142036] border border-slate-700 rounded px-1.5 py-0.5 text-xs text-emerald-400 text-center font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={() => handleRemovePlayer(item.idAtleta)}
              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Remover atleta do relatório"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Linha 2: BARRA DE AÇÕES RÁPIDAS DA AGENDA ([ + Banco de Dados ] / [ 🔖 Monitoramento / Lista ]) */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5 pb-0.5 border-t border-b border-slate-800/60">
          
          {/* Ação A: Banco de Dados */}
          <button
            type="button"
            onClick={() => handleToggleEnrollPlayer(item)}
            className={'text-[10px] px-2 py-1 rounded font-bold transition flex items-center gap-1 cursor-pointer ' + (
              isEnrolled
                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/50'
                : 'border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/15'
            )}
            title={isEnrolled ? 'Atleta já cadastrado no banco' : 'Cadastrar atleta no Banco de Dados'}
          >
            {isEnrolled ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>✓ No Banco</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3 text-emerald-400" />
                <span>+ Banco de Dados</span>
              </>
            )}
          </button>

          {/* Ação B: Monitoramento / Listas com Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenListDropdownPlayerId(isListMenuOpen ? null : item.idAtleta)}
              className="border border-blue-500/40 text-blue-400 hover:bg-blue-500/15 text-[10px] px-2 py-1 rounded font-bold transition flex items-center gap-1 cursor-pointer"
              title="Vincular a uma lista de monitoramento"
            >
              <Bookmark className="w-3 h-3 text-blue-400" />
              <span>{activeListName ? ('🔖 ' + activeListName) : '🔖 Monitoramento / Lista'}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-70" />
            </button>

            {/* Menu Suspenso de Listas */}
            {isListMenuOpen && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-[#0e1728] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Selecionar Lista
                </div>
                {MONITORING_LISTS.map(lst => {
                  const Icon = lst.icon
                  const isCurrent = activeListName === lst.label || activeListName === lst.id
                  return (
                    <button
                      key={lst.id}
                      type="button"
                      onClick={() => handleAssignToList(item, lst.id)}
                      className={'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 transition cursor-pointer ' + (
                        isCurrent
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{lst.label}</span>
                      </div>
                      {isCurrent && <Check className="w-3 h-3 text-blue-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Badge de Lista Ativa */}
          {activeListName && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
              {activeListName}
            </span>
          )}
        </div>

        {/* Linha 3: Toggles de Destaque e Sub-20 */}
        <div className="flex flex-wrap items-center gap-3 text-xs pt-0.5">
          <button
            type="button"
            onClick={() => handleUpdatePlayer(item.idAtleta, 'destaque', !item.destaque)}
            className={'px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ' + (
              item.destaque
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/30 font-black'
                : 'bg-[#121c2e] text-slate-400 border-slate-700 hover:border-slate-500'
            )}
            title={item.destaque ? 'Remover destaque da partida' : 'Marcar como Destaque da Partida (★)'}
          >
            <Star className={'w-3 h-3 ' + (item.destaque ? 'fill-slate-950 text-slate-950' : 'text-slate-500')} />
            <span>★ Destaque</span>
          </button>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={!!item.sub20}
              onChange={(e) => handleUpdatePlayer(item.idAtleta, 'sub20', e.target.checked)}
              className="accent-purple-500 rounded cursor-pointer"
            />
            <span className="text-purple-300 text-[11px] font-semibold">
              Sub-20 / Jovem
            </span>
          </label>
        </div>

        {/* Linha 4: Comentário Individual */}
        <input
          type="text"
          placeholder="Desempenho individual, virtudes ou fragilidades observadas..."
          value={item.comentario || ''}
          onChange={(e) => handleUpdatePlayer(item.idAtleta, 'comentario', e.target.value)}
          className="w-full bg-[#121c2e] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="bg-[#0b1322] border border-slate-700/80 rounded-2xl w-full max-w-6xl w-[94vw] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Toast de Feedback */}
        {toastMessage && (
          <div className={'px-4 py-2 text-xs font-bold text-center border-b animate-in slide-in-from-top-2 ' + (
            toastMessage.type === 'success' 
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
              : 'bg-sky-950 text-sky-300 border-sky-700/60'
          )}>
            {toastMessage.text}
          </div>
        )}

        {/* 1. Header Panorâmico */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-[#090f1c] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {isEditing ? 'Editar Relatório de Jogo' : 'Novo Relatório de Jogo'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {isEditing ? 'MODO EDIÇÃO' : 'CRIAÇÃO'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Avaliação técnica e tática de partida, comissão técnica e atletas observados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll e Layout Amplo */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* BLOCO 1: DADOS BÁSICOS DO CONFRONTO */}
          <div className="bg-[#080e1a]/80 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>1. DADOS BÁSICOS DA PARTIDA</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Jogo (Mandante x Visitante) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Goiás 2 x 1 Vila Nova"
                  value={partida}
                  onChange={(e) => setPartida(e.target.value)}
                  className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Competição</label>
                <input
                  type="text"
                  placeholder="Ex: Brasileirão Série B"
                  value={competicao}
                  onChange={(e) => setCompeticao(e.target.value)}
                  className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Data do Jogo</label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Estádio / Local</label>
                <input
                  type="text"
                  placeholder="Ex: Estádio da Serrinha"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* BLOCO 2: TREINADORES EM DUAS COLUNAS LADO A LADO */}
          <div className="bg-[#080e1a]/80 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-violet-400" />
                <span>2. COMISSÃO TÉCNICA / TREINADORES (MANDANTE VS VISITANTE)</span>
              </div>
              <span className="text-[10px] text-slate-400 bg-[#121d30] px-2 py-0.5 rounded border border-slate-700/60 font-medium">
                Avalie ao menos um técnico
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Coluna A: Treinador Mandante */}
              <div className="bg-[#0c1424] border border-slate-700/60 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    Treinador {homeTeamName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                    Mandante
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Selecionar Técnico
                    </label>
                    <select
                      value={coachMandanteId}
                      onChange={(e) => setCoachMandanteId(e.target.value)}
                      className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="">[ Selecione ou Deixe em Branco ]</option>
                      {(coaches || []).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nome} ({c.clubeAtual || 'Sem clube'} - Nível {c.nivelAtual})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Nota (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      disabled={!coachMandanteId}
                      value={coachMandanteNota}
                      onChange={(e) => setCoachMandanteNota(e.target.value)}
                      className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 text-center font-bold disabled:opacity-40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Observação Tática do Mandante
                  </label>
                  <textarea
                    rows={2}
                    disabled={!coachMandanteId}
                    placeholder="Postura do time, leitura no intervalo, organização ofensiva..."
                    value={coachMandanteComentario}
                    onChange={(e) => setCoachMandanteComentario(e.target.value)}
                    className="w-full bg-[#121d30] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Coluna B: Treinador Visitante */}
              <div className="bg-[#0c1424] border border-slate-700/60 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    Treinador {awayTeamName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold uppercase">
                    Visitante
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Selecionar Técnico
                    </label>
                    <select
                      value={coachVisitanteId}
                      onChange={(e) => setCoachVisitanteId(e.target.value)}
                      className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="">[ Selecione ou Deixe em Branco ]</option>
                      {(coaches || []).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nome} ({c.clubeAtual || 'Sem clube'} - Nível {c.nivelAtual})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Nota (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      disabled={!coachVisitanteId}
                      value={coachVisitanteNota}
                      onChange={(e) => setCoachVisitanteNota(e.target.value)}
                      className="w-full bg-[#121d30] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 text-center font-bold disabled:opacity-40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Observação Tática do Visitante
                  </label>
                  <textarea
                    rows={2}
                    disabled={!coachVisitanteId}
                    placeholder="Estratégia fora de casa, transições, bloco defensivo..."
                    value={coachVisitanteComentario}
                    onChange={(e) => setCoachVisitanteComentario(e.target.value)}
                    className="w-full bg-[#121d30] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500 resize-none disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO 3: ATLETAS OBSERVADOS EM DUAS COLUNAS (MANDANTE | VISITANTE) */}
          <div className="bg-[#080e1a]/80 border border-slate-800 rounded-xl p-4 space-y-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>3. ATLETAS OBSERVADOS (AÇÕES RÁPIDAS: BANCO DE DADOS & LISTAS DE MONITORAMENTO)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ' + (
                  totalDestaques > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                )}>
                  ★ {totalDestaques} destaque(s) selecionado(s)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {(atletasAvaliados || []).length} atleta(s) cadastrado(s)
                </span>
              </div>
            </div>

            {/* Campo de Busca Rápida de Atletas para Adicionar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar atleta no banco de dados para incluir na partida..."
                value={playerSearch}
                onFocus={() => setIsPlayerDropdownOpen(true)}
                onChange={(e) => {
                  setPlayerSearch(e.target.value)
                  setIsPlayerDropdownOpen(true)
                }}
                className="w-full bg-[#121d30] border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              {/* Dropdown com os atletas disponíveis com opção de time */}
              {isPlayerDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-[#0e1726] border border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-800">
                  <div className="p-2 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/60 font-semibold uppercase">
                    <span>Selecione um atleta ({availablePlayers.length})</span>
                    <button
                      type="button"
                      onClick={() => setIsPlayerDropdownOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Fechar
                    </button>
                  </div>
                  {availablePlayers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500">
                      Nenhum atleta disponível encontrado.
                    </div>
                  ) : (
                    availablePlayers.slice(0, 15).map(p => (
                      <div
                        key={p.id}
                        className="px-3 py-2 hover:bg-[#15233a] flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="text-xs font-bold text-white mr-2">{p.nome}</span>
                          <span className="text-[10px] text-slate-400">
                            {p.posicaoLabel || p.posicao} &bull; {p.ca}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAddPlayer(p, 'mandante')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                          >
                            + {homeTeamName}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddPlayer(p, 'visitante')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 hover:bg-sky-500/40 text-sky-400 border border-sky-500/30 cursor-pointer"
                          >
                            + {awayTeamName}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Grid de Duas Colunas: Mandante à Esquerda | Visitante à Direita */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* COLUNA 1: ATLETAS DO MANDANTE */}
              <div className="bg-[#0b121f] border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {homeTeamName}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">{homeAthletes.length} atletas</span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {homeAthletes.length === 0 ? (
                    <div className="text-xs text-slate-500 italic text-center py-6 bg-[#080d17]/60 rounded-lg border border-slate-800">
                      Nenhum atleta listado para o Mandante.
                    </div>
                  ) : (
                    homeAthletes.map((item, idx) => renderAthleteCard(item, idx))
                  )}
                </div>
              </div>

              {/* COLUNA 2: ATLETAS DO VISITANTE */}
              <div className="bg-[#0b121f] border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      {awayTeamName}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">{awayAthletes.length} atletas</span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {awayAthletes.length === 0 ? (
                    <div className="text-xs text-slate-500 italic text-center py-6 bg-[#080d17]/60 rounded-lg border border-slate-800">
                      Nenhum atleta listado para o Visitante.
                    </div>
                  ) : (
                    awayAthletes.map((item, idx) => renderAthleteCard(item, idx))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* BLOCO 4: ANÁLISE GERAL */}
          <div className="bg-[#080e1a]/80 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>4. ANÁLISE TÁTICA GERAL DO JOGO</span>
            </div>
            <textarea
              rows={3}
              required
              placeholder="Descreva a dinâmica da partida, ritmo de jogo, fase defensiva/ofensiva, transições e conclusões do scout..."
              value={analiseGeral}
              onChange={(e) => setAnaliseGeral(e.target.value)}
              className="w-full bg-[#121d30] border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
            />
          </div>

          {/* Rodapé do Modal */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
            >
              {isEditing ? 'Salvar Alterações' : 'Salvar Relatório'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
