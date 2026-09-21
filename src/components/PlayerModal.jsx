import React, { useState, useEffect } from 'react'
import { X, UserPlus, Video, Check } from 'lucide-react'
import { POSITION_CHARACTERISTICS } from '../constants/scoutCharacteristics'

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

const NIVEIS = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D']
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
const PES = ['Destro', 'Canhoto', 'Ambidestro']
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
    pe: 'Destro',
    nivel: 'B',
    tetoNacional: 'BR1',
    projecaoInternacional: '',
    nivelFisico: 'Bom',
    posSecundaria: 'Nenhuma',
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

  // Sincroniza dados quando o modal abre ou o jogador para edição muda
  useEffect(() => {
    if (playerToEdit) {
      // Converte data se vier em DD/MM/AAAA para YYYY-MM-DD para o input date
      let contratoFormatted = playerToEdit.contrato || ''
      if (contratoFormatted.includes('/')) {
        const parts = contratoFormatted.split('/')
        if (parts.length === 3) {
          contratoFormatted = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        }
      }

      // Trata dados legados de projeção (string ou array)
      let tetoNac = ''
      let projInt = ''
      if (playerToEdit.projecao) {
        if (Array.isArray(playerToEdit.projecao)) {
          tetoNac = playerToEdit.projecao.find(p => ['BR1', 'BR2', 'BR3', 'BR4'].includes(p)) || ''
          projInt = playerToEdit.projecao.find(p => ['E1', 'E2', 'E3', 'EXT', 'MLS', 'AS1', 'AS2'].includes(p)) || ''
          if (['MLS', 'AS1', 'AS2'].includes(projInt)) projInt = 'EXT'
        } else if (typeof playerToEdit.projecao === 'string') {
          const p = playerToEdit.projecao
          if (['BR1', 'BR2', 'BR3', 'BR4'].includes(p)) {
            tetoNac = p
          } else if (['E1', 'E2', 'E3', 'EXT'].includes(p)) {
            projInt = p
          } else if (['MLS', 'AS1', 'AS2'].includes(p)) {
            projInt = 'EXT'
          }
        }
      }

      const rawPos = playerToEdit.posicao || playerToEdit.posicaoLabel || activePosition || 'goleiro'
      const initialPos = mapOptionToPosId(rawPos)

      let initialAn = playerToEdit.an || playerToEdit.anoNascimento || ''
      if (!initialAn && playerToEdit.idade) {
        const parsed = parseInt(String(playerToEdit.idade), 10)
        if (!isNaN(parsed)) {
          if (parsed > 1900 && parsed <= new Date().getFullYear()) {
            initialAn = parsed
          } else if (parsed >= 12 && parsed <= 50) {
            initialAn = new Date().getFullYear() - parsed
          }
        }
      }

      setFormData({
        nome: playerToEdit.nome || '',
        posicao: initialPos,
        an: initialAn,
        alt: playerToEdit.alt || playerToEdit.altura || '',
        pe: (playerToEdit.pe && playerToEdit.pe !== '—') ? playerToEdit.pe : (playerToEdit.pePreferencial || 'Destro'),
        nivel: (playerToEdit.nivel && playerToEdit.nivel !== '—' && playerToEdit.nivel !== 'A Avaliar') ? playerToEdit.nivel : 'B',
        tetoNacional: tetoNac,
        projecaoInternacional: projInt,
        nivelFisico: playerToEdit.nivelFisico && playerToEdit.nivelFisico !== '—' ? playerToEdit.nivelFisico : '',
        posSecundaria: playerToEdit.posSecundaria === '—' ? 'Nenhuma' : (playerToEdit.posSecundaria === 'Zagueiro' ? 'Zag. Destro' : (playerToEdit.posSecundaria || 'Nenhuma')),
        ca: playerToEdit.ca || playerToEdit.clubeAtual || playerToEdit.clube || '',
        clubeFormador: playerToEdit.clubeFormador || '',
        agente: playerToEdit.agente === '—' ? '' : (playerToEdit.agente || ''),
        contrato: contratoFormatted,
        radarSub23: Boolean(playerToEdit.radarSub23),
        monitoramento: Boolean(playerToEdit.monitoramento),
        hotList: Boolean(playerToEdit.hotList),
        caracteristicas: Array.isArray(playerToEdit.caracteristicas) ? [...playerToEdit.caracteristicas] : [],
        observacao: playerToEdit.observacao || '',
        videoYoutube: playerToEdit.videoYoutube || ''
      })
    } else {
      setFormData({
        nome: '',
        posicao: activePosition || 'goleiro',
        an: new Date().getFullYear() - 22,
        alt: '',
        pe: 'Destro',
        nivel: '',
        tetoNacional: '',
        projecaoInternacional: '',
        nivelFisico: '',
        posSecundaria: 'Nenhuma',
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

  // Lista de características disponíveis para a posição atual (baseada na posição selecionada)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nome.trim()) return

    // Formatar data de contrato de YYYY-MM-DD para DD/MM/AAAA se preenchido
    let contratoDisplay = '—'
    let alerta = 'OK'

    if (formData.contrato) {
      if (formData.contrato.includes('-')) {
        const [year, month, day] = formData.contrato.split('-')
        contratoDisplay = `${day}/${month}/${year}`

        // Calcular se vence em menos de 180 dias
        const contratoDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
        const today = new Date()
        const diffDays = Math.ceil((contratoDate - today) / (1000 * 60 * 60 * 24))
        if (diffDays <= 180) {
          alerta = 'VENCENDO'
        }
      } else {
        contratoDisplay = formData.contrato
      }
    }

    const finalPosId = mapOptionToPosId(formData.posicao || activePosition)

    const newPlayerData = {
      ...(playerToEdit || {}),
      id: playerToEdit ? playerToEdit.id : Date.now(),
      nome: formData.nome.trim(),
      posicao: finalPosId,
      posicaoLabel: mapPosIdToOption(finalPosId),
      an: parseInt(formData.an, 10) || '—',
      alt: parseInt(formData.alt, 10) || '—',
      pe: formData.pe,
      nivel: formData.nivel,
      projecao: [formData.tetoNacional, formData.projecaoInternacional].filter(Boolean),
      nivelFisico: formData.nivelFisico,
      alerta: alerta,
      ca: formData.ca.trim() || '—',
      clubeAtual: formData.ca.trim() || '—',
      clube: formData.ca.trim() || '—',
      clubeFormador: formData.clubeFormador.trim() || '—',
      posSecundaria: formData.posSecundaria === 'Nenhuma' ? '—' : formData.posSecundaria,
      caracteristicas: formData.caracteristicas,
      agente: formData.agente.trim() || '—',
      contrato: contratoDisplay,
      radarSub23: formData.radarSub23,
      monitoramento: formData.monitoramento,
      hotList: formData.hotList,
      observacao: formData.observacao.trim(),
      videoYoutube: formData.videoYoutube.trim(),
      isProvisorio: false,
      is_provisorio: false
    }

    onSave(newPlayerData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-black overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-800/90 flex items-center justify-between bg-[#080d16]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {playerToEdit ? 'Editar Jogador' : '+ Novo Jogador'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Posição: <strong className="text-emerald-400 font-bold">{mapPosIdToOption(formData.posicao || activePosition)}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* 1. SELETOR DE POSIÇÃO PRINCIPAL NO TOPO */}
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
              <option value="Goleiro">Goleiro</option>
              <option value="Zag. Destro">Zag. Destro</option>
              <option value="Zag. Canhoto">Zag. Canhoto</option>
              <option value="Lat. Direito">Lat. Direito</option>
              <option value="Lat. Esquerdo">Lat. Esquerdo</option>
              <option value="Volante (1º Médio)">Volante (1º Médio)</option>
              <option value="Médio Central">Médio Central</option>
              <option value="Meia Ofensivo">Meia Ofensivo</option>
              <option value="Extremo">Extremo</option>
              <option value="Centroavante">Centroavante</option>
            </select>
          </div>

          {/* NOME (largura total) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              NOME *
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

          {/* Grid de 2 Colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ANO NASC */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                ANO NASC.
              </label>
              <input
                type="number"
                placeholder="Ex: 2002"
                value={formData.an || ''}
                onChange={(e) => setFormData({ ...formData, an: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* ALTURA */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                ALTURA (cm)
              </label>
              <input
                type="number"
                placeholder="Ex: 188"
                value={formData.alt || ''}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* PÉ */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                PÉ
              </label>
              <select
                value={formData.pe || ''}
                onChange={(e) => setFormData({ ...formData, pe: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
              >
                <option value="">[ — Não Definido ]</option>
                {PES.map(pe => (
                  <option key={pe} value={pe}>{pe}</option>
                ))}
              </select>
            </div>

            {/* NÍVEL */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                NÍVEL
              </label>
              <select
                value={formData.nivel || ''}
                onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
              >
                <option value="">[ — Não Definido ]</option>
                {NIVEIS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* PROJEÇÃO: DUAL SELECTION (TETO NACIONAL + INTERNACIONAL) - Ocupa as 2 colunas */}
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                PROJEÇÃO (DUAL)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Teto Nacional */}
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

                {/* Projeção Internacional */}
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

            {/* POS. SECUNDÁRIA */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                POS. SECUNDÁRIA
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

            {/* CLUBE ATUAL (CA) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                CLUBE ATUAL (CA)
              </label>
              <input
                type="text"
                placeholder="Ex: Anápolis"
                value={formData.ca || ''}
                onChange={(e) => setFormData({ ...formData, ca: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* CLUBE FORMADOR */}
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

            {/* AGENTE */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                AGENTE / EMPRESA
              </label>
              <input
                type="text"
                placeholder="Ex: Bertolucci Sports"
                value={formData.agente || ''}
                onChange={(e) => setFormData({ ...formData, agente: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* CONTRATO */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                FIM DE CONTRATO
              </label>
              <input
                type="date"
                value={formData.contrato || ''}
                onChange={(e) => setFormData({ ...formData, contrato: e.target.value })}
                className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80"
              />
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

          {/* CARACTERÍSTICAS (TAGS MULTI-SELECT) */}
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

          {/* OBSERVAÇÕES (TEXTAREA) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              OBSERVAÇÕES DO SCOUT
            </label>
            <textarea
              rows={3}
              placeholder="Descreva pontos fortes, fracos, comportamento tático, etc..."
              value={formData.observacao || ''}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg p-3 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/80 resize-none"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-colors cursor-pointer"
            >
              {playerToEdit ? 'Salvar Alterações' : 'Adicionar Jogador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
