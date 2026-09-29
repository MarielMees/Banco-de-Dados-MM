import React, { useState, useEffect } from 'react'
import { X, UserPlus, Video, Check, Loader2, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react'
import { POSITION_CHARACTERISTICS } from '../constants/scoutCharacteristics'
import VoiceNoteControl from './VoiceNoteControl'
import {
  sanitizePlayerProfile,
  VALID_TIERS,
  VALID_FEET,
  VALID_CONTRACT_STATUSES
} from '../utils/playerSanitizer'
import { formatBRL } from '../utils/salaryUtils'

export const POSITIONS_OPTIONS = [
  'Goleiro',
  'Zag. Destro',
  'Zag. Canhoto',
  'Lat. Direito',
  'Lat. Esquerdo',
  'Volante (1º Médio)',
  'Médio Central',
  'Meia Ofensivo',
  'Extremo',
  'Centroavante'
]

export const mapOptionToPosId = (opt) => {
  if (!opt) return 'goleiro'
  const o = String(opt).toLowerCase().trim()
  if (o === 'goleiro' || o === 'gol' || o === 'gk') return 'goleiro'
  if (o === 'zag. canhoto' || o === 'zag-canhoto' || (o.includes('zag') && o.includes('canhoto'))) return 'zag-canhoto'
  if (o === 'zag. destro' || o === 'zagueiro' || o === 'zag-destro' || o.includes('destro') || o === 'zag' || o.includes('zagueiro')) return 'zagueiro'
  if (o === 'lat. direito' || o === 'lat-direito' || o === 'ld' || o.includes('direito')) return 'lat-direito'
  if (o === 'lat. esquerdo' || o === 'lat-esquerdo' || o === 'le' || o.includes('esquerdo')) return 'lat-esquerdo'
  if (o.includes('volante') || o.includes('1º médio') || o.includes('1o medio') || o === 'vol') return 'medio'
  if (o.includes('médio central') || o.includes('medio central') || o === 'medio-central' || o === 'mc') return 'medio-central'
  if (o === 'medio' || o === 'médio') return 'medio'
  if (o.includes('meia ofensivo') || o === 'meia-ofensivo' || o === 'meia' || o === 'mei' || o === 'moc') return 'meia-ofensivo'
  if (o.includes('extremo') || o.includes('ponta') || o.startsWith('ext')) return 'extremo'
  if (o.includes('centroavante') || o === 'ca' || o.includes('ata') || o === 'cf') return 'centroavante'
  return opt
}

export const mapPosIdToOption = (posId) => {
  if (!posId) return 'Goleiro'
  const p = String(posId).toLowerCase().trim()
  if (p === 'goleiro' || p === 'gol' || p === 'gk') return 'Goleiro'
  if (p === 'zag-canhoto' || (p.includes('zag') && p.includes('canhoto'))) return 'Zag. Canhoto'
  if (p === 'zagueiro' || p === 'zag-destro' || p.includes('destro') || p === 'zag' || p.includes('zagueiro')) return 'Zag. Destro'
  if (p === 'lat-direito' || p === 'ld' || p.includes('lateral direito') || p.includes('lat. direito') || p === 'lat d') return 'Lat. Direito'
  if (p === 'lat-esquerdo' || p === 'le' || p.includes('lateral esquerdo') || p.includes('lat. esquerdo') || p === 'lat e') return 'Lat. Esquerdo'
  if (p === 'volante' || p.includes('volante') || p.includes('1º médio') || p.includes('1o medio') || p === 'vol') return 'Volante (1º Médio)'
  if (p === 'medio-central' || p.includes('médio central') || p.includes('medio central') || p === 'mc') return 'Médio Central'
  if (p === 'medio' || p === 'médio') return 'Volante (1º Médio)'
  if (p === 'meia-ofensivo' || p === 'meia' || p.includes('ofensivo') || p === 'mei' || p === 'moc') return 'Meia Ofensivo'
  if (p === 'extremo' || p.includes('extremo') || p.includes('ponta') || p.startsWith('ext')) return 'Extremo'
  if (p === 'centroavante' || p === 'ca' || p.includes('ata') || p === 'cf') return 'Centroavante'
  return posId
}

const SECONDARY_POSITIONS = [
  'Nenhuma',
  'Goleiro',
  'Zag. Destro',
  'Zag. Canhoto',
  'Lat. Direito',
  'Lat. Esquerdo',
  'Médio',
  'Meia Ofensivo',
  'Extremo',
  'Centroavante'
]

const PROJECOES_NACIONAL = [
  { id: 'BR1', label: 'BR1', desc: 'Série A' },
  { id: 'BR2', label: 'BR2', desc: 'Série B' },
  { id: 'BR3', label: 'BR3', desc: 'Série C / Estaduais' },
  { id: 'BR4', label: 'BR4', desc: 'Série D / Regionais' }
]

const PROJECOES_INTERNACIONAL = [
  { id: 'E1', label: 'E1', desc: 'Top 5 Ligas Europeias' },
  { id: 'E2', label: 'E2', desc: 'Europa Média / Trampolim' },
  { id: 'E3', label: 'E3', desc: 'Europa Periférica' },
  { id: 'EXT', label: 'EXT', desc: 'Mundo Árabe / MLS / México / Ásia' }
]

const NIVEIS_FISICOS = ['Excelente', 'Muito Bom', 'Bom', 'Fraco', 'Muito Ruim']

export default function PlayerModal({
  isOpen,
  onClose,
  onSave,
  activePosition = 'goleiro',
  playerToEdit = null
}) {
  const [formData, setFormData] = useState({
    nome: '',
    posicao: activePosition || 'goleiro',
    an: '',
    alt: '',
    salario: '',
    pe: '',
    nivel: '',
    tetoNacional: '',
    projecaoInternacional: '',
    nivelFisico: '',
    posSecundaria: 'Nenhuma',
    situacao: 'Sem data',
    ca: '',
    clubeFormador: '',
    agente: '',
    contrato: '',
    radarSub23: false,
    monitoramento: false,
    hotList: false,
    caracteristicas: [],
    observacao: '',
    videoYoutube: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Sincroniza dados quando o modal abre ou o jogador para edição muda
  useEffect(() => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(false)

    if (playerToEdit) {
      // Converte data para formato YYYY-MM-DD para o input type="date"
      let contratoFormatted = playerToEdit.contract_end || playerToEdit.contrato || ''
      if (contratoFormatted.includes('/')) {
        const parts = contratoFormatted.split('/')
        if (parts.length === 3) {
          contratoFormatted = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        }
      }

      // Trata dados legados de projeção
      let tetoNac = ''
      let projInt = ''
      if (playerToEdit.projecao) {
        if (Array.isArray(playerToEdit.projecao)) {
          tetoNac = playerToEdit.projecao.find(p => ['BR1', 'BR2', 'BR3', 'BR4'].includes(p)) || ''
          projInt = playerToEdit.projecao.find(p => ['E1', 'E2', 'E3', 'EXT', 'MLS', 'AS1', 'AS2'].includes(p)) || ''
          if (['MLS', 'AS1', 'AS2'].includes(projInt)) projInt = 'EXT'
        } else if (typeof playerToEdit.projecao === 'string') {
          const p = playerToEdit.projecao
          if (['BR1', 'BR2', 'BR3', 'BR4'].includes(p)) tetoNac = p
          else if (['E1', 'E2', 'E3', 'EXT'].includes(p)) projInt = p
        }
      }

      const rawPos = playerToEdit.posicao || playerToEdit.posicaoLabel || playerToEdit.position || activePosition || 'goleiro'
      const initialPos = mapOptionToPosId(rawPos)

      // Ano nascimento estrito (sem inventar idade fictícia)
      let initialAn = ''
      if (playerToEdit.birth_year) initialAn = String(playerToEdit.birth_year)
      else if (playerToEdit.anoNascimento) initialAn = String(playerToEdit.anoNascimento)
      else if (playerToEdit.an && playerToEdit.an !== '—') initialAn = String(playerToEdit.an)

      // Altura real estrita
      let initialAlt = ''
      if (playerToEdit.height) initialAlt = String(playerToEdit.height)
      else if (playerToEdit.alt && playerToEdit.alt !== '—') initialAlt = String(playerToEdit.alt)
      else if (playerToEdit.altura && playerToEdit.altura !== '—') initialAlt = String(playerToEdit.altura)

      // Salário real estrito
      let initialSal = ''
      const rawSal = playerToEdit.salary ?? playerToEdit.estimated_salary ?? playerToEdit.salarioEstimado
      if (rawSal !== null && rawSal !== undefined && rawSal !== '') {
        initialSal = String(rawSal)
      }

      // Pé preferencial estrito
      const rawPe = playerToEdit.preferred_foot || playerToEdit.pePreferencial || playerToEdit.pe || ''
      const initialPe = (rawPe && rawPe !== '—') ? rawPe : ''

      // Tier estrito
      const rawNivel = playerToEdit.tier || playerToEdit.nivel || ''
      const initialNivel = (rawNivel && rawNivel !== '—' && rawNivel !== 'A Avaliar') ? rawNivel : ''

      // Status de contrato estrito
      const initialSituacao = playerToEdit.contract_status || playerToEdit.situacao || playerToEdit.alerta || 'Sem data'

      // Posição secundária estrita
      let initialPosSec = playerToEdit.secondary_position || playerToEdit.posSecundaria || 'Nenhuma'
      if (initialPosSec === '—' || initialPosSec === '-') initialPosSec = 'Nenhuma'
      if (initialPosSec === 'Zagueiro') initialPosSec = 'Zag. Destro'

      // Agente estrito
      let initialAgente = playerToEdit.agent || playerToEdit.agente || ''
      if (initialAgente === '—' || initialAgente === '-') initialAgente = ''

      // Tags estritas (sem tags automáticas inventadas)
      const initialTags = Array.isArray(playerToEdit.tactical_dna) && playerToEdit.tactical_dna.length > 0
        ? [...playerToEdit.tactical_dna]
        : (Array.isArray(playerToEdit.caracteristicas) ? [...playerToEdit.caracteristicas] : [])

      setFormData({
        nome: playerToEdit.nome || playerToEdit.name || '',
        posicao: initialPos,
        an: initialAn,
        alt: initialAlt,
        salario: initialSal,
        pe: initialPe,
        nivel: initialNivel,
        tetoNacional: tetoNac,
        projecaoInternacional: projInt,
        nivelFisico: playerToEdit.nivelFisico && playerToEdit.nivelFisico !== '—' ? playerToEdit.nivelFisico : '',
        posSecundaria: initialPosSec,
        situacao: initialSituacao,
        ca: playerToEdit.current_club || playerToEdit.ca || playerToEdit.clubeAtual || playerToEdit.clube || '',
        clubeFormador: playerToEdit.youth_club || playerToEdit.clubeFormador || '',
        agente: initialAgente,
        contrato: contratoFormatted,
        radarSub23: Boolean(playerToEdit.radarSub23),
        monitoramento: Boolean(playerToEdit.monitoramento),
        hotList: Boolean(playerToEdit.hotList),
        caracteristicas: initialTags,
        observacao: playerToEdit.observacao || '',
        videoYoutube: playerToEdit.videoYoutube || ''
      })
    } else {
      // Criação de novo atleta: tolerância zero a mocks ou dados aleatórios padrão
      setFormData({
        nome: '',
        posicao: activePosition || 'goleiro',
        an: '',
        alt: '',
        salario: '',
        pe: '',
        nivel: '',
        tetoNacional: '',
        projecaoInternacional: '',
        nivelFisico: '',
        posSecundaria: 'Nenhuma',
        situacao: 'Sem data',
        ca: '',
        clubeFormador: '',
        agente: '',
        contrato: '',
        radarSub23: false,
        monitoramento: false,
        hotList: false,
        caracteristicas: [],
        observacao: '',
        videoYoutube: ''
      })
    }
  }, [playerToEdit, isOpen, activePosition])

  if (!isOpen) return null

  // Lista de características disponíveis para a posição atual
  const currentSelectedPosId = mapOptionToPosId(formData.posicao || activePosition || 'goleiro')
  const currentPosData = POSITION_CHARACTERISTICS[currentSelectedPosId] || POSITION_CHARACTERISTICS[activePosition] || {
    name: currentSelectedPosId,
    items: []
  }
  const availableCharacteristics = currentPosData.items || []

  const toggleCharacteristic = (name) => {
    setFormData(prev => {
      const exists = prev.caracteristicas.includes(name)
      return {
        ...prev,
        caracteristicas: exists
          ? prev.caracteristicas.filter(c => c !== name)
          : [...prev.caracteristicas, name]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nome.trim()) return

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const finalPosId = mapOptionToPosId(formData.posicao || activePosition)

    // Monta payload preliminar com os campos fornecidos pelo scout
    const rawPayload = {
      ...(playerToEdit || {}),
      id: playerToEdit ? playerToEdit.id : `p_${Date.now()}`,
      nome: formData.nome.trim(),
      name: formData.nome.trim(),
      posicao: finalPosId,
      position: mapPosIdToOption(finalPosId),
      posicaoLabel: mapPosIdToOption(finalPosId),
      height: formData.alt,
      alt: formData.alt,
      salary: formData.salario,
      estimated_salary: formData.salario,
      birth_year: formData.an,
      an: formData.an,
      preferred_foot: formData.pe,
      pe: formData.pe,
      tier: formData.nivel,
      nivel: formData.nivel,
      contract_status: formData.situacao,
      situacao: formData.situacao,
      contract_end: formData.contrato,
      contrato: formData.contrato,
      secondary_position: formData.posSecundaria,
      posSecundaria: formData.posSecundaria,
      tactical_dna: formData.caracteristicas,
      caracteristicas: formData.caracteristicas,
      agent: formData.agente,
      agente: formData.agente,
      ca: formData.ca.trim(),
      clubeAtual: formData.ca.trim(),
      current_club: formData.ca.trim(),
      clube: formData.ca.trim(),
      clubeFormador: formData.clubeFormador.trim(),
      youth_club: formData.clubeFormador.trim(),
      tetoNacional: formData.tetoNacional,
      projecaoInternacional: formData.projecaoInternacional,
      projecao: [formData.tetoNacional, formData.projecaoInternacional].filter(Boolean),
      nivelFisico: formData.nivelFisico,
      radarSub23: formData.radarSub23,
      monitoramento: formData.monitoramento,
      hotList: formData.hotList,
      observacao: formData.observacao.trim(),
      videoYoutube: formData.videoYoutube.trim(),
      isProvisorio: false,
      is_provisorio: false
    }

    // 2. Sanitização Estrita Universal
    const sanitizedPlayer = sanitizePlayerProfile(rawPayload)

    // 3. Sincronização e Confirmação com o Supabase
    try {
      if (onSave) {
        const result = await onSave(sanitizedPlayer)
        if (result && result.success === false) {
          // Erro no Supabase: NÃO fechar o formulário e exibir a mensagem real do erro
          setErrorMessage(result.error || 'Erro ao sincronizar jogador no Supabase.')
          setIsSubmitting(false)
          return
        }
      }

      setSuccessMessage('Jogador atualizado com sucesso!')
      setTimeout(() => {
        setIsSubmitting(false)
        onClose()
      }, 600)
    } catch (err) {
      console.error('[PlayerModal Save Error]', err)
      setErrorMessage(err.message || 'Erro inesperado ao salvar jogador.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl shadow-black overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-800/90 flex items-center justify-between bg-[#080d16]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {playerToEdit ? 'Editar Jogador' : '+ Novo Jogador'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Posição Principal: <strong className="text-emerald-400 font-bold">{mapPosIdToOption(formData.posicao || activePosition)}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banners de Feedback Imediato */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-2.5 text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold">Falha ao salvar no banco:</span> {errorMessage}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-2.5 text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs font-bold">{successMessage}</div>
          </div>
        )}

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* 1. SELETOR DE POSIÇÃO PRINCIPAL */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Posição Principal *
            </label>
            <select
              value={mapPosIdToOption(formData.posicao || activePosition)}
              onChange={(e) => {
                const optVal = e.target.value
                const posId = mapOptionToPosId(optVal)
                const isCanhoto = optVal === 'Zag. Canhoto' || posId === 'zag-canhoto'
                setFormData({
                  ...formData,
                  posicao: posId,
                  pe: isCanhoto ? 'Canhoto' : (formData.pe || 'Destro')
                })
              }}
              className="w-full bg-[#131b2e] border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {POSITIONS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* NOME (largura total) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              NOME DO ATLETA *
            </label>
            <input
              type="text"
              required
              placeholder="Nome completo do atleta"
              value={formData.nome || ''}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80 transition-colors"
            />
          </div>

          {/* Grid de Campos Sanitizados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ANO NASCIMENTO (birth_year) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                ANO DE NASCIMENTO (4 DÍGITOS)
              </label>
              <input
                type="text"
                placeholder="Ex: 2002"
                maxLength={4}
                value={formData.an || ''}
                onChange={(e) => setFormData({ ...formData, an: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* ALTURA (height) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                ALTURA (ex: 188, 1.88, 1,88 ou 188 cm)
              </label>
              <input
                type="text"
                placeholder="Ex: 188 ou 1.88m"
                value={formData.alt || ''}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* SALÁRIO ESTIMADO (salary) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                SALÁRIO MENSAL (ex: R$ 25.000,00 ou 25000)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: 85.000,00"
                  value={formData.salario || ''}
                  onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                  className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-emerald-300 placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-emerald-500/80"
                />
                <DollarSign className="w-3.5 h-3.5 text-emerald-500/70 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* PÉ PREFERIDO (preferred_foot) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                PÉ PREFERIDO
              </label>
              <select
                value={formData.pe || ''}
                onChange={(e) => setFormData({ ...formData, pe: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
              >
                <option value="">[ — Não Definido ]</option>
                {VALID_FEET.map(pe => (
                  <option key={pe} value={pe}>{pe}</option>
                ))}
              </select>
            </div>

            {/* TIER / NÍVEL (tier) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                TIER / NÍVEL
              </label>
              <select
                value={formData.nivel || ''}
                onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
              >
                <option value="">[ — Não Definido ]</option>
                {VALID_TIERS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* STATUS DO CONTRATO (contract_status) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                STATUS DO CONTRATO
              </label>
              <select
                value={formData.situacao || 'Sem data'}
                onChange={(e) => setFormData({ ...formData, situacao: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
              >
                {VALID_CONTRACT_STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* FIM DE CONTRATO (contract_end) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                FIM DE CONTRATO (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={formData.contrato || ''}
                onChange={(e) => setFormData({ ...formData, contrato: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* POSIÇÃO SECUNDÁRIA (secondary_position) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                POSIÇÃO SECUNDÁRIA
              </label>
              <select
                value={formData.posSecundaria || 'Nenhuma'}
                onChange={(e) => setFormData({ ...formData, posSecundaria: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
              >
                {SECONDARY_POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* AGENTE (agent) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                AGENTE / EMPRESA
              </label>
              <input
                type="text"
                placeholder="Ex: Bertolucci Sports ou NG Soccer"
                value={formData.agente || ''}
                onChange={(e) => setFormData({ ...formData, agente: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* CLUBE ATUAL (current_club) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                CLUBE ATUAL (CA)
              </label>
              <input
                type="text"
                placeholder="Ex: Juventude"
                value={formData.ca || ''}
                onChange={(e) => setFormData({ ...formData, ca: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* CLUBE FORMADOR (youth_club) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                CLUBE FORMADOR
              </label>
              <input
                type="text"
                placeholder="Ex: Grêmio"
                value={formData.clubeFormador || ''}
                onChange={(e) => setFormData({ ...formData, clubeFormador: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* NÍVEL FÍSICO */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                NÍVEL FÍSICO
              </label>
              <select
                value={formData.nivelFisico || ''}
                onChange={(e) => setFormData({ ...formData, nivelFisico: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
              >
                <option value="">[ — Não Definido ]</option>
                {NIVEIS_FISICOS.map(nf => (
                  <option key={nf} value={nf}>{nf}</option>
                ))}
              </select>
            </div>

            {/* PROJEÇÃO: DUAL SELECTION - Ocupa as 2 colunas */}
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                PROJEÇÃO (TETO NACIONAL + INTERNACIONAL)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] text-slate-400 mb-1">Teto Nacional</span>
                  <select
                    value={formData.tetoNacional}
                    onChange={(e) => setFormData({ ...formData, tetoNacional: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                  >
                    <option value="">[ — Nenhum ]</option>
                    {PROJECOES_NACIONAL.map(p => (
                      <option key={p.id} value={p.id}>{p.label} - {p.desc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400 mb-1">Projeção Internacional</span>
                  <select
                    value={formData.projecaoInternacional}
                    onChange={(e) => setFormData({ ...formData, projecaoInternacional: e.target.value })}
                    className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                  >
                    <option value="">[ — Nenhuma ]</option>
                    {PROJECOES_INTERNACIONAL.map(p => (
                      <option key={p.id} value={p.id}>{p.label} - {p.desc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* VÍDEO / YOUTUBE (largura total) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              VÍDEO / LINK (YOUTUBE / WYSCOUT)
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoYoutube || ''}
                onChange={(e) => setFormData({ ...formData, videoYoutube: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80"
              />
              <Video className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* ESTEIRAS DE ACOMPANHAMENTO (CHECKBOXES) */}
          <div className="bg-[#080d16] border border-slate-800/90 rounded-xl p-3.5 space-y-2">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Esteiras de Acompanhamento
            </span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={formData.radarSub23}
                  onChange={(e) => setFormData({ ...formData, radarSub23: e.target.checked })}
                  className="rounded border-slate-700 bg-[#131d2e] text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold">Radar Sub-23</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={formData.monitoramento}
                  onChange={(e) => setFormData({ ...formData, monitoramento: e.target.checked })}
                  className="rounded border-slate-700 bg-[#131d2e] text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold">Monitoramento</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={formData.hotList}
                  onChange={(e) => setFormData({ ...formData, hotList: e.target.checked })}
                  className="rounded border-slate-700 bg-[#131d2e] text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold">Hot List</span>
              </label>
            </div>
          </div>

          {/* CARACTERÍSTICAS / DNA TÁTICO (TAGS MULTI-SELECT) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              CARACTERÍSTICAS DA POSIÇÃO ({availableCharacteristics.length} disponíveis)
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 bg-[#080d16]/50 rounded-xl border border-slate-800/60">
              {availableCharacteristics.map((item, idx) => {
                const isSelected = formData.caracteristicas.includes(item.name)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleCharacteristic(item.name)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-xs'
                        : 'bg-[#131d2e] text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* OBSERVAÇÕES (TEXTAREA COM DITADO POR VOZ) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              OBSERVAÇÕES DO SCOUT (OU DITADO POR VOZ)
            </label>
            <VoiceNoteControl
              rows={3}
              placeholder="Descreva pontos fortes, fracos, comportamento tático, etc..."
              value={formData.observacao || ''}
              onChange={(val) => setFormData({ ...formData, observacao: val })}
              showMinuteButton={false}
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Salvando no Supabase...</span>
                </>
              ) : (
                <span>{playerToEdit ? 'Salvar Alterações' : 'Adicionar Jogador'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
